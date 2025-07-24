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
    const adminUserId = (session.user as any)?.id

    if (userRole !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Acceso denegado. Solo administradores pueden acceder.' },
        { status: 403 }
      )
    }

    const { suggestionId, action } = await request.json()

    if (!suggestionId || !action || !['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: 'Parámetros inválidos' },
        { status: 400 }
      )
    }

    // Get the suggestion
    const suggestion = await prisma.profileSuggestion.findUnique({
      where: { id: suggestionId },
      include: {
        priest: true
      }
    })

    if (!suggestion) {
      return NextResponse.json(
        { error: 'Sugerencia no encontrada' },
        { status: 404 }
      )
    }

    if (suggestion.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Esta sugerencia ya ha sido procesada' },
        { status: 400 }
      )
    }

    if (action === 'approve') {
      // Special handling for different field types
      const updateData: any = {}
      
      if (suggestion.field === 'parishId') {
        // For parishId, we need to validate that the suggested value contains a valid parish
        // The suggested value should be in format "Parish Name, City Name"
        // For now, we'll allow manual handling by admin - they should provide the actual parish ID
        return NextResponse.json({
          error: 'Las sugerencias de parroquia requieren procesamiento manual. Por favor, edita el sacerdote directamente desde el panel de administración.'
        }, { status: 400 })
      } else if (suggestion.field === 'specialties') {
        // For specialties, we might need special handling too
        // For now, we'll store as string and let the system handle it
        updateData[suggestion.field] = suggestion.suggestedValue
      } else {
        // For other fields, direct assignment
        updateData[suggestion.field] = suggestion.suggestedValue
      }

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