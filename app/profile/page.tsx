'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import Image from 'next/image'
import { 
  UserIcon, 
  EnvelopeIcon, 
  PhoneIcon, 
  MapPinIcon,
  CalendarIcon,
  PencilIcon,
  CheckIcon,
  ClockIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'

interface Parish {
  id: string
  name: string
  city: {
    id: string
    name: string
    state: string
  }
}

interface PriestProfile {
  id: string
  firstName: string
  lastName: string
  phone: string | null
  ordainedDate: string | null
  biography: string | null
  profileImage: string | null
  status: string
  parishId: string | null
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
  user: {
    email: string
  }
}

interface Suggestion {
  id: string
  field: string
  currentValue: string
  suggestedValue: string
  reason: string
  status: string
  createdAt: string
}

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const [profile, setProfile] = useState<PriestProfile | null>(null)
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [parishes, setParishes] = useState<Parish[]>([])
  const [loading, setLoading] = useState(true)
  const [showSuggestionForm, setShowSuggestionForm] = useState(false)
  const [selectedField, setSelectedField] = useState('')
  const [suggestedValue, setSuggestedValue] = useState('')
  const [reason, setReason] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      redirect('/auth/signin')
    }
    if (status === 'authenticated') {
      fetchProfile()
      fetchSuggestions()
      fetchParishes()
    }
  }, [status])

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/profile')
      if (response.ok) {
        const data = await response.json()
        setProfile(data.priest)
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchSuggestions = async () => {
    try {
      const response = await fetch('/api/suggestions')
      if (response.ok) {
        const data = await response.json()
        setSuggestions(data.suggestions)
      }
    } catch (error) {
      console.error('Error fetching suggestions:', error)
    }
  }

  const fetchParishes = async () => {
    try {
      const response = await fetch('/api/parishes')
      if (response.ok) {
        const data = await response.json()
        setParishes(data.parishes)
      }
    } catch (error) {
      console.error('Error fetching parishes:', error)
    }
  }

  const fieldLabels: { [key: string]: string } = {
    firstName: 'Nombre',
    lastName: 'Apellido',
    phone: 'Teléfono',
    parishId: 'Parroquia',
    ordainedDate: 'Fecha de ordenación',
    biography: 'Biografía',
    specialties: 'Especialidades'
  }

  const getFieldValue = (field: string): string => {
    if (!profile) return ''
    
    switch (field) {
      case 'firstName':
        return profile.firstName || ''
      case 'lastName':
        return profile.lastName || ''
      case 'phone':
        return profile.phone || ''
      case 'parishId':
        return profile.parish ? `${profile.parish.name}, ${profile.parish.city.name}` : ''
      case 'ordainedDate':
        return profile.ordainedDate ? new Date(profile.ordainedDate).toLocaleDateString('es-ES') : ''
      case 'biography':
        return profile.biography || ''
      case 'specialties':
        return profile.specialties.map(s => s.specialty.name).join(', ') || ''
      default:
        return ''
    }
  }

  const handleSuggestionSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const trimmedValue = suggestedValue.trim()
    const trimmedReason = reason.trim()
    
    if (!trimmedValue || !trimmedReason) {
      alert('Por favor, complete todos los campos')
      return
    }

    setSubmitting(true)
    try {
      const response = await fetch('/api/suggestions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          field: selectedField,
          suggestedValue: trimmedValue,
          reason: trimmedReason,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        alert('Sugerencia enviada exitosamente')
        setShowSuggestionForm(false)
        setSelectedField('')
        setSuggestedValue('')
        setReason('')
        fetchSuggestions()
      } else {
        alert(data.error || 'Error al enviar la sugerencia')
      }
    } catch (error) {
      console.error('Error submitting suggestion:', error)
      alert('Error al enviar la sugerencia')
    } finally {
      setSubmitting(false)
    }
  }

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

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 text-sm sm:text-base">Cargando perfil...</p>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <h2 className="text-lg sm:text-xl font-medium text-gray-900 mb-2">Perfil no encontrado</h2>
          <p className="text-gray-600 text-sm sm:text-base">No se pudo cargar tu información de perfil.</p>
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
              Mi Perfil
            </h1>
            <p className="mt-1 text-sm sm:text-base text-gray-500">
              Revisa y sugiere cambios a tu información personal
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-4 sm:py-6 lg:py-8 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Profile Information */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {/* Basic Info Card */}
            <div className="bg-white rounded-lg shadow border border-gray-200 p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 mb-6">
                <div className="flex-shrink-0 self-center sm:self-start">
                  {profile.profileImage ? (
                    <Image
                      src={profile.profileImage}
                      alt={`${profile.firstName} ${profile.lastName}`}
                      width={100}
                      height={100}
                      className="h-20 w-20 sm:h-24 sm:w-24 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-20 w-20 sm:h-24 sm:w-24 bg-blue-100 rounded-full flex items-center justify-center">
                      <UserIcon className="h-10 w-10 sm:h-12 sm:w-12 text-blue-600" />
                    </div>
                  )}
                </div>
                <div className="flex-1 text-center sm:text-left">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">
                    P. {profile.firstName} {profile.lastName}
                  </h2>
                  <div className="flex items-center justify-center sm:justify-start gap-2 mb-2">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      profile.status === 'APPROVED' 
                        ? 'bg-green-100 text-green-800'
                        : profile.status === 'PENDING'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {profile.status === 'APPROVED' ? 'Aprobado' : 
                       profile.status === 'PENDING' ? 'Pendiente' : 'Rechazado'}
                    </span>
                  </div>
                  <div className="flex items-center justify-center sm:justify-start text-gray-600 text-sm">
                    <EnvelopeIcon className="h-4 w-4 mr-2" />
                    <span className="break-all">{profile.user.email}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-3">
                  {profile.phone && (
                    <div className="flex items-center text-sm">
                      <PhoneIcon className="h-4 w-4 text-gray-400 mr-3 flex-shrink-0" />
                      <span>{profile.phone}</span>
                    </div>
                  )}

                  {profile.parish && (
                    <div className="flex items-start text-sm">
                      <MapPinIcon className="h-4 w-4 text-gray-400 mr-3 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">{profile.parish.name}</p>
                        <p className="text-gray-500">{profile.parish.city.name}</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  {profile.ordainedDate && (
                    <div className="flex items-start text-sm">
                      <CalendarIcon className="h-4 w-4 text-gray-400 mr-3 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Ordenación</p>
                        <p className="text-gray-500">{formatDate(profile.ordainedDate)}</p>
                      </div>
                    </div>
                  )}

                  {profile.specialties.length > 0 && (
                    <div className="flex items-start text-sm">
                      <UserIcon className="h-4 w-4 text-gray-400 mr-3 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium mb-1">Especialidades</p>
                        <div className="flex flex-wrap gap-1">
                          {profile.specialties.map((specialty, index) => (
                            <span
                              key={index}
                              className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                            >
                              {specialty.specialty.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {profile.biography && (
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <h3 className="text-sm font-medium text-gray-900 mb-2">Biografía</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{profile.biography}</p>
                </div>
              )}

              <div className="mt-6 pt-6 border-t border-gray-100">
                <button
                  onClick={() => setShowSuggestionForm(true)}
                  className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  <PencilIcon className="h-4 w-4 mr-2" />
                  Sugerir cambio
                </button>
              </div>
            </div>
          </div>

          {/* Suggestions History */}
          <div className="space-y-4 sm:space-y-6">
            <div className="bg-white rounded-lg shadow border border-gray-200 p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">
                Historial de Sugerencias
              </h3>

              {suggestions.length === 0 ? (
                <div className="text-center py-6">
                  <PencilIcon className="h-8 w-8 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">
                    No has enviado sugerencias aún
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {suggestions.map((suggestion) => (
                    <div
                      key={suggestion.id}
                      className={`p-3 rounded-lg border text-sm ${
                        suggestion.status === 'PENDING'
                          ? 'bg-yellow-50 border-yellow-200'
                          : suggestion.status === 'APPROVED'
                          ? 'bg-green-50 border-green-200'
                          : 'bg-red-50 border-red-200'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-900">
                          {fieldLabels[suggestion.field] || suggestion.field}
                        </span>
                        <div className="flex items-center gap-1">
                          {suggestion.status === 'PENDING' && (
                            <ClockIcon className="h-3 w-3 text-yellow-600" />
                          )}
                          {suggestion.status === 'APPROVED' && (
                            <CheckIcon className="h-3 w-3 text-green-600" />
                          )}
                          {suggestion.status === 'REJECTED' && (
                            <XMarkIcon className="h-3 w-3 text-red-600" />
                          )}
                          <span className={`text-xs font-medium ${
                            suggestion.status === 'PENDING'
                              ? 'text-yellow-600'
                              : suggestion.status === 'APPROVED'
                              ? 'text-green-600'
                              : 'text-red-600'
                          }`}>
                            {suggestion.status === 'PENDING' ? 'Pendiente' :
                             suggestion.status === 'APPROVED' ? 'Aprobada' : 'Rechazada'}
                          </span>
                        </div>
                      </div>
                      <p className="text-gray-600 mb-1 break-words">
                        <strong>Sugerencia:</strong> {suggestion.suggestedValue}
                      </p>
                      <p className="text-gray-500 text-xs">
                        {new Date(suggestion.createdAt).toLocaleDateString('es-ES')}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Suggestion Form Modal */}
      {showSuggestionForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 p-4">
          <div className="relative top-4 sm:top-20 mx-auto max-w-md sm:max-w-lg bg-white rounded-lg shadow-lg">
            <div className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Sugerir cambio
                </h3>
                <button
                  onClick={() => setShowSuggestionForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleSuggestionSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Campo a modificar
                  </label>
                  <select
                    value={selectedField}
                    onChange={(e) => setSelectedField(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    required
                  >
                    <option value="">Selecciona un campo</option>
                    {Object.entries(fieldLabels).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>

                {selectedField && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Valor actual
                    </label>
                    <div className="w-full px-3 py-2 border border-gray-200 rounded-md bg-gray-50 text-sm text-gray-600">
                      {getFieldValue(selectedField) || 'Sin información'}
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nuevo valor sugerido
                  </label>
                  <input
                    type="text"
                    value={suggestedValue}
                    onChange={(e) => setSuggestedValue(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    placeholder="Ingresa el nuevo valor"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Razón del cambio
                  </label>
                  <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    placeholder="Explica por qué necesitas este cambio"
                    required
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                  >
                    {submitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Enviando...
                      </>
                    ) : (
                      'Enviar sugerencia'
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowSuggestionForm(false)}
                    className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors text-sm font-medium"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 