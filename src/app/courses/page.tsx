import { Metadata } from 'next';
import CoursesList from '@/components/sections/CoursesList';
import PageHeader from '@/components/ui/PageHeader';

export const metadata: Metadata = {
  title: 'Professional Courses in Badlapur | Acting, Dance, Photography | GLITZFUSION',
  description: 'Explore GLITZFUSION\'s comprehensive courses in Acting, Dancing, Photography, Filmmaking & Modeling in Badlapur. Industry-expert instructors, hands-on training, career placement support.',
  keywords: [
    'acting courses Badlapur', 'dance classes Badlapur', 'photography courses Badlapur',
    'filmmaking classes Badlapur', 'modeling courses Badlapur', 'media courses Maharashtra',
    'professional acting training', 'dance academy courses', 'photography institute programs',
    'film direction courses', 'creative arts courses Badlapur'
  ],
  openGraph: {
    title: 'Professional Media Courses in Badlapur | GLITZFUSION Academy',
    description: 'Master Acting, Dancing, Photography, Filmmaking & Modeling with industry experts at Badlapur\'s premier media academy. Flexible schedules, practical training.',
    images: [{
      url: '/og-courses.jpg',
      width: 1200,
      height: 630,
      alt: 'GLITZFUSION Academy courses - Acting, Dance, Photography classes in Badlapur'
    }]
  },
  alternates: {
    canonical: 'https://glitzfusion.in/courses'
  }
};

export default function CoursesPage() {
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
          title="Our Courses"
          description="Unleash your creative potential with our expert-led courses designed to help you master the arts."
        />
        <CoursesList />
      </div>
    </div>
  );
}
