'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { 
  MagnifyingGlassIcon, 
  MapPinIcon, 
  PhoneIcon, 
  CalendarIcon,
  UserGroupIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline'
import { calculateOrdinationTime, formatPriestName, getPriestProfileImage, parseSpecialties } from '@/lib/utils'

interface Priest {
  id: string
  firstName: string
  lastName: string
  parishId: string | null
  phone: string | null
  specialties: string | null
  profileImage: string | null
  ordainedDate: string | null
  parish?: {
    id: string
    name: string
    city: {
      name: string
    }
  }
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
        priest.parish?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        priest.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (priest.specialties && priest.specialties.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    if (parishFilter) {
      filtered = filtered.filter(priest => 
        priest.parish?.name.toLowerCase().includes(parishFilter.toLowerCase())
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
      .map(priest => priest.parish?.name)
      .filter(parish => parish !== null && parish !== undefined)
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPriests.map((priest) => (
            <div
              key={priest.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setSelectedPriest(priest)}
            >
              <div className="text-center mb-4">
                <div className="mb-4">
                  <Image
                    src={getPriestProfileImage(priest.profileImage)}
                    alt={`${priest.firstName} ${priest.lastName}`}
                    width={80}
                    height={80}
                    className="w-20 h-20 rounded-full object-cover mx-auto"
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

                <div className="flex items-center text-sm text-gray-600">
                  <PhoneIcon className="h-4 w-4 mr-2 text-gray-400" />
                  <span>{priest.phone || 'Sin teléfono'}</span>
                </div>

                {parseSpecialties(priest.specialties).length > 0 && (
                  <div className="flex items-start text-sm text-gray-600">
                    <UserGroupIcon className="h-4 w-4 mr-2 mt-0.5 text-gray-400 flex-shrink-0" />
                    <div>
                      <span className="font-medium">Especialidades:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {parseSpecialties(priest.specialties).slice(0, 2).map((specialty, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                          >
                            {specialty}
                          </span>
                        ))}
                        {parseSpecialties(priest.specialties).length > 2 && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                            +{parseSpecialties(priest.specialties).length - 2} más
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs text-gray-400">
                    {priest.user.email}
                  </span>
                  <ChevronRightIcon className="h-4 w-4 text-gray-400" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredPriests.length === 0 && (
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

        {/* Modal */}
        {selectedPriest && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-2xl shadow-lg rounded-md bg-white">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center space-x-4">
                  <Image
                    src={getPriestProfileImage(selectedPriest.profileImage)}
                    alt={`${selectedPriest.firstName} ${selectedPriest.lastName}`}
                    width={64}
                    height={64}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      {formatPriestName(selectedPriest.firstName, selectedPriest.lastName)}
                    </h3>
                    <p className="text-gray-600">{selectedPriest.user.email}</p>
                    {selectedPriest.ordainedDate && (
                      <p className="text-sm text-blue-600 font-medium">
                        {calculateOrdinationTime(selectedPriest.ordainedDate)} de ordenación
                      </p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setSelectedPriest(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                {selectedPriest.parish && (
                  <div className="flex items-center text-gray-600">
                    <MapPinIcon className="h-5 w-5 mr-3 text-gray-400" />
                    <div>
                      <span className="font-medium">Parroquia:</span>
                      <span className="ml-2">{selectedPriest.parish.name}, {selectedPriest.parish.city.name}</span>
                    </div>
                  </div>
                )}

                <div className="flex items-center text-gray-600">
                  <PhoneIcon className="h-5 w-5 mr-3 text-gray-400" />
                  <div>
                    <span className="font-medium">Teléfono:</span>
                    <span className="ml-2">{selectedPriest.phone || 'No especificado'}</span>
                  </div>
                </div>

                {selectedPriest.ordainedDate && (
                  <div className="flex items-center text-gray-600">
                    <CalendarIcon className="h-5 w-5 mr-3 text-gray-400" />
                    <div>
                      <span className="font-medium">Fecha de ordenación:</span>
                      <span className="ml-2">
                        {new Date(selectedPriest.ordainedDate).toLocaleDateString('es-ES')}
                      </span>
                    </div>
                  </div>
                )}

                {parseSpecialties(selectedPriest.specialties).length > 0 && (
                  <div className="flex items-start text-gray-600">
                    <UserGroupIcon className="h-5 w-5 mr-3 text-gray-400 mt-1" />
                    <div>
                      <span className="font-medium">Especialidades ministeriales:</span>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {parseSpecialties(selectedPriest.specialties).map((specialty, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                          >
                            {specialty}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-6 pt-4 border-t">
                <button
                  onClick={() => setSelectedPriest(null)}
                  className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 