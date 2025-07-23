import './globals.css'
import { Inter } from 'next/font/google'
import { Providers } from '@/components/providers'
import { AuthHeader } from '@/components/auth-header'

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
        <Providers>
          <AuthHeader />
          {children}
        </Providers>
      </body>
    </html>
  )
} 