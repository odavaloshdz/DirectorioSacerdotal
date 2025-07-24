'use client'

import { useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { ClockIcon, ExclamationTriangleIcon, EnvelopeIcon } from '@heroicons/react/24/outline'

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

    // If user is admin or approved priest, redirect
    if (userRole === 'ADMIN') {
      router.push('/admin')
    } else if (userRole === 'PRIEST' && priestStatus === 'APPROVED') {
      router.push('/directorio')
    }
    // Otherwise, stay on this page (pending/rejected priests)
  }, [session, status, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 text-sm sm:text-base">Verificando estado...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  const priestStatus = (session.user as any)?.priest?.status

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md lg:max-w-lg">
        <div className="text-center mb-6 sm:mb-8">
          <div className="flex justify-center mb-4 sm:mb-6">
            <Image 
              src="/logodiosesis.png" 
              alt="Diócesis de San Juan de los Lagos"
              width={140}
              height={140}
              quality={100}
              priority={true}
              className="h-20 w-20 sm:h-28 sm:w-28 lg:h-36 lg:w-36 object-contain"
              style={{ imageRendering: 'crisp-edges' }}
            />
          </div>
          
          {priestStatus === 'REJECTED' ? (
            <>
              <div className="mb-4 sm:mb-6">
                <ExclamationTriangleIcon className="h-12 w-12 sm:h-16 sm:w-16 text-red-500 mx-auto mb-3 sm:mb-4" />
              </div>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-3 sm:mb-4 px-4">
                Registro Rechazado
              </h2>
              <p className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-8 px-4">
                Su solicitud de registro ha sido rechazada por el administrador diocesano.
              </p>
            </>
          ) : (
            <>
              <div className="mb-4 sm:mb-6">
                <ClockIcon className="h-12 w-12 sm:h-16 sm:w-16 text-yellow-500 mx-auto mb-3 sm:mb-4" />
              </div>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-3 sm:mb-4 px-4">
                Cuenta Pendiente de Aprobación
              </h2>
              <p className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-8 px-4">
                Su registro está siendo revisado por el administrador diocesano. 
                Recibirá una notificación cuando sea aprobado.
              </p>
            </>
          )}
        </div>

        <div className="bg-white py-6 px-4 sm:py-8 sm:px-10 shadow rounded-lg">
          <div className="text-center">
            <div className="mb-4 sm:mb-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
                {session.user?.name}
              </h3>
              <p className="text-xs sm:text-sm text-gray-500">
                {session.user?.email}
              </p>
            </div>

            <div className="bg-gray-50 p-3 sm:p-4 rounded-lg mb-6">
              <div className="flex items-center justify-center mb-2">
                <div className={`w-3 h-3 rounded-full mr-2 ${
                  priestStatus === 'REJECTED' ? 'bg-red-500' : 'bg-yellow-500'
                }`}></div>
                <span className={`text-xs sm:text-sm font-medium ${
                  priestStatus === 'REJECTED' ? 'text-red-700' : 'text-yellow-700'
                }`}>
                  {priestStatus === 'REJECTED' ? 'Rechazado' : 'Pendiente de Aprobación'}
                </span>
              </div>
              <p className="text-xs text-gray-600">
                Estado actual de su cuenta
              </p>
            </div>

            {priestStatus === 'REJECTED' ? (
              <div className="space-y-4">
                <p className="text-sm text-gray-600 px-4">
                  Si considera que esto es un error, puede contactar al administrador 
                  diocesano para más información.
                </p>
                <div className="flex items-center justify-center text-sm text-blue-600">
                  <EnvelopeIcon className="h-4 w-4 mr-2" />
                  <a href="mailto:comunicacion@diocesisdesanjuan.org" className="hover:text-blue-700">
                    comunicacion@diocesisdesanjuan.org
                  </a>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-gray-600 px-4">
                  Mientras tanto, puede contactar al administrador diocesano 
                  si tiene alguna pregunta sobre su registro.
                </p>
                <div className="flex items-center justify-center text-sm text-blue-600">
                  <EnvelopeIcon className="h-4 w-4 mr-2" />
                  <a href="mailto:comunicacion@diocesisdesanjuan.org" className="hover:text-blue-700">
                    comunicacion@diocesisdesanjuan.org
                  </a>
                </div>
              </div>
            )}

            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <button
                  onClick={async () => {
                    await fetch('/api/auth/signout', { method: 'POST' })
                    router.push('/')
                  }}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors text-sm font-medium"
                >
                  Cerrar Sesión
                </button>
                <Link
                  href="/"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium text-center"
                >
                  Volver al Inicio
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 sm:mt-8 text-center">
          <p className="text-xs sm:text-sm text-gray-500">
            © {new Date().getFullYear()} Diócesis de San Juan de los Lagos
          </p>
        </div>
      </div>
    </div>
  )
} 