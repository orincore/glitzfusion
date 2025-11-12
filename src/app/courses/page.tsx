import { Metadata } from 'next';
import CoursesList from '@/components/sections/CoursesList';
import PageHeader from '@/components/ui/PageHeader';

export const metadata: Metadata = {
  title: 'Our Courses | Glitz Fusion Academy',
  description: 'Discover our professional courses in Acting, Dancing, Photography, Filmmaking, and Modeling. Start your creative journey with industry experts.',
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
