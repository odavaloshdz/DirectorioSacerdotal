'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { UserGroupIcon, PhoneIcon, MapPinIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'

interface Priest {
  id: string
  firstName: string
  lastName: string
  parish: string | null
  phone: string | null
  specialties: string | null
  user: {
    email: string
  }
}

export default function DirectorioPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [priests, setPriests] = useState<Priest[]>([])
  const [filteredPriests, setFilteredPriests] = useState<Priest[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [parishFilter, setParishFilter] = useState('')
  const [selectedPriest, setSelectedPriest] = useState<Priest | null>(null)

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/auth/signin')
      return
    }

    // Check if user is authorized (approved priest or admin)
    const userRole = (session.user as any)?.role
    const priestStatus = (session.user as any)?.priest?.status

    if (userRole !== 'ADMIN' && (userRole !== 'PRIEST' || priestStatus !== 'APPROVED')) {
      router.push('/waiting-approval')
      return
    }

    fetchPriests()
  }, [session, status, router])

  useEffect(() => {
    // Filter priests based on search term and parish filter
    let filtered = priests

    if (searchTerm) {
      filtered = filtered.filter(priest => 
        `${priest.firstName} ${priest.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        priest.parish?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        priest.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (priest.specialties && priest.specialties.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    if (parishFilter) {
      filtered = filtered.filter(priest => 
        priest.parish?.toLowerCase().includes(parishFilter.toLowerCase())
      )
    }

    setFilteredPriests(filtered)
  }, [priests, searchTerm, parishFilter])

  const fetchPriests = async () => {
    try {
      const response = await fetch('/api/priests')
      if (response.ok) {
        const data = await response.json()
        setPriests(data.priests)
        setFilteredPriests(data.priests)
      }
    } catch (error) {
      console.error('Error fetching priests:', error)
    } finally {
      setLoading(false)
    }
  }

  const getUniqueParishes = () => {
    const parishes = priests
      .map(priest => priest.parish)
      .filter(parish => parish !== null)
      .filter((parish, index, self) => self.indexOf(parish) === index)
      .sort()
    return parishes as string[]
  }

  const clearFilters = () => {
    setSearchTerm('')
    setParishFilter('')
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando directorio...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Directorio Sacerdotal</h1>
              <p className="mt-2 text-gray-600">
                Diócesis de San Juan de los Lagos - {filteredPriests.length} de {priests.length} sacerdotes
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">
                Bienvenido, {session.user?.name}
              </span>
              <button
                onClick={() => router.push('/api/auth/signout')}
                className="px-4 py-2 text-sm text-red-600 hover:text-red-700"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por nombre, parroquia, email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Parish Filter */}
            <select
              value={parishFilter}
              onChange={(e) => setParishFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Todas las parroquias</option>
              {getUniqueParishes().map(parish => (
                <option key={parish} value={parish}>{parish}</option>
              ))}
            </select>

            {/* Clear Filters */}
            <button
              onClick={clearFilters}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Limpiar filtros
            </button>
          </div>
        </div>

        {/* Results */}
        {filteredPriests.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <UserGroupIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {priests.length === 0 ? 'No hay sacerdotes registrados' : 'No se encontraron resultados'}
            </h3>
            <p className="text-gray-600">
              {priests.length === 0 
                ? 'Los sacerdotes aparecerán aquí una vez que sean aprobados por el administrador.'
                : 'Intenta ajustar tus filtros de búsqueda para encontrar lo que buscas.'
              }
            </p>
            {priests.length > 0 && (
              <button
                onClick={clearFilters}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Ver todos los sacerdotes
              </button>
            )}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPriests.map((priest) => (
              <div
                key={priest.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setSelectedPriest(priest)}
              >
                <div className="text-center mb-4">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <UserGroupIcon className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    P. {priest.firstName} {priest.lastName}
                  </h3>
                </div>

                <div className="space-y-3">
                  {priest.parish && (
                    <div className="flex items-center text-gray-600">
                      <MapPinIcon className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span className="text-sm">{priest.parish}</span>
                    </div>
                  )}

                  {priest.phone && (
                    <div className="flex items-center text-gray-600">
                      <PhoneIcon className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span className="text-sm">{priest.phone}</span>
                    </div>
                  )}

                  <div className="flex items-center text-gray-600">
                    <svg className="h-4 w-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span className="text-sm truncate">{priest.user.email}</span>
                  </div>

                  {priest.specialties && (
                    <div className="mt-4">
                      <p className="text-xs text-gray-500 mb-2">Especialidades:</p>
                      <div className="flex flex-wrap gap-1">
                        {JSON.parse(priest.specialties).slice(0, 2).map((specialty: string, index: number) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs"
                          >
                            {specialty}
                          </span>
                        ))}
                        {JSON.parse(priest.specialties).length > 2 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                            +{JSON.parse(priest.specialties).length - 2}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-6 pt-4 border-t border-gray-100">
                  <div className="text-center text-xs text-gray-500">
                    Clic para ver perfil completo
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Priest Detail Modal */}
        {selectedPriest && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold text-gray-900">
                  P. {selectedPriest.firstName} {selectedPriest.lastName}
                </h3>
                <button
                  onClick={() => setSelectedPriest(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div className="text-center">
                  <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <UserGroupIcon className="h-10 w-10 text-blue-600" />
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between py-2 border-b">
                    <span className="font-medium text-gray-700">Email:</span>
                    <span className="text-gray-600">{selectedPriest.user.email}</span>
                  </div>

                  {selectedPriest.parish && (
                    <div className="flex items-center justify-between py-2 border-b">
                      <span className="font-medium text-gray-700">Parroquia:</span>
                      <span className="text-gray-600">{selectedPriest.parish}</span>
                    </div>
                  )}

                  {selectedPriest.phone && (
                    <div className="flex items-center justify-between py-2 border-b">
                      <span className="font-medium text-gray-700">Teléfono:</span>
                      <span className="text-gray-600">{selectedPriest.phone}</span>
                    </div>
                  )}

                  {selectedPriest.specialties && (
                    <div className="py-2">
                      <span className="font-medium text-gray-700 block mb-2">Especialidades:</span>
                      <div className="flex flex-wrap gap-2">
                        {JSON.parse(selectedPriest.specialties).map((specialty: string, index: number) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm"
                          >
                            {specialty}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-4">
                  <button
                    onClick={() => setSelectedPriest(null)}
                    className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 