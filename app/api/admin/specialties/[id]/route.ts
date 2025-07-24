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
        { error: 'Solo administradores pueden editar especialidades' },
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

    // Verificar si la especialidad existe
    const existingSpecialty = await prisma.specialty.findUnique({
      where: { id: params.id }
    })

    if (!existingSpecialty) {
      return NextResponse.json(
        { error: 'Especialidad no encontrada' },
        { status: 404 }
      )
    }

    // Verificar si el nuevo nombre ya existe (excepto en la especialidad actual)
    const duplicateSpecialty = await prisma.specialty.findFirst({
      where: {
        name: name.trim(),
        NOT: {
          id: params.id
        }
      }
    })

    if (duplicateSpecialty) {
      return NextResponse.json(
        { error: 'Ya existe otra especialidad con ese nombre' },
        { status: 400 }
      )
    }

    const updatedSpecialty = await prisma.specialty.update({
      where: { id: params.id },
      data: {
        name: name.trim(),
        description: description?.trim() || null
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Especialidad actualizada exitosamente',
      specialty: updatedSpecialty
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
        { error: 'Solo administradores pueden eliminar especialidades' },
        { status: 403 }
      )
    }

    // Verificar si la especialidad existe
    const existingSpecialty = await prisma.specialty.findUnique({
      where: { id: params.id },
      include: {
        priests: true
      }
    })

    if (!existingSpecialty) {
      return NextResponse.json(
        { error: 'Especialidad no encontrada' },
        { status: 404 }
      )
    }

    // Verificar si la especialidad tiene sacerdotes asociados
    if (existingSpecialty.priests.length > 0) {
      return NextResponse.json(
        { error: 'No se puede eliminar la especialidad porque tiene sacerdotes asociados' },
        { status: 400 }
      )
    }

    await prisma.specialty.delete({
      where: { id: params.id }
    })

    return NextResponse.json({
      success: true,
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