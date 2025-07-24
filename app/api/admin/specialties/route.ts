import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

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
        { error: 'Solo administradores pueden acceder' },
        { status: 403 }
      )
    }

    const specialties = await prisma.specialty.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: {
            priests: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      specialties: specialties.map(specialty => ({
        id: specialty.id,
        name: specialty.name,
        description: specialty.description,
        createdAt: specialty.createdAt,
        priestCount: specialty._count.priests
      }))
    })

  } catch (error) {
    console.error('Error fetching specialties:', error)
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
        { error: 'Solo administradores pueden crear especialidades' },
        { status: 403 }
      )
    }

    const { name, description } = await request.json()

    if (!name) {
      return NextResponse.json(
        { error: 'El nombre es requerido' },
        { status: 400 }
      )
    }

    // Verificar si la especialidad ya existe
    const existingSpecialty = await prisma.specialty.findUnique({
      where: { name: name.trim() }
    })

    if (existingSpecialty) {
      return NextResponse.json(
        { error: 'Ya existe una especialidad con ese nombre' },
        { status: 400 }
      )
    }

    const specialty = await prisma.specialty.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Especialidad creada exitosamente',
      specialty
    })

  } catch (error) {
    console.error('Error creating specialty:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
} 