import { NextResponse } from 'next/server'
import { cloudinary } from '@/lib/cloudinary'

export async function GET() {
  try {
    // Test Cloudinary configuration
    const config = {
      cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET ? '***CONFIGURED***' : 'NOT SET',
    }

    // Test Cloudinary connection
    let cloudinaryTest = null
    try {
      const result = await cloudinary.api.ping()
      cloudinaryTest = { status: 'success', result }
    } catch (error) {
      cloudinaryTest = { status: 'error', error: (error as Error).message }
    }

    return NextResponse.json({
      message: 'Cloudinary Diagnostic Test',
      config,
      cloudinaryTest,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    return NextResponse.json(
      { 
        error: 'Error testing Cloudinary', 
        details: (error as Error).message,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
} 