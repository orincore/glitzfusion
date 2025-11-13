import { Metadata } from 'next'
import GalleryClient from './GalleryClient'

export const metadata: Metadata = {
  title: 'Student Gallery | GLITZFUSION Badlapur Media Academy Showcase',
  description: 'Explore GLITZFUSION student work, behind-the-scenes moments, and creative expressions from Badlapur\'s premier media academy. Acting performances, dance shows, photography projects & more.',
  keywords: [
    'GLITZFUSION student gallery', 'media academy student work Badlapur', 'acting performances Badlapur',
    'dance academy showcase', 'photography student projects', 'filmmaking student work Maharashtra',
    'modeling portfolio Badlapur', 'creative arts showcase', 'student achievements gallery'
  ],
  openGraph: {
    title: 'Student Gallery | GLITZFUSION Academy Creative Showcase',
    description: 'Discover amazing work by GLITZFUSION students from Badlapur. Acting performances, dance choreography, photography projects, and filmmaking showcases.',
    images: [{
      url: '/og-gallery.jpg',
      width: 1200,
      height: 630,
      alt: 'GLITZFUSION Academy student gallery - Creative work from Badlapur media academy'
    }]
  },
  alternates: {
    canonical: 'https://glitzfusion.in/gallery'
  }
}

export default function GalleryPage() {
  return <GalleryClient />
}
