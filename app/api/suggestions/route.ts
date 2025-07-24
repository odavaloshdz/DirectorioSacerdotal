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
    const priestStatus = (session.user as any)?.priest?.status

    if (userRole !== 'PRIEST' || priestStatus !== 'APPROVED') {
      return NextResponse.json(
        { error: 'Acceso denegado. Solo sacerdotes aprobados pueden acceder.' },
        { status: 403 }
      )
    }

    const userId = (session.user as any)?.id

    // Get priest record to find priestId
    const priest = await prisma.priest.findUnique({
      where: { userId: userId }
    })

    if (!priest) {
      return NextResponse.json(
        { error: 'Perfil de sacerdote no encontrado' },
        { status: 404 }
      )
    }

    const suggestions = await prisma.profileSuggestion.findMany({
      where: {
        priestId: priest.id
      },
      orderBy: {
        createdAt: 'desc'
      }
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

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      )
    }

    const userRole = (session.user as any)?.role
    const priestStatus = (session.user as any)?.priest?.status

    if (userRole !== 'PRIEST' || priestStatus !== 'APPROVED') {
      return NextResponse.json(
        { error: 'Acceso denegado. Solo sacerdotes aprobados pueden acceder.' },
        { status: 403 }
      )
    }

    const { field, suggestedValue, reason } = await request.json()

    // Validate required fields
    if (!field || !suggestedValue) {
      return NextResponse.json(
        { error: 'Campo y valor sugerido son requeridos' },
        { status: 400 }
      )
    }

    // Validate field name
    const validFields = ['firstName', 'lastName', 'parish', 'phone', 'specialties', 'biography', 'profileImage']
    if (!validFields.includes(field)) {
      return NextResponse.json(
        { error: 'Campo no válido' },
        { status: 400 }
      )
    }

    const userId = (session.user as any)?.id

    // Get priest record
    const priest = await prisma.priest.findUnique({
      where: { userId: userId }
    })

    if (!priest) {
      return NextResponse.json(
        { error: 'Perfil de sacerdote no encontrado' },
        { status: 404 }
      )
    }

    // Get current value
    let currentValue: string | null = null
    switch (field) {
      case 'firstName':
        currentValue = priest.firstName
        break
      case 'lastName':
        currentValue = priest.lastName
        break
      case 'parish':
        currentValue = priest.parish || null
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
        currentValue = priest.profileImage
        break
    }

    // Create suggestion
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