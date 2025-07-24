import Image from 'next/image'
import Link from 'next/link'
import { UserGroupIcon, MapPinIcon, ClockIcon } from '@heroicons/react/24/outline'
import { PublicDirectory } from '@/components/public-directory'

export default function Home() {
  const currentYear = new Date().getFullYear()

  const features = [
    {
      icon: <UserGroupIcon className="h-8 w-8" />,
      title: "Directorio de Sacerdotes",
      description: "Busca y encuentra información de contacto de sacerdotes en tu región."
    },
    {
      icon: <MapPinIcon className="h-8 w-8" />,
      title: "Parroquias y Diócesis",
      description: "Explora las diferentes parroquias y diócesis en todo el territorio."
    },
    {
      icon: <ClockIcon className="h-8 w-8" />,
      title: "Información Actualizada",
      description: "Mantenemos la información actualizada constantemente para asegurar datos precisos y confiables."
    }
  ]

  return (
    <main>
      {/* Hero Section */}
      <section className="hero-section text-white py-12 sm:py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="mb-6 sm:mb-8">
            <Image 
              src="/logodiosesis.png" 
              alt="Diócesis de San Juan de los Lagos"
              width={200}
              height={200}
              quality={100}
              priority={true}
              className="mx-auto mb-4 sm:mb-6 h-32 w-32 sm:h-40 sm:w-40 lg:h-52 lg:w-52 object-contain logo-crisp"
              style={{ imageRendering: 'crisp-edges' }}
            />
          </div>
          
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-blue-900 mb-4 sm:mb-6 px-4">
            Directorio Sacerdotal
          </h1>
          
          <p className="text-base sm:text-lg text-gray-700 mb-6 sm:mb-8 max-w-2xl mx-auto leading-relaxed px-4">
            Bienvenido al directorio oficial de sacerdotes de la Diócesis de San Juan de los Lagos, 
            Jalisco. Conéctate con nuestros pastores y encuentre información de contacto 
            actualizada.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4">
            <Link
              href="/auth/signin"
              className="w-full sm:w-auto px-6 sm:px-8 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition font-medium text-center"
            >
              Acceder al Directorio
            </Link>
            <Link
              href="/auth/register"
              className="w-full sm:w-auto px-6 sm:px-8 py-3 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50 transition font-medium text-center"
            >
              Registro para Sacerdotes
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4 px-4">
              Servicios del Directorio
            </h2>
            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto px-4">
              Descubre todas las funcionalidades que nuestro directorio ofrece para 
              mantenerte conectado con la comunidad sacerdotal.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {features.map((feature, index) => (
              <div key={index} className="service-card text-center p-6 sm:p-8 rounded-lg mx-4 sm:mx-0">
                <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-blue-100 text-blue-600 rounded-full mb-4 sm:mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Public Directory Section */}
      <PublicDirectory />

      {/* About Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-center">
            <div className="order-2 lg:order-1">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 sm:mb-6">
                Sobre la Diócesis de San Juan de los Lagos
              </h2>
              <p className="text-gray-600 mb-4 sm:mb-6 leading-relaxed text-sm sm:text-base">
                La Diócesis de San Juan de los Lagos, establecida en Jalisco, es el hogar 
                espiritual de miles de fieles católicos. Nuestros sacerdotes trabajan 
                incansablemente para servir a la comunidad en diversas parroquias de la región.
              </p>
              <p className="text-gray-600 mb-6 sm:mb-8 leading-relaxed text-sm sm:text-base">
                Este directorio digital facilita la comunicación entre fieles y pastores, 
                proporcionando acceso directo a información de contacto y especialidades 
                ministeriales de nuestro clero.
              </p>
              <div className="space-y-3 sm:space-y-4">
                <Link
                  href="https://diocesisdesanjuan.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block text-blue-600 hover:text-blue-800 font-medium text-sm sm:text-base break-all"
                >
                  🌐 Visita nuestro sitio web oficial →
                </Link>
                <br />
                <Link
                  href="https://diocesisdesanjuan.org/?p=202"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block text-blue-600 hover:text-blue-800 font-medium text-sm sm:text-base"
                >
                  ℹ️ Conoce más sobre nosotros →
                </Link>
              </div>
            </div>
            <div className="text-center order-1 lg:order-2">
              <Image 
                src="/logodiosesis.png" 
                alt="Diócesis de San Juan de los Lagos"
                width={350}
                height={350}
                quality={100}
                className="mx-auto h-48 w-48 sm:h-64 sm:w-64 lg:h-80 lg:w-80 object-contain logo-crisp"
                style={{ imageRendering: 'crisp-edges' }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-blue-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4 sm:mb-6 px-4">
            ¿Eres sacerdote de nuestra diócesis?
          </h2>
          <p className="text-lg sm:text-xl text-blue-100 mb-6 sm:mb-8 leading-relaxed px-4">
            Regístrate en nuestro directorio para que los fieles puedan encontrarte 
            fácilmente y conocer más sobre tu ministerio pastoral.
          </p>
          <Link
            href="/auth/register"
            className="inline-flex items-center px-6 sm:px-8 py-3 sm:py-4 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-50 transition-colors text-base sm:text-lg"
          >
            Registrarse como Sacerdote
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-blue-950 text-white py-8 sm:py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            <div className="sm:col-span-2 lg:col-span-1">
              <div className="flex flex-col sm:flex-row lg:flex-col items-center sm:items-start lg:items-center space-y-3 sm:space-y-0 sm:space-x-3 lg:space-x-0 lg:space-y-3 mb-4">
                <Image 
                  src="/logodiosesis.png" 
                  alt="Diócesis de San Juan de los Lagos"
                  width={64}
                  height={64}
                  quality={100}
                  className="h-12 w-12 sm:h-16 sm:w-16 object-contain flex-shrink-0"
                  style={{ imageRendering: 'crisp-edges' }}
                />
                <h3 className="text-base sm:text-lg font-semibold text-center sm:text-left lg:text-center">
                  Diócesis de San Juan de los Lagos
                </h3>
              </div>
              <p className="text-blue-200 text-sm mb-4 text-center sm:text-left lg:text-center">
                Directorio oficial de sacerdotes de la Diócesis de San Juan de 
                los Lagos, Jalisco.
              </p>
              <div className="space-y-2 text-center sm:text-left lg:text-center">
                <Link
                  href="https://diocesisdesanjuan.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-200 hover:text-white text-sm block break-all"
                >
                  🌐 diocesisdesanjuan.org
                </Link>
                <Link
                  href="https://diocesisdesanjuan.org/?p=202"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-200 hover:text-white text-sm block"
                >
                  ℹ️ Conoce más sobre nosotros
                </Link>
              </div>
            </div>
            
            <div className="text-center sm:text-left">
              <h4 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Contacto</h4>
              <div className="space-y-2 text-blue-200 text-sm">
                <p className="break-all">📞 395 785 0570</p>
                <p className="break-all">📧 comunicacion@diocesisdesanjuan.org</p>
                <p>📍 San Juan de los Lagos, Jalisco</p>
              </div>
            </div>
            
            <div className="text-center sm:text-left lg:text-left">
              <h4 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Enlaces Rápidos</h4>
              <div className="space-y-2">
                <Link
                  href="/auth/signin"
                  className="text-blue-200 hover:text-white text-sm block"
                >
                  Iniciar Sesión
                </Link>
                <Link
                  href="/auth/register"
                  className="text-blue-200 hover:text-white text-sm block"
                >
                  Registro de Sacerdotes
                </Link>
                <Link
                  href="/help"
                  className="text-blue-200 hover:text-white text-sm block"
                >
                  Ayuda
                </Link>
              </div>
            </div>
          </div>
          
          <div className="border-t border-blue-800 mt-6 sm:mt-8 pt-6 sm:pt-8 text-center">
            <p className="text-blue-200 text-xs sm:text-sm">
              © {currentYear} Diócesis de San Juan de los Lagos. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </footer>
    </main>
  )
} 