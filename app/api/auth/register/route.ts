import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const { email, password, firstName, lastName, parish, phone, specialties } = await request.json()

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

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user and priest profile
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: `${firstName} ${lastName}`,
        role: 'USER', // Start as USER, will become PRIEST when approved
        priest: {
          create: {
            firstName,
            lastName,
            parish: parish || null,
            phone: phone || null,
            specialties: specialties || null,
            status: 'PENDING'
          }
        }
      },
      include: {
        priest: true
      }
    })

    return NextResponse.json({
      message: 'Registro exitoso. Su cuenta está pendiente de aprobación.',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        priest: user.priest
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