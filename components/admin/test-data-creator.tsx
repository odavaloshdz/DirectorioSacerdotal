'use client'

import { useState } from 'react'

export function TestDataCreator() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const createTestData = async () => {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch('/api/admin/create-test-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const data = await response.json()

      if (response.ok) {
        setResult(data)
      } else {
        setError(data.error || 'Error al crear datos de prueba')
      }
    } catch (error) {
      setError('Error de conexión')
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Crear Datos de Prueba
      </h3>
      
      <p className="text-gray-600 mb-6">
        Este botón creará 10 sacerdotes de prueba con credenciales conocidas para testing.
      </p>

      <button
        onClick={createTestData}
        disabled={loading}
        className="mb-4 px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Creando...' : 'Crear 10 Sacerdotes de Prueba'}
      </button>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
          <p className="text-red-700 font-medium">Error:</p>
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {result && (
        <div className="bg-green-50 border border-green-200 rounded-md p-4">
          <p className="text-green-700 font-medium mb-2">
            ✅ {result.message}
          </p>
          <p className="text-green-600 mb-3">
            {result.createdCount} sacerdotes procesados
          </p>
          
          {result.credentials && (
            <div className="bg-white p-4 rounded border">
              <h4 className="font-medium text-gray-900 mb-2">
                Credenciales de Acceso:
              </h4>
              
              <div className="mb-3">
                <p className="text-sm font-medium text-gray-700">Administrador:</p>
                <p className="text-sm text-gray-600">
                  Email: {result.credentials.admin.email}
                </p>
                <p className="text-sm text-gray-600">
                  Password: {result.credentials.admin.password}
                </p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">
                  Sacerdotes (todos usan la misma contraseña):
                </p>
                <p className="text-sm text-gray-600 mb-2">
                  Password: {result.credentials.priests.password}
                </p>
                <div className="max-h-32 overflow-y-auto">
                  {result.credentials.priests.emails.map((email: string, index: number) => (
                    <p key={index} className="text-xs text-gray-500">
                      {index + 1}. {email}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          )}

          {result.results && (
            <details className="mt-4">
              <summary className="cursor-pointer text-sm font-medium text-gray-700">
                Ver detalles del proceso
              </summary>
              <div className="mt-2 max-h-40 overflow-y-auto bg-gray-50 p-2 rounded text-xs">
                {result.results.map((line: string, index: number) => (
                  <p key={index} className="text-gray-600">{line}</p>
                ))}
              </div>
            </details>
          )}
        </div>
      )}
    </div>
  )
} 