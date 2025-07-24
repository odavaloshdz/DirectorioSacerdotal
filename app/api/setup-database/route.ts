import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    console.log('🔄 Iniciando setup de base de datos...')
    
    // First, let's try to create tables by pushing schema
    console.log('📋 Verificando conexión a base de datos...')
    
    // Test database connection
    await prisma.$connect()
    console.log('✅ Conexión exitosa a PostgreSQL')
    
    // Try to create a simple user to test if tables exist
    console.log('🔍 Verificando si las tablas existen...')
    
    try {
      // Try a simple query to see if tables exist
      await prisma.user.findFirst()
      console.log('✅ Tablas ya existen')
    } catch (error: any) {
      if (error.message.includes('does not exist')) {
        console.log('⚠️ Las tablas no existen. Necesitas ejecutar prisma db push.')
        return NextResponse.json({
          success: false,
          error: 'Las tablas de la base de datos no existen',
          details: 'Necesitas ejecutar "prisma db push" para crear las tablas.',
          instructions: [
            '1. Clona el repositorio localmente',
            '2. Configura las variables de entorno',
            '3. Ejecuta: npx prisma db push',
            '4. Luego vuelve a intentar el setup de producción'
          ]
        })
      }
      throw error
    }
    
    // If we get here, tables exist, redirect to production setup
    console.log('🔄 Tablas existen, ejecutando setup de producción...')
    
    // Import and run production setup
    const setupResponse = await fetch(new URL('/api/setup-production', process.env.NEXTAUTH_URL || 'http://localhost:3000'))
    const setupData = await setupResponse.json()
    
    return NextResponse.json({
      success: true,
      message: 'Setup de base de datos completado',
      productionSetup: setupData
    })
    
  } catch (error: any) {
    console.error('❌ Error en setup de base de datos:', error)
    return NextResponse.json({
      success: false,
      error: 'Error en el setup de base de datos',
      details: error.message
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
} 