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
      <section className="hero-section text-white py-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="mb-8">
            <Image 
              src="/logodiosesis.png" 
              alt="Diócesis de San Juan de los Lagos"
              width={200}
              height={200}
              quality={100}
              priority={true}
              className="mx-auto mb-6 h-52 w-52 object-contain logo-crisp"
              style={{ imageRendering: 'crisp-edges' }}
            />
          </div>
          
          <h1 className="text-4xl font-bold text-blue-900 mb-6">
            Directorio Sacerdotal
          </h1>
          
          <p className="text-lg text-gray-700 mb-8 max-w-2xl mx-auto leading-relaxed">
            Bienvenido al directorio oficial de sacerdotes de la Diócesis de San Juan de los Lagos, 
            Jalisco. Conéctate con nuestros pastores y encuentre información de contacto 
            actualizada.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/signin"
              className="px-8 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition font-medium text-center"
            >
              Acceder al Directorio
            </Link>
            <Link
              href="/auth/register"
              className="px-8 py-3 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50 transition font-medium text-center"
            >
              Registro para Sacerdotes
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Servicios del Directorio
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Descubre todas las funcionalidades que nuestro directorio ofrece para 
              mantenerte conectado con la comunidad sacerdotal.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="service-card text-center p-8 rounded-lg">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 text-blue-600 rounded-full mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
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
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Sobre la Diócesis de San Juan de los Lagos
              </h2>
              <p className="text-gray-600 mb-6 leading-relaxed">
                La Diócesis de San Juan de los Lagos, establecida en Jalisco, es el hogar 
                espiritual de miles de fieles católicos. Nuestros sacerdotes trabajan 
                incansablemente para servir a la comunidad en diversas parroquias de la región.
              </p>
              <p className="text-gray-600 mb-8 leading-relaxed">
                Este directorio digital facilita la comunicación entre fieles y pastores, 
                proporcionando acceso directo a información de contacto y especialidades 
                ministeriales de nuestro clero.
              </p>
              <div className="space-y-4">
                <Link
                  href="https://diocesisdesanjuan.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block text-blue-600 hover:text-blue-800 font-medium"
                >
                  🌐 Visita nuestro sitio web oficial →
                </Link>
                <br />
                <Link
                  href="https://diocesisdesanjuan.org/?p=202"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block text-blue-600 hover:text-blue-800 font-medium"
                >
                  ℹ️ Conoce más sobre nosotros →
                </Link>
              </div>
            </div>
            <div className="text-center">
              <Image 
                src="/logodiosesis.png" 
                alt="Diócesis de San Juan de los Lagos"
                width={350}
                height={350}
                quality={100}
                className="mx-auto h-80 w-80 object-contain logo-crisp"
                style={{ imageRendering: 'crisp-edges' }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            ¿Eres sacerdote de nuestra diócesis?
          </h2>
          <p className="text-xl text-blue-100 mb-8 leading-relaxed">
            Regístrate en nuestro directorio para que los fieles puedan encontrarte 
            fácilmente y conocer más sobre tu ministerio pastoral.
          </p>
          <Link
            href="/auth/register"
            className="inline-flex items-center px-8 py-4 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-50 transition-colors text-lg"
          >
            Registrarse como Sacerdote
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-blue-950 text-white py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <Image 
                  src="/logodiosesis.png" 
                  alt="Diócesis de San Juan de los Lagos"
                  width={64}
                  height={64}
                  quality={100}
                  className="h-16 w-16 object-contain"
                  style={{ imageRendering: 'crisp-edges' }}
                />
                <h3 className="text-lg font-semibold">Diócesis de San Juan de los Lagos</h3>
              </div>
              <p className="text-blue-200 text-sm mb-4">
                Directorio oficial de sacerdotes de la Diócesis de San Juan de 
                los Lagos, Jalisco.
              </p>
              <div className="space-y-2">
                <Link
                  href="https://diocesisdesanjuan.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-200 hover:text-white text-sm block"
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
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Contacto</h4>
              <div className="space-y-2 text-blue-200 text-sm">
                <p>📞 395 785 0570</p>
                <p>📧 comunicacion@diocesisdesanjuan.org</p>
                <p>📍 San Juan de los Lagos, Jalisco</p>
              </div>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Enlaces Rápidos</h4>
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
          
          <div className="border-t border-blue-800 mt-8 pt-8 text-center">
            <p className="text-blue-200 text-sm">
              © {currentYear} Diócesis de San Juan de los Lagos. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </footer>
    </main>
  )
} 