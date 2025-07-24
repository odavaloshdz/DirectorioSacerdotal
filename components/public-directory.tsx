'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { MagnifyingGlassIcon, MapPinIcon, CalendarIcon } from '@heroicons/react/24/outline'

interface Priest {
  id: string
  firstName: string
  lastName: string
  profileImage: string | null
  ordainedDate: string | null
  parish: {
    id: string
    name: string
    city: {
      name: string
    }
  } | null
  specialties: Array<{
    specialty: {
      id: string
      name: string
    }
  }>
}

interface Parish {
  id: string
  name: string
  city: {
    name: string
  }
}

export function PublicDirectory() {
  const [priests, setPriests] = useState<Priest[]>([])
  const [parishes, setParishes] = useState<Parish[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [parishFilter, setParishFilter] = useState('')
  const [showAll, setShowAll] = useState(false)

  useEffect(() => {
    fetchPriests()
  }, [searchTerm, parishFilter])

  const fetchPriests = async () => {
    try {
      const params = new URLSearchParams()
      if (searchTerm) params.append('search', searchTerm)
      if (parishFilter) params.append('parish', parishFilter)
      
      const response = await fetch(`/api/public/priests?${params}`)
      const data = await response.json()
      
      if (response.ok) {
        setPriests(data.priests || [])
        setParishes(data.parishes || [])
      }
    } catch (error) {
      console.error('Error fetching priests:', error)
    } finally {
      setLoading(false)
    }
  }

  const displayedPriests = showAll ? priests : priests.slice(0, 6)

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'No especificada'
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    } catch {
      return 'No especificada'
    }
  }

  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4 px-4">
            Directorio Público de Sacerdotes
          </h2>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto mb-6 sm:mb-8 px-4">
            Conoce a nuestros sacerdotes y las parroquias donde ejercen su ministerio pastoral.
          </p>

          {/* Search and Filter Controls */}
          <div className="max-w-4xl mx-auto space-y-3 sm:space-y-4">
            {/* Search Input */}
            <div className="relative mx-4 sm:mx-0">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Buscar por nombre del sacerdote..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
              />
            </div>

            {/* Parish Filter */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mx-4 sm:mx-0">
              <select
                value={parishFilter}
                onChange={(e) => setParishFilter(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
              >
                <option value="">Todas las parroquias</option>
                {parishes.map((parish) => (
                  <option key={parish.id} value={parish.id}>
                    {parish.name} - {parish.city.name}
                  </option>
                ))}
              </select>

              <button
                onClick={() => {
                  setSearchTerm('')
                  setParishFilter('')
                }}
                className="w-full px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm sm:text-base font-medium"
              >
                Limpiar filtros
              </button>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="text-center py-8 sm:py-12">
            <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 text-sm sm:text-base">Cargando directorio...</p>
          </div>
        ) : (
          <>
            {/* Results Count */}
            <div className="text-center mb-6 sm:mb-8">
              <p className="text-gray-600 text-sm sm:text-base px-4">
                {searchTerm || parishFilter 
                  ? `${priests.length} sacerdote${priests.length !== 1 ? 's' : ''} encontrado${priests.length !== 1 ? 's' : ''}` 
                  : `Mostrando ${Math.min(displayedPriests.length, priests.length)} de ${priests.length} sacerdotes`}
              </p>
            </div>

            {/* Priests Grid */}
            {displayedPriests.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mb-8 sm:mb-12">
                {displayedPriests.map((priest) => (
                  <div 
                    key={priest.id} 
                    className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-4 sm:p-6 mx-4 sm:mx-0"
                  >
                    {/* Profile Image */}
                    <div className="text-center mb-4">
                      {priest.profileImage ? (
                        <Image
                          src={priest.profileImage}
                          alt={`${priest.firstName} ${priest.lastName}`}
                          width={80}
                          height={80}
                          className="mx-auto h-16 w-16 sm:h-20 sm:w-20 rounded-full object-cover"
                        />
                      ) : (
                        <div className="mx-auto h-16 w-16 sm:h-20 sm:w-20 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-bold text-lg sm:text-xl">
                            {priest.firstName.charAt(0)}{priest.lastName.charAt(0)}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Name */}
                    <h3 className="text-center text-base sm:text-lg font-semibold text-gray-900 mb-3">
                      P. {priest.firstName} {priest.lastName}
                    </h3>

                    {/* Parish */}
                    {priest.parish && (
                      <div className="flex items-start space-x-2 mb-3 text-xs sm:text-sm">
                        <MapPinIcon className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-gray-600">{priest.parish.name}</p>
                          <p className="text-gray-500">{priest.parish.city.name}</p>
                        </div>
                      </div>
                    )}

                    {/* Ordination Date */}
                    {priest.ordainedDate && (
                      <div className="flex items-center space-x-2 mb-3 text-xs sm:text-sm">
                        <CalendarIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />
                        <span className="text-gray-600">
                          Ordenado: {formatDate(priest.ordainedDate)}
                        </span>
                      </div>
                    )}

                    {/* Specialties */}
                    {priest.specialties && priest.specialties.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-xs sm:text-sm font-medium text-gray-700">Especialidades:</p>
                        <div className="flex flex-wrap gap-1 sm:gap-2">
                          {priest.specialties.slice(0, 3).map((specialty, index) => (
                            <span
                              key={index}
                              className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                            >
                              {specialty.specialty.name}
                            </span>
                          ))}
                          {priest.specialties.length > 3 && (
                            <span className="inline-block px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                              +{priest.specialties.length - 3} más
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 sm:py-12">
                <div className="text-gray-400 mb-4">
                  <MagnifyingGlassIcon className="h-12 w-12 sm:h-16 sm:w-16 mx-auto" />
                </div>
                <h3 className="text-lg sm:text-xl font-medium text-gray-900 mb-2">
                  No se encontraron sacerdotes
                </h3>
                <p className="text-gray-600 text-sm sm:text-base px-4">
                  Intenta ajustar los filtros de búsqueda para encontrar más resultados.
                </p>
              </div>
            )}

            {/* Show More/Less Button */}
            {priests.length > 6 && !searchTerm && !parishFilter && (
              <div className="text-center">
                <button
                  onClick={() => setShowAll(!showAll)}
                  className="px-6 sm:px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm sm:text-base"
                >
                  {showAll ? 'Mostrar menos' : `Ver todos (${priests.length} sacerdotes)`}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  )
} 