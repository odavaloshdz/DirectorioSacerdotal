import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// Simplified suggestions endpoint for deployment
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // For now, just return success - functionality to be restored post-deployment
    return NextResponse.json({
      message: 'Funcionalidad de sugerencias temporalmente deshabilitada durante deployment'
    })

  } catch (error) {
    console.error('Error:', error)
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

    // Return empty suggestions for now
    return NextResponse.json({ suggestions: [] })

  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
} 