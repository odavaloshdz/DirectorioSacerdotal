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
import { calculateOrdinationTime, formatPriestName, getPriestProfileImage } from '@/lib/utils'

interface Priest {
  id: string
  firstName: string
  lastName: string
  parishId: string | null
  phone: string | null
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
  parish?: {
    id: string
    name: string
    city: {
      name: string
    }
  }
  specialties?: Array<{
    specialty: {
      id: string
      name: string
    }
  }>
}

interface Parish {
  id: string
  name: string
  city: {
    name: string
  }
}

interface Specialty {
  id: string
  name: string
  description?: string
}

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
    parishId: '',
    phone: '',
    specialtyIds: [] as string[],
    ordainedDate: '',
    biography: '',
    status: 'PENDING'
  })
  const [profileImage, setProfileImage] = useState<File | null>(null)
  const [parishes, setParishes] = useState<Parish[]>([])
  const [specialties, setSpecialties] = useState<Specialty[]>([])
  const [loadingCatalogs, setLoadingCatalogs] = useState(false)

  useEffect(() => {
    fetchPriests()
    fetchCatalogs()
  }, [])

  const fetchPriests = async () => {
    try {
      setLoading(true)
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

  const fetchCatalogs = async () => {
    try {
      setLoadingCatalogs(true)
      const [parishesRes, specialtiesRes] = await Promise.all([
        fetch('/api/admin/parishes'),
        fetch('/api/admin/specialties')
      ])

      if (parishesRes.ok) {
        const parishesData = await parishesRes.json()
        setParishes(parishesData.parishes)
      }

      if (specialtiesRes.ok) {
        const specialtiesData = await specialtiesRes.json()
        setSpecialties(specialtiesData.specialties)
      }
    } catch (error) {
      console.error('Error fetching catalogs:', error)
    } finally {
      setLoadingCatalogs(false)
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
      parishId: '',
      phone: '',
      specialtyIds: [],
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
      parishId: priest.parishId || '',
      phone: priest.phone || '',
      specialtyIds: priest.specialties?.map(ps => ps.specialty.id) || [],
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
        if (key === 'specialtyIds') {
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

  const handleSpecialtyToggle = (specialtyId: string) => {
    setFormData(prev => ({
      ...prev,
      specialtyIds: prev.specialtyIds.includes(specialtyId)
        ? prev.specialtyIds.filter(s => s !== specialtyId)
        : [...prev.specialtyIds, specialtyId]
    }))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setProfileImage(e.target.files[0])
    }
  }

  const filteredPriests = priests.filter(priest => {
    const searchMatch = 
      priest.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      priest.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      priest.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (priest.parish?.name.toLowerCase().includes(searchTerm.toLowerCase()))

    const statusMatch = statusFilter === '' || priest.status === statusFilter

    return searchMatch && statusMatch
  })

  const getStatusBadge = (status: string) => {
    const statusStyles = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      APPROVED: 'bg-green-100 text-green-800',
      REJECTED: 'bg-red-100 text-red-800'
    }
    
    const statusLabels = {
      PENDING: 'Pendiente',
      APPROVED: 'Aprobado',
      REJECTED: 'Rechazado'
    }

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyles[status as keyof typeof statusStyles]}`}>
        {statusLabels[status as keyof typeof statusLabels]}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Gestión de Sacerdotes</h2>
        <button
          onClick={handleAddPriest}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <PlusIcon className="h-5 w-5" />
          Agregar Sacerdote
        </button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="relative">
          <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nombre, email o parroquia..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Todos los estados</option>
          <option value="PENDING">Pendientes</option>
          <option value="APPROVED">Aprobados</option>
          <option value="REJECTED">Rechazados</option>
        </select>
      </div>

      {/* Priests Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {filteredPriests.map((priest) => (
            <li key={priest.id} className="px-6 py-4 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-12 w-12">
                    {priest.profileImage ? (
                      <Image
                        src={priest.profileImage}
                        alt={`Foto de ${formatPriestName(priest.firstName, priest.lastName)}`}
                        width={48}
                        height={48}
                        className="h-12 w-12 rounded-full object-cover"
                      />
                    ) : (
                      <UserCircleIcon className="h-12 w-12 text-gray-400" />
                    )}
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900">
                      {formatPriestName(priest.firstName, priest.lastName)}
                    </div>
                    <div className="text-sm text-gray-500">{priest.user.email}</div>
                    <div className="text-sm text-gray-500">
                      {priest.parish ? `${priest.parish.name}, ${priest.parish.city.name}` : 'Sin parroquia asignada'}
                    </div>
                    {priest.specialties && priest.specialties.length > 0 && (
                      <div className="text-sm text-gray-500">
                        Especialidades: {priest.specialties.map(ps => ps.specialty.name).join(', ')}
                      </div>
                    )}
                    {priest.ordainedDate && (
                      <div className="text-sm text-gray-500">
                        Ordenado: {calculateOrdinationTime(priest.ordainedDate)}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  {getStatusBadge(priest.status)}
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditPriest(priest)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      <PencilIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDeletePriest(priest)}
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
        {filteredPriests.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No se encontraron sacerdotes
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-2xl shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                {modalMode === 'add' ? 'Agregar Sacerdote' : 'Editar Sacerdote'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
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
                    Apellido *
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
                  Contraseña {modalMode === 'edit' ? '(dejar en blanco para mantener actual)' : '*'}
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
                  <select
                    name="parishId"
                    value={formData.parishId}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Seleccionar parroquia</option>
                    {parishes.map((parish) => (
                      <option key={parish.id} value={parish.id}>
                        {parish.name} - {parish.city.name}
                      </option>
                    ))}
                  </select>
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Especialidades Ministeriales
                </label>
                <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto border border-gray-300 rounded-md p-2">
                  {specialties.map((specialty) => (
                    <label key={specialty.id} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.specialtyIds.includes(specialty.id)}
                        onChange={() => handleSpecialtyToggle(specialty.id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{specialty.name}</span>
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
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Describe la formación y experiencia del sacerdote..."
                />
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

              <div className="flex justify-end space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {submitting ? 'Guardando...' : (modalMode === 'add' ? 'Crear' : 'Actualizar')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
} 