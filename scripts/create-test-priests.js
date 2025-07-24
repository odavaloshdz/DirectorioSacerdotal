const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function createTestPriests() {
  console.log('🔄 Creando 10 sacerdotes de prueba...')

  try {
    // Crear ciudades si no existen
    const cities = [
      { name: 'San Juan de los Lagos', state: 'Jalisco' },
      { name: 'Lagos de Moreno', state: 'Jalisco' },
      { name: 'Teocaltiche', state: 'Jalisco' },
      { name: 'Jalostotitlán', state: 'Jalisco' },
      { name: 'San Diego de Alejandría', state: 'Jalisco' }
    ]

    for (const cityData of cities) {
      await prisma.city.upsert({
        where: { name: cityData.name },
        update: {},
        create: cityData
      })
    }

    // Obtener ciudades creadas
    const createdCities = await prisma.city.findMany()
    console.log(`✅ ${createdCities.length} ciudades disponibles`)

    // Crear parroquias si no existen
    const parishes = [
      { name: 'Basílica de Nuestra Señora de San Juan de los Lagos', cityName: 'San Juan de los Lagos' },
      { name: 'Parroquia de San José', cityName: 'Lagos de Moreno' },
      { name: 'Parroquia del Sagrado Corazón', cityName: 'Teocaltiche' },
      { name: 'Parroquia de la Inmaculada Concepción', cityName: 'Jalostotitlán' },
      { name: 'Parroquia de San Diego', cityName: 'San Diego de Alejandría' },
      { name: 'Capilla de la Virgen de Guadalupe', cityName: 'San Juan de los Lagos' },
      { name: 'Parroquia de San Miguel Arcángel', cityName: 'Lagos de Moreno' },
      { name: 'Templo de San Francisco', cityName: 'Teocaltiche' }
    ]

    for (const parishData of parishes) {
      const city = createdCities.find(c => c.name === parishData.cityName)
      if (city) {
        await prisma.parish.upsert({
          where: { 
            name_cityId: { 
              name: parishData.name, 
              cityId: city.id 
            } 
          },
          update: {},
          create: {
            name: parishData.name,
            cityId: city.id,
            address: `Dirección de ${parishData.name}`,
            phone: '395 785 0000'
          }
        })
      }
    }

    // Obtener parroquias creadas
    const createdParishes = await prisma.parish.findMany({
      include: { city: true }
    })
    console.log(`✅ ${createdParishes.length} parroquias disponibles`)

    // Crear especialidades si no existen
    const specialties = [
      { name: 'Liturgia', description: 'Especialista en ceremonias litúrgicas' },
      { name: 'Catequesis', description: 'Enseñanza de la fe católica' },
      { name: 'Pastoral Juvenil', description: 'Trabajo con jóvenes' },
      { name: 'Pastoral Familiar', description: 'Acompañamiento a familias' },
      { name: 'Dirección Espiritual', description: 'Guía espiritual personal' },
      { name: 'Música Sacra', description: 'Música en celebraciones religiosas' },
      { name: 'Pastoral Social', description: 'Trabajo social y comunitario' },
      { name: 'Pastoral de Enfermos', description: 'Atención a enfermos' }
    ]

    for (const specialtyData of specialties) {
      await prisma.specialty.upsert({
        where: { name: specialtyData.name },
        update: {},
        create: specialtyData
      })
    }

    const createdSpecialties = await prisma.specialty.findMany()
    console.log(`✅ ${createdSpecialties.length} especialidades disponibles`)

    // Datos de sacerdotes de prueba
    const testPriests = [
      {
        firstName: 'José María',
        lastName: 'González Pérez',
        email: 'jose.gonzalez@diocesis.org',
        password: 'Sacerdote123!',
        phone: '395 123 4567',
        ordainedDate: '2015-06-15',
        biography: 'Sacerdote ordenado en 2015, especialista en liturgia y pastoral juvenil.',
        parishName: 'Basílica de Nuestra Señora de San Juan de los Lagos',
        specialtyNames: ['Liturgia', 'Pastoral Juvenil']
      },
      {
        firstName: 'Miguel Ángel',
        lastName: 'Rodríguez López',
        email: 'miguel.rodriguez@diocesis.org',
        password: 'Sacerdote123!',
        phone: '395 234 5678',
        ordainedDate: '2012-05-20',
        biography: 'Sacerdote con experiencia en catequesis y dirección espiritual.',
        parishName: 'Parroquia de San José',
        specialtyNames: ['Catequesis', 'Dirección Espiritual']
      },
      {
        firstName: 'Francisco Javier',
        lastName: 'Martínez Silva',
        email: 'francisco.martinez@diocesis.org',
        password: 'Sacerdote123!',
        phone: '395 345 6789',
        ordainedDate: '2018-08-10',
        biography: 'Sacerdote joven dedicado a la pastoral familiar y social.',
        parishName: 'Parroquia del Sagrado Corazón',
        specialtyNames: ['Pastoral Familiar', 'Pastoral Social']
      },
      {
        firstName: 'Carlos Eduardo',
        lastName: 'Hernández Morales',
        email: 'carlos.hernandez@diocesis.org',
        password: 'Sacerdote123!',
        phone: '395 456 7890',
        ordainedDate: '2010-03-25',
        biography: 'Sacerdote veterano especialista en música sacra y liturgia.',
        parishName: 'Parroquia de la Inmaculada Concepción',
        specialtyNames: ['Música Sacra', 'Liturgia']
      },
      {
        firstName: 'Roberto',
        lastName: 'Sánchez Gutiérrez',
        email: 'roberto.sanchez@diocesis.org',
        password: 'Sacerdote123!',
        phone: '395 567 8901',
        ordainedDate: '2016-11-12',
        biography: 'Sacerdote dedicado a la pastoral de enfermos y dirección espiritual.',
        parishName: 'Parroquia de San Diego',
        specialtyNames: ['Pastoral de Enfermos', 'Dirección Espiritual']
      },
      {
        firstName: 'Antonio',
        lastName: 'Ramírez Castro',
        email: 'antonio.ramirez@diocesis.org',
        password: 'Sacerdote123!',
        phone: '395 678 9012',
        ordainedDate: '2014-02-18',
        biography: 'Sacerdote especialista en pastoral juvenil y catequesis.',
        parishName: 'Capilla de la Virgen de Guadalupe',
        specialtyNames: ['Pastoral Juvenil', 'Catequesis']
      },
      {
        firstName: 'Fernando',
        lastName: 'Torres Mendoza',
        email: 'fernando.torres@diocesis.org',
        password: 'Sacerdote123!',
        phone: '395 789 0123',
        ordainedDate: '2019-07-30',
        biography: 'Sacerdote recién ordenado con enfoque en pastoral social.',
        parishName: 'Parroquia de San Miguel Arcángel',
        specialtyNames: ['Pastoral Social', 'Pastoral Juvenil']
      },
      {
        firstName: 'Alejandro',
        lastName: 'Vargas Jiménez',
        email: 'alejandro.vargas@diocesis.org',
        password: 'Sacerdote123!',
        phone: '395 890 1234',
        ordainedDate: '2013-04-14',
        biography: 'Sacerdote con amplia experiencia en liturgia y música sacra.',
        parishName: 'Templo de San Francisco',
        specialtyNames: ['Liturgia', 'Música Sacra']
      },
      {
        firstName: 'Ricardo',
        lastName: 'Moreno Álvarez',
        email: 'ricardo.moreno@diocesis.org',
        password: 'Sacerdote123!',
        phone: '395 901 2345',
        ordainedDate: '2017-09-05',
        biography: 'Sacerdote especialista en pastoral familiar y dirección espiritual.',
        parishName: 'Basílica de Nuestra Señora de San Juan de los Lagos',
        specialtyNames: ['Pastoral Familiar', 'Dirección Espiritual']
      },
      {
        firstName: 'Gabriel',
        lastName: 'Ortega Ruiz',
        email: 'gabriel.ortega@diocesis.org',
        password: 'Sacerdote123!',
        phone: '395 012 3456',
        ordainedDate: '2011-12-08',
        biography: 'Sacerdote veterano dedicado a la catequesis y pastoral de enfermos.',
        parishName: 'Parroquia de San José',
        specialtyNames: ['Catequesis', 'Pastoral de Enfermos']
      }
    ]

    let createdCount = 0

    for (const priestData of testPriests) {
      try {
        // Buscar parroquia
        const parish = createdParishes.find(p => p.name === priestData.parishName)
        if (!parish) {
          console.log(`⚠️ Parroquia no encontrada: ${priestData.parishName}`)
          continue
        }

        // Verificar si el usuario ya existe
        const existingUser = await prisma.user.findUnique({
          where: { email: priestData.email }
        })

        let user
        if (existingUser) {
          console.log(`👤 Usuario ya existe: ${priestData.email}`)
          user = existingUser
        } else {
          // Hash de la contraseña
          const hashedPassword = await bcrypt.hash(priestData.password, 12)

          // Crear usuario
          user = await prisma.user.create({
            data: {
              name: `${priestData.firstName} ${priestData.lastName}`,
              email: priestData.email,
              password: hashedPassword,
              role: 'PRIEST',
              emailVerified: new Date()
            }
          })
          console.log(`✅ Usuario creado: ${priestData.email}`)
        }

        // Verificar si el sacerdote ya existe
        const existingPriest = await prisma.priest.findUnique({
          where: { userId: user.id }
        })

        let priest
        if (existingPriest) {
          console.log(`⛪ Sacerdote ya existe para: ${priestData.email}`)
          priest = existingPriest
        } else {
          // Crear sacerdote
          priest = await prisma.priest.create({
            data: {
              userId: user.id,
              firstName: priestData.firstName,
              lastName: priestData.lastName,
              phone: priestData.phone,
              ordainedDate: new Date(priestData.ordainedDate),
              biography: priestData.biography,
              parishId: parish.id,
              status: 'APPROVED',
              approvedAt: new Date(),
              approvedBy: 'SYSTEM'
            }
          })
          console.log(`⛪ Sacerdote creado: ${priestData.firstName} ${priestData.lastName}`)
        }

        // Asignar especialidades
        for (const specialtyName of priestData.specialtyNames) {
          const specialty = createdSpecialties.find(s => s.name === specialtyName)
          if (specialty) {
            await prisma.priestSpecialty.upsert({
              where: {
                priestId_specialtyId: {
                  priestId: priest.id,
                  specialtyId: specialty.id
                }
              },
              update: {},
              create: {
                priestId: priest.id,
                specialtyId: specialty.id
              }
            })
          }
        }

        createdCount++
      } catch (error) {
        console.error(`❌ Error creando sacerdote ${priestData.firstName} ${priestData.lastName}:`, error)
      }
    }

    // Crear admin de prueba
    try {
      const adminEmail = 'admin@diocesis.org'
      const adminPassword = 'Admin123!'
      
      const existingAdmin = await prisma.user.findUnique({
        where: { email: adminEmail }
      })

      if (!existingAdmin) {
        const hashedAdminPassword = await bcrypt.hash(adminPassword, 12)
        await prisma.user.create({
          data: {
            name: 'Administrador del Sistema',
            email: adminEmail,
            password: hashedAdminPassword,
            role: 'ADMIN',
            emailVerified: new Date()
          }
        })
        console.log(`🔑 Administrador creado: ${adminEmail}`)
      } else {
        console.log(`🔑 Administrador ya existe: ${adminEmail}`)
      }
    } catch (error) {
      console.error('❌ Error creando administrador:', error)
    }

    console.log(`\n🎉 Proceso completado!`)
    console.log(`✅ ${createdCount} sacerdotes procesados`)
    console.log(`\n📋 CREDENCIALES DE PRUEBA:`)
    console.log(`\n🔑 ADMINISTRADOR:`)
    console.log(`   Email: admin@diocesis.org`)
    console.log(`   Password: Admin123!`)
    console.log(`\n⛪ SACERDOTES (todos usan la misma contraseña):`)
    console.log(`   Password: Sacerdote123!`)
    console.log(`   Emails:`)
    
    testPriests.forEach((priest, index) => {
      console.log(`   ${index + 1}. ${priest.email}`)
    })

    console.log(`\n🌐 Puedes usar cualquiera de estas credenciales para iniciar sesión.`)

  } catch (error) {
    console.error('❌ Error general:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createTestPriests()
  .catch((e) => {
    console.error('❌ Error ejecutando script:', e)
    process.exit(1)
  }) 