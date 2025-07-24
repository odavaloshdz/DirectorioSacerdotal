'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { MagnifyingGlassIcon, MapPinIcon, UserGroupIcon } from '@heroicons/react/24/outline'
import { calculateOrdinationTime, formatPriestName } from '@/lib/utils'
import { PriestImage } from './priest-image'

interface PublicPriest {
  id: string
  firstName: string
  lastName: string
  profileImage: string | null
  ordainedDate: string | null
  parish?: {
    id: string
    name: string
    city: {
      name: string
    }
  }
  specialties?: Array<{
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
  const [priests, setPriests] = useState<PublicPriest[]>([])
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
      setLoading(true)
      const params = new URLSearchParams()
      if (searchTerm) params.append('search', searchTerm)
      if (parishFilter) params.append('parish', parishFilter)
      params.append('limit', showAll ? '50' : '6')

      const response = await fetch(`/api/public/priests?${params}`)
      if (response.ok) {
        const data = await response.json()
        setPriests(data.priests)
        setParishes(data.parishes)
      }
    } catch (error) {
      console.error('Error fetching priests:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleShowMore = () => {
    setShowAll(true)
    fetchPriests()
  }

  if (loading && priests.length === 0) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando directorio...</p>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16 bg-gray-50" id="directorio-publico">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Directorio de Sacerdotes
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Conoce a los sacerdotes de nuestra diócesis. Encuentra información sobre 
            su ministerio, especialidades y parroquia de servicio.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
            <div className="relative">
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por nombre o especialidad..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-3 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <select
              value={parishFilter}
              onChange={(e) => setParishFilter(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Todas las parroquias</option>
              {parishes.map((parish) => (
                <option key={parish.id} value={parish.name}>
                  {parish.name} - {parish.city.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Priests Grid */}
        {priests.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {priests.map((priest) => (
              <div
                key={priest.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="text-center mb-4">
                  <div className="mb-4">
                    <PriestImage
                      profileImage={priest.profileImage}
                      firstName={priest.firstName}
                      lastName={priest.lastName}
                      size={80}
                      className="mx-auto"
                    />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {formatPriestName(priest.firstName, priest.lastName)}
                  </h3>
                  {priest.ordainedDate && (
                    <p className="text-sm text-blue-600 font-medium mb-2">
                      {calculateOrdinationTime(priest.ordainedDate)} de ordenación
                    </p>
                  )}
                </div>

                <div className="space-y-3">
                  {priest.parish && (
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPinIcon className="h-4 w-4 mr-2 text-gray-400" />
                      <span>{priest.parish.name}, {priest.parish.city.name}</span>
                    </div>
                  )}

                  {priest.specialties && priest.specialties.length > 0 && (
                    <div className="flex items-start text-sm text-gray-600">
                      <UserGroupIcon className="h-4 w-4 mr-2 mt-0.5 text-gray-400 flex-shrink-0" />
                      <div>
                        <span className="font-medium">Especialidades:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {priest.specialties.slice(0, 3).map((ps) => (
                            <span
                              key={ps.specialty.id}
                              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                            >
                              {ps.specialty.name}
                            </span>
                          ))}
                          {priest.specialties.length > 3 && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                              +{priest.specialties.length - 3} más
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <UserGroupIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No se encontraron sacerdotes
            </h3>
            <p className="text-gray-600">
              Intenta ajustar los filtros de búsqueda
            </p>
          </div>
        )}

        {/* Show More Button or Login Prompt */}
        <div className="text-center">
          {!showAll && priests.length >= 6 ? (
            <button
              onClick={handleShowMore}
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              Ver más sacerdotes
            </button>
          ) : (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 max-w-2xl mx-auto">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">
                ¿Necesitas más información?
              </h3>
              <p className="text-blue-700 mb-4">
                Inicia sesión para acceder al directorio completo con información de contacto
                y detalles adicionales de nuestros sacerdotes.
              </p>
              <Link
                href="/auth/signin"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors"
              >
                Acceder al Directorio Completo
              </Link>
            </div>
          )}
        </div>
      </div>
    </section>
  )
} 