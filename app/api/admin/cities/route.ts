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

    const cities = await prisma.city.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: {
            parishes: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      cities: cities.map(city => ({
        id: city.id,
        name: city.name,
        state: city.state,
        createdAt: city.createdAt,
        parishCount: city._count.parishes
      }))
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
        { error: 'Solo administradores pueden crear ciudades' },
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

    // Verificar si la ciudad ya existe
    const existingCity = await prisma.city.findUnique({
      where: { name }
    })

    if (existingCity) {
      return NextResponse.json(
        { error: 'Ya existe una ciudad con ese nombre' },
        { status: 400 }
      )
    }

    const city = await prisma.city.create({
      data: {
        name: name.trim(),
        state: state.trim()
      }
    })

    return NextResponse.json({
      success: true,
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