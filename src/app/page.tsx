'use client'

import { Hero } from '@/components/sections/Hero'
import { CoursesSection } from '@/components/sections/CoursesSection'
import { AboutSection } from '@/components/sections/AboutSection'
import { GallerySection } from '@/components/sections/GallerySection'
import { TestimonialsSection } from '@/components/sections/TestimonialsSection'
import { ContactSection } from '@/components/sections/ContactSection'

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
