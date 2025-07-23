import './globals.css'
import { Inter } from 'next/font/google'
import Image from 'next/image'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Diócesis de San Juan de los Lagos - Directorio Sacerdotal',
  description: 'Directorio oficial de sacerdotes de la Diócesis de San Juan de los Lagos, Jalisco',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <nav className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex justify-between items-center h-20">
              <div className="flex items-center space-x-4">
                <Image 
                  src="/san juan.png" 
                  alt="Diócesis de San Juan de los Lagos"
                  width={60}
                  height={60}
                  className="h-14 w-auto"
                />
                <div>
                  <h1 className="text-xl font-bold text-blue-900">
                    Diócesis de San Juan de los Lagos
                  </h1>
                  <p className="text-sm text-gray-600">Directorio Sacerdotal</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition text-sm">
                  Iniciar Sesión
                </button>
                <button className="px-4 py-2 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50 transition text-sm">
                  Registrarse
                </button>
              </div>
            </div>
          </div>
        </nav>
        {children}
      </body>
    </html>
  )
} 