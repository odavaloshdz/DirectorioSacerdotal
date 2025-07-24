import './globals.css'
import { Inter } from 'next/font/google'
import { Providers } from '@/components/providers'
import { AuthHeader } from '@/components/auth-header'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Diócesis de San Juan de los Lagos - Directorio Sacerdotal',
  description: 'Directorio oficial de sacerdotes de la Diócesis de San Juan de los Lagos, Jalisco',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=5',
  themeColor: '#2563eb',
  robots: 'index, follow',
  openGraph: {
    title: 'Directorio Sacerdotal - Diócesis de San Juan de los Lagos',
    description: 'Directorio oficial de sacerdotes de la Diócesis de San Juan de los Lagos, Jalisco',
    type: 'website',
    locale: 'es_ES',
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className="scroll-smooth">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <meta name="theme-color" content="#2563eb" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="format-detection" content="telephone=no" />
      </head>
      <body className={`${inter.className} overflow-x-hidden`}>
        <Providers>
          <AuthHeader />
          <main className="relative">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  )
} 