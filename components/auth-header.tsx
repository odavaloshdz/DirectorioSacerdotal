'use client'

import { useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Bars3Icon, XMarkIcon, UserIcon, Cog6ToothIcon, BookOpenIcon, QuestionMarkCircleIcon } from '@heroicons/react/24/outline'

export function AuthHeader() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleSignOut = async () => {
    await signOut({ redirect: false })
    router.push('/')
    setMobileMenuOpen(false)
  }

  const navigation = session ? [
    ...(((session.user as any)?.role === 'ADMIN') ? [{
      name: 'Panel Admin',
      href: '/admin',
      icon: Cog6ToothIcon,
      color: 'text-purple-600 hover:text-purple-700'
    }] : []),
    ...(((session.user as any)?.role === 'ADMIN' || 
         ((session.user as any)?.role === 'PRIEST' && (session.user as any)?.priest?.status === 'APPROVED')) ? [{
      name: 'Directorio',
      href: '/directorio',
      icon: BookOpenIcon,
      color: 'text-blue-600 hover:text-blue-700'
    }] : []),
    ...((session.user as any)?.role === 'PRIEST' && (session.user as any)?.priest?.status === 'APPROVED' ? [{
      name: 'Mi Perfil',
      href: '/profile',
      icon: UserIcon,
      color: 'text-green-600 hover:text-green-700'
    }] : []),
    {
      name: 'Ayuda',
      href: '/help',
      icon: QuestionMarkCircleIcon,
      color: 'text-gray-600 hover:text-gray-700'
    }
  ] : [
    {
      name: 'Ayuda',
      href: '/help',
      icon: QuestionMarkCircleIcon,
      color: 'text-gray-600 hover:text-gray-700'
    }
  ]

  return (
    <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 sm:h-20 lg:h-24">
          {/* Logo and title */}
          <Link href="/" className="flex items-center space-x-2 sm:space-x-3 lg:space-x-4 flex-shrink-0">
            <Image 
              src="/logodiosesis.png" 
              alt="Diócesis de San Juan de los Lagos"
              width={80}
              height={80}
              quality={100}
              priority={true}
              className="h-12 w-12 sm:h-16 sm:w-16 lg:h-20 lg:w-20 object-contain logo-crisp"
              style={{ imageRendering: 'crisp-edges' }}
            />
            <div className="hidden sm:block">
              <h1 className="text-sm sm:text-base lg:text-xl font-bold text-blue-900 leading-tight">
                Diócesis de San Juan de los Lagos
              </h1>
              <p className="text-xs sm:text-sm text-gray-600">Directorio Sacerdotal</p>
            </div>
            <div className="sm:hidden">
              <h1 className="text-sm font-bold text-blue-900">
                Diócesis SJL
              </h1>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            {status === 'loading' ? (
              <div className="h-8 w-20 bg-gray-200 animate-pulse rounded"></div>
            ) : session ? (
              <>
                {/* Welcome message */}
                <span className="text-sm text-gray-600 mr-4 max-w-32 truncate">
                  Hola, {session.user?.name?.split(' ')[0] || 'Usuario'}
                </span>
                
                {/* Navigation links */}
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${item.color}`}
                  >
                    {item.name}
                  </Link>
                ))}

                {/* Sign out button */}
                <button
                  onClick={handleSignOut}
                  className="ml-4 px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 border border-red-600 rounded-md hover:bg-red-50 transition-colors"
                >
                  Cerrar Sesión
                </button>
              </>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  href="/help"
                  className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-700 rounded-md transition-colors"
                >
                  Ayuda
                </Link>
                <Link
                  href="/auth/signin"
                  className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
                >
                  Iniciar Sesión
                </Link>
                <Link
                  href="/auth/register"
                  className="px-4 py-2 border border-blue-600 text-blue-600 text-sm font-medium rounded-md hover:bg-blue-50 transition-colors"
                >
                  Registrarse
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden">
            <button
              type="button"
              className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <span className="sr-only">Abrir menú</span>
              {mobileMenuOpen ? (
                <XMarkIcon className="h-6 w-6" />
              ) : (
                <Bars3Icon className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-200 bg-white">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {status === 'loading' ? (
                <div className="px-3 py-2">
                  <div className="h-4 w-32 bg-gray-200 animate-pulse rounded"></div>
                </div>
              ) : session ? (
                <>
                  {/* User info */}
                  <div className="px-3 py-2 border-b border-gray-100 mb-2">
                    <p className="text-sm font-medium text-gray-900">
                      Bienvenido, {session.user?.name || 'Usuario'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {(session.user as any)?.role === 'ADMIN' ? 'Administrador' : 
                       (session.user as any)?.role === 'PRIEST' ? 'Sacerdote' : 'Usuario'}
                    </p>
                  </div>

                  {/* Navigation items */}
                  {navigation.map((item) => {
                    const IconComponent = item.icon
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        className="flex items-center px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <IconComponent className="h-5 w-5 mr-3 text-gray-400" />
                        {item.name}
                      </Link>
                    )
                  })}

                  {/* Sign out button */}
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center px-3 py-2 text-base font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                  >
                    <svg className="h-5 w-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Cerrar Sesión
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/help"
                    className="flex items-center px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <QuestionMarkCircleIcon className="h-5 w-5 mr-3 text-gray-400" />
                    Ayuda
                  </Link>
                  <Link
                    href="/auth/signin"
                    className="flex items-center px-3 py-2 text-base font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <svg className="h-5 w-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                    Iniciar Sesión
                  </Link>
                  <Link
                    href="/auth/register"
                    className="flex items-center px-3 py-2 text-base font-medium text-green-600 hover:text-green-700 hover:bg-green-50 rounded-md transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <svg className="h-5 w-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                    Registrarse
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
} 