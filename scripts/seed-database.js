const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

const samplePriests = [
  {
    firstName: 'Juan Carlos',
    lastName: 'Martínez González',
    email: 'jcmartinez@diocesis-sjl.org',
    parish: 'Parroquia San José',
    phone: '+52 395 785 1234',
    specialties: ['Dirección Espiritual', 'Liturgia']
  },
  {
    firstName: 'Miguel Ángel',
    lastName: 'Rodríguez López',
    email: 'marodriguez@diocesis-sjl.org',
    parish: 'Catedral Metropolitana',
    phone: '+52 395 785 5678',
    specialties: ['Catequesis', 'Juventud', 'Formación']
  },
  {
    firstName: 'Francisco Javier',
    lastName: 'López Hernández',
    email: 'fjlopez@diocesis-sjl.org',
    parish: 'Parroquia del Sagrado Corazón',
    phone: '+52 395 785 9012',
    specialties: ['Matrimonios', 'Familia']
  },
  {
    firstName: 'José Luis',
    lastName: 'García Morales',
    email: 'jlgarcia@diocesis-sjl.org',
    parish: 'Parroquia Nuestra Señora de Guadalupe',
    phone: '+52 395 785 3456',
    specialties: ['Pastoral Social', 'Misiones']
  },
  {
    firstName: 'Carlos Eduardo',
    lastName: 'Mendoza Silva',
    email: 'cemendoza@diocesis-sjl.org',
    parish: 'Parroquia San Pedro Apóstol',
    phone: '+52 395 785 7890',
    specialties: ['Educación', 'Música Sacra']
  },
  {
    firstName: 'Roberto',
    lastName: 'Fernández Ruiz',
    email: 'rfernandez@diocesis-sjl.org',
    parish: 'Parroquia Santa María',
    phone: '+52 395 785 2345',
    specialties: ['Arte Sacro', 'Liturgia']
  }
]

async function seedDatabase() {
  try {
    console.log('🌱 Iniciando la creación de datos de ejemplo...')

    // Check if we already have sample data
    const existingPriests = await prisma.priest.count()
    if (existingPriests > 1) {
      console.log('❌ Ya existen datos en la base de datos')
      console.log(`   Sacerdotes registrados: ${existingPriests}`)
      console.log('   Use este script solo en una base de datos vacía')
      return
    }

    for (const priestData of samplePriests) {
      console.log(`➕ Creando: P. ${priestData.firstName} ${priestData.lastName}`)
      
      // Create a default password for all sample priests
      const hashedPassword = await bcrypt.hash('password123', 12)

      const user = await prisma.user.create({
        data: {
          email: priestData.email,
          password: hashedPassword,
          name: `${priestData.firstName} ${priestData.lastName}`,
          role: 'PRIEST',
          priest: {
            create: {
              firstName: priestData.firstName,
              lastName: priestData.lastName,
              parish: priestData.parish,
              phone: priestData.phone,
              specialties: JSON.stringify(priestData.specialties),
              status: 'APPROVED',
              approvedAt: new Date(),
              approvedBy: 'system'
            }
          }
        }
      })

      console.log(`   ✅ Creado: ${user.email}`)
    }

    // Create some pending priests for testing admin approval
    const pendingPriests = [
      {
        firstName: 'Antonio',
        lastName: 'Pérez Castro',
        email: 'aperez@diocesis-sjl.org',
        parish: 'Parroquia San Antonio',
        phone: '+52 395 785 4567',
        specialties: ['Juventud', 'Catequesis']
      },
      {
        firstName: 'Fernando',
        lastName: 'Jiménez Valle',
        email: 'fjimenez@diocesis-sjl.org',
        parish: 'Parroquia San Fernando',
        phone: '+52 395 785 8901',
        specialties: ['Familia', 'Dirección Espiritual']
      }
    ]

    console.log('\n📋 Creando sacerdotes pendientes de aprobación...')
    
    for (const priestData of pendingPriests) {
      console.log(`⏳ Creando (pendiente): P. ${priestData.firstName} ${priestData.lastName}`)
      
      const hashedPassword = await bcrypt.hash('password123', 12)

      const user = await prisma.user.create({
        data: {
          email: priestData.email,
          password: hashedPassword,
          name: `${priestData.firstName} ${priestData.lastName}`,
          role: 'USER',
          priest: {
            create: {
              firstName: priestData.firstName,
              lastName: priestData.lastName,
              parish: priestData.parish,
              phone: priestData.phone,
              specialties: JSON.stringify(priestData.specialties),
              status: 'PENDING'
            }
          }
        }
      })

      console.log(`   ⏳ Pendiente: ${user.email}`)
    }

    console.log('\n✅ Datos de ejemplo creados exitosamente!')
    console.log('\n📊 Resumen:')
    console.log(`   👤 ${samplePriests.length} sacerdotes aprobados`)
    console.log(`   ⏳ ${pendingPriests.length} sacerdotes pendientes`)
    console.log('\n🔑 Credenciales de prueba:')
    console.log('   📧 Email: cualquier email de los creados arriba')
    console.log('   🔑 Contraseña: password123')
    console.log('\n🔧 Admin:')
    console.log('   📧 Email: admin@diocesis-sjl.org')
    console.log('   🔑 Contraseña: admin123')

  } catch (error) {
    console.error('❌ Error creando datos de ejemplo:', error)
  } finally {
    await prisma.$disconnect()
  }
}

seedDatabase() 