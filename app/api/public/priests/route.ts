import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const parish = searchParams.get('parish') || ''
    const limit = parseInt(searchParams.get('limit') || '12')

    // Build search conditions
    const whereConditions: any = {
      status: 'APPROVED' // Only approved priests
    }

    if (search) {
      whereConditions.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { 
          parish: { 
            name: { contains: search, mode: 'insensitive' }
          } 
        },
        {
          specialties: {
            some: {
              specialty: {
                name: { contains: search, mode: 'insensitive' }
              }
            }
          }
        }
      ]
    }

    if (parish) {
      whereConditions.parish = {
        name: { contains: parish, mode: 'insensitive' }
      }
    }

    // Fetch priests with public information only (no phone, email, biography)
    const allPriests = await prisma.priest.findMany({
      where: whereConditions,
      include: {
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
      },
      orderBy: [
        { lastName: 'asc' },
        { firstName: 'asc' }
      ],
      take: limit
    })

    // Filter out private information from the response
    const priests = allPriests.map(priest => ({
      id: priest.id,
      firstName: priest.firstName,
      lastName: priest.lastName,
      profileImage: priest.profileImage,
      ordainedDate: priest.ordainedDate,
      parish: priest.parish,
      specialties: priest.specialties
      // Explicitly exclude: phone, biography, user (email)
    }))

    // Get list of parishes for filtering
    const parishes = await prisma.parish.findMany({
      where: {
        priests: {
          some: {
            status: 'APPROVED'
          }
        }
      },
      select: {
        id: true,
        name: true,
        city: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    })

    return NextResponse.json({
      priests,
      parishes,
      total: priests.length
    })
  } catch (error) {
    console.error('Error fetching public priests:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
} 