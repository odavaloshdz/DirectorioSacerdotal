import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
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

    // Check if city exists
    const existingCity = await prisma.city.findUnique({
      where: { id: params.id }
    })

    if (!existingCity) {
      return NextResponse.json(
        { error: 'Ciudad no encontrada' },
        { status: 404 }
      )
    }

    // Check if another city with same name exists (excluding current)
    const duplicateCity = await prisma.city.findFirst({
      where: {
        name,
        id: { not: params.id }
      }
    })

    if (duplicateCity) {
      return NextResponse.json(
        { error: 'Ya existe otra ciudad con este nombre' },
        { status: 400 }
      )
    }

    const city = await prisma.city.update({
      where: { id: params.id },
      data: { name, state }
    })

    return NextResponse.json({
      message: 'Ciudad actualizada exitosamente',
      city
    })
  } catch (error) {
    console.error('Error updating city:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
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

    // Check if city has parishes
    const city = await prisma.city.findUnique({
      where: { id: params.id },
      include: { parishes: true }
    })

    if (!city) {
      return NextResponse.json(
        { error: 'Ciudad no encontrada' },
        { status: 404 }
      )
    }

    if (city.parishes.length > 0) {
      return NextResponse.json(
        { error: 'No se puede eliminar la ciudad porque tiene parroquias asociadas' },
        { status: 400 }
      )
    }

    await prisma.city.delete({
      where: { id: params.id }
    })

    return NextResponse.json({
      message: 'Ciudad eliminada exitosamente'
    })
  } catch (error) {
    console.error('Error deleting city:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
} 