import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || (session.user as any)?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Get all priests with images
    const priests = await prisma.priest.findMany({
      where: {
        profileImage: { not: null }
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        profileImage: true,
        status: true
      }
    })

    // Analyze image URLs
    const imageAnalysis = priests.map(priest => {
      const imageUrl = priest.profileImage
      let imageType = 'unknown'
      let isCloudinary = false
      let isLocal = false
      
      if (imageUrl) {
        if (imageUrl.includes('cloudinary.com')) {
          imageType = 'cloudinary'
          isCloudinary = true
        } else if (imageUrl.startsWith('/uploads/')) {
          imageType = 'local'
          isLocal = true
        } else {
          imageType = 'other'
        }
      }

      return {
        id: priest.id,
        name: `${priest.firstName} ${priest.lastName}`,
        status: priest.status,
        imageUrl,
        imageType,
        isCloudinary,
        isLocal
      }
    })

    const stats = {
      total: priests.length,
      cloudinary: imageAnalysis.filter(p => p.isCloudinary).length,
      local: imageAnalysis.filter(p => p.isLocal).length,
      other: imageAnalysis.filter(p => !p.isCloudinary && !p.isLocal).length
    }

    return NextResponse.json({
      message: 'Image Debug Analysis',
      stats,
      priests: imageAnalysis,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    return NextResponse.json(
      { 
        error: 'Error analyzing images', 
        details: (error as Error).message 
      },
      { status: 500 }
    )
  }
} 