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
        { error: 'Acceso denegado. Solo administradores pueden acceder.' },
        { status: 403 }
      )
    }

    const cities = await prisma.city.findMany({
      include: {
        parishes: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    })

    return NextResponse.json({
      cities
    })
  } catch (error) {
    console.error('Error fetching cities:', error)
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

    const { name, state } = await request.json()

    if (!name || !state) {
      return NextResponse.json(
        { error: 'Nombre y estado son requeridos' },
        { status: 400 }
      )
    }

    // Check if city already exists
    const existingCity = await prisma.city.findUnique({
      where: { name }
    })

    if (existingCity) {
      return NextResponse.json(
        { error: 'Ya existe una ciudad con este nombre' },
        { status: 400 }
      )
    }

    const city = await prisma.city.create({
      data: {
        name,
        state
      }
    })

    return NextResponse.json({
      message: 'Ciudad creada exitosamente',
      city
    })
  } catch (error) {
    console.error('Error creating city:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
} 