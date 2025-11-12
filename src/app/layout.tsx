import type { Metadata } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/providers/ThemeProvider'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const playfair = Playfair_Display({ 
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Glitz Fusion - Premier Media Academy',
  description: 'Master the arts of Acting, Dancing, Photography, Filmmaking, and Modeling at the premier creative academy. Transform your passion into professional excellence.',
  keywords: ['acting classes', 'dance academy', 'photography courses', 'filmmaking school', 'modeling training', 'creative arts education'],
  authors: [{ name: 'Glitz Fusion Academy' }],
  creator: 'Glitz Fusion Academy',
  publisher: 'Glitz Fusion Academy',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://glitzfusion.com'),
  openGraph: {
    title: 'Glitz Fusion - Premier Media Academy',
    description: 'Master the arts of Acting, Dancing, Photography, Filmmaking, and Modeling at the premier creative academy.',
    url: 'https://glitzfusion.com',
    siteName: 'Glitz Fusion',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Glitz Fusion - Premier Media Academy',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Glitz Fusion - Premier Media Academy',
    description: 'Master the arts of Acting, Dancing, Photography, Filmmaking, and Modeling at the premier creative academy.',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${playfair.variable} font-sans`}>
        <ThemeProvider>
          <div className="relative min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1">
              {children}
            </main>
            <Footer />
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}
