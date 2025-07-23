import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || (session.user as any)?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const { priestId, action } = await request.json()

    if (!priestId || !action || !['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: 'Datos inválidos' },
        { status: 400 }
      )
    }

    const priest = await prisma.priest.findUnique({
      where: { id: priestId },
      include: { user: true }
    })

    if (!priest) {
      return NextResponse.json(
        { error: 'Sacerdote no encontrado' },
        { status: 404 }
      )
    }

    if (priest.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Este sacerdote ya ha sido procesado' },
        { status: 400 }
      )
    }

    const newStatus = action === 'approve' ? 'APPROVED' : 'REJECTED'
    const adminId = (session.user as any).id

    // Update priest status
    await prisma.priest.update({
      where: { id: priestId },
      data: {
        status: newStatus,
        approvedAt: action === 'approve' ? new Date() : null,
        approvedBy: action === 'approve' ? adminId : null
      }
    })

    // Update user role if approved
    if (action === 'approve') {
      await prisma.user.update({
        where: { id: priest.userId },
        data: { role: 'PRIEST' }
      })
    }

    return NextResponse.json({
      message: action === 'approve' 
        ? `P. ${priest.firstName} ${priest.lastName} ha sido aprobado` 
        : `P. ${priest.firstName} ${priest.lastName} ha sido rechazado`,
      priest: {
        id: priest.id,
        name: `${priest.firstName} ${priest.lastName}`,
        status: newStatus
      }
    })

  } catch (error) {
    console.error('Error managing priest:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
} 