import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { saveProfileImage } from '@/lib/file-upload'

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
    const parish = formData.get('parish') as string
    const phone = formData.get('phone') as string
    const specialties = formData.get('specialties') as string
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
    let profileImagePath: string | null = null
    if (profileImageFile && profileImageFile.size > 0) {
      try {
        profileImagePath = await saveProfileImage(profileImageFile, user.id)
      } catch (error) {
        console.error('Error uploading image:', error)
      }
    }

    // Create priest record (simplified for deployment - profileImage added later)
    const priest = await prisma.priest.create({
      data: {
        userId: user.id,
        firstName,
        lastName,
        phone: phone || null,
        ordainedDate: ordainedDate ? new Date(ordainedDate) : null,
        biography: biography || null,
        status: status as any,
        approvedAt: status === 'APPROVED' ? new Date() : null,
        approvedBy: status === 'APPROVED' ? (session.user as any)?.id : null
      }
    })

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