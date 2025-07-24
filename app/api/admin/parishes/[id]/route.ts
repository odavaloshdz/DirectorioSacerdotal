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
        { error: 'Solo administradores pueden editar parroquias' },
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

    // Verificar si la parroquia existe
    const existingParish = await prisma.parish.findUnique({
      where: { id: params.id }
    })

    if (!existingParish) {
      return NextResponse.json(
        { error: 'Parroquia no encontrada' },
        { status: 404 }
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

    // Verificar si ya existe otra parroquia con el mismo nombre en esa ciudad
    const duplicateParish = await prisma.parish.findFirst({
      where: {
        name: name.trim(),
        cityId: cityId,
        NOT: {
          id: params.id
        }
      }
    })

    if (duplicateParish) {
      return NextResponse.json(
        { error: 'Ya existe otra parroquia con ese nombre en esta ciudad' },
        { status: 400 }
      )
    }

    const updatedParish = await prisma.parish.update({
      where: { id: params.id },
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
      message: 'Parroquia actualizada exitosamente',
      parish: updatedParish
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
        { error: 'Solo administradores pueden eliminar parroquias' },
        { status: 403 }
      )
    }

    // Verificar si la parroquia existe
    const existingParish = await prisma.parish.findUnique({
      where: { id: params.id },
      include: {
        priests: true
      }
    })

    if (!existingParish) {
      return NextResponse.json(
        { error: 'Parroquia no encontrada' },
        { status: 404 }
      )
    }

    // Verificar si la parroquia tiene sacerdotes asociados
    if (existingParish.priests.length > 0) {
      return NextResponse.json(
        { error: 'No se puede eliminar la parroquia porque tiene sacerdotes asociados' },
        { status: 400 }
      )
    }

    await prisma.parish.delete({
      where: { id: params.id }
    })

    return NextResponse.json({
      success: true,
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