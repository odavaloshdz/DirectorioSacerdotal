import { NextResponse } from 'next/server'
import { setupProduction } from '../../../scripts/setup-production.js'

export async function GET() {
  try {
    // Only allow in production environment or if specifically enabled
    if (process.env.NODE_ENV === 'production' || process.env.ENABLE_SETUP === 'true') {
      await setupProduction()
      
      return NextResponse.json({
        success: true,
        message: 'Configuración de producción completada exitosamente',
        adminEmail: 'admin@diocesisdesanjuan.org',
        adminPassword: 'Admin123!',
        warning: '⚠️ CAMBIAR LA CONTRASEÑA INMEDIATAMENTE'
      })
    } else {
      return NextResponse.json(
        { error: 'Setup de producción no habilitado en este entorno' },
        { status: 403 }
      )
    }
  } catch (error) {
    console.error('Error en setup de producción:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Error en la configuración de producción',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    )
  }
}

export async function POST() {
  return GET() // Allow POST as well for flexibility
} 