import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const { email, password, firstName, lastName, parish, phone } = await request.json()

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
        role: 'PRIEST',
        priest: {
          create: {
            firstName,
            lastName,
            parish,
            phone,
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