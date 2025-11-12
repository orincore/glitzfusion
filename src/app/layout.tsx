import type { Metadata } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/providers/ThemeProvider'
import { LayoutShell } from '@/components/layout/LayoutShell'

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
  title: 'GLITZFUSION - Premier Media Academy',
  description: 'Master the arts of Acting, Dancing, Photography, Filmmaking, and Modeling at the premier creative academy. Transform your passion into professional excellence.',
  keywords: ['acting classes', 'dance academy', 'photography courses', 'filmmaking school', 'modeling training', 'creative arts education'],
  authors: [{ name: 'GLITZFUSION Academy' }],
  creator: 'GLITZFUSION Academy',
  publisher: 'GLITZFUSION Academy',
  icons: {
    icon: '/logo/Glitzfusion%20logo%20bg%20rm.png',
    shortcut: '/logo/Glitzfusion%20logo%20bg%20rm.png',
    apple: '/logo/Glitzfusion%20logo%20bg%20rm.png',
  },
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://glitzfusion.com'),
  openGraph: {
    title: 'GLITZFUSION - Premier Media Academy',
    description: 'Master the arts of Acting, Dancing, Photography, Filmmaking, and Modeling at the premier creative academy.',
    url: 'https://glitzfusion.com',
    siteName: 'GLITZFUSION',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'GLITZFUSION - Premier Media Academy',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GLITZFUSION - Premier Media Academy',
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
      <body className={`${inter.variable} ${playfair.variable} font-sans antialiased bg-primary-dark text-white min-h-screen w-full`}>
        <ThemeProvider>
          <LayoutShell>
            {children}
          </LayoutShell>
        </ThemeProvider>
      </body>
    </html>
  )
}
