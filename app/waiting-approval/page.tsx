'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Image from 'next/image'
import { ClockIcon } from '@heroicons/react/24/outline'

export default function WaitingApproval() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/auth/signin')
      return
    }

    const userRole = (session.user as any)?.role
    const priestStatus = (session.user as any)?.priest?.status

    // If user is admin or approved priest, redirect to directory
    if (userRole === 'ADMIN' || (userRole === 'PRIEST' && priestStatus === 'APPROVED')) {
      router.push('/directorio')
      return
    }
  }, [session, status, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <Image 
            src="/logodiosesis.png" 
            alt="Diócesis de San Juan de los Lagos"
            width={100}
            height={100}
            quality={100}
            priority={true}
            className="h-24 w-24 object-contain"
            style={{ imageRendering: 'crisp-edges' }}
          />
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
          Cuenta Pendiente de Aprobación
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Diócesis de San Juan de los Lagos
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-yellow-100 rounded-full">
                <ClockIcon className="h-8 w-8 text-yellow-600" />
              </div>
            </div>

            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Registro Exitoso
            </h3>
            
            <p className="text-gray-600 mb-6 leading-relaxed">
              Su registro como sacerdote ha sido recibido correctamente. 
              Su cuenta está pendiente de aprobación por parte del administrador diocesano.
            </p>

            <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
              <p className="text-blue-800 text-sm">
                <strong>Información de su cuenta:</strong><br />
                Nombre: {session.user?.name}<br />
                Email: {session.user?.email}<br />
                Estado: Pendiente de aprobación
              </p>
            </div>

            <p className="text-sm text-gray-500 mb-6">
              Recibirá una notificación por correo electrónico una vez que su cuenta sea aprobada. 
              Mientras tanto, puede contactar al administrador diocesano si tiene alguna pregunta.
            </p>

            <div className="space-y-3">
              <button
                onClick={() => router.push('/api/auth/signout')}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cerrar Sesión
              </button>
              
              <button
                onClick={() => router.push('/')}
                className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Volver al Inicio
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 