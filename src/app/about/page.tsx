import { Metadata } from 'next';
import { AboutHero } from '@/components/sections/AboutHero';
import { OurStory } from '@/components/sections/OurStory';
import { TeamShowcase } from '@/components/sections/TeamShowcase';
import { Values } from '@/components/sections/Values';
import { Testimonials } from '@/components/sections/Testimonials';
import { CTA } from '@/components/sections/CTA';

export const metadata: Metadata = {
  title: 'About Us | GLITZFUSION',
  description: 'Discover the passion and expertise behind GLITZFUSION. Learn about our mission, values, and the talented team that makes it all possible.',
};

export default function AboutPage() {
  return (
    <main className="min-h-screen">
      <AboutHero />
      <OurStory />
      <TeamShowcase />
      <Values />
      <Testimonials />
      <CTA />
    </main>
  );
}
