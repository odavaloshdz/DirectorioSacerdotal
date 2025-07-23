import Image from 'next/image'
import Link from 'next/link'
import { UserGroupIcon, MapPinIcon, ClockIcon } from '@heroicons/react/24/outline'

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

  const samplePriests = [
    {
      name: "P. Juan Carlos Martínez",
      parish: "Parroquia San José",
      diocese: "Diócesis de San Juan de los Lagos",
      specialties: ["Dirección Espiritual", "Liturgia"]
    },
    {
      name: "P. Miguel Ángel Rodríguez",
      parish: "Catedral Metropolitana",
      diocese: "Arquidiócesis de Guadalajara",
      specialties: ["Catequesis", "Juventud"]
    },
    {
      name: "P. Francisco Javier López",
      parish: "Parroquia del Sagrado Corazón",
      diocese: "Diócesis de Puebla",
      specialties: ["Matrimonios", "Familia"]
    }
  ]

  return (
    <main>
      {/* Hero Section */}
      <section className="hero-section text-white py-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="mb-8">
            <Image 
              src="/san juan.png" 
              alt="Diócesis de San Juan de los Lagos"
              width={120}
              height={120}
              className="mx-auto mb-6"
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
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
            Servicios del Directorio
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white p-8 rounded-lg shadow-sm border border-blue-100 text-center service-card">
                <div className="flex justify-center mb-6">
                  <div className="p-3 bg-blue-100 rounded-full">
                    {feature.icon}
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-4 text-gray-900">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sobre la Diócesis */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-8 text-blue-900">
            Sobre la Diócesis de San Juan de los Lagos
          </h2>
          
          <div className="bg-gray-50 p-8 rounded-lg">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-blue-100 rounded-full">
                <svg className="h-8 w-8 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            
            <p className="text-lg text-gray-700 mb-6 leading-relaxed">
              La Diócesis de San Juan de los Lagos es una comunidad de fe que sirve a los fieles católicos en la región 
              de Jalisco. Nuestros sacerdotes dedican su vida al servicio pastoral, brindando orientación espiritual y 
              acompañamiento a las comunidades locales.
            </p>
            
            <p className="text-gray-600 leading-relaxed mb-6">
              Este directorio facilita la comunicación entre los fieles y sus pastores, fortaleciendo los lazos de nuestra comunidad 
              diocesana.
            </p>

            <div className="mt-6">
              <Link
                href="https://diocesisdesanjuan.org/?p=202"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
              >
                <span>Conoce más sobre nosotros</span>
                <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Registro Sacerdotes */}
      <section className="py-16 bg-blue-900 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">
            ¿Es usted un sacerdote de la diócesis?
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Regístrese para acceder al directorio completo y mantener actualizada su información de contacto.
          </p>
          <Link
            href="/auth/register"
            className="inline-block px-8 py-3 bg-white text-blue-900 rounded-md hover:bg-gray-100 transition font-medium"
          >
            Registrarse Ahora
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
                  src="/san juan.png" 
                  alt="Diócesis de San Juan de los Lagos"
                  width={40}
                  height={40}
                  className="h-10 w-auto"
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
              <h3 className="text-lg font-semibold mb-4">Contacto</h3>
              <div className="space-y-2 text-blue-200 text-sm">
                <p>🏢 Palacio Episcopal, San Juan de los Lagos, Jalisco</p>
                <p>📞 <a href="tel:+523957850570" className="hover:text-white">395 785 0570</a></p>
                <p>✉️ <a href="mailto:comunicacion@diocesisdesanjuan.org" className="hover:text-white">comunicacion@diocesisdesanjuan.org</a></p>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Horarios de Atención</h3>
              <div className="space-y-2 text-blue-200 text-sm">
                <p><strong>Lunes a Viernes:</strong> 9:00 AM - 6:00 PM</p>
                <p><strong>Sábados:</strong> 9:00 AM - 2:00 PM</p>
                <p><strong>Domingos:</strong> Cerrado</p>
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