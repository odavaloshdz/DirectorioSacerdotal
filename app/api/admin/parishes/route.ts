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

    const parishes = await prisma.parish.findMany({
      include: {
        city: {
          select: {
            id: true,
            name: true,
            state: true
          }
        },
        priests: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    })

    return NextResponse.json({
      parishes
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
        { error: 'Acceso denegado. Solo administradores pueden acceder.' },
        { status: 403 }
      )
    }

    const { name, cityId, address, phone, email } = await request.json()

    if (!name || !cityId) {
      return NextResponse.json(
        { error: 'Nombre y ciudad son requeridos' },
        { status: 400 }
      )
    }

    // Check if parish already exists in the same city
    const existingParish = await prisma.parish.findFirst({
      where: {
        name,
        cityId
      }
    })

    if (existingParish) {
      return NextResponse.json(
        { error: 'Ya existe una parroquia con este nombre en esta ciudad' },
        { status: 400 }
      )
    }

    const parish = await prisma.parish.create({
      data: {
        name,
        cityId,
        address: address || null,
        phone: phone || null,
        email: email || null
      },
      include: {
        city: {
          select: {
            name: true,
            state: true
          }
        }
      }
    })

    return NextResponse.json({
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