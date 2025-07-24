const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function migrateData() {
  console.log('🔄 Iniciando migración de datos...')

  try {
    // 1. Crear datos iniciales de ciudades
    console.log('📍 Creando ciudades iniciales...')
    
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
      console.log(`✅ Ciudad creada: ${cityData.name}`)
    }

    // 2. Crear especialidades iniciales
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

    const createdSpecialties = {}
    
    for (const specialtyData of specialtiesData) {
      const specialty = await prisma.specialty.upsert({
        where: { name: specialtyData.name },
        update: {},
        create: specialtyData
      })
      createdSpecialties[specialtyData.name] = specialty.id
      console.log(`✅ Especialidad creada: ${specialtyData.name}`)
    }

    // 3. Crear parroquias iniciales
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
      }
    ]

    const createdParishes = {}
    
    for (const parishData of parishes) {
      const parish = await prisma.parish.upsert({
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
      createdParishes[parishData.name] = parish.id
      console.log(`✅ Parroquia creada: ${parishData.name}`)
    }

    console.log('✅ Migración completada exitosamente!')
    console.log(`📊 Resumen:`)
    console.log(`   - ${Object.keys(createdCities).length} ciudades`)
    console.log(`   - ${Object.keys(createdSpecialties).length} especialidades`)
    console.log(`   - ${Object.keys(createdParishes).length} parroquias`)

  } catch (error) {
    console.error('❌ Error en la migración:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

migrateData()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  }) 