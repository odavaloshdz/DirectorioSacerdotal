'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import { CheckIcon, XMarkIcon, EyeIcon, PencilIcon, TrashIcon, PlusIcon } from '@heroicons/react/24/outline'
import { TestDataCreator } from '@/components/admin/test-data-creator'

interface PendingPriest {
  id: string
  firstName: string
  lastName: string
  user: {
    email: string
    createdAt: string
  }
  parish?: {
    name: string
    city: {
      name: string
    }
  }
  phone?: string
  status: string
}

interface Suggestion {
  id: string
  field: string
  currentValue: string
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

export default function AdminPanel() {
  const { data: session, status } = useSession()
  const [activeTab, setActiveTab] = useState('pending')
  const [pendingPriests, setPendingPriests] = useState<PendingPriest[]>([])
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      redirect('/auth/signin')
    }
    if (session?.user && (session.user as any).role !== 'ADMIN') {
      redirect('/')
    }
    if (status === 'authenticated') {
      fetchData()
    }
  }, [session, status])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [priestsRes, suggestionsRes] = await Promise.all([
        fetch('/api/admin/pending-priests'),
        fetch('/api/admin/suggestions')
      ])

      if (priestsRes.ok) {
        const priestsData = await priestsRes.json()
        setPendingPriests(priestsData.priests)
      }

      if (suggestionsRes.ok) {
        const suggestionsData = await suggestionsRes.json()
        setSuggestions(suggestionsData.suggestions)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
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
    { id: 'catalogs', name: 'Catálogos', count: 0 }
  ]

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
              Gestiona aprobaciones, sugerencias y catálogos del directorio
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
                onClick={() => setActiveTab(tab.id)}
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
                                📍 {priest.parish.name}, {priest.parish.city.name}
                              </p>
                            )}
                            <p className="text-xs text-gray-400 mt-1">
                              Registrado: {new Date(priest.user.createdAt).toLocaleDateString('es-ES')}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-row sm:flex-col lg:flex-row gap-2 sm:gap-3">
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

        {activeTab === 'suggestions' && (
          <div className="space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-900">
                Sugerencias de Cambios ({suggestions.filter(s => s.status === 'PENDING').length} pendientes)
              </h2>
            </div>

            {suggestions.length === 0 ? (
              <div className="text-center py-8 sm:py-12">
                <PencilIcon className="mx-auto h-12 w-12 sm:h-16 sm:w-16 text-gray-400" />
                <h3 className="mt-2 text-sm sm:text-base font-medium text-gray-900">
                  No hay sugerencias
                </h3>
                <p className="mt-1 text-xs sm:text-sm text-gray-500">
                  Cuando los sacerdotes envíen sugerencias, aparecerán aquí
                </p>
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {suggestions.map((suggestion) => (
                  <div
                    key={suggestion.id}
                    className={`bg-white rounded-lg shadow border p-3 sm:p-6 ${
                      suggestion.status === 'PENDING' ? 'border-yellow-200' : 'border-gray-200'
                    }`}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3 lg:gap-6">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm sm:text-lg font-medium text-gray-900">
                              P. {suggestion.priest.firstName} {suggestion.priest.lastName}
                            </h3>
                            <p className="text-xs sm:text-sm text-gray-500 break-all mb-2">
                              📧 {suggestion.priest.user.email}
                            </p>
                            
                            <div className="space-y-2 text-xs sm:text-sm">
                              <div>
                                <span className="font-medium text-gray-700">Campo:</span>
                                <span className="ml-2 text-gray-600">{suggestion.field}</span>
                              </div>
                              <div>
                                <span className="font-medium text-gray-700">Valor actual:</span>
                                <span className="ml-2 text-gray-600 break-all">{suggestion.currentValue}</span>
                              </div>
                              <div>
                                <span className="font-medium text-gray-700">Valor sugerido:</span>
                                <span className="ml-2 text-blue-600 font-medium break-all">{suggestion.suggestedValue}</span>
                              </div>
                              <div>
                                <span className="font-medium text-gray-700">Razón:</span>
                                <span className="ml-2 text-gray-600">{suggestion.reason}</span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 mt-3">
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                suggestion.status === 'PENDING' 
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : suggestion.status === 'APPROVED'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {suggestion.status === 'PENDING' ? 'Pendiente' : 
                                 suggestion.status === 'APPROVED' ? 'Aprobada' : 'Rechazada'}
                              </span>
                              <span className="text-xs text-gray-400">
                                {new Date(suggestion.createdAt).toLocaleDateString('es-ES')}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {suggestion.status === 'PENDING' && (
                        <div className="flex flex-row sm:flex-col lg:flex-row gap-2 sm:gap-3">
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

        {activeTab === 'catalogs' && (
          <div className="space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-900">
                Gestión de Catálogos
              </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {/* Test Data Creator */}
              <TestDataCreator />
              
              {/* Coming Soon Cards */}
              <div className="bg-white rounded-lg shadow border border-gray-200 p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-3 sm:mb-4">
                  Gestión de Parroquias
                </h3>
                <p className="text-xs sm:text-sm text-gray-500 mb-4">
                  Administra las parroquias de la diócesis
                </p>
                <button 
                  className="w-full px-4 py-2 bg-gray-100 text-gray-500 rounded-md cursor-not-allowed text-xs sm:text-sm"
                  disabled
                >
                  Próximamente
                </button>
              </div>

              <div className="bg-white rounded-lg shadow border border-gray-200 p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-3 sm:mb-4">
                  Gestión de Especialidades
                </h3>
                <p className="text-xs sm:text-sm text-gray-500 mb-4">
                  Administra las especialidades ministeriales
                </p>
                <button 
                  className="w-full px-4 py-2 bg-gray-100 text-gray-500 rounded-md cursor-not-allowed text-xs sm:text-sm"
                  disabled
                >
                  Próximamente
                </button>
              </div>

              <div className="bg-white rounded-lg shadow border border-gray-200 p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-3 sm:mb-4">
                  Gestión de Ciudades
                </h3>
                <p className="text-xs sm:text-sm text-gray-500 mb-4">
                  Administra las ciudades de la diócesis
                </p>
                <button 
                  className="w-full px-4 py-2 bg-gray-100 text-gray-500 rounded-md cursor-not-allowed text-xs sm:text-sm"
                  disabled
                >
                  Próximamente
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 