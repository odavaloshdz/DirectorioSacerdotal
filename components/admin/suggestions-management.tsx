'use client'

import { useState, useEffect } from 'react'
import { 
  CheckIcon,
  XMarkIcon,
  ClockIcon,
  UserCircleIcon,
  EyeIcon,
  ChevronDownIcon,
  ChevronUpIcon
} from '@heroicons/react/24/outline'
import { formatPriestName } from '@/lib/utils'

interface ProfileSuggestion {
  id: string
  priestId: string
  field: string
  currentValue: string | null
  suggestedValue: string
  reason: string | null
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  reviewedBy: string | null
  reviewedAt: string | null
  createdAt: string
  updatedAt: string
  priest: {
    firstName: string
    lastName: string
    user: {
      email: string
    }
  }
}

export function SuggestionsManagement() {
  const [suggestions, setSuggestions] = useState<ProfileSuggestion[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING')
  const [expandedSuggestion, setExpandedSuggestion] = useState<string | null>(null)

  useEffect(() => {
    fetchSuggestions()
  }, [])

  const fetchSuggestions = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/suggestions')
      if (response.ok) {
        const data = await response.json()
        setSuggestions(data.suggestions)
      }
    } catch (error) {
      console.error('Error fetching suggestions:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSuggestionAction = async (suggestionId: string, action: 'approve' | 'reject') => {
    setProcessing(suggestionId)
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
        fetchSuggestions()
        alert(data.message)
      } else {
        alert(data.error || 'Error al procesar la sugerencia')
      }
    } catch (error) {
      console.error('Error processing suggestion:', error)
      alert('Error al procesar la sugerencia')
    } finally {
      setProcessing(null)
    }
  }

  const getFieldLabel = (field: string): string => {
    const fieldLabels: { [key: string]: string } = {
      firstName: 'Nombre',
      lastName: 'Apellidos',
      phone: 'Teléfono',
      parish: 'Parroquia',
      biography: 'Biografía',
      ordainedDate: 'Fecha de Ordenación'
    }
    return fieldLabels[field] || field
  }

  const formatValue = (value: string | null): string => {
    if (!value) return 'No especificado'
    
    // Si parece una fecha ISO, formatearla
    if (value.match(/^\d{4}-\d{2}-\d{2}/)) {
      return new Date(value).toLocaleDateString('es-ES')
    }
    
    return value
  }

  const filteredSuggestions = suggestions.filter(suggestion => {
    if (statusFilter === 'ALL') return true
    return suggestion.status === statusFilter
  })

  const pendingCount = suggestions.filter(s => s.status === 'PENDING').length
  const approvedCount = suggestions.filter(s => s.status === 'APPROVED').length
  const rejectedCount = suggestions.filter(s => s.status === 'REJECTED').length

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestión de Sugerencias</h2>
          <p className="text-gray-600">Revisar y procesar sugerencias de cambio de perfil</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
          <div className="flex items-center">
            <ClockIcon className="h-6 w-6 text-yellow-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-yellow-600">Pendientes</p>
              <p className="text-xl font-bold text-yellow-900">{pendingCount}</p>
            </div>
          </div>
        </div>

        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <div className="flex items-center">
            <CheckIcon className="h-6 w-6 text-green-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-green-600">Aprobadas</p>
              <p className="text-xl font-bold text-green-900">{approvedCount}</p>
            </div>
          </div>
        </div>

        <div className="bg-red-50 p-4 rounded-lg border border-red-200">
          <div className="flex items-center">
            <XMarkIcon className="h-6 w-6 text-red-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-red-600">Rechazadas</p>
              <p className="text-xl font-bold text-red-900">{rejectedCount}</p>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="flex items-center">
            <UserCircleIcon className="h-6 w-6 text-blue-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-blue-600">Total</p>
              <p className="text-xl font-bold text-blue-900">{suggestions.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="flex items-center space-x-4">
          <label className="text-sm font-medium text-gray-700">Filtrar por estado:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="ALL">Todas las sugerencias</option>
            <option value="PENDING">Pendientes ({pendingCount})</option>
            <option value="APPROVED">Aprobadas ({approvedCount})</option>
            <option value="REJECTED">Rechazadas ({rejectedCount})</option>
          </select>
          
          <div className="text-sm text-gray-600">
            Mostrando: {filteredSuggestions.length} sugerencias
          </div>
        </div>
      </div>

      {/* Suggestions List */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        {filteredSuggestions.length === 0 ? (
          <div className="p-12 text-center">
            <ClockIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {statusFilter === 'PENDING' ? '¡Todo al día!' : 'No hay sugerencias'}
            </h3>
            <p className="text-gray-600">
              {statusFilter === 'PENDING' 
                ? 'No hay sugerencias pendientes de revisión.' 
                : `No hay sugerencias con estado ${statusFilter.toLowerCase()}.`}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredSuggestions.map((suggestion) => (
              <div key={suggestion.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4 mb-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                        <UserCircleIcon className="h-6 w-6 text-gray-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-gray-900">
                          {formatPriestName(suggestion.priest.firstName, suggestion.priest.lastName)}
                        </h3>
                        <p className="text-sm text-gray-600">{suggestion.priest.user.email}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                          <span>Campo: <strong>{getFieldLabel(suggestion.field)}</strong></span>
                          <span>•</span>
                          <span>{new Date(suggestion.createdAt).toLocaleDateString('es-ES')} {new Date(suggestion.createdAt).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          suggestion.status === 'APPROVED' 
                            ? 'bg-green-100 text-green-800'
                            : suggestion.status === 'PENDING'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {suggestion.status === 'APPROVED' ? 'Aprobada' :
                           suggestion.status === 'PENDING' ? 'Pendiente' : 'Rechazada'}
                        </span>
                        <button
                          onClick={() => setExpandedSuggestion(
                            expandedSuggestion === suggestion.id ? null : suggestion.id
                          )}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          {expandedSuggestion === suggestion.id ? (
                            <ChevronUpIcon className="h-5 w-5" />
                          ) : (
                            <ChevronDownIcon className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Valor Actual:
                          </label>
                          <div className="text-sm text-gray-900 bg-white p-2 rounded border">
                            {formatValue(suggestion.currentValue)}
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Valor Propuesto:
                          </label>
                          <div className="text-sm text-gray-900 bg-blue-50 p-2 rounded border border-blue-200">
                            {formatValue(suggestion.suggestedValue)}
                          </div>
                        </div>
                      </div>
                      
                      {suggestion.reason && (
                        <div className="mt-3">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Razón del cambio:
                          </label>
                          <div className="text-sm text-gray-700 bg-white p-2 rounded border">
                            {suggestion.reason}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Expanded details */}
                    {expandedSuggestion === suggestion.id && (
                      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Detalles adicionales:</h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium text-gray-700">ID de sugerencia:</span>
                            <span className="ml-2 text-gray-600 font-mono">{suggestion.id}</span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Creada:</span>
                            <span className="ml-2 text-gray-600">
                              {new Date(suggestion.createdAt).toLocaleString('es-ES')}
                            </span>
                          </div>
                          {suggestion.reviewedBy && (
                            <>
                              <div>
                                <span className="font-medium text-gray-700">Revisada por:</span>
                                <span className="ml-2 text-gray-600">{suggestion.reviewedBy}</span>
                              </div>
                              <div>
                                <span className="font-medium text-gray-700">Fecha de revisión:</span>
                                <span className="ml-2 text-gray-600">
                                  {suggestion.reviewedAt ? new Date(suggestion.reviewedAt).toLocaleString('es-ES') : 'N/A'}
                                </span>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action buttons for pending suggestions */}
                {suggestion.status === 'PENDING' && (
                  <div className="flex items-center space-x-3 mt-4 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => handleSuggestionAction(suggestion.id, 'approve')}
                      disabled={processing === suggestion.id}
                      className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                    >
                      {processing === suggestion.id ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      ) : (
                        <CheckIcon className="h-4 w-4 mr-2" />
                      )}
                      Aprobar y Aplicar
                    </button>

                    <button
                      onClick={() => handleSuggestionAction(suggestion.id, 'reject')}
                      disabled={processing === suggestion.id}
                      className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                    >
                      {processing === suggestion.id ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      ) : (
                        <XMarkIcon className="h-4 w-4 mr-2" />
                      )}
                      Rechazar
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
} 