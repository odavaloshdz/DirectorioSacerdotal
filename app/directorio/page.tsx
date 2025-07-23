'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { UserGroupIcon, PhoneIcon, MapPinIcon } from '@heroicons/react/24/outline'

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
  const [loading, setLoading] = useState(true)

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

  const fetchPriests = async () => {
    try {
      const response = await fetch('/api/priests')
      if (response.ok) {
        const data = await response.json()
        setPriests(data.priests)
      }
    } catch (error) {
      console.error('Error fetching priests:', error)
    } finally {
      setLoading(false)
    }
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
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Directorio Sacerdotal</h1>
              <p className="mt-2 text-gray-600">
                Diócesis de San Juan de los Lagos - {priests.length} sacerdotes registrados
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

        {priests.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <UserGroupIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No hay sacerdotes registrados
            </h3>
            <p className="text-gray-600">
              Los sacerdotes aparecerán aquí una vez que sean aprobados por el administrador.
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {priests.map((priest) => (
              <div
                key={priest.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
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
                    <span className="text-sm">{priest.user.email}</span>
                  </div>

                  {priest.specialties && (
                    <div className="mt-4">
                      <p className="text-xs text-gray-500 mb-2">Especialidades:</p>
                      <div className="flex flex-wrap gap-1">
                        {JSON.parse(priest.specialties).map((specialty: string, index: number) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs"
                          >
                            {specialty}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-6 pt-4 border-t border-gray-100">
                  <button className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition text-sm">
                    Ver Perfil Completo
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
} 