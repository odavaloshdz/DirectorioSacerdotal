import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    // Check if user is authorized to view directory
    const userRole = (session.user as any)?.role
    const priestStatus = (session.user as any)?.priest?.status

    if (userRole !== 'ADMIN' && (userRole !== 'PRIEST' || priestStatus !== 'APPROVED')) {
      return NextResponse.json(
        { error: 'No tienes permisos para ver el directorio' },
        { status: 403 }
      )
    }

    // Fetch approved priests
    const priests = await prisma.priest.findMany({
      where: {
        status: 'APPROVED'
      },
      include: {
        user: {
          select: {
            email: true,
            name: true
          }
        }
      },
      orderBy: {
        lastName: 'asc'
      }
    })

    return NextResponse.json({ priests })
  } catch (error) {
    console.error('Error fetching priests:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
} 