import { Metadata } from 'next'
import AdmissionForm from '@/components/sections/AdmissionForm'
import PageHeader from '@/components/ui/PageHeader'

export const metadata: Metadata = {
  title: 'Apply for Admission | GLITZFUSION',
  description: 'Start your creative journey with GLITZFUSION. Apply for our professional courses in Acting, Dancing, Photography, Filmmaking, and Modeling.',
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
