import { Metadata } from 'next';
import BlogList from '@/components/sections/BlogList';
import PageHeader from '@/components/ui/PageHeader';

export const metadata: Metadata = {
  title: 'Blog | GLITZFUSION Academy - Acting, Dance, Photography Tips & Industry Insights',
  description: 'Discover expert tips, industry insights, and creative inspiration from GLITZFUSION Academy. Read about acting techniques, dance styles, photography tips, filmmaking secrets, and modeling career advice.',
  keywords: [
    'acting tips blog', 'dance techniques blog', 'photography tutorials', 'filmmaking insights',
    'modeling career advice', 'creative arts blog', 'media industry news', 'entertainment blog',
    'acting classes blog Badlapur', 'dance academy blog', 'photography institute blog',
    'film school blog', 'creative education blog Maharashtra'
  ],
  openGraph: {
    title: 'GLITZFUSION Academy Blog - Creative Arts & Media Industry Insights',
    description: 'Expert insights on Acting, Dancing, Photography, Filmmaking & Modeling from Badlapur\'s premier media academy. Tips, tutorials, and industry secrets.',
    images: [{
      url: '/og-blog.jpg',
      width: 1200,
      height: 630,
      alt: 'GLITZFUSION Academy Blog - Creative arts and media industry insights'
    }]
  },
  alternates: {
    canonical: 'https://glitzfusion.in/blog'
  }
};

export default function BlogPage() {
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
          title="Our Blog"
          description="Discover expert insights, creative tips, and industry secrets from the world of acting, dancing, photography, filmmaking, and modeling."
        />
        <BlogList />
      </div>
    </div>
  );
}
