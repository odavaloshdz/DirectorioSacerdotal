import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Fetch suggestions for the current user
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const userRole = (session.user as any)?.role
    const userId = (session.user as any)?.id

    // Only approved priests can access their own suggestions
    if (userRole !== 'PRIEST') {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
    }

    // Get the priest profile
    const priest = await prisma.priest.findUnique({
      where: { userId },
      select: { id: true, status: true }
    })

    if (!priest || priest.status !== 'APPROVED') {
      return NextResponse.json({ error: 'Sacerdote no encontrado o no aprobado' }, { status: 404 })
    }

    // Fetch suggestions for this priest
    const suggestions = await prisma.profileSuggestion.findMany({
      where: { priestId: priest.id },
      orderBy: [
        { status: 'asc' }, // PENDING first
        { createdAt: 'desc' }
      ]
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

// POST - Create a new suggestion
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const userRole = (session.user as any)?.role
    const userId = (session.user as any)?.id

    // Only approved priests can create suggestions
    if (userRole !== 'PRIEST') {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
    }

    // Get the priest profile
    const priest = await prisma.priest.findUnique({
      where: { userId },
      include: {
        parish: true,
        specialties: {
          include: {
            specialty: true
          }
        }
      }
    })

    if (!priest || priest.status !== 'APPROVED') {
      return NextResponse.json({ error: 'Sacerdote no encontrado o no aprobado' }, { status: 404 })
    }

    const { field, suggestedValue, reason } = await request.json()

    // Validate required fields
    if (!field || !suggestedValue) {
      return NextResponse.json(
        { error: 'Campo y valor sugerido son requeridos' },
        { status: 400 }
      )
    }

    // Validate field is allowed to be changed
    const allowedFields = [
      'firstName', 'lastName', 'phone', 'biography', 
      'parishId', 'specialties', 'profileImage'
    ]

    if (!allowedFields.includes(field)) {
      return NextResponse.json(
        { error: 'Campo no válido para sugerencia' },
        { status: 400 }
      )
    }

    // Get current value for the field
    let currentValue: string | null = null
    switch (field) {
      case 'firstName':
        currentValue = priest.firstName
        break
      case 'lastName':
        currentValue = priest.lastName
        break
      case 'phone':
        currentValue = priest.phone
        break
      case 'biography':
        currentValue = priest.biography
        break
      case 'parishId':
        currentValue = priest.parishId
        break
      case 'specialties':
        currentValue = priest.specialties.map(ps => ps.specialty.name).join(', ')
        break
      case 'profileImage':
        currentValue = priest.profileImage ? 'Imagen cargada' : null
        break
    }

    // Check if there's already a pending suggestion for this field
    const existingPendingSuggestion = await prisma.profileSuggestion.findFirst({
      where: {
        priestId: priest.id,
        field,
        status: 'PENDING'
      }
    })

    if (existingPendingSuggestion) {
      return NextResponse.json(
        { error: 'Ya existe una sugerencia pendiente para este campo' },
        { status: 400 }
      )
    }

    // Create the suggestion
    const suggestion = await prisma.profileSuggestion.create({
      data: {
        priestId: priest.id,
        field,
        currentValue,
        suggestedValue,
        reason: reason || null,
        status: 'PENDING'
      }
    })

    return NextResponse.json({
      message: 'Sugerencia creada exitosamente',
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