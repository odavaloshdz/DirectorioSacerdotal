'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  UserGroupIcon, 
  CheckIcon, 
  XMarkIcon, 
  ClockIcon,
  ExclamationTriangleIcon,
  CogIcon
} from '@heroicons/react/24/outline'
import { PriestsManagement } from '@/components/admin/priests-management'

interface PendingPriest {
  id: string
  firstName: string
  lastName: string
  parish: string | null
  phone: string | null
  status: string
  createdAt: string
  user: {
    email: string
    name: string
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
  const [activeTab, setActiveTab] = useState<'overview' | 'manage'>('overview')

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
      const [priestsResponse, statsResponse] = await Promise.all([
        fetch('/api/admin/pending-priests'),
        fetch('/api/admin/stats')
      ])

      if (priestsResponse.ok) {
        const priestsData = await priestsResponse.json()
        setPendingPriests(priestsData.priests)
      }

      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        setStats(statsData.stats)
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

      if (response.ok) {
        // Refresh data after action
        await fetchData()
      } else {
        const error = await response.json()
        alert(error.error || 'Error al procesar la acción')
      }
    } catch (error) {
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
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Panel de Administración</h1>
                <p className="mt-2 text-gray-600">
                  Gestión de sacerdotes - Diócesis de San Juan de los Lagos
                </p>
              </div>
              
              {/* Tabs */}
              <div className="flex space-x-1">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    activeTab === 'overview'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <UserGroupIcon className="h-4 w-4 inline mr-2" />
                  Resumen y Aprobaciones
                </button>
                <button
                  onClick={() => setActiveTab('manage')}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    activeTab === 'manage'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <CogIcon className="h-4 w-4 inline mr-2" />
                  Gestionar Sacerdotes
                </button>
              </div>
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
        ) : (
          <PriestsManagement />
        )}
      </div>
    </div>
  )
} 