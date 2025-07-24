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
        { error: 'Solo administradores pueden editar ciudades' },
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

    // Verificar si la ciudad existe
    const existingCity = await prisma.city.findUnique({
      where: { id: params.id }
    })

    if (!existingCity) {
      return NextResponse.json(
        { error: 'Ciudad no encontrada' },
        { status: 404 }
      )
    }

    // Verificar si el nuevo nombre ya existe (excepto en la ciudad actual)
    const duplicateCity = await prisma.city.findFirst({
      where: {
        name: name.trim(),
        NOT: {
          id: params.id
        }
      }
    })

    if (duplicateCity) {
      return NextResponse.json(
        { error: 'Ya existe otra ciudad con ese nombre' },
        { status: 400 }
      )
    }

    const updatedCity = await prisma.city.update({
      where: { id: params.id },
      data: {
        name: name.trim(),
        state: state.trim()
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Ciudad actualizada exitosamente',
      city: updatedCity
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
        { error: 'Solo administradores pueden eliminar ciudades' },
        { status: 403 }
      )
    }

    // Verificar si la ciudad existe
    const existingCity = await prisma.city.findUnique({
      where: { id: params.id },
      include: {
        parishes: true
      }
    })

    if (!existingCity) {
      return NextResponse.json(
        { error: 'Ciudad no encontrada' },
        { status: 404 }
      )
    }

    // Verificar si la ciudad tiene parroquias asociadas
    if (existingCity.parishes.length > 0) {
      return NextResponse.json(
        { error: 'No se puede eliminar la ciudad porque tiene parroquias asociadas' },
        { status: 400 }
      )
    }

    await prisma.city.delete({
      where: { id: params.id }
    })

    return NextResponse.json({
      success: true,
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