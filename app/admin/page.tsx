'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import { 
  CheckIcon, 
  XMarkIcon, 
  EyeIcon, 
  PencilIcon, 
  TrashIcon,
  PlusIcon,
  UserGroupIcon,
  BuildingOfficeIcon,
  TagIcon,
  MapPinIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline'
import { TestDataCreator } from '@/components/admin/test-data-creator'

interface PendingPriest {
  id: string
  firstName: string
  lastName: string
  phone?: string
  parish?: {
    id: string
    name: string
    city: {
      name: string
    }
  }
  user: {
    id: string
    email: string
    name: string
    createdAt: string
  }
}

interface Suggestion {
  id: string
  field: string
  currentValue: string | null
  suggestedValue: string
  reason: string
  status: string
  createdAt: string
  priest: {
    firstName: string
    lastName: string
    user: {
      email: string
    }
  }
}

interface ApprovedPriest {
  id: string
  firstName: string
  lastName: string
  phone?: string
  ordainedDate?: string
  biography?: string
  profileImage?: string
  user: {
    email: string
    name: string
    createdAt: string
  }
  parish?: {
    name: string
    city: {
      name: string
    }
  }
  specialties: Array<{
    specialty: {
      name: string
    }
  }>
}

interface City {
  id: string
  name: string
  state: string
  createdAt: string
}

interface Parish {
  id: string
  name: string
  address?: string
  phone?: string
  city: {
    name: string
    state: string
  }
  createdAt: string
}

interface Specialty {
  id: string
  name: string
  description?: string
  createdAt: string
}

