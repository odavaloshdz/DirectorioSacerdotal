'use client'

import { useState } from 'react'

export function TestDataCreator() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const handleCreateTestData = async () => {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch('/api/admin/create-test-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()

      if (response.ok) {
        setResult(data)
      } else {
        setError(data.error || 'Error al crear datos de prueba')
      }
    } catch (error) {
      console.error('Error:', error)
      setError('Error al crear datos de prueba')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow border border-gray-200 p-4 sm:p-6">
      <div className="mb-4 sm:mb-6">
        <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">
          Crear Datos de Prueba
        </h3>
        <p className="text-xs sm:text-sm text-gray-500">
          Genera ciudades, parroquias, especialidades y sacerdotes de prueba para el sistema.
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {result && (
        <div className="mb-4 space-y-3">
          <div className="p-3 bg-green-50 border border-green-200 rounded-md">
            <h4 className="text-sm font-medium text-green-800 mb-2">
              ¡Datos creados exitosamente!
            </h4>
            <div className="space-y-2 text-xs sm:text-sm text-green-700">
              <p>• Ciudades: {result.stats?.cities || 0}</p>
              <p>• Parroquias: {result.stats?.parishes || 0}</p>
              <p>• Especialidades: {result.stats?.specialties || 0}</p>
              <p>• Sacerdotes: {result.stats?.priests || 0}</p>
            </div>
          </div>

          {result.credentials && result.credentials.length > 0 && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
              <h4 className="text-sm font-medium text-blue-800 mb-2">
                Credenciales generadas:
              </h4>
              <div className="space-y-2 max-h-32 sm:max-h-40 overflow-y-auto">
                {result.credentials.map((cred: any, index: number) => (
                  <div key={index} className="text-xs bg-white p-2 rounded border">
                    <p className="font-medium text-gray-900 break-all">{cred.email}</p>
                    <p className="text-gray-600">Contraseña: {cred.password}</p>
                    <p className="text-gray-500">Rol: {cred.role}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {result.results && result.results.length > 0 && (
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-md">
              <h4 className="text-sm font-medium text-gray-800 mb-2">
                Detalles del proceso:
              </h4>
              <div className="max-h-24 sm:max-h-32 overflow-y-auto">
                {result.results.map((res: string, index: number) => (
                  <p key={index} className="text-xs text-gray-600 mb-1">
                    {res}
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <button
        onClick={handleCreateTestData}
        disabled={loading}
        className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            <span className="text-sm">Creando...</span>
          </>
        ) : (
          <span className="text-sm">Crear Datos de Prueba</span>
        )}
      </button>

      <div className="mt-3 pt-3 border-t border-gray-100">
        <p className="text-xs text-gray-500 text-center">
          <strong>Nota:</strong> Esta acción creará datos de ejemplo únicamente.
          No afecta los datos reales existentes.
        </p>
      </div>
    </div>
  )
} 