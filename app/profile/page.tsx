'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { 
  UserCircleIcon, 
  PencilIcon, 
  CheckIcon, 
  XMarkIcon,
  MapPinIcon,
  PhoneIcon,
  CalendarIcon,
  BookOpenIcon 
} from '@heroicons/react/24/outline'
import { calculateOrdinationTime, formatPriestName, getPriestProfileImage, parseSpecialties } from '@/lib/utils'

interface PriestProfile {
  id: string
  firstName: string
  lastName: string
  parishId: string | null
  phone: string | null
  specialties: string | null
  profileImage: string | null
  ordainedDate: string | null
  biography: string | null
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

interface Suggestion {
  id: string
  field: string
  currentValue: string | null
  suggestedValue: string
  reason: string | null
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  createdAt: string
}

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [profile, setProfile] = useState<PriestProfile | null>(null)
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [loading, setLoading] = useState(true)
  const [showSuggestionForm, setShowSuggestionForm] = useState(false)
  const [suggestionField, setSuggestionField] = useState('')
  const [suggestionValue, setSuggestionValue] = useState('')
  const [suggestionReason, setSuggestionReason] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/auth/signin')
      return
    }

    // Check if user is an approved priest
    const userRole = (session.user as any)?.role
    const priestStatus = (session.user as any)?.priest?.status

    if (userRole !== 'PRIEST' || priestStatus !== 'APPROVED') {
      router.push('/waiting-approval')
      return
    }

    fetchProfile()
    fetchSuggestions()
  }, [session, status, router])

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/profile')
      if (response.ok) {
        const data = await response.json()
        setProfile(data.profile)
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

  const handleSuggestionSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!suggestionField || !suggestionValue.trim()) {
      alert('Por favor completa todos los campos requeridos')
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
          field: suggestionField,
          suggestedValue: suggestionValue.trim(),
          reason: suggestionReason.trim() || null,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setShowSuggestionForm(false)
        setSuggestionField('')
        setSuggestionValue('')
        setSuggestionReason('')
        fetchSuggestions()
        alert('Sugerencia enviada correctamente')
      } else {
        alert(data.error || 'Error al enviar sugerencia')
      }
    } catch (error) {
      console.error('Error submitting suggestion:', error)
      alert('Error al enviar sugerencia')
    } finally {
      setSubmitting(false)
    }
  }

  const fieldLabels: { [key: string]: string } = {
    firstName: 'Nombre',
    lastName: 'Apellido',
    parishId: 'Parroquia',
    phone: 'Teléfono',
    specialties: 'Especialidades',
    biography: 'Biografía',
    profileImage: 'Imagen de perfil'
  }

  const getFieldValue = (field: string): string => {
    if (!profile) return ''
    
    switch (field) {
      case 'firstName': return profile.firstName
      case 'lastName': return profile.lastName
      case 'parishId': 
        return profile.parish ? `${profile.parish.name}, ${profile.parish.city.name}` : 'No especificado'
      case 'phone': return profile.phone || 'No especificado'
      case 'specialties': return parseSpecialties(profile.specialties).join(', ') || 'No especificado'
      case 'biography': return profile.biography || 'No especificado'
      case 'profileImage': return profile.profileImage ? 'Imagen cargada' : 'Sin imagen'
      default: return ''
    }
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      APPROVED: 'bg-green-100 text-green-800',
      REJECTED: 'bg-red-100 text-red-800'
    }
    
    const labels = {
      PENDING: 'Pendiente',
      APPROVED: 'Aprobada',
      REJECTED: 'Rechazada'
    }

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    )
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando perfil...</p>
        </div>
      </div>
    )
  }

  if (!session || !profile) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 rounded-full overflow-hidden">
                <Image
                  src={getPriestProfileImage(profile.profileImage)}
                  alt={`${profile.firstName} ${profile.lastName}`}
                  width={64}
                  height={64}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {formatPriestName(profile.firstName, profile.lastName)}
                </h1>
                <p className="text-gray-600">{profile.user.email}</p>
                {profile.ordainedDate && (
                  <p className="text-sm text-blue-600 font-medium">
                    {calculateOrdinationTime(profile.ordainedDate)} de ordenación
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={() => setShowSuggestionForm(true)}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors"
            >
              <PencilIcon className="h-4 w-4 mr-2" />
              Sugerir Cambios
            </button>
          </div>
        </div>

        {/* Profile Information */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Información del Perfil</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <div className="flex items-center text-sm text-gray-600 mb-1">
                  <UserCircleIcon className="h-4 w-4 mr-2" />
                  <span className="font-medium">Nombre Completo</span>
                </div>
                <p className="text-gray-900">{formatPriestName(profile.firstName, profile.lastName)}</p>
              </div>

              {profile.parish && (
                <div>
                  <div className="flex items-center text-sm text-gray-600 mb-1">
                    <MapPinIcon className="h-4 w-4 mr-2" />
                    <span className="font-medium">Parroquia</span>
                  </div>
                  <p className="text-gray-900">{profile.parish.name}, {profile.parish.city.name}</p>
                </div>
              )}

              {profile.phone && (
                <div>
                  <div className="flex items-center text-sm text-gray-600 mb-1">
                    <PhoneIcon className="h-4 w-4 mr-2" />
                    <span className="font-medium">Teléfono</span>
                  </div>
                  <p className="text-gray-900">{profile.phone}</p>
                </div>
              )}

              {profile.ordainedDate && (
                <div>
                  <div className="flex items-center text-sm text-gray-600 mb-1">
                    <CalendarIcon className="h-4 w-4 mr-2" />
                    <span className="font-medium">Fecha de Ordenación</span>
                  </div>
                  <p className="text-gray-900">
                    {new Date(profile.ordainedDate).toLocaleDateString('es-ES')} 
                    <span className="text-sm text-blue-600 ml-2">
                      ({calculateOrdinationTime(profile.ordainedDate)})
                    </span>
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-4">
              {parseSpecialties(profile.specialties).length > 0 && (
                <div>
                  <div className="flex items-center text-sm text-gray-600 mb-2">
                    <BookOpenIcon className="h-4 w-4 mr-2" />
                    <span className="font-medium">Especialidades Ministeriales</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {parseSpecialties(profile.specialties).map((specialty, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                      >
                        {specialty}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {profile.biography && (
                <div>
                  <div className="flex items-center text-sm text-gray-600 mb-2">
                    <BookOpenIcon className="h-4 w-4 mr-2" />
                    <span className="font-medium">Biografía</span>
                  </div>
                  <p className="text-gray-900 text-sm leading-relaxed">{profile.biography}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Suggestions History */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Historial de Sugerencias</h2>
          
          {suggestions.length === 0 ? (
            <div className="text-center py-8">
              <PencilIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No hay sugerencias</h3>
              <p className="text-gray-600">
                Cuando envíes sugerencias de cambios aparecerán aquí.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {suggestions.map((suggestion) => (
                <div key={suggestion.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">
                        {fieldLabels[suggestion.field]} 
                      </h4>
                      {getStatusBadge(suggestion.status)}
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-600 space-y-1">
                    <p><span className="font-medium">Valor actual:</span> {suggestion.currentValue || 'No especificado'}</p>
                    <p><span className="font-medium">Valor sugerido:</span> {suggestion.suggestedValue}</p>
                    {suggestion.reason && (
                      <p><span className="font-medium">Razón:</span> {suggestion.reason}</p>
                    )}
                  </div>
                  
                  <p className="text-xs text-gray-400 mt-2">
                    Enviado el {new Date(suggestion.createdAt).toLocaleDateString('es-ES')}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Suggestion Form Modal */}
        {showSuggestionForm && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-2xl shadow-lg rounded-md bg-white">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Sugerir Cambio</h3>
                <button
                  onClick={() => setShowSuggestionForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleSuggestionSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Campo a modificar *
                  </label>
                  <select
                    value={suggestionField}
                    onChange={(e) => setSuggestionField(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Seleccionar campo...</option>
                    <option value="firstName">Nombre</option>
                    <option value="lastName">Apellido</option>
                    <option value="phone">Teléfono</option>
                    <option value="parishId">Parroquia</option>
                    <option value="biography">Biografía</option>
                    <option value="profileImage">Imagen de perfil</option>
                  </select>
                </div>

                {suggestionField && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Valor actual
                    </label>
                    <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                      {getFieldValue(suggestionField)}
                    </p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Valor sugerido *
                  </label>
                  <textarea
                    value={suggestionValue}
                    onChange={(e) => setSuggestionValue(e.target.value)}
                    required
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Ingresa el nuevo valor..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Razón del cambio (opcional)
                  </label>
                  <textarea
                    value={suggestionReason}
                    onChange={(e) => setSuggestionReason(e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Explica por qué necesitas este cambio..."
                  />
                </div>

                <div className="flex justify-end space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowSuggestionForm(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    {submitting ? 'Enviando...' : 'Enviar Sugerencia'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 