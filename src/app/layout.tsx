import type { Metadata } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/providers/ThemeProvider'
import { LayoutShell } from '@/components/layout/LayoutShell'
import { SchemaMarkup } from '@/components/seo/SchemaMarkup'

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
  title: 'GLITZFUSION - Badlapur\'s Premier Media Academy | Acting, Dance, Photography Classes',
  description: 'Badlapur\'s first media academy offering professional Acting, Dancing, Photography, Filmmaking & Modeling courses. Expert-led training with 95% success rate. Enroll now!',
  keywords: [
    'media academy Badlapur', 'acting classes Badlapur', 'dance classes Badlapur', 
    'photography courses Badlapur', 'modeling school Badlapur', 'film acting institute Badlapur',
    'best media academy near me', 'acting school Maharashtra', 'dance academy Kalyan Dombivli',
    'filmmaking courses Mumbai region', 'creative arts education Badlapur', 'performing arts school',
    'theatre workshop Badlapur', 'dance choreography classes', 'portrait photography course',
    'video production training', 'runway modeling school', 'entertainment industry training'
  ],
  authors: [{ name: 'GLITZFUSION Academy' }],
  creator: 'GLITZFUSION Academy - Badlapur\'s First Media Academy',
  publisher: 'GLITZFUSION Academy',
  category: 'Education',
  classification: 'Media Arts Education',
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
  metadataBase: new URL('https://glitzfusion.in'),
  alternates: {
    canonical: 'https://glitzfusion.in',
  },
  openGraph: {
    title: 'GLITZFUSION - Badlapur\'s Premier Media Academy | Acting, Dance, Photography Classes',
    description: 'Badlapur\'s first media academy offering professional Acting, Dancing, Photography, Filmmaking & Modeling courses. Expert-led training with 95% success rate.',
    url: 'https://glitzfusion.in',
    siteName: 'GLITZFUSION Academy',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'GLITZFUSION Academy - Badlapur\'s Premier Media Academy for Acting, Dance, Photography',
      },
    ],
    locale: 'en_IN',
    type: 'website',
    countryName: 'India',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GLITZFUSION - Badlapur\'s Premier Media Academy',
    description: 'Badlapur\'s first media academy offering professional Acting, Dancing, Photography, Filmmaking & Modeling courses. Expert-led training with 95% success rate.',
    images: ['/og-image.jpg'],
    site: '@glitzfusion',
    creator: '@glitzfusion',
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
  other: {
    'geo.region': 'IN-MH',
    'geo.placename': 'Badlapur',
    'geo.position': '19.1559;73.2673',
    'ICBM': '19.1559, 73.2673',
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
        <SchemaMarkup type="LocalBusiness" />
        <SchemaMarkup type="Organization" />
        <SchemaMarkup type="FAQ" />
        <ThemeProvider>
          <LayoutShell>
            {children}
          </LayoutShell>
        </ThemeProvider>
      </body>
    </html>
  )
}
