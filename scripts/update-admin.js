const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function updateAdmin() {
  try {
    console.log('🔄 Actualizando administrador con email real...')

    // Check if old admin exists and delete
    const oldAdmin = await prisma.user.findUnique({
      where: { email: 'admin@diocesis-sjl.org' }
    })

    if (oldAdmin) {
      console.log('🗑️  Eliminando administrador anterior...')
      await prisma.user.delete({
        where: { email: 'admin@diocesis-sjl.org' }
      })
    }

    // Check if new admin already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: 'comunicacion@diocesisdesanjuan.org' }
    })

    if (existingAdmin) {
      console.log('✅ El administrador con email real ya existe')
      console.log('📧 Email: comunicacion@diocesisdesanjuan.org')
      console.log('🔑 Contraseña: admin123')
      return
    }

    // Create new admin with real email
    const hashedPassword = await bcrypt.hash('admin123', 12)

    const admin = await prisma.user.create({
      data: {
        email: 'comunicacion@diocesisdesanjuan.org',
        password: hashedPassword,
        name: 'Administrador Diocesano',
        role: 'ADMIN'
      }
    })

    console.log('✅ Administrador actualizado exitosamente')
    console.log('📧 Email: comunicacion@diocesisdesanjuan.org')
    console.log('🔑 Contraseña: admin123')
    console.log('🌐 Sitio web: https://diocesisdesanjuan.org')

  } catch (error) {
    console.error('❌ Error actualizando administrador:', error)
  } finally {
    await prisma.$disconnect()
  }
}

updateAdmin() 