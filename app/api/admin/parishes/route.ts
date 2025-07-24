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

    const parishes = await prisma.parish.findMany({
      orderBy: { name: 'asc' },
      include: {
        city: {
          select: {
            id: true,
            name: true,
            state: true
          }
        },
        _count: {
          select: {
            priests: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      parishes: parishes.map(parish => ({
        id: parish.id,
        name: parish.name,
        address: parish.address,
        phone: parish.phone,
        createdAt: parish.createdAt,
        city: parish.city,
        priestCount: parish._count.priests
      }))
    })

  } catch (error) {
    console.error('Error fetching parishes:', error)
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
        { error: 'Solo administradores pueden crear parroquias' },
        { status: 403 }
      )
    }

    const { name, address, phone, cityId } = await request.json()

    if (!name || !cityId) {
      return NextResponse.json(
        { error: 'Nombre y ciudad son requeridos' },
        { status: 400 }
      )
    }

    // Verificar si la ciudad existe
    const city = await prisma.city.findUnique({
      where: { id: cityId }
    })

    if (!city) {
      return NextResponse.json(
        { error: 'Ciudad no encontrada' },
        { status: 404 }
      )
    }

    // Verificar si la parroquia ya existe en esa ciudad
    const existingParish = await prisma.parish.findFirst({
      where: {
        name: name.trim(),
        cityId: cityId
      }
    })

    if (existingParish) {
      return NextResponse.json(
        { error: 'Ya existe una parroquia con ese nombre en esta ciudad' },
        { status: 400 }
      )
    }

    const parish = await prisma.parish.create({
      data: {
        name: name.trim(),
        address: address?.trim() || null,
        phone: phone?.trim() || null,
        cityId: cityId
      },
      include: {
        city: {
          select: {
            id: true,
            name: true,
            state: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Parroquia creada exitosamente',
      parish
    })

  } catch (error) {
    console.error('Error creating parish:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
} 