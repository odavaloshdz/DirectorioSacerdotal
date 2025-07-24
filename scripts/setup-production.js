const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function setupProduction() {
  console.log('🚀 Configurando base de datos para producción...')

  try {
    // 1. Crear administrador principal
    console.log('👤 Creando administrador principal...')
    
    const adminEmail = 'admin@diocesisdesanjuan.org'
    const adminPassword = 'Admin123!' // Cambiar en producción
    
    // Verificar si el admin ya existe
    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminEmail }
    })

    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash(adminPassword, 12)
      
      const adminUser = await prisma.user.create({
        data: {
          email: adminEmail,
          password: hashedPassword,
          name: 'Administrador',
          role: 'ADMIN'
        }
      })
      
      console.log(`✅ Administrador creado: ${adminEmail}`)
      console.log(`🔑 Contraseña temporal: ${adminPassword}`)
      console.log('⚠️  IMPORTANTE: Cambiar la contraseña después del primer login')
    } else {
      console.log('✅ El administrador ya existe')
    }

    // 2. Crear ciudades iniciales
    console.log('🏙️ Creando ciudades iniciales...')
    
    const cities = [
      { name: 'San Juan de los Lagos', state: 'Jalisco' },
      { name: 'Guadalajara', state: 'Jalisco' },
      { name: 'Lagos de Moreno', state: 'Jalisco' },
      { name: 'Tepatitlán', state: 'Jalisco' },
      { name: 'Encarnación de Díaz', state: 'Jalisco' }
    ]

    const createdCities = {}
    
    for (const cityData of cities) {
      const city = await prisma.city.upsert({
        where: { name: cityData.name },
        update: {},
        create: cityData
      })
      createdCities[cityData.name] = city.id
      console.log(`✅ Ciudad: ${cityData.name}`)
    }

    // 3. Crear especialidades iniciales
    console.log('🎯 Creando especialidades iniciales...')
    
    const specialtiesData = [
      { name: 'Dirección Espiritual', description: 'Acompañamiento espiritual personalizado' },
      { name: 'Liturgia', description: 'Celebraciones litúrgicas y sacramentos' },
      { name: 'Catequesis', description: 'Enseñanza y formación en la fe' },
      { name: 'Juventud', description: 'Pastoral juvenil y vocacional' },
      { name: 'Matrimonios', description: 'Preparación matrimonial y familiar' },
      { name: 'Familia', description: 'Pastoral familiar' },
      { name: 'Formación', description: 'Formación de laicos y agentes pastorales' },
      { name: 'Misiones', description: 'Actividad misionera' },
      { name: 'Pastoral Social', description: 'Acción social y caridad' },
      { name: 'Educación', description: 'Ministerio educativo' },
      { name: 'Música Sacra', description: 'Ministerio musical litúrgico' },
      { name: 'Arte Sacro', description: 'Arte y expresión religiosa' }
    ]

    for (const specialtyData of specialtiesData) {
      await prisma.specialty.upsert({
        where: { name: specialtyData.name },
        update: {},
        create: specialtyData
      })
      console.log(`✅ Especialidad: ${specialtyData.name}`)
    }

    // 4. Crear parroquias iniciales
    console.log('⛪ Creando parroquias iniciales...')
    
    const parishes = [
      { 
        name: 'Basílica de Nuestra Señora de San Juan de los Lagos',
        city: 'San Juan de los Lagos',
        address: 'Plaza Principal s/n, Centro',
        phone: '395 785 0570',
        email: 'basilica@diocesisdesanjuan.org'
      },
      {
        name: 'Parroquia San José',
        city: 'San Juan de los Lagos',
        address: 'Calle Hidalgo 123',
        phone: '395 785 1234'
      },
      {
        name: 'Parroquia del Sagrado Corazón',
        city: 'Lagos de Moreno',
        address: 'Centro Histórico'
      },
      {
        name: 'Catedral Metropolitana',
        city: 'Guadalajara',
        address: 'Av. Alcalde 10, Centro Histórico'
      },
      {
        name: 'Parroquia San Miguel Arcángel',
        city: 'Tepatitlán',
        address: 'Calle Morelos 45',
        phone: '378 781 2345'
      }
    ]

    for (const parishData of parishes) {
      await prisma.parish.upsert({
        where: { 
          name_cityId: {
            name: parishData.name,
            cityId: createdCities[parishData.city]
          }
        },
        update: {},
        create: {
          name: parishData.name,
          cityId: createdCities[parishData.city],
          address: parishData.address || null,
          phone: parishData.phone || null,
          email: parishData.email || null
        }
      })
      console.log(`✅ Parroquia: ${parishData.name}`)
    }

    console.log('🎉 ¡Configuración de producción completada exitosamente!')
    
    // Mostrar resumen
    const totalCities = await prisma.city.count()
    const totalParishes = await prisma.parish.count()
    const totalSpecialties = await prisma.specialty.count()
    
    console.log('')
    console.log('📊 Resumen de la configuración:')
    console.log(`   - Ciudades: ${totalCities}`)
    console.log(`   - Parroquias: ${totalParishes}`)
    console.log(`   - Especialidades: ${totalSpecialties}`)
    console.log(`   - Admin email: ${adminEmail}`)
    console.log('')
    console.log('🔗 Para acceder al sistema:')
    console.log('   1. Ve a https://tu-dominio.vercel.app/auth/signin')
    console.log(`   2. Email: ${adminEmail}`)
    console.log(`   3. Contraseña: ${adminPassword}`)
    console.log('   4. ¡CAMBIA LA CONTRASEÑA INMEDIATAMENTE!')

  } catch (error) {
    console.error('❌ Error en la configuración de producción:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Solo ejecutar si es llamado directamente
if (require.main === module) {
  setupProduction()
    .catch((e) => {
      console.error(e)
      process.exit(1)
    })
}

module.exports = { setupProduction } 