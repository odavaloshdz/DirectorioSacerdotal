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

    const { name, cityId, address, phone, email } = await request.json()

    if (!name || !cityId) {
      return NextResponse.json(
        { error: 'Nombre y ciudad son requeridos' },
        { status: 400 }
      )
    }

    // Check if parish exists
    const existingParish = await prisma.parish.findUnique({
      where: { id: params.id }
    })

    if (!existingParish) {
      return NextResponse.json(
        { error: 'Parroquia no encontrada' },
        { status: 404 }
      )
    }

    // Check if another parish with same name exists in same city (excluding current)
    const duplicateParish = await prisma.parish.findFirst({
      where: {
        name,
        cityId,
        id: { not: params.id }
      }
    })

    if (duplicateParish) {
      return NextResponse.json(
        { error: 'Ya existe otra parroquia con este nombre en esta ciudad' },
        { status: 400 }
      )
    }

    const parish = await prisma.parish.update({
      where: { id: params.id },
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
      message: 'Parroquia actualizada exitosamente',
      parish
    })
  } catch (error) {
    console.error('Error updating parish:', error)
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

    // Check if parish has priests
    const parish = await prisma.parish.findUnique({
      where: { id: params.id },
      include: { priests: true }
    })

    if (!parish) {
      return NextResponse.json(
        { error: 'Parroquia no encontrada' },
        { status: 404 }
      )
    }

    if (parish.priests.length > 0) {
      return NextResponse.json(
        { error: 'No se puede eliminar la parroquia porque tiene sacerdotes asignados' },
        { status: 400 }
      )
    }

    await prisma.parish.delete({
      where: { id: params.id }
    })

    return NextResponse.json({
      message: 'Parroquia eliminada exitosamente'
    })
  } catch (error) {
    console.error('Error deleting parish:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
} 