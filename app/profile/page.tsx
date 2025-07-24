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
  parish: string | null
  phone: string | null
  specialties: string | null
  profileImage: string | null
  ordainedDate: string | null
  biography: string | null
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
    setSubmitting(true)

    try {
      const response = await fetch('/api/suggestions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          field: suggestionField,
          suggestedValue: suggestionValue,
          reason: suggestionReason,
        }),
      })

      if (response.ok) {
        setShowSuggestionForm(false)
        setSuggestionField('')
        setSuggestionValue('')
        setSuggestionReason('')
        fetchSuggestions()
        alert('Sugerencia enviada correctamente')
      } else {
        alert('Error al enviar sugerencia')
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
    parish: 'Parroquia',
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
      case 'parish': return profile.parish || 'No especificado'
      case 'phone': return profile.phone || 'No especificado'
      case 'specialties': return parseSpecialties(profile.specialties).join(', ') || 'No especificado'
      case 'biography': return profile.biography || 'No especificado'
      case 'profileImage': return profile.profileImage ? 'Imagen cargada' : 'Sin imagen'
      default: return ''
    }
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
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center space-x-2"
            >
              <PencilIcon className="h-4 w-4" />
              <span>Sugerir Cambio</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Profile Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Información Personal</h2>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <UserCircleIcon className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Nombre completo</p>
                  <p className="font-medium">{profile.firstName} {profile.lastName}</p>
                </div>
              </div>

              {profile.parish && (
                <div className="flex items-center space-x-3">
                  <MapPinIcon className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Parroquia</p>
                    <p className="font-medium">{profile.parish}</p>
                  </div>
                </div>
              )}

              {profile.phone && (
                <div className="flex items-center space-x-3">
                  <PhoneIcon className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Teléfono</p>
                    <p className="font-medium">{profile.phone}</p>
                  </div>
                </div>
              )}

              {profile.ordainedDate && (
                <div className="flex items-center space-x-3">
                  <CalendarIcon className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Fecha de ordenación</p>
                    <p className="font-medium">
                      {new Date(profile.ordainedDate).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              )}

              {parseSpecialties(profile.specialties).length > 0 && (
                <div className="flex items-start space-x-3">
                  <BookOpenIcon className="h-5 w-5 text-gray-400 mt-1" />
                  <div>
                    <p className="text-sm text-gray-500 mb-2">Especialidades</p>
                    <div className="flex flex-wrap gap-2">
                      {parseSpecialties(profile.specialties).map((specialty, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                        >
                          {specialty}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {profile.biography && (
                <div className="pt-4 border-t">
                  <p className="text-sm text-gray-500 mb-2">Biografía</p>
                  <p className="text-gray-700 leading-relaxed">{profile.biography}</p>
                </div>
              )}
            </div>
          </div>

          {/* Suggestions History */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Historial de Sugerencias</h2>
            
            {suggestions.length === 0 ? (
              <div className="text-center py-8">
                <PencilIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No has enviado ninguna sugerencia</p>
                <p className="text-sm text-gray-400 mt-2">
                  Usa el botón "Sugerir Cambio" para proponer modificaciones a tu perfil
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {suggestions.map((suggestion) => (
                  <div
                    key={suggestion.id}
                    className="border rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-900">
                        {fieldLabels[suggestion.field] || suggestion.field}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        suggestion.status === 'PENDING'
                          ? 'bg-yellow-100 text-yellow-800'
                          : suggestion.status === 'APPROVED'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {suggestion.status === 'PENDING' ? 'Pendiente' :
                         suggestion.status === 'APPROVED' ? 'Aprobado' : 'Rechazado'}
                      </span>
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
        </div>

        {/* Suggestion Form Modal */}
        {showSuggestionForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Sugerir Cambio</h3>
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
                    value={suggestionField}
                    onChange={(e) => setSuggestionField(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Seleccionar campo</option>
                    {Object.entries(fieldLabels).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>

                {suggestionField && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Valor actual
                    </label>
                    <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                      {getFieldValue(suggestionField)}
                    </p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nuevo valor sugerido
                  </label>
                  <textarea
                    value={suggestionValue}
                    onChange={(e) => setSuggestionValue(e.target.value)}
                    required
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Escribe el nuevo valor..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Razón del cambio (opcional)
                  </label>
                  <textarea
                    value={suggestionReason}
                    onChange={(e) => setSuggestionReason(e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Explica por qué quieres hacer este cambio..."
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowSuggestionForm(false)}
                    className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
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