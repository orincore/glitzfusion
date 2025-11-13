import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Creative Arts Jobs in Badlapur | GLITZFUSION Academy Careers',
  description: 'Find exciting career opportunities in Badlapur, Maharashtra at GLITZFUSION Academy. We are hiring photographers, acting instructors, musicians, choreographers, content creators, and more creative professionals.',
  keywords: [
    'jobs in Badlapur',
    'careers Badlapur Maharashtra',
    'creative arts jobs Badlapur',
    'photography jobs Badlapur',
    'acting instructor jobs',
    'music teacher jobs Badlapur',
    'dance instructor careers',
    'content creator jobs',
    'film maker jobs Maharashtra',
    'GLITZFUSION Academy careers',
    'entertainment industry jobs',
    'creative arts education jobs',
    'Badlapur employment opportunities',
    'Maharashtra creative jobs'
  ],
  authors: [{ name: 'GLITZFUSION Academy' }],
  creator: 'GLITZFUSION Academy',
  publisher: 'GLITZFUSION Academy',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://glitzfusion.in'),
  alternates: {
    canonical: '/careers',
  },
  openGraph: {
    title: 'Creative Arts Jobs in Badlapur | GLITZFUSION Academy Careers',
    description: 'Join GLITZFUSION Academy in Badlapur! We are hiring creative professionals including photographers, acting instructors, musicians, choreographers, and content creators.',
    url: 'https://glitzfusion.in/careers',
    siteName: 'GLITZFUSION Academy',
    images: [
      {
        url: '/og-careers.jpg',
        width: 1200,
        height: 630,
        alt: 'GLITZFUSION Academy Careers - Creative Arts Jobs in Badlapur',
      },
    ],
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Creative Arts Jobs in Badlapur | GLITZFUSION Academy',
    description: 'Join our creative team in Badlapur! Photography, acting, music, dance, and content creation opportunities available.',
    images: ['/og-careers.jpg'],
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
  verification: {
    google: 'your-google-verification-code',
    yandex: 'your-yandex-verification-code',
    yahoo: 'your-yahoo-verification-code',
  },
}
