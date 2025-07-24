'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'

export function AuthHeader() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const handleSignOut = async () => {
    await signOut({ redirect: false })
    router.push('/')
  }

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-20">
          <Link href="/" className="flex items-center space-x-4">
            <Image 
              src="/logodiosesis.png" 
              alt="Diócesis de San Juan de los Lagos"
              width={56}
              height={56}
              quality={100}
              priority={true}
              className="h-14 w-14 object-contain logo-crisp"
              style={{ imageRendering: 'crisp-edges' }}
            />
            <div>
              <h1 className="text-xl font-bold text-blue-900">
                Diócesis de San Juan de los Lagos
              </h1>
              <p className="text-sm text-gray-600">Directorio Sacerdotal</p>
            </div>
          </Link>

          <div className="flex items-center space-x-3">
            {status === 'loading' ? (
              <div className="h-8 w-20 bg-gray-200 animate-pulse rounded"></div>
            ) : session ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">
                  Bienvenido, {session.user?.name}
                </span>
                
                {/* Show different options based on role */}
                {(session.user as any)?.role === 'ADMIN' && (
                  <Link
                    href="/admin"
                    className="px-3 py-2 text-sm text-blue-600 hover:text-blue-700"
                  >
                    Administrar
                  </Link>
                )}
                
                {((session.user as any)?.role === 'ADMIN' || 
                  ((session.user as any)?.role === 'PRIEST' && (session.user as any)?.priest?.status === 'APPROVED')) && (
                  <Link
                    href="/directorio"
                    className="px-3 py-2 text-sm text-blue-600 hover:text-blue-700"
                  >
                    Directorio
                  </Link>
                )}

                {(session.user as any)?.role === 'PRIEST' && (session.user as any)?.priest?.status === 'APPROVED' && (
                  <Link
                    href="/profile"
                    className="px-3 py-2 text-sm text-blue-600 hover:text-blue-700"
                  >
                    Mi Perfil
                  </Link>
                )}

                <Link
                  href="/help"
                  className="px-3 py-2 text-sm text-gray-600 hover:text-gray-700"
                >
                  Ayuda
                </Link>

                <button
                  onClick={handleSignOut}
                  className="px-4 py-2 text-sm text-red-600 hover:text-red-700 border border-red-600 rounded-md hover:bg-red-50 transition"
                >
                  Cerrar Sesión
                </button>
              </div>
            ) : (
              <>
                <Link
                  href="/help"
                  className="px-3 py-2 text-sm text-gray-600 hover:text-gray-700"
                >
                  Ayuda
                </Link>
                <Link
                  href="/auth/signin"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition text-sm"
                >
                  Iniciar Sesión
                </Link>
                <Link
                  href="/auth/register"
                  className="px-4 py-2 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50 transition text-sm"
                >
                  Registrarse
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
} 