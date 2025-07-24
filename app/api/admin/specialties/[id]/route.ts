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

    const { name, description } = await request.json()

    if (!name) {
      return NextResponse.json(
        { error: 'El nombre es requerido' },
        { status: 400 }
      )
    }

    // Check if specialty exists
    const existingSpecialty = await prisma.specialty.findUnique({
      where: { id: params.id }
    })

    if (!existingSpecialty) {
      return NextResponse.json(
        { error: 'Especialidad no encontrada' },
        { status: 404 }
      )
    }

    // Check if another specialty with same name exists (excluding current)
    const duplicateSpecialty = await prisma.specialty.findFirst({
      where: {
        name,
        id: { not: params.id }
      }
    })

    if (duplicateSpecialty) {
      return NextResponse.json(
        { error: 'Ya existe otra especialidad con este nombre' },
        { status: 400 }
      )
    }

    const specialty = await prisma.specialty.update({
      where: { id: params.id },
      data: {
        name,
        description: description || null
      }
    })

    return NextResponse.json({
      message: 'Especialidad actualizada exitosamente',
      specialty
    })
  } catch (error) {
    console.error('Error updating specialty:', error)
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

    // Check if specialty has priests
    const specialty = await prisma.specialty.findUnique({
      where: { id: params.id },
      include: { priests: true }
    })

    if (!specialty) {
      return NextResponse.json(
        { error: 'Especialidad no encontrada' },
        { status: 404 }
      )
    }

    if (specialty.priests.length > 0) {
      return NextResponse.json(
        { error: 'No se puede eliminar la especialidad porque tiene sacerdotes asignados' },
        { status: 400 }
      )
    }

    await prisma.specialty.delete({
      where: { id: params.id }
    })

    return NextResponse.json({
      message: 'Especialidad eliminada exitosamente'
    })
  } catch (error) {
    console.error('Error deleting specialty:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
} 