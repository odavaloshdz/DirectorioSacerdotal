import { MagnifyingGlassIcon, UserGroupIcon, MapPinIcon } from '@heroicons/react/24/outline'

export default function Home() {
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
      icon: <MagnifyingGlassIcon className="h-8 w-8" />,
      title: "Búsqueda Avanzada",
      description: "Encuentra sacerdotes por nombre, parroquia, especialidad o ubicación."
    }
  ]

  const samplePriests = [
    {
      name: "P. Juan Carlos Martínez",
      parish: "Parroquia San José",
      diocese: "Diócesis de México",
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
      <section className="hero-gradient text-white py-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6">
            Directorio Sacerdotal
          </h1>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Conecta con la comunidad sacerdotal. Encuentra información de contacto, 
            especialidades y ubicación de sacerdotes católicos.
          </p>
          <div className="max-w-md mx-auto">
            <div className="flex">
              <input 
                type="text" 
                placeholder="Buscar sacerdote, parroquia o ciudad..."
                className="flex-1 px-4 py-3 text-gray-900 rounded-l-lg focus:outline-none"
              />
              <button className="px-6 py-3 bg-secondary-500 text-white rounded-r-lg hover:bg-secondary-600 transition">
                <MagnifyingGlassIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
            Funcionalidades
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white p-6 rounded-lg card-shadow text-center">
                <div className="text-primary-500 mb-4 flex justify-center">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sample Directory */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
            Directorio de Sacerdotes
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {samplePriests.map((priest, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition">
                <h3 className="text-xl font-semibold mb-2 text-gray-900">{priest.name}</h3>
                <p className="text-gray-600 mb-1"><strong>Parroquia:</strong> {priest.parish}</p>
                <p className="text-gray-600 mb-3"><strong>Diócesis:</strong> {priest.diocese}</p>
                <div className="mb-4">
                  <p className="text-sm text-gray-500 mb-2"><strong>Especialidades:</strong></p>
                  <div className="flex flex-wrap gap-2">
                    {priest.specialties.map((specialty, i) => (
                      <span key={i} className="px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-sm">
                        {specialty}
                      </span>
                    ))}
                  </div>
                </div>
                <button className="w-full py-2 bg-primary-500 text-white rounded hover:bg-primary-600 transition">
                  Ver Perfil
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p>&copy; 2024 Directorio Sacerdotal. Todos los derechos reservados.</p>
          <p className="mt-2 text-gray-400">
            Conectando la comunidad católica con amor y servicio.
          </p>
        </div>
      </footer>
    </main>
  )
} 