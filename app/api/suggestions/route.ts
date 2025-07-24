import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { field, newValue } = body

    // Get priest record
    const priest = await prisma.priest.findUnique({
      where: { userId: session.user.id }
    })

    if (!priest) {
      return NextResponse.json({ error: 'Perfil de sacerdote no encontrado' }, { status: 404 })
    }

    let currentValue: any = null

    // Get current value based on field - using correct field names
    switch (field) {
      case 'firstName':
        currentValue = priest.firstName
        break
      case 'lastName':
        currentValue = priest.lastName
        break
      case 'parish':
        currentValue = priest.parishId // Use parishId instead of parish
        break
      case 'phone':
        currentValue = priest.phone
        break
      case 'specialties':
        currentValue = null // Simplified for deployment
        break
      case 'biography':
        currentValue = priest.biography
        break
      case 'profileImage':
        currentValue = priest.profileImage || null
        break
      default:
        return NextResponse.json({ error: 'Campo no válido' }, { status: 400 })
    }

    // Create suggestion
    const suggestion = await prisma.profileSuggestion.create({
      data: {
        priestId: priest.id,
        field,
        currentValue: currentValue?.toString() || null,
        suggestedValue: newValue,
        status: 'PENDING'
      }
    })

    return NextResponse.json({
      message: 'Sugerencia enviada exitosamente',
      suggestion
    })

  } catch (error) {
    console.error('Error creating suggestion:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Get suggestions for current priest
    const priest = await prisma.priest.findUnique({
      where: { userId: session.user.id }
    })

    if (!priest) {
      return NextResponse.json({ error: 'Perfil de sacerdote no encontrado' }, { status: 404 })
    }

    const suggestions = await prisma.profileSuggestion.findMany({
      where: { priestId: priest.id },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ suggestions })

  } catch (error) {
    console.error('Error fetching suggestions:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
} 