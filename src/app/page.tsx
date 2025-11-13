import { Metadata } from 'next'
import { Hero } from '@/components/sections/Hero'
import { CoursesSection } from '@/components/sections/CoursesSection'
import { AboutSection } from '@/components/sections/AboutSection'
import { GallerySection } from '@/components/sections/GallerySection'
import { TestimonialsSection } from '@/components/sections/TestimonialsSection'
import { ContactSection } from '@/components/sections/ContactSection'

export const metadata: Metadata = {
  title: 'GLITZFUSION - Badlapur\'s First Media Academy | Acting, Dance, Photography Classes',
  description: 'Join Badlapur\'s premier media academy for professional Acting, Dancing, Photography, Filmmaking & Modeling courses. Expert instructors, 95% success rate, flexible schedules. Enroll today!',
  keywords: [
    'media academy Badlapur', 'acting classes Badlapur', 'dance classes Badlapur',
    'photography courses Badlapur', 'modeling school Badlapur', 'filmmaking institute Badlapur',
    'best media academy near me', 'creative arts education Badlapur', 'performing arts school Maharashtra',
    'theatre workshop Badlapur', 'professional acting training', 'dance choreography classes',
    'portrait photography course', 'video production training', 'runway modeling school'
  ],
  openGraph: {
    title: 'GLITZFUSION - Badlapur\'s First Media Academy | Transform Your Creative Passion',
    description: 'Discover Badlapur\'s premier destination for media arts education. Professional courses in Acting, Dancing, Photography, Filmmaking & Modeling with industry experts.',
    images: [
      {
        url: '/og-home.jpg',
        width: 1200,
        height: 630,
        alt: 'GLITZFUSION Academy - Students learning acting, dance, photography in Badlapur',
      },
    ],
  },
  alternates: {
    canonical: 'https://glitzfusion.in',
  },
}

export default function HomePage() {
  return (
    <div className="relative">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Spotlight Background */}
        <div className="absolute inset-0 bg-spotlight opacity-30" />
      </div>

      {/* Page Content */}
      <div className="relative z-10">
        <Hero />
        <div className="pt-20">
          <CoursesSection />
          <AboutSection />
          <GallerySection />
          <TestimonialsSection />
          <ContactSection />
        </div>
      </div>
    </div>
  )
}
