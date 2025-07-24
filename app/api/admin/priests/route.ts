import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { uploadProfileImage } from '@/lib/cloudinary'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      )
    }

    const userRole = (session.user as any)?.role

    if (userRole !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Acceso denegado. Solo administradores pueden acceder.' },
        { status: 403 }
      )
    }

    const priests = await prisma.priest.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            createdAt: true
          }
        },
        parish: {
          select: {
            id: true,
            name: true,
            city: {
              select: {
                name: true
              }
            }
          }
        },
        specialties: {
          include: {
            specialty: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      },
      orderBy: [
        { status: 'asc' }, // PENDING first
        { createdAt: 'desc' }
      ]
    })

    return NextResponse.json({
      priests
    })
  } catch (error) {
    console.error('Error fetching priests:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      )
    }

    const userRole = (session.user as any)?.role

    if (userRole !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Acceso denegado. Solo administradores pueden acceder.' },
        { status: 403 }
      )
    }

    const formData = await request.formData()
    
    // Extract fields from FormData
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const firstName = formData.get('firstName') as string
    const lastName = formData.get('lastName') as string
    const parishId = formData.get('parishId') as string
    const phone = formData.get('phone') as string
    const specialtyIds = formData.get('specialtyIds') as string
    const ordainedDate = formData.get('ordainedDate') as string
    const biography = formData.get('biography') as string
    const status = formData.get('status') as string || 'PENDING'
    const profileImageFile = formData.get('profileImage') as File | null

    // Validate required fields
    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json(
        { error: 'Email, contraseña, nombre y apellido son requeridos' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'La contraseña debe tener al menos 6 caracteres' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })
    if (existingUser) {
      return NextResponse.json(
        { error: 'Ya existe un usuario con este email' },
        { status: 400 }
      )
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user first
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: `${firstName} ${lastName}`,
        role: status === 'APPROVED' ? 'PRIEST' : 'USER',
      }
    })

    // Handle profile image upload
    let profileImageUrl: string | null = null
    if (profileImageFile && profileImageFile.size > 0) {
      try {
        profileImageUrl = await uploadProfileImage(profileImageFile, user.id)
      } catch (error) {
        console.error('Error uploading image:', error)
      }
    }

    // Parse specialty IDs
    let parsedSpecialtyIds: string[] = []
    if (specialtyIds) {
      try {
        parsedSpecialtyIds = JSON.parse(specialtyIds)
      } catch (error) {
        console.error('Error parsing specialty IDs:', error)
      }
    }

    // Create priest record with all fields
    const priest = await prisma.priest.create({
      data: {
        userId: user.id,
        firstName,
        lastName,
        parishId: parishId || null,
        phone: phone || null,
        ordainedDate: ordainedDate ? new Date(ordainedDate) : null,
        biography: biography || null,
        profileImage: profileImageUrl,
        status: status as any,
        approvedAt: status === 'APPROVED' ? new Date() : null,
        approvedBy: status === 'APPROVED' ? (session.user as any)?.id : null
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            createdAt: true
          }
        }
      }
    })

    // Create priest-specialty relationships
    if (parsedSpecialtyIds.length > 0) {
      await prisma.priestSpecialty.createMany({
        data: parsedSpecialtyIds.map(specialtyId => ({
          priestId: priest.id,
          specialtyId
        }))
      })
    }

    return NextResponse.json({
      message: 'Sacerdote creado exitosamente',
      priest
    })
  } catch (error) {
    console.error('Error creating priest:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
} 