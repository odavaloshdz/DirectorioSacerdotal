import Image from 'next/image'
import { UserGroupIcon, MapPinIcon, ClockIcon } from '@heroicons/react/24/outline'

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
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
            <button className="px-8 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition font-medium">
              Acceder al Directorio
            </button>
            <button className="px-8 py-3 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50 transition font-medium">
              Registro para Sacerdotes
            </button>
          </div>
        </div>
      </section>

      {/* Servicios del Directorio */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
            Servicios del Directorio
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-lg shadow-sm border border-blue-100 text-center">
              <div className="flex justify-center mb-6">
                <div className="p-3 bg-blue-100 rounded-full">
                  <UserGroupIcon className="h-8 w-8 text-blue-600" />
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-4 text-gray-900">Directorio Completo</h3>
              <p className="text-gray-600 leading-relaxed">
                Acceda a la información completa de todos los sacerdotes de la diócesis, 
                incluyendo parroquias asignadas y datos de contacto.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-lg shadow-sm border border-blue-100 text-center">
              <div className="flex justify-center mb-6">
                <div className="p-3 bg-blue-100 rounded-full">
                  <MapPinIcon className="h-8 w-8 text-blue-600" />
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-4 text-gray-900">Búsqueda por Localidad</h3>
              <p className="text-gray-600 leading-relaxed">
                Encuentra fácilmente sacerdotes por ubicación geográfica y parroquia 
                para facilitar el contacto local.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-lg shadow-sm border border-blue-100 text-center">
              <div className="flex justify-center mb-6">
                <div className="p-3 bg-blue-100 rounded-full">
                  <ClockIcon className="h-8 w-8 text-blue-600" />
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-4 text-gray-900">Información Actualizada</h3>
              <p className="text-gray-600 leading-relaxed">
                Mantenemos la información actualizada constantemente para 
                asegurar datos precisos y confiables.
              </p>
            </div>
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
            
            <p className="text-gray-600 leading-relaxed">
              Este directorio facilita la comunicación entre los fieles y sus pastores, fortaleciendo los lazos de nuestra comunidad 
              diocesana.
            </p>
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
          <button className="px-8 py-3 bg-white text-blue-900 rounded-md hover:bg-gray-100 transition font-medium">
            Registrarse Ahora
          </button>
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
              <p className="text-blue-200 text-sm">
                Directorio oficial de sacerdotes de la Diócesis de San Juan de 
                los Lagos, Jalisco.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Contacto</h3>
              <div className="space-y-2 text-blue-200 text-sm">
                <p>Palacio Episcopal, San Juan de los Lagos, Jalisco</p>
                <p>📞 +52 (395) 785-0100</p>
                <p>✉️ contacto@diocesis-sjl.org</p>
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
              © 2024 Diócesis de San Juan de los Lagos. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </footer>
    </main>
  )
} 