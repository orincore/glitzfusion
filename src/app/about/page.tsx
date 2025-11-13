import { Metadata } from 'next';
import { AboutHero } from '@/components/sections/AboutHero';
import { OurStory } from '@/components/sections/OurStory';
import { FoundersSection } from '@/components/sections/FoundersSection';
import { TeamShowcase } from '@/components/sections/TeamShowcase';
import { Values } from '@/components/sections/Values';
import { Testimonials } from '@/components/sections/Testimonials';
import { CTA } from '@/components/sections/CTA';

export const metadata: Metadata = {
  title: 'About GLITZFUSION | Badlapur\'s First Media Academy - Our Story & Mission',
  description: 'Learn about GLITZFUSION - Badlapur\'s pioneering media academy. Founded to bring world-class Acting, Dancing, Photography, Filmmaking & Modeling education to Maharashtra. Meet our expert faculty.',
  keywords: [
    'about GLITZFUSION', 'media academy history Badlapur', 'acting school founders Maharashtra',
    'dance academy team Badlapur', 'photography institute faculty', 'filmmaking school mission',
    'creative arts education philosophy', 'media training experts Badlapur'
  ],
  openGraph: {
    title: 'About GLITZFUSION - Badlapur\'s Premier Media Academy Story',
    description: 'Discover the vision behind Badlapur\'s first media academy. Expert faculty, proven methodology, and commitment to nurturing creative talent in Maharashtra.',
    images: [{
      url: '/og-about.jpg',
      width: 1200,
      height: 630,
      alt: 'GLITZFUSION Academy founders and faculty team in Badlapur'
    }]
  },
  alternates: {
    canonical: 'https://glitzfusion.in/about'
  }
};

export default function AboutPage() {
  return (
    <main className="min-h-screen">
      <AboutHero />
      <OurStory />
      <FoundersSection />
      <TeamShowcase />
      <Values />
      <Testimonials />
      <CTA />
    </main>
  );
}
