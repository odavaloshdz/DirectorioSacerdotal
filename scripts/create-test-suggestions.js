const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function createTestSuggestions() {
  console.log('🔄 Creando sugerencias de prueba...')

  try {
    // Obtener sacerdotes aprobados
    const priests = await prisma.priest.findMany({
      where: { status: 'APPROVED' },
      include: { user: true }
    })

    if (priests.length === 0) {
      console.log('❌ No hay sacerdotes aprobados para crear sugerencias.')
      return
    }

    const testSuggestions = [
      {
        priestId: priests[0]?.id,
        field: 'phone',
        currentValue: priests[0]?.phone,
        suggestedValue: '395 123 4567',
        reason: 'Actualizar número de teléfono principal'
      },
      {
        priestId: priests[0]?.id,
        field: 'biography',
        currentValue: priests[0]?.biography,
        suggestedValue: 'Sacerdote ordenado en 2015, especialista en liturgia y pastoral juvenil. Ha servido en varias parroquias de la diócesis.',
        reason: 'Ampliar información biográfica'
      },
      {
        priestId: priests[1]?.id || priests[0]?.id,
        field: 'firstName',
        currentValue: priests[1]?.firstName || priests[0]?.firstName,
        suggestedValue: 'José María',
        reason: 'Corregir nombre completo según documentos oficiales'
      },
      {
        priestId: priests[1]?.id || priests[0]?.id,
        field: 'phone',
        currentValue: priests[1]?.phone || priests[0]?.phone,
        suggestedValue: '395 987 6543',
        reason: 'Nuevo número de contacto'
      }
    ]

    let createdCount = 0

    for (const suggestion of testSuggestions) {
      if (suggestion.priestId) {
        try {
          await prisma.profileSuggestion.create({
            data: {
              priestId: suggestion.priestId,
              field: suggestion.field,
              currentValue: suggestion.currentValue,
              suggestedValue: suggestion.suggestedValue,
              reason: suggestion.reason,
              status: 'PENDING'
            }
          })
          createdCount++
        } catch (error) {
          console.error(`Error creando sugerencia: ${error.message}`)
        }
      }
    }

    console.log(`✅ ${createdCount} sugerencias de prueba creadas exitosamente!`)

    // Mostrar estadísticas
    const totalSuggestions = await prisma.profileSuggestion.count()
    const pendingSuggestions = await prisma.profileSuggestion.count({
      where: { status: 'PENDING' }
    })

    console.log(`📊 Resumen:`)
    console.log(`   - Total de sugerencias: ${totalSuggestions}`)
    console.log(`   - Sugerencias pendientes: ${pendingSuggestions}`)

  } catch (error) {
    console.error('❌ Error creando sugerencias de prueba:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

createTestSuggestions()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  }) 