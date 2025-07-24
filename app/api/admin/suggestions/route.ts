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

    const suggestions = await prisma.profileSuggestion.findMany({
      include: {
        priest: {
          include: {
            user: {
              select: {
                email: true
              }
            }
          }
        }
      },
      orderBy: [
        { status: 'asc' }, // PENDING first
        { createdAt: 'desc' }
      ]
    })

    return NextResponse.json({
      suggestions
    })
  } catch (error) {
    console.error('Error fetching suggestions:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: Request) {
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

    const { suggestionId, action } = await request.json()

    if (!suggestionId || !action) {
      return NextResponse.json(
        { error: 'ID de sugerencia y acción son requeridos' },
        { status: 400 }
      )
    }

    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: 'Acción no válida. Debe ser "approve" o "reject"' },
        { status: 400 }
      )
    }

    const adminUserId = (session.user as any)?.id

    // Get the suggestion with priest data
    const suggestion = await prisma.profileSuggestion.findUnique({
      where: { id: suggestionId },
      include: { priest: true }
    })

    if (!suggestion) {
      return NextResponse.json(
        { error: 'Sugerencia no encontrada' },
        { status: 404 }
      )
    }

    if (suggestion.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Esta sugerencia ya fue procesada' },
        { status: 400 }
      )
    }

    if (action === 'approve') {
      // Apply the change to the priest record and update suggestion status
      const updateData: any = {}
      updateData[suggestion.field] = suggestion.suggestedValue

      await prisma.$transaction([
        // Update the priest record
        prisma.priest.update({
          where: { id: suggestion.priestId },
          data: updateData
        }),
        // Update the suggestion status
        prisma.profileSuggestion.update({
          where: { id: suggestionId },
          data: {
            status: 'APPROVED',
            reviewedBy: adminUserId,
            reviewedAt: new Date()
          }
        })
      ])

      return NextResponse.json({
        message: 'Sugerencia aprobada y cambio aplicado exitosamente'
      })
    } else {
      // Just reject the suggestion
      await prisma.profileSuggestion.update({
        where: { id: suggestionId },
        data: {
          status: 'REJECTED',
          reviewedBy: adminUserId,
          reviewedAt: new Date()
        }
      })

      return NextResponse.json({
        message: 'Sugerencia rechazada'
      })
    }
  } catch (error) {
    console.error('Error processing suggestion:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
} 