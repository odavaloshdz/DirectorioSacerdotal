'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  UserGroupIcon, 
  CheckIcon, 
  XMarkIcon, 
  ClockIcon,
  Cog6ToothIcon,
  DocumentTextIcon,
  LightBulbIcon
} from '@heroicons/react/24/outline'
import { PriestsManagement } from '@/components/admin/priests-management'
import { CatalogManagement } from '@/components/admin/catalog-management'
import { SuggestionsManagement } from '@/components/admin/suggestions-management'
import { TestDataCreator } from '@/components/admin/test-data-creator'

interface PendingPriest {
  id: string
  firstName: string
  lastName: string
  phone: string | null
  parish: string | null
  createdAt: string
  user: {
    email: string
  }
}

interface Stats {
  totalPriests: number
  approvedPriests: number
  pendingPriests: number
  rejectedPriests: number
}

export default function AdminPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [pendingPriests, setPendingPriests] = useState<PendingPriest[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'manage' | 'catalogs' | 'suggestions'>('overview')
  const [pendingSuggestionsCount, setPendingSuggestionsCount] = useState(0)

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/auth/signin')
      return
    }

    if ((session.user as any)?.role !== 'ADMIN') {
      router.push('/')
      return
    }

    fetchData()
  }, [session, status, router])

  const fetchData = async () => {
    try {
      const [priestsResponse, statsResponse, suggestionsResponse] = await Promise.all([
        fetch('/api/admin/pending-priests'),
        fetch('/api/admin/stats'),
        fetch('/api/admin/suggestions')
      ])

      if (priestsResponse.ok) {
        const priestsData = await priestsResponse.json()
        setPendingPriests(priestsData.priests)
      }

      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        setStats(statsData.stats)
      }

      if (suggestionsResponse.ok) {
        const suggestionsData = await suggestionsResponse.json()
        const pendingCount = suggestionsData.suggestions.filter((s: any) => s.status === 'PENDING').length
        setPendingSuggestionsCount(pendingCount)
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
      const response = await fetch('/api/admin/priests', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          priestId,
          action
        })
      })

      if (response.ok) {
        fetchData()
      } else {
        alert('Error al procesar la acción')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error al procesar la acción')
    } finally {
      setActionLoading(null)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando panel de administración...</p>
        </div>
      </div>
    )
  }

  if (!session || (session.user as any)?.role !== 'ADMIN') {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Panel de Administración</h1>
              <p className="mt-2 text-gray-600">
                Gestión del Directorio Sacerdotal - Diócesis de San Juan de los Lagos
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

          {/* Navigation Tabs */}
          <div className="mt-6">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'overview'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <UserGroupIcon className="h-5 w-5" />
                    <span>Resumen</span>
                  </div>
                </button>

                <button
                  onClick={() => setActiveTab('manage')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'manage'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <Cog6ToothIcon className="h-5 w-5" />
                    <span>Gestionar Sacerdotes</span>
                  </div>
                </button>

                <button
                  onClick={() => setActiveTab('catalogs')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'catalogs'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <DocumentTextIcon className="h-5 w-5" />
                    <span>Catálogos</span>
                  </div>
                </button>

                <button
                  onClick={() => setActiveTab('suggestions')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm relative ${
                    activeTab === 'suggestions'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <LightBulbIcon className="h-5 w-5" />
                    <span>Sugerencias</span>
                  </div>
                  {pendingSuggestionsCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {pendingSuggestionsCount}
                    </span>
                  )}
                </button>
              </nav>
            </div>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' ? (
          <div>
            {/* Stats Cards */}
            {stats && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                  <div className="flex items-center">
                    <UserGroupIcon className="h-8 w-8 text-blue-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Total Sacerdotes</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.totalPriests}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                  <div className="flex items-center">
                    <CheckIcon className="h-8 w-8 text-green-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Aprobados</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.approvedPriests}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                  <div className="flex items-center">
                    <ClockIcon className="h-8 w-8 text-yellow-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Pendientes</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.pendingPriests}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                  <div className="flex items-center">
                    <XMarkIcon className="h-8 w-8 text-red-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Rechazados</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.rejectedPriests}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Pending Priests */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">
                  Sacerdotes Pendientes de Aprobación ({pendingPriests.length})
                </h2>
              </div>

              {pendingPriests.length === 0 ? (
                <div className="p-12 text-center">
                  <CheckIcon className="h-12 w-12 text-green-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    ¡Todo al día!
                  </h3>
                  <p className="text-gray-600">
                    No hay sacerdotes pendientes de aprobación en este momento.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {pendingPriests.map((priest) => (
                    <div key={priest.id} className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                              <UserGroupIcon className="h-6 w-6 text-gray-600" />
                            </div>
                            <div className="flex-1">
                              <h3 className="text-lg font-medium text-gray-900">
                                P. {priest.firstName} {priest.lastName}
                              </h3>
                              <p className="text-sm text-gray-600">{priest.user.email}</p>
                              <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                                {priest.parish && (
                                  <span>📍 {priest.parish}</span>
                                )}
                                {priest.phone && (
                                  <span>📞 {priest.phone}</span>
                                )}
                                <span>
                                  📅 {new Date(priest.createdAt).toLocaleDateString('es-ES')}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => handlePriestAction(priest.id, 'approve')}
                            disabled={actionLoading === priest.id}
                            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 flex items-center space-x-2"
                          >
                            {actionLoading === priest.id ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            ) : (
                              <CheckIcon className="h-4 w-4" />
                            )}
                            <span>Aprobar</span>
                          </button>

                          <button
                            onClick={() => handlePriestAction(priest.id, 'reject')}
                            disabled={actionLoading === priest.id}
                            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 flex items-center space-x-2"
                          >
                            {actionLoading === priest.id ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            ) : (
                              <XMarkIcon className="h-4 w-4" />
                            )}
                            <span>Rechazar</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : activeTab === 'manage' ? (
          <PriestsManagement />
        ) : activeTab === 'catalogs' ? (
          <div className="space-y-8">
            <CatalogManagement />
            <TestDataCreator />
          </div>
        ) : (
          <SuggestionsManagement />
        )}
      </div>
    </div>
  )
} 