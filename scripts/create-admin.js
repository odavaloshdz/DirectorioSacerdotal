const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function createAdmin() {
  try {
    // Check if admin already exists
    const existingAdmin = await prisma.user.findFirst({
      where: {
        role: 'ADMIN'
      }
    })

    if (existingAdmin) {
      console.log('❌ Ya existe un administrador en el sistema')
      return
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 12)

    const admin = await prisma.user.create({
      data: {
        email: 'comunicacion@diocesisdesanjuan.org',
        password: hashedPassword,
        name: 'Administrador Diocesano',
        role: 'ADMIN'
      }
    })

    console.log('✅ Administrador creado exitosamente')
    console.log('📧 Email: comunicacion@diocesisdesanjuan.org')
    console.log('🔑 Contraseña: admin123')
    console.log('⚠️  Por favor, cambie la contraseña después del primer inicio de sesión')

  } catch (error) {
    console.error('Error creando administrador:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createAdmin() 