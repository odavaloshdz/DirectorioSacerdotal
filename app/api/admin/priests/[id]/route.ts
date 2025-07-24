import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { uploadProfileImage } from '@/lib/cloudinary'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
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

    const priest = await prisma.priest.findUnique({
      where: { id: params.id },
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
      }
    })

    if (!priest) {
      return NextResponse.json(
        { error: 'Sacerdote no encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      priest
    })
  } catch (error) {
    console.error('Error fetching priest:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
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
    const status = formData.get('status') as string
    const profileImageFile = formData.get('profileImage') as File | null

    // Get existing priest
    const existingPriest = await prisma.priest.findUnique({
      where: { id: params.id },
      include: { 
        user: true,
        specialties: true
      }
    })

    if (!existingPriest) {
      return NextResponse.json(
        { error: 'Sacerdote no encontrado' },
        { status: 404 }
      )
    }

    // Validate required fields
    if (!email || !firstName || !lastName) {
      return NextResponse.json(
        { error: 'Email, nombre y apellido son requeridos' },
        { status: 400 }
      )
    }

    // Check if email is being changed and if it already exists
    if (email !== existingPriest.user.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email }
      })
      if (existingUser) {
        return NextResponse.json(
          { error: 'Ya existe un usuario con este email' },
          { status: 400 }
        )
      }
    }

    // Handle profile image upload
    let profileImageUrl: string | null = existingPriest.profileImage
    if (profileImageFile && profileImageFile.size > 0) {
      try {
        profileImageUrl = await uploadProfileImage(profileImageFile, existingPriest.userId)
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

    // Prepare user update data
    const userUpdateData: any = {
      email,
      name: `${firstName} ${lastName}`,
      role: status === 'APPROVED' ? 'PRIEST' : 'USER',
    }

    // Hash new password if provided
    if (password && password.length >= 6) {
      userUpdateData.password = await bcrypt.hash(password, 12)
    }

    // Prepare priest update data
    const priestUpdateData: any = {
      firstName,
      lastName,
      parishId: parishId || null,
      phone: phone || null,
      ordainedDate: ordainedDate ? new Date(ordainedDate) : null,
      biography: biography || null,
      profileImage: profileImageUrl,
      status: status as any,
    }

    // If status is changing to APPROVED, set approval data
    if (status === 'APPROVED' && existingPriest.status !== 'APPROVED') {
      priestUpdateData.approvedAt = new Date()
      priestUpdateData.approvedBy = (session.user as any)?.id
    }

    // Update both user and priest in a transaction
    const updatedPriest = await prisma.$transaction(async (tx) => {
      // Update user
      await tx.user.update({
        where: { id: existingPriest.userId },
        data: userUpdateData
      })

      // Update priest
      const priest = await tx.priest.update({
        where: { id: params.id },
        data: priestUpdateData,
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
          }
        }
      })

      // Update priest-specialty relationships
      // First, delete existing relationships
      await tx.priestSpecialty.deleteMany({
        where: { priestId: params.id }
      })

      // Then, create new relationships
      if (parsedSpecialtyIds.length > 0) {
        await tx.priestSpecialty.createMany({
          data: parsedSpecialtyIds.map(specialtyId => ({
            priestId: params.id,
            specialtyId
          }))
        })
      }

      return priest
    })

    return NextResponse.json({
      message: 'Sacerdote actualizado exitosamente',
      priest: updatedPriest
    })
  } catch (error) {
    console.error('Error updating priest:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
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
        { error: 'Solo administradores pueden eliminar sacerdotes' },
        { status: 403 }
      )
    }

    // Verificar si el sacerdote existe
    const existingPriest = await prisma.priest.findUnique({
      where: { id: params.id },
      include: {
        user: true,
        specialties: true,
        suggestions: true
      }
    })

    if (!existingPriest) {
      return NextResponse.json(
        { error: 'Sacerdote no encontrado' },
        { status: 404 }
      )
    }

    // Eliminar relaciones primero
    await prisma.priestSpecialty.deleteMany({
      where: { priestId: params.id }
    })

    await prisma.profileSuggestion.deleteMany({
      where: { priestId: params.id }
    })

    // Eliminar el sacerdote
    await prisma.priest.delete({
      where: { id: params.id }
    })

    // Eliminar el usuario asociado
    await prisma.user.delete({
      where: { id: existingPriest.userId }
    })

    return NextResponse.json({
      success: true,
      message: 'Sacerdote eliminado exitosamente'
    })

  } catch (error) {
    console.error('Error deleting priest:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
} 