export default function AdminPanel() {
  const { data: session, status } = useSession()
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('pending')
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  
  // Data states
  const [pendingPriests, setPendingPriests] = useState<PendingPriest[]>([])
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [approvedPriests, setApprovedPriests] = useState<ApprovedPriest[]>([])
  const [cities, setCities] = useState<City[]>([])
  const [parishes, setParishes] = useState<Parish[]>([])
  const [specialties, setSpecialties] = useState<Specialty[]>([])
  
  // Search and filter states
  const [priestSearchTerm, setPriestSearchTerm] = useState('')
  const [citySearchTerm, setCitySearchTerm] = useState('')
  const [parishSearchTerm, setParishSearchTerm] = useState('')
  const [specialtySearchTerm, setSpecialtySearchTerm] = useState('')

  // Modal states
  const [showAddPriestModal, setShowAddPriestModal] = useState(false)
  const [showAddCityModal, setShowAddCityModal] = useState(false)
  const [showAddParishModal, setShowAddParishModal] = useState(false)
  const [showAddSpecialtyModal, setShowAddSpecialtyModal] = useState(false)
  const [editingItem, setEditingItem] = useState<any>(null)

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      redirect('/auth/signin')
      return
    }

    const userRole = (session.user as any)?.role
    if (userRole !== 'ADMIN') {
      redirect('/directorio')
      return
    }

    fetchData()
    setLoading(false)
  }, [session, status])

  const fetchData = async () => {
    try {
      // Fetch pending priests
      const pendingResponse = await fetch('/api/admin/pending-priests')
      const pendingData = await pendingResponse.json()
      setPendingPriests(pendingData.priests || [])

      // Fetch suggestions
      const suggestionsResponse = await fetch('/api/admin/suggestions')
      const suggestionsData = await suggestionsResponse.json()
      setSuggestions(suggestionsData.suggestions || [])

      // Fetch approved priests for management
      const priestsResponse = await fetch('/api/admin/priests')
      const priestsData = await priestsResponse.json()
      setApprovedPriests(priestsData.priests || [])

      // Fetch catalog data
      if (activeTab === 'catalogs' || activeTab === 'priests') {
        await fetchCatalogData()
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }

  const fetchCatalogData = async () => {
    try {
      const [citiesRes, parishesRes, specialtiesRes] = await Promise.all([
        fetch('/api/admin/cities'),
        fetch('/api/admin/parishes'),
        fetch('/api/admin/specialties')
      ])

      const citiesData = await citiesRes.json()
      const parishesData = await parishesRes.json()
      const specialtiesData = await specialtiesRes.json()

      setCities(citiesData.cities || [])
      setParishes(parishesData.parishes || [])
      setSpecialties(specialtiesData.specialties || [])
    } catch (error) {
      console.error('Error fetching catalog data:', error)
    }
  }

  const handlePriestAction = async (priestId: string, action: 'approve' | 'reject') => {
    setActionLoading(priestId)
    try {
      const response = await fetch('/api/admin/manage-priest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          priestId,
          action
        })
      })

      const data = await response.json()
      
      if (response.ok) {
        alert(data.message)
        fetchData()
      } else {
        alert(data.error || 'Error al procesar la acción')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error al procesar la acción')
    } finally {
      setActionLoading(null)
    }
  }

  const handleSuggestionAction = async (suggestionId: string, action: 'approve' | 'reject') => {
    setActionLoading(suggestionId)
    try {
      const response = await fetch('/api/admin/suggestions', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          suggestionId,
          action
        })
      })

      const data = await response.json()
      
      if (response.ok) {
        alert(data.message)
        fetchData()
      } else {
        alert(data.error || 'Error al procesar la sugerencia')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error al procesar la sugerencia')
    } finally {
      setActionLoading(null)
    }
  }

  const handleDeletePriest = async (priestId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este sacerdote?')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/priests/${priestId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        alert('Sacerdote eliminado exitosamente')
        fetchData()
      } else {
        const data = await response.json()
        alert(data.error || 'Error al eliminar sacerdote')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error al eliminar sacerdote')
    }
  }

  const handleDeleteCity = async (cityId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta ciudad?')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/cities/${cityId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        alert('Ciudad eliminada exitosamente')
        fetchCatalogData()
      } else {
        const data = await response.json()
        alert(data.error || 'Error al eliminar ciudad')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error al eliminar ciudad')
    }
  }

  const handleDeleteParish = async (parishId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta parroquia?')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/parishes/${parishId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        alert('Parroquia eliminada exitosamente')
        fetchCatalogData()
      } else {
        const data = await response.json()
        alert(data.error || 'Error al eliminar parroquia')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error al eliminar parroquia')
    }
  }

  const handleDeleteSpecialty = async (specialtyId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta especialidad?')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/specialties/${specialtyId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        alert('Especialidad eliminada exitosamente')
        fetchCatalogData()
      } else {
        const data = await response.json()
        alert(data.error || 'Error al eliminar especialidad')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error al eliminar especialidad')
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 text-sm sm:text-base">Cargando panel de administración...</p>
        </div>
      </div>
    )
  }

  const tabs = [
    { id: 'pending', name: 'Aprobaciones Pendientes', count: pendingPriests.length },
    { id: 'suggestions', name: 'Sugerencias', count: suggestions.filter(s => s.status === 'PENDING').length },
    { id: 'priests', name: 'Gestión de Sacerdotes', count: approvedPriests.length },
    { id: 'catalogs', name: 'Catálogos', count: 0 }
  ]

  const filteredPriests = approvedPriests.filter(priest =>
    priest.firstName.toLowerCase().includes(priestSearchTerm.toLowerCase()) ||
    priest.lastName.toLowerCase().includes(priestSearchTerm.toLowerCase()) ||
    priest.user.email.toLowerCase().includes(priestSearchTerm.toLowerCase()) ||
    priest.parish?.name.toLowerCase().includes(priestSearchTerm.toLowerCase()) || ''
  )

  const filteredCities = cities.filter(city =>
    city.name.toLowerCase().includes(citySearchTerm.toLowerCase()) ||
    city.state.toLowerCase().includes(citySearchTerm.toLowerCase())
  )

  const filteredParishes = parishes.filter(parish =>
    parish.name.toLowerCase().includes(parishSearchTerm.toLowerCase()) ||
    parish.city.name.toLowerCase().includes(parishSearchTerm.toLowerCase())
  )

  const filteredSpecialties = specialties.filter(specialty =>
    specialty.name.toLowerCase().includes(specialtySearchTerm.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4 sm:py-6">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
              Panel de Administración
            </h1>
            <p className="mt-1 text-sm sm:text-base text-gray-500">
              Gestiona aprobaciones, sugerencias, sacerdotes y catálogos del directorio
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-4 sm:space-x-8 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id)
                  if (tab.id === 'catalogs' || tab.id === 'priests') {
                    fetchCatalogData()
                  }
                }}
                className={`py-2 sm:py-4 px-1 whitespace-nowrap border-b-2 font-medium text-sm sm:text-base flex-shrink-0 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.name}
                {tab.count > 0 && (
                  <span className="ml-2 bg-red-100 text-red-600 text-xs font-semibold px-2 py-1 rounded-full">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto py-4 sm:py-6 lg:py-8 px-4 sm:px-6 lg:px-8">
        {/* Pending Priests Tab */}
        {activeTab === 'pending' && (
          <div className="space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-900">
                Sacerdotes Pendientes de Aprobación ({pendingPriests.length})
              </h2>
            </div>

            {pendingPriests.length === 0 ? (
              <div className="text-center py-8 sm:py-12">
                <CheckIcon className="mx-auto h-12 w-12 sm:h-16 sm:w-16 text-gray-400" />
                <h3 className="mt-2 text-sm sm:text-base font-medium text-gray-900">
                  No hay sacerdotes pendientes
                </h3>
                <p className="mt-1 text-xs sm:text-sm text-gray-500">
                  Todos los registros han sido procesados
                </p>
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {pendingPriests.map((priest) => (
                  <div
                    key={priest.id}
                    className="bg-white rounded-lg shadow border border-gray-200 p-3 sm:p-6"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 lg:gap-6">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm sm:text-lg font-medium text-gray-900 truncate">
                              P. {priest.firstName} {priest.lastName}
                            </h3>
                            <p className="text-xs sm:text-sm text-gray-500 break-all">
                              📧 {priest.user.email}
                            </p>
                            {priest.phone && (
                              <p className="text-xs sm:text-sm text-gray-500">
                                📞 {priest.phone}
                              </p>
                            )}
                            {priest.parish && (
                              <p className="text-xs sm:text-sm text-gray-500">
                                ⛪ {priest.parish.name}, {priest.parish.city.name}
                              </p>
                            )}
                            <p className="text-xs text-gray-400">
                              Registrado: {new Date(priest.user.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                        <button
                          onClick={() => handlePriestAction(priest.id, 'approve')}
                          disabled={actionLoading === priest.id}
                          className="flex-1 sm:flex-none inline-flex justify-center items-center px-3 sm:px-4 py-2 border border-transparent text-xs sm:text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {actionLoading === priest.id ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          ) : (
                            <>
                              <CheckIcon className="h-4 w-4 mr-1" />
                              <span className="hidden sm:inline">Aprobar</span>
                              <span className="sm:hidden">✓</span>
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => handlePriestAction(priest.id, 'reject')}
                          disabled={actionLoading === priest.id}
                          className="flex-1 sm:flex-none inline-flex justify-center items-center px-3 sm:px-4 py-2 border border-transparent text-xs sm:text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {actionLoading === priest.id ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          ) : (
                            <>
                              <XMarkIcon className="h-4 w-4 mr-1" />
                              <span className="hidden sm:inline">Rechazar</span>
                              <span className="sm:hidden">✗</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Suggestions Tab */}
        {activeTab === 'suggestions' && (
          <div className="space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-900">
                Sugerencias de Cambios ({suggestions.filter(s => s.status === 'PENDING').length} pendientes)
              </h2>
            </div>

            {suggestions.filter(s => s.status === 'PENDING').length === 0 ? (
              <div className="text-center py-8 sm:py-12">
                <CheckIcon className="mx-auto h-12 w-12 sm:h-16 sm:w-16 text-gray-400" />
                <h3 className="mt-2 text-sm sm:text-base font-medium text-gray-900">
                  No hay sugerencias pendientes
                </h3>
                <p className="mt-1 text-xs sm:text-sm text-gray-500">
                  Todas las sugerencias han sido procesadas
                </p>
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {suggestions.filter(s => s.status === 'PENDING').map((suggestion) => (
                  <div
                    key={suggestion.id}
                    className="bg-white rounded-lg shadow border border-gray-200 p-3 sm:p-6"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3 lg:gap-6">
                      <div className="flex-1 min-w-0">
                        <div className="mb-3 sm:mb-4">
                          <h3 className="text-sm sm:text-lg font-medium text-gray-900">
                            P. {suggestion.priest.firstName} {suggestion.priest.lastName}
                          </h3>
                          <p className="text-xs sm:text-sm text-gray-500">
                            📧 {suggestion.priest.user.email}
                          </p>
                          <p className="text-xs text-gray-400">
                            {new Date(suggestion.createdAt).toLocaleDateString()}
                          </p>
                        </div>

                        <div className="bg-gray-50 p-3 sm:p-4 rounded-lg mb-3 sm:mb-4">
                          <div className="mb-2">
                            <span className="text-xs sm:text-sm font-medium text-gray-700">Campo:</span>
                            <span className="ml-2 text-xs sm:text-sm text-gray-900 capitalize">
                              {suggestion.field}
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                            <div>
                              <span className="text-xs font-medium text-gray-700">Valor actual:</span>
                              <p className="text-xs sm:text-sm text-gray-600 mt-1 break-words">
                                {suggestion.currentValue || 'No especificado'}
                              </p>
                            </div>
                            <div>
                              <span className="text-xs font-medium text-gray-700">Valor sugerido:</span>
                              <p className="text-xs sm:text-sm text-gray-900 mt-1 break-words font-medium">
                                {suggestion.suggestedValue}
                              </p>
                            </div>
                          </div>

                          <div>
                            <span className="text-xs font-medium text-gray-700">Razón:</span>
                            <p className="text-xs sm:text-sm text-gray-600 mt-1">
                              {suggestion.reason}
                            </p>
                          </div>
                        </div>
                      </div>

                      {suggestion.status === 'PENDING' && (
                        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 flex-shrink-0">
                          <button
                            onClick={() => handleSuggestionAction(suggestion.id, 'approve')}
                            disabled={actionLoading === suggestion.id}
                            className="flex-1 sm:flex-none inline-flex justify-center items-center px-3 sm:px-4 py-2 border border-transparent text-xs sm:text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {actionLoading === suggestion.id ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            ) : (
                              <>
                                <CheckIcon className="h-4 w-4 mr-1" />
                                <span className="hidden sm:inline">Aprobar</span>
                                <span className="sm:hidden">✓</span>
                              </>
                            )}
                          </button>
                          <button
                            onClick={() => handleSuggestionAction(suggestion.id, 'reject')}
                            disabled={actionLoading === suggestion.id}
                            className="flex-1 sm:flex-none inline-flex justify-center items-center px-3 sm:px-4 py-2 border border-transparent text-xs sm:text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {actionLoading === suggestion.id ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            ) : (
                              <>
                                <XMarkIcon className="h-4 w-4 mr-1" />
                                <span className="hidden sm:inline">Rechazar</span>
                                <span className="sm:hidden">✗</span>
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Priests Management Tab */}
        {activeTab === 'priests' && (
          <div className="space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-900">
                Gestión de Sacerdotes ({approvedPriests.length} sacerdotes)
              </h2>
              <button
                onClick={() => setShowAddPriestModal(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Agregar Sacerdote
              </button>
            </div>

            {/* Search */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Buscar sacerdotes..."
                value={priestSearchTerm}
                onChange={(e) => setPriestSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Priests List */}
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <ul className="divide-y divide-gray-200">
                {filteredPriests.map((priest) => (
                  <li key={priest.id}>
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <UserGroupIcon className="h-10 w-10 text-gray-400" />
                          </div>
                          <div className="ml-4">
                            <div className="flex items-center">
                              <p className="text-sm font-medium text-indigo-600 truncate">
                                P. {priest.firstName} {priest.lastName}
                              </p>
                            </div>
                            <div className="mt-2 flex items-center text-sm text-gray-500">
                              <p className="truncate">{priest.user.email}</p>
                            </div>
                            {priest.parish && (
                              <div className="mt-1 flex items-center text-sm text-gray-500">
                                <p className="truncate">⛪ {priest.parish.name}, {priest.parish.city.name}</p>
                              </div>
                            )}
                            {priest.specialties.length > 0 && (
                              <div className="mt-1 flex items-center text-sm text-gray-500">
                                <p className="truncate">
                                  🏷️ {priest.specialties.map(s => s.specialty.name).join(', ')}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => {
                              setEditingItem(priest)
                              setShowAddPriestModal(true)
                            }}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            <PencilIcon className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDeletePriest(priest.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Catalogs Tab */}
        {activeTab === 'catalogs' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-900">
                Gestión de Catálogos
              </h2>
            </div>

            {/* Test Data Creator */}
            <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
              <TestDataCreator />
            </div>

            {/* Cities Management */}
            <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <MapPinIcon className="h-5 w-5 mr-2" />
                  Ciudades ({cities.length})
                </h3>
                <button
                  onClick={() => setShowAddCityModal(true)}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-blue-600 bg-blue-100 hover:bg-blue-200"
                >
                  <PlusIcon className="h-4 w-4 mr-1" />
                  Agregar
                </button>
              </div>
              
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Buscar ciudades..."
                  value={citySearchTerm}
                  onChange={(e) => setCitySearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredCities.map((city) => (
                  <div key={city.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">{city.name}</h4>
                        <p className="text-sm text-gray-500">{city.state}</p>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setEditingItem(city)
                            setShowAddCityModal(true)
                          }}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteCity(city.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Parishes Management */}
            <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <BuildingOfficeIcon className="h-5 w-5 mr-2" />
                  Parroquias ({parishes.length})
                </h3>
                <button
                  onClick={() => setShowAddParishModal(true)}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-blue-600 bg-blue-100 hover:bg-blue-200"
                >
                  <PlusIcon className="h-4 w-4 mr-1" />
                  Agregar
                </button>
              </div>
              
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Buscar parroquias..."
                  value={parishSearchTerm}
                  onChange={(e) => setParishSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredParishes.map((parish) => (
                  <div key={parish.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{parish.name}</h4>
                        <p className="text-sm text-gray-500">{parish.city.name}, {parish.city.state}</p>
                        {parish.address && (
                          <p className="text-sm text-gray-500">{parish.address}</p>
                        )}
                        {parish.phone && (
                          <p className="text-sm text-gray-500">📞 {parish.phone}</p>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setEditingItem(parish)
                            setShowAddParishModal(true)
                          }}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteParish(parish.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Specialties Management */}
            <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <TagIcon className="h-5 w-5 mr-2" />
                  Especialidades ({specialties.length})
                </h3>
                <button
                  onClick={() => setShowAddSpecialtyModal(true)}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-blue-600 bg-blue-100 hover:bg-blue-200"
                >
                  <PlusIcon className="h-4 w-4 mr-1" />
                  Agregar
                </button>
              </div>
              
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Buscar especialidades..."
                  value={specialtySearchTerm}
                  onChange={(e) => setSpecialtySearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredSpecialties.map((specialty) => (
                  <div key={specialty.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{specialty.name}</h4>
                        {specialty.description && (
                          <p className="text-sm text-gray-500 mt-1">{specialty.description}</p>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setEditingItem(specialty)
                            setShowAddSpecialtyModal(true)
                          }}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteSpecialty(specialty.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Modals would go here - implementation needed for add/edit forms */}
    </div>
  )
} 