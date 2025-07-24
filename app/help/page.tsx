import Image from 'next/image'
import Link from 'next/link'
import { 
  UserGroupIcon, 
  ShieldCheckIcon, 
  ClockIcon, 
  BookOpenIcon,
  CogIcon
} from '@heroicons/react/24/outline'

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
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
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4 px-4">
            Ayuda - Directorio Sacerdotal
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-gray-600 px-4">
            Guía completa para usar el sistema de la Diócesis de San Juan de los Lagos
          </p>
        </div>

        {/* Quick Access */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12">
          <Link
            href="/auth/signin"
            className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition text-center"
          >
            <UserGroupIcon className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 mx-auto mb-2 sm:mb-3" />
            <h3 className="font-semibold text-gray-900 mb-1 sm:mb-2 text-sm sm:text-base">Iniciar Sesión</h3>
            <p className="text-xs sm:text-sm text-gray-600">Acceder al directorio</p>
          </Link>

          <Link
            href="/auth/register"
            className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition text-center"
          >
            <ShieldCheckIcon className="h-6 w-6 sm:h-8 sm:w-8 text-green-600 mx-auto mb-2 sm:mb-3" />
            <h3 className="font-semibold text-gray-900 mb-1 sm:mb-2 text-sm sm:text-base">Registrarse</h3>
            <p className="text-xs sm:text-sm text-gray-600">Nuevo sacerdote</p>
          </Link>

          <Link
            href="/admin"
            className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition text-center"
          >
            <CogIcon className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600 mx-auto mb-2 sm:mb-3" />
            <h3 className="font-semibold text-gray-900 mb-1 sm:mb-2 text-sm sm:text-base">Administración</h3>
            <p className="text-xs sm:text-sm text-gray-600">Panel de admin</p>
          </Link>
        </div>

        {/* How it Works */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8">
          <div className="flex items-center mb-4 sm:mb-6">
            <BookOpenIcon className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 mr-2 sm:mr-3" />
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">¿Cómo funciona el sistema?</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            <div className="text-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <span className="text-blue-600 font-bold text-sm sm:text-base">1</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">Registro</h3>
              <p className="text-xs sm:text-sm text-gray-600">
                Los sacerdotes se registran proporcionando su información personal, 
                parroquia y especialidades pastorales.
              </p>
            </div>

            <div className="text-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <span className="text-yellow-600 font-bold text-sm sm:text-base">2</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">Aprobación</h3>
              <p className="text-xs sm:text-sm text-gray-600">
                El administrador diocesano revisa y aprueba cada registro 
                para garantizar la autenticidad.
              </p>
            </div>

            <div className="text-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <span className="text-green-600 font-bold text-sm sm:text-base">3</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">Acceso</h3>
              <p className="text-xs sm:text-sm text-gray-600">
                Una vez aprobados, los sacerdotes pueden acceder al directorio 
                completo y contactar a otros colegas.
              </p>
            </div>
          </div>
        </div>

        {/* User Roles */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Tipos de Usuario</h2>
          
          <div className="space-y-4 sm:space-y-6">
            <div className="flex items-start space-x-3 sm:space-x-4">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <ShieldCheckIcon className="h-3 w-3 sm:h-5 sm:w-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-sm sm:text-base">Administrador</h3>
                <p className="text-gray-600 text-xs sm:text-sm mt-1">
                  <strong>Acceso total:</strong> Puede aprobar/rechazar registros, ver estadísticas y gestionar todos los usuarios.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3 sm:space-x-4">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <UserGroupIcon className="h-3 w-3 sm:h-5 sm:w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-sm sm:text-base">Sacerdote Aprobado</h3>
                <p className="text-gray-600 text-xs sm:text-sm mt-1">
                  <strong>Acceso al directorio:</strong> Puede ver la información de contacto de otros sacerdotes aprobados.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3 sm:space-x-4">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                <ClockIcon className="h-3 w-3 sm:h-5 sm:w-5 text-yellow-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-sm sm:text-base">Sacerdote Pendiente</h3>
                <p className="text-gray-600 text-xs sm:text-sm mt-1">
                  <strong>Esperando aprobación:</strong> Puede iniciar sesión pero no acceder al directorio hasta ser aprobado.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Características del Sistema</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2 sm:mb-3 text-sm sm:text-base">🔍 Búsqueda Avanzada</h3>
              <ul className="text-xs sm:text-sm text-gray-600 space-y-1">
                <li>• Buscar por nombre del sacerdote</li>
                <li>• Filtrar por parroquia</li>
                <li>• Buscar por especialidades pastorales</li>
                <li>• Búsqueda por email</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2 sm:mb-3 text-sm sm:text-base">👤 Perfiles Completos</h3>
              <ul className="text-xs sm:text-sm text-gray-600 space-y-1">
                <li>• Información de contacto</li>
                <li>• Parroquia asignada</li>
                <li>• Teléfono directo</li>
                <li>• Especialidades pastorales</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2 sm:mb-3 text-sm sm:text-base">🔒 Seguridad</h3>
              <ul className="text-xs sm:text-sm text-gray-600 space-y-1">
                <li>• Autenticación segura</li>
                <li>• Contraseñas encriptadas</li>
                <li>• Acceso controlado por roles</li>
                <li>• Verificación administrativa</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2 sm:mb-3 text-sm sm:text-base">📱 Interfaz Moderna</h3>
              <ul className="text-xs sm:text-sm text-gray-600 space-y-1">
                <li>• Diseño responsive</li>
                <li>• Navegación intuitiva</li>
                <li>• Búsqueda en tiempo real</li>
                <li>• Optimizado para móviles</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Contact */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 lg:p-8 text-center">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">¿Necesita Ayuda?</h2>
          <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 px-4">
            Si tiene problemas técnicos o preguntas sobre el sistema, contacte al administrador diocesano.
          </p>
          <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm text-gray-600 mb-4 sm:mb-6">
            <p>
              📧 <a href="mailto:comunicacion@diocesisdesanjuan.org" className="text-blue-600 hover:text-blue-700 break-all">
                comunicacion@diocesisdesanjuan.org
              </a>
            </p>
            <p>
              📞 <a href="tel:+523957850570" className="text-blue-600 hover:text-blue-700">
                395 785 0570
              </a>
            </p>
            <p>🏢 Palacio Episcopal, San Juan de los Lagos, Jalisco</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center">
            <a
              href="https://diocesisdesanjuan.org"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-4 sm:px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition text-xs sm:text-sm font-medium"
            >
              🌐 Sitio Web Oficial
            </a>
            <a
              href="https://diocesisdesanjuan.org/?p=202"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-4 sm:px-6 py-2 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50 transition text-xs sm:text-sm font-medium"
            >
              ℹ️ Conoce más sobre nosotros
            </a>
          </div>
        </div>

        {/* Back to Home */}
        <div className="mt-6 sm:mt-8 text-center">
          <Link
            href="/"
            className="text-sm text-blue-600 hover:text-blue-500 font-medium"
          >
            ← Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  )
} 