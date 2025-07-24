'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { 
  MagnifyingGlassIcon, 
  MapPinIcon, 
  PhoneIcon, 
  EnvelopeIcon,
  CalendarIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline'

interface Priest {
  id: string
  firstName: string
  lastName: string
  phone: string | null
  biography: string | null
  profileImage: string | null
  ordainedDate: string | null
  status: string
  user: {
    email: string
  } | null
  parish: {
    id: string
    name: string
    city: {
      name: string
    }
  } | null
  specialties: string | Array<{
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

export default function DirectoryPage() {
  const { data: session, status } = useSession()
  const [priests, setPriests] = useState<Priest[]>([])
  const [parishes, setParishes] = useState<Parish[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [parishFilter, setParishFilter] = useState('')

  useEffect(() => {
    if (status === 'unauthenticated') {
      redirect('/auth/signin')
    }
    if (status === 'authenticated') {
      fetchPriests()
    }
  }, [status])

  const fetchPriests = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch('/api/priests')
      
      if (!response.ok) {
        throw new Error('Error al cargar los datos')
      }
      
      const data = await response.json()
      setPriests(data.priests || [])
      
      // Extract unique parishes from priests data
      const uniqueParishes = Array.from(
        new Map(
          data.priests
            ?.filter((p: Priest) => p.parish)
            .map((p: Priest) => [p.parish!.id, p.parish])
        ).values()
      ) as Parish[]
      
      setParishes(uniqueParishes)
    } catch (error) {
      console.error('Error fetching priests:', error)
      setError('Error al cargar el directorio. Por favor, intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  // Helper function to safely parse specialties
  const getSafeSpecialties = (specialties: string | Array<{specialty: {id: string, name: string}}>) => {
    if (!specialties) return []
    
    if (typeof specialties === 'string') {
      try {
        const parsed = JSON.parse(specialties)
        return Array.isArray(parsed) ? parsed : []
      } catch {
        return []
      }
    }
    
    if (Array.isArray(specialties)) {
      return specialties
    }
    
    return []
  }

  // Filter priests based on search and parish filter
  const filteredPriests = priests.filter(priest => {
    const searchTermLower = searchTerm.toLowerCase()
    const matchesSearch = !searchTerm || 
      priest.firstName.toLowerCase().includes(searchTermLower) ||
      priest.lastName.toLowerCase().includes(searchTermLower) ||
      priest.user?.email?.toLowerCase().includes(searchTermLower) ||
      priest.parish?.name?.toLowerCase().includes(searchTermLower)

    const matchesParish = !parishFilter || priest.parish?.name === parishFilter

    return matchesSearch && matchesParish
  })

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

  const formatSpecialties = (specialties: string | Array<{specialty: {id: string, name: string}}>) => {
    const safeSpecialties = getSafeSpecialties(specialties)
    if (safeSpecialties.length === 0) return 'Sin especialidades'
    
    return safeSpecialties
      .map(s => s.specialty?.name || s)
      .filter(Boolean)
      .join(', ')
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 text-sm sm:text-base">Cargando directorio...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <ExclamationTriangleIcon className="h-12 w-12 sm:h-16 sm:w-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg sm:text-xl font-medium text-gray-900 mb-2">Error al cargar</h3>
          <p className="text-gray-600 mb-4 text-sm sm:text-base">{error}</p>
          <button
            onClick={fetchPriests}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm sm:text-base"
          >
            <ArrowPathIcon className="h-4 w-4 mr-2" />
            Reintentar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4 sm:py-6">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
              Directorio Sacerdotal
            </h1>
            <p className="mt-1 text-sm sm:text-base text-gray-500">
              Directorio completo de la Diócesis de San Juan de los Lagos
            </p>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="space-y-3 sm:space-y-4">
            {/* Search Input */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Buscar por nombre, email o parroquia..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
              />
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              <select
                value={parishFilter}
                onChange={(e) => setParishFilter(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
              >
                <option value="">Todas las parroquias</option>
                {parishes.map((parish) => (
                  <option key={parish.id} value={parish.name}>
                    {parish.name} - {parish.city.name}
                  </option>
                ))}
              </select>

              <button
                onClick={() => {
                  setSearchTerm('')
                  setParishFilter('')
                }}
                className="w-full px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm sm:text-base font-medium sm:col-span-1 lg:col-span-2"
              >
                Limpiar filtros
              </button>
            </div>

            {/* Results count */}
            <div className="text-center sm:text-left">
              <p className="text-gray-600 text-sm sm:text-base">
                {searchTerm || parishFilter 
                  ? `${filteredPriests.length} sacerdote${filteredPriests.length !== 1 ? 's' : ''} encontrado${filteredPriests.length !== 1 ? 's' : ''}` 
                  : `${filteredPriests.length} sacerdotes en total`}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Priests Directory */}
      <div className="max-w-7xl mx-auto py-4 sm:py-6 lg:py-8 px-4 sm:px-6 lg:px-8">
        {filteredPriests.length === 0 ? (
          <div className="text-center py-8 sm:py-12">
            <div className="text-gray-400 mb-4">
              <MagnifyingGlassIcon className="h-12 w-12 sm:h-16 sm:w-16 mx-auto" />
            </div>
            <h3 className="text-lg sm:text-xl font-medium text-gray-900 mb-2">
              No se encontraron sacerdotes
            </h3>
            <p className="text-gray-600 text-sm sm:text-base">
              Intenta ajustar los filtros de búsqueda para encontrar más resultados.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {filteredPriests.map((priest) => (
              <div
                key={priest.id}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-4 sm:p-6"
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

                {/* Contact Information */}
                <div className="space-y-2 text-xs sm:text-sm">
                  {priest.user?.email && (
                    <div className="flex items-center space-x-2">
                      <EnvelopeIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />
                      <a
                        href={`mailto:${priest.user.email}`}
                        className="text-blue-600 hover:text-blue-800 break-all"
                      >
                        {priest.user.email}
                      </a>
                    </div>
                  )}

                  {priest.phone && (
                    <div className="flex items-center space-x-2">
                      <PhoneIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />
                      <a
                        href={`tel:${priest.phone}`}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        {priest.phone}
                      </a>
                    </div>
                  )}

                  {priest.parish && (
                    <div className="flex items-start space-x-2">
                      <MapPinIcon className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-gray-600">{priest.parish.name}</p>
                        <p className="text-gray-500">{priest.parish.city?.name}</p>
                      </div>
                    </div>
                  )}

                  {priest.ordainedDate && (
                    <div className="flex items-start space-x-2">
                      <CalendarIcon className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-gray-600">Ordenación:</p>
                        <p className="text-gray-500">{formatDate(priest.ordainedDate)}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Specialties */}
                {priest.specialties && getSafeSpecialties(priest.specialties).length > 0 && (
                  <div className="mt-4 pt-3 border-t border-gray-100">
                    <p className="text-xs sm:text-sm font-medium text-gray-700 mb-2">Especialidades:</p>
                    <div className="flex flex-wrap gap-1">
                      {getSafeSpecialties(priest.specialties).slice(0, 3).map((specialty, index) => (
                        <span
                          key={index}
                          className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                        >
                          {specialty.specialty?.name || specialty}
                        </span>
                      ))}
                      {getSafeSpecialties(priest.specialties).length > 3 && (
                        <span className="inline-block px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                          +{getSafeSpecialties(priest.specialties).length - 3} más
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Biography preview */}
                {priest.biography && (
                  <div className="mt-4 pt-3 border-t border-gray-100">
                    <p className="text-xs sm:text-sm text-gray-600 line-clamp-3">
                      {priest.biography.substring(0, 100)}
                      {priest.biography.length > 100 && '...'}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6">
        <div className="flex flex-col space-y-2">
          <Link
            href="/profile"
            className="inline-flex items-center justify-center h-12 w-12 sm:h-14 sm:w-14 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors"
            title="Mi Perfil"
          >
            <svg className="h-5 w-5 sm:h-6 sm:w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  )
} 