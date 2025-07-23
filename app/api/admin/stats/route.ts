import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || (session.user as any)?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const [totalPriests, approvedPriests, pendingPriests, rejectedPriests] = await Promise.all([
      prisma.priest.count(),
      prisma.priest.count({ where: { status: 'APPROVED' } }),
      prisma.priest.count({ where: { status: 'PENDING' } }),
      prisma.priest.count({ where: { status: 'REJECTED' } })
    ])

    const stats = {
      totalPriests,
      approvedPriests,
      pendingPriests,
      rejectedPriests
    }

    return NextResponse.json({ stats })
  } catch (error) {
    console.error('Error fetching stats:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
} 