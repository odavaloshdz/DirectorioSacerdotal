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

    const priest = await prisma.priest.findUnique({
      where: {
        userId: userId
      },
      include: {
        user: {
          select: {
            email: true
          }
        }
      }
    })

    if (!priest) {
      return NextResponse.json(
        { error: 'Perfil de sacerdote no encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      profile: priest
    })
  } catch (error) {
    console.error('Error fetching profile:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
} 