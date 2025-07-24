import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { uploadProfileImage } from '@/lib/cloudinary'

export async function POST(request: Request) {
  try {
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
    const profileImageFile = formData.get('profileImage') as File | null

    // Validate required fields
    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
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
        { error: 'El usuario ya existe' },
        { status: 400 }
      )
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user first to get ID for image upload
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: `${firstName} ${lastName}`,
        role: 'USER', // Start as USER, will become PRIEST when approved
      }
    })

    // Handle profile image upload
    let profileImageUrl: string | null = null
    if (profileImageFile && profileImageFile.size > 0) {
      try {
        profileImageUrl = await uploadProfileImage(profileImageFile, user.id)
      } catch (error) {
        console.error('Error uploading image:', error)
        // Continue without image rather than failing the registration
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
        status: 'PENDING'
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
      message: 'Registro exitoso. Su cuenta está pendiente de aprobación.',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        priest
      }
    })
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
} 