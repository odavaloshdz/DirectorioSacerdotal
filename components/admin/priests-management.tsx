'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  XMarkIcon,
  UserCircleIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline'
import { calculateOrdinationTime, formatPriestName, getPriestProfileImage, parseSpecialties } from '@/lib/utils'

interface Priest {
  id: string
  firstName: string
  lastName: string
  parish: string | null
  phone: string | null
  specialties: string | null
  profileImage: string | null
  ordainedDate: string | null
  biography: string | null
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  createdAt: string
  user: {
    id: string
    email: string
    name: string
    role: string
  }
}

const availableSpecialties = [
  'Dirección Espiritual',
  'Liturgia',
  'Catequesis',
  'Juventud',
  'Matrimonios',
  'Familia',
  'Formación',
  'Misiones',
  'Pastoral Social',
  'Educación',
  'Música Sacra',
  'Arte Sacro'
]

export function PriestsManagement() {
  const [priests, setPriests] = useState<Priest[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add')
  const [selectedPriest, setSelectedPriest] = useState<Priest | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    parish: '',
    phone: '',
    specialties: [] as string[],
    ordainedDate: '',
    biography: '',
    status: 'PENDING'
  })
  const [profileImage, setProfileImage] = useState<File | null>(null)

  useEffect(() => {
    fetchPriests()
  }, [])

  const fetchPriests = async () => {
    try {
      const response = await fetch('/api/admin/priests')
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

  const handleAddPriest = () => {
    setModalMode('add')
    setSelectedPriest(null)
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      parish: '',
      phone: '',
      specialties: [],
      ordainedDate: '',
      biography: '',
      status: 'PENDING'
    })
    setProfileImage(null)
    setShowModal(true)
  }

  const handleEditPriest = (priest: Priest) => {
    setModalMode('edit')
    setSelectedPriest(priest)
    setFormData({
      firstName: priest.firstName,
      lastName: priest.lastName,
      email: priest.user.email,
      password: '',
      parish: priest.parish || '',
      phone: priest.phone || '',
      specialties: parseSpecialties(priest.specialties),
      ordainedDate: priest.ordainedDate ? priest.ordainedDate.split('T')[0] : '',
      biography: priest.biography || '',
      status: priest.status
    })
    setProfileImage(null)
    setShowModal(true)
  }

  const handleDeletePriest = async (priest: Priest) => {
    if (!confirm(`¿Está seguro de que desea eliminar al sacerdote ${formatPriestName(priest.firstName, priest.lastName)}? Esta acción no se puede deshacer.`)) {
      return
    }

    try {
      const response = await fetch(`/api/admin/priests/${priest.id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        fetchPriests()
        alert('Sacerdote eliminado exitosamente')
      } else {
        const data = await response.json()
        alert(data.error || 'Error al eliminar sacerdote')
      }
    } catch (error) {
      console.error('Error deleting priest:', error)
      alert('Error al eliminar sacerdote')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const submitData = new FormData()
      
      // Add all text fields
      Object.entries(formData).forEach(([key, value]) => {
        if (key === 'specialties') {
          submitData.append(key, JSON.stringify(value))
        } else {
          submitData.append(key, value as string)
        }
      })
      
      // Add profile image if selected
      if (profileImage) {
        submitData.append('profileImage', profileImage)
      }

      const url = modalMode === 'add' 
        ? '/api/admin/priests'
        : `/api/admin/priests/${selectedPriest?.id}`
      
      const method = modalMode === 'add' ? 'POST' : 'PUT'

      const response = await fetch(url, {
        method,
        body: submitData
      })

      const data = await response.json()

      if (response.ok) {
        setShowModal(false)
        fetchPriests()
        alert(data.message)
      } else {
        alert(data.error || 'Error al guardar sacerdote')
      }
    } catch (error) {
      console.error('Error submitting form:', error)
      alert('Error al guardar sacerdote')
    } finally {
      setSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSpecialtyToggle = (specialty: string) => {
    setFormData(prev => ({
      ...prev,
      specialties: prev.specialties.includes(specialty)
        ? prev.specialties.filter(s => s !== specialty)
        : [...prev.specialties, specialty]
    }))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setProfileImage(e.target.files[0])
    }
  }

  const filteredPriests = priests.filter(priest => {
    const matchesSearch = !searchTerm || 
      `${priest.firstName} ${priest.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      priest.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      priest.parish?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = !statusFilter || priest.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

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
          <h2 className="text-2xl font-bold text-gray-900">Gestión de Sacerdotes</h2>
          <p className="text-gray-600">Administrar sacerdotes del directorio</p>
        </div>
        <button
          onClick={handleAddPriest}
          className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Agregar Sacerdote
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nombre, email o parroquia..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Todos los estados</option>
            <option value="PENDING">Pendiente</option>
            <option value="APPROVED">Aprobado</option>
            <option value="REJECTED">Rechazado</option>
          </select>

          <div className="text-sm text-gray-600 flex items-center">
            Total: {filteredPriests.length} sacerdotes
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white shadow-sm rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sacerdote
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Parroquia
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ordenación
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPriests.map((priest) => (
                <tr key={priest.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full overflow-hidden mr-4">
                        <Image
                          src={getPriestProfileImage(priest.profileImage)}
                          alt={`${priest.firstName} ${priest.lastName}`}
                          width={40}
                          height={40}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {formatPriestName(priest.firstName, priest.lastName)}
                        </div>
                        <div className="text-sm text-gray-500">
                          {priest.user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {priest.parish || 'No asignada'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      priest.status === 'APPROVED' 
                        ? 'bg-green-100 text-green-800'
                        : priest.status === 'PENDING'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {priest.status === 'APPROVED' ? 'Aprobado' :
                       priest.status === 'PENDING' ? 'Pendiente' : 'Rechazado'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {priest.ordainedDate ? calculateOrdinationTime(priest.ordainedDate) : 'No especificado'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditPriest(priest)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeletePriest(priest)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900">
                {modalMode === 'add' ? 'Agregar Sacerdote' : 'Editar Sacerdote'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre *
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Apellidos *
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contraseña {modalMode === 'edit' ? '(dejar vacío para mantener actual)' : '*'}
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required={modalMode === 'add'}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Parroquia
                  </label>
                  <input
                    type="text"
                    name="parish"
                    value={formData.parish}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha de Ordenación
                  </label>
                  <input
                    type="date"
                    name="ordainedDate"
                    value={formData.ordainedDate}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Estado
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="PENDING">Pendiente</option>
                    <option value="APPROVED">Aprobado</option>
                    <option value="REJECTED">Rechazado</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Imagen de Perfil
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Especialidades
                </label>
                <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto border border-gray-300 rounded-md p-3">
                  {availableSpecialties.map(specialty => (
                    <label key={specialty} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.specialties.includes(specialty)}
                        onChange={() => handleSpecialtyToggle(specialty)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="text-sm text-gray-700">{specialty}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Biografía
                </label>
                <textarea
                  name="biography"
                  value={formData.biography}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {submitting ? 'Guardando...' : modalMode === 'add' ? 'Crear Sacerdote' : 'Actualizar Sacerdote'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
} 