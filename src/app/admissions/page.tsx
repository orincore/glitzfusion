import { Metadata } from 'next'
import AdmissionForm from '@/components/sections/AdmissionForm'
import PageHeader from '@/components/ui/PageHeader'

export const metadata: Metadata = {
  title: 'Admissions Open 2025 | Apply to GLITZFUSION Badlapur Media Academy',
  description: 'Apply now for GLITZFUSION Badlapur - Maharashtra\'s premier media academy. Admissions open for Acting, Dancing, Photography, Filmmaking & Modeling courses. Limited seats available!',
  keywords: [
    'admissions open Badlapur media academy', 'apply GLITZFUSION academy', 'media academy admission 2025',
    'acting school admission Badlapur', 'dance academy enrollment', 'photography course admission',
    'filmmaking institute application', 'modeling school admission Maharashtra'
  ],
  openGraph: {
    title: 'Admissions Open 2025 | Join GLITZFUSION Badlapur Media Academy',
    description: 'Secure your seat at Badlapur\'s first media academy. Professional training in Acting, Dancing, Photography, Filmmaking & Modeling. Apply today!',
    images: [{
      url: '/og-admissions.jpg',
      width: 1200,
      height: 630,
      alt: 'GLITZFUSION Academy admissions - Students applying for media courses in Badlapur'
    }]
  },
  alternates: {
    canonical: 'https://glitzfusion.in/admissions'
  }
}

export default function AdmissionsPage() {
  return (
    <div className="relative">
      {/* Background Effects - matching homepage */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Spotlight Background */}
        <div className="absolute inset-0 bg-spotlight opacity-30" />
      </div>

      {/* Page Content */}
      <div className="relative z-10 pt-20">
        <PageHeader 
          title="Apply for Admission"
          description="Take the first step towards your creative career. Join thousands of successful graduates who have transformed their passion into profession."
        />
        <AdmissionForm />
      </div>
    </div>
  )
}
