'use client'

import { useState, useEffect } from 'react'
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  XMarkIcon,
  MapPinIcon,
  BuildingOfficeIcon,
  AcademicCapIcon
} from '@heroicons/react/24/outline'

interface City {
  id: string
  name: string
  state: string
  parishes: { id: string; name: string }[]
}

interface Parish {
  id: string
  name: string
  cityId: string
  address?: string
  phone?: string
  email?: string
  city: {
    name: string
    state: string
  }
  priests: { id: string; firstName: string; lastName: string }[]
}

interface Specialty {
  id: string
  name: string
  description?: string
  priests: { priest: { firstName: string; lastName: string } }[]
}

export function CatalogManagement() {
  const [activeTab, setActiveTab] = useState<'cities' | 'parishes' | 'specialties'>('cities')
  const [cities, setCities] = useState<City[]>([])
  const [parishes, setParishes] = useState<Parish[]>([])
  const [specialties, setSpecialties] = useState<Specialty[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [modalType, setModalType] = useState<'add' | 'edit'>('add')
  const [submitting, setSubmitting] = useState(false)

  // Form states
  const [cityForm, setCityForm] = useState({ name: '', state: '' })
  const [parishForm, setParishForm] = useState({ 
    name: '', 
    cityId: '', 
    address: '', 
    phone: '', 
    email: '' 
  })
  const [specialtyForm, setSpecialtyForm] = useState({ name: '', description: '' })
  const [selectedItem, setSelectedItem] = useState<any>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [citiesRes, parishesRes, specialtiesRes] = await Promise.all([
        fetch('/api/admin/cities'),
        fetch('/api/admin/parishes'),
        fetch('/api/admin/specialties')
      ])

      if (citiesRes.ok) {
        const citiesData = await citiesRes.json()
        setCities(citiesData.cities)
      }

      if (parishesRes.ok) {
        const parishesData = await parishesRes.json()
        setParishes(parishesData.parishes)
      }

      if (specialtiesRes.ok) {
        const specialtiesData = await specialtiesRes.json()
        setSpecialties(specialtiesData.specialties)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = (type: 'cities' | 'parishes' | 'specialties') => {
    setModalType('add')
    setSelectedItem(null)
    
    if (type === 'cities') {
      setCityForm({ name: '', state: '' })
    } else if (type === 'parishes') {
      setParishForm({ name: '', cityId: '', address: '', phone: '', email: '' })
    } else {
      setSpecialtyForm({ name: '', description: '' })
    }
    
    setShowModal(true)
  }

  const handleEdit = (item: any, type: 'cities' | 'parishes' | 'specialties') => {
    setModalType('edit')
    setSelectedItem(item)
    
    if (type === 'cities') {
      setCityForm({ name: item.name, state: item.state })
    } else if (type === 'parishes') {
      setParishForm({ 
        name: item.name, 
        cityId: item.cityId, 
        address: item.address || '', 
        phone: item.phone || '', 
        email: item.email || '' 
      })
    } else {
      setSpecialtyForm({ name: item.name, description: item.description || '' })
    }
    
    setShowModal(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      let url = `/api/admin/${activeTab}`
      let method = modalType === 'add' ? 'POST' : 'PUT'
      let body: any = {}

      if (activeTab === 'cities') {
        body = cityForm
        if (modalType === 'edit') url += `/${selectedItem.id}`
      } else if (activeTab === 'parishes') {
        body = parishForm
        if (modalType === 'edit') url += `/${selectedItem.id}`
      } else {
        body = specialtyForm
        if (modalType === 'edit') url += `/${selectedItem.id}`
      }

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })

      const data = await response.json()

      if (response.ok) {
        setShowModal(false)
        fetchData()
        alert(data.message)
      } else {
        alert(data.error || 'Error al guardar')
      }
    } catch (error) {
      console.error('Error submitting form:', error)
      alert('Error al guardar')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (item: any, type: 'cities' | 'parishes' | 'specialties') => {
    if (!confirm(`¿Está seguro de que desea eliminar "${item.name}"? Esta acción no se puede deshacer.`)) {
      return
    }

    try {
      const response = await fetch(`/api/admin/${type}/${item.id}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (response.ok) {
        fetchData()
        alert(data.message)
      } else {
        alert(data.error || 'Error al eliminar')
      }
    } catch (error) {
      console.error('Error deleting item:', error)
      alert('Error al eliminar')
    }
  }

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
          <h2 className="text-2xl font-bold text-gray-900">Gestión de Catálogos</h2>
          <p className="text-gray-600">Administrar ciudades, parroquias y especialidades</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="flex space-x-1 p-1">
          <button
            onClick={() => setActiveTab('cities')}
            className={`flex-1 flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'cities'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
            }`}
          >
            <MapPinIcon className="h-4 w-4 mr-2" />
            Ciudades ({cities.length})
          </button>
          <button
            onClick={() => setActiveTab('parishes')}
            className={`flex-1 flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'parishes'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
            }`}
          >
            <BuildingOfficeIcon className="h-4 w-4 mr-2" />
            Parroquias ({parishes.length})
          </button>
          <button
            onClick={() => setActiveTab('specialties')}
            className={`flex-1 flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'specialties'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
            }`}
          >
            <AcademicCapIcon className="h-4 w-4 mr-2" />
            Especialidades ({specialties.length})
          </button>
        </div>
      </div>

      {/* Add Button */}
      <div className="flex justify-end">
        <button
          onClick={() => handleAdd(activeTab)}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Agregar {
            activeTab === 'cities' ? 'Ciudad' :
            activeTab === 'parishes' ? 'Parroquia' : 'Especialidad'
          }
        </button>
      </div>

      {/* Content */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        {activeTab === 'cities' && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ciudad
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Parroquias
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {cities.map((city) => (
                  <tr key={city.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {city.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {city.state}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {city.parishes.length} parroquias
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(city, 'cities')}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(city, 'cities')}
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
        )}

        {activeTab === 'parishes' && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Parroquia
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ciudad
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contacto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sacerdotes
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {parishes.map((parish) => (
                  <tr key={parish.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{parish.name}</div>
                        {parish.address && (
                          <div className="text-sm text-gray-500">{parish.address}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {parish.city.name}, {parish.city.state}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {parish.phone && <div>📞 {parish.phone}</div>}
                      {parish.email && <div>✉️ {parish.email}</div>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {parish.priests.length} sacerdotes
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(parish, 'parishes')}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(parish, 'parishes')}
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
        )}

        {activeTab === 'specialties' && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Especialidad
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Descripción
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sacerdotes
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {specialties.map((specialty) => (
                  <tr key={specialty.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {specialty.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {specialty.description || 'Sin descripción'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {specialty.priests.length} sacerdotes
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(specialty, 'specialties')}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(specialty, 'specialties')}
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
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900">
                {modalType === 'add' ? 'Agregar' : 'Editar'} {
                  activeTab === 'cities' ? 'Ciudad' :
                  activeTab === 'parishes' ? 'Parroquia' : 'Especialidad'
                }
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {activeTab === 'cities' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre de la Ciudad *
                    </label>
                    <input
                      type="text"
                      value={cityForm.name}
                      onChange={(e) => setCityForm({...cityForm, name: e.target.value})}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Estado *
                    </label>
                    <input
                      type="text"
                      value={cityForm.state}
                      onChange={(e) => setCityForm({...cityForm, state: e.target.value})}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </>
              )}

              {activeTab === 'parishes' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre de la Parroquia *
                    </label>
                    <input
                      type="text"
                      value={parishForm.name}
                      onChange={(e) => setParishForm({...parishForm, name: e.target.value})}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ciudad *
                    </label>
                    <select
                      value={parishForm.cityId}
                      onChange={(e) => setParishForm({...parishForm, cityId: e.target.value})}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Seleccionar ciudad</option>
                      {cities.map(city => (
                        <option key={city.id} value={city.id}>
                          {city.name}, {city.state}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Dirección
                    </label>
                    <input
                      type="text"
                      value={parishForm.address}
                      onChange={(e) => setParishForm({...parishForm, address: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Teléfono
                    </label>
                    <input
                      type="tel"
                      value={parishForm.phone}
                      onChange={(e) => setParishForm({...parishForm, phone: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={parishForm.email}
                      onChange={(e) => setParishForm({...parishForm, email: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </>
              )}

              {activeTab === 'specialties' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre de la Especialidad *
                    </label>
                    <input
                      type="text"
                      value={specialtyForm.name}
                      onChange={(e) => setSpecialtyForm({...specialtyForm, name: e.target.value})}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Descripción
                    </label>
                    <textarea
                      value={specialtyForm.description}
                      onChange={(e) => setSpecialtyForm({...specialtyForm, description: e.target.value})}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </>
              )}

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
                  {submitting ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
} 