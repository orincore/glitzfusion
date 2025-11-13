import { Metadata } from 'next'
import ContactClient from './ContactClient'

export const metadata: Metadata = {
  title: 'Contact GLITZFUSION | Badlapur Media Academy | Get in Touch',
  description: 'Contact GLITZFUSION Academy in Badlapur for inquiries about Acting, Dancing, Photography, Filmmaking & Modeling courses. Visit us, call, or send a message. We\'re here to help!',
  keywords: [
    'contact GLITZFUSION Badlapur', 'media academy contact details', 'GLITZFUSION phone number',
    'acting school contact Badlapur', 'dance academy address', 'photography institute location',
    'filmmaking school contact Maharashtra', 'modeling academy inquiry'
  ],
  openGraph: {
    title: 'Contact GLITZFUSION Academy | Badlapur Media Academy',
    description: 'Get in touch with Badlapur\'s premier media academy. Contact us for course information, admissions, or any questions about our Acting, Dance, Photography programs.',
    images: [{
      url: '/og-contact.jpg',
      width: 1200,
      height: 630,
      alt: 'Contact GLITZFUSION Academy - Badlapur media academy contact information'
    }]
  },
  alternates: {
    canonical: 'https://glitzfusion.in/contact'
  }
}

export default function ContactPage() {
  return <ContactClient />
}
