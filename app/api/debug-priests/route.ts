import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Fetch one priest to see the exact data structure
    const priest = await prisma.priest.findFirst({
      where: {
        status: 'APPROVED'
      },
      include: {
        user: {
          select: {
            email: true,
            name: true
          }
        },
        parish: {
          select: {
            id: true,
            name: true,
            city: {
              select: {
                name: true
              }
            }
          }
        },
        specialties: {
          include: {
            specialty: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      }
    })

    console.log('DEBUG PRIEST DATA:', JSON.stringify(priest, null, 2))

    return NextResponse.json({
      priest,
      message: 'Check server console for detailed log'
    })
  } catch (error) {
    console.error('Debug Error:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor', details: error },
      { status: 500 }
    )
  }
} 