import './globals.css'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Directorio Sacerdotal',
  description: 'Sistema de gestión y directorio de sacerdotes católicos',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <nav className="bg-white shadow-lg">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <h1 className="text-xl font-bold text-gray-800">
                  📿 Directorio Sacerdotal
                </h1>
              </div>
              <div className="flex items-center space-x-4">
                <a href="#" className="text-gray-600 hover:text-gray-900">Inicio</a>
                <a href="#" className="text-gray-600 hover:text-gray-900">Directorio</a>
                <a href="#" className="text-gray-600 hover:text-gray-900">Contacto</a>
              </div>
            </div>
          </div>
        </nav>
        {children}
      </body>
    </html>
  )
} 