import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST() {
  try {
    // Check if any admin already exists
    const existingAdmin = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    })

    if (existingAdmin) {
      return NextResponse.json({
        error: 'Ya existe un administrador en el sistema',
        existingAdmin: {
          email: existingAdmin.email,
          name: existingAdmin.name
        }
      }, { status: 400 })
    }

    // Create initial admin
    const adminEmail = 'admin@diocesis.org'
    const adminPassword = 'Admin123!'
    
    const hashedPassword = await bcrypt.hash(adminPassword, 12)
    
    const admin = await prisma.user.create({
      data: {
        name: 'Administrador Principal',
        email: adminEmail,
        password: hashedPassword,
        role: 'ADMIN',
        emailVerified: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Administrador inicial creado exitosamente',
      credentials: {
        email: adminEmail,
        password: adminPassword
      },
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role
      }
    })

  } catch (error) {
    console.error('Error creating initial admin:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor', details: error },
      { status: 500 }
    )
  }
} 