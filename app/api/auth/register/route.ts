import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { saveProfileImage } from '@/lib/file-upload'

export async function POST(request: Request) {
  try {
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
    let profileImagePath: string | null = null
    if (profileImageFile && profileImageFile.size > 0) {
      try {
        profileImagePath = await saveProfileImage(profileImageFile, user.id)
      } catch (error) {
        console.error('Error uploading image:', error)
        // Continue without image rather than failing the registration
      }
    }

    // Create priest record
    const priest = await prisma.priest.create({
      data: {
        userId: user.id,
        firstName,
        lastName,
        parish: parish || null,
        phone: phone || null,
        specialties: specialties || null,
        ordainedDate: ordainedDate ? new Date(ordainedDate) : null,
        biography: biography || null,
        profileImage: profileImagePath,
        status: 'PENDING'
      }
    })

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