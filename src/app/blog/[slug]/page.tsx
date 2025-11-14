import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import BlogPost from '@/components/sections/BlogPost';

interface BlogPageProps {
  params: { slug: string };
}

// Generate metadata for SEO
export async function generateMetadata({ params }: BlogPageProps): Promise<Metadata> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/blog/slug/${params.slug}`, {
      cache: 'no-store'
    });

    if (!response.ok) {
      return {
        title: 'Blog Post Not Found | GLITZFUSION Academy',
        description: 'The requested blog post could not be found.'
      };
    }

    const { blog } = await response.json();

    return {
      title: blog.seo?.metaTitle || `${blog.title} | GLITZFUSION Academy Blog`,
      description: blog.seo?.metaDescription || blog.excerpt,
      keywords: blog.seo?.keywords || blog.tags,
      authors: [{ name: blog.author.name }],
      openGraph: {
        title: blog.seo?.ogTitle || blog.title,
        description: blog.seo?.ogDescription || blog.excerpt,
        type: 'article',
        publishedTime: blog.publishedAt,
        modifiedTime: blog.updatedAt,
        authors: [blog.author.name],
        tags: blog.tags,
        images: blog.seo?.ogImage || blog.featuredImage?.url ? [{
          url: blog.seo?.ogImage || blog.featuredImage.url,
          width: 1200,
          height: 630,
          alt: blog.featuredImage?.alt || blog.title
        }] : []
      },
      twitter: {
        card: 'summary_large_image',
        title: blog.seo?.twitterTitle || blog.title,
        description: blog.seo?.twitterDescription || blog.excerpt,
        images: blog.seo?.twitterImage || blog.featuredImage?.url ? [blog.seo?.twitterImage || blog.featuredImage.url] : []
      },
      alternates: {
        canonical: blog.seo?.canonicalUrl || `https://glitzfusion.in/blog/${blog.slug}`
      },
      other: {
        'article:author': blog.author.name,
        'article:published_time': blog.publishedAt,
        'article:modified_time': blog.updatedAt,
        'article:section': blog.category,
        'article:tag': blog.tags.join(', ')
      }
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'Blog Post | GLITZFUSION Academy',
      description: 'Read the latest insights from GLITZFUSION Academy.'
    };
  }
}

export default async function BlogPostPage({ params }: BlogPageProps) {
  let blogData;
  
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/blog/slug/${params.slug}`, {
      cache: 'no-store'
    });

    if (!response.ok) {
      notFound();
    }

    blogData = await response.json();
  } catch (error) {
    console.error('Error fetching blog post:', error);
    notFound();
  }

  return (
    <div className="relative">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-spotlight opacity-30" />
      </div>

      {/* Page Content */}
      <div className="relative z-10">
        <BlogPost blog={blogData.blog} relatedPosts={blogData.relatedPosts} />
      </div>
    </div>
  );
}
