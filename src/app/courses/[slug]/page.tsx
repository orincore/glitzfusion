import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import PageHeader from '@/components/ui/PageHeader'
import { CourseDetailContent } from '@/components/sections/CourseDetailContent'

// Enable dynamic rendering for courses not in static params
export const dynamicParams = true

interface CoursePageProps {
  params: Promise<{ slug: string }>
}

interface DatabaseCourse {
  _id: string
  id: string
  slug: string
  title: string
  summary: string
  description: string
  icon: string
  duration: string
  level: string
  format: string
  investment: string
  nextStart: string
  color: string
  highlights: string[]
  curriculum: Array<{
    title: string
    description: string
    points: string[]
  }>
  outcomes: string[]
  heroMedia?: {
    mediaId: string
    url: string
    mediaType: 'image' | 'video'
    alt?: string
  }
  videoUrl?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

async function getCourseFromAPI(slug: string): Promise<DatabaseCourse | null> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 
                   (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')
    
    const response = await fetch(`${baseUrl}/api/courses/slug/${slug}`, {
      cache: 'no-store', // Always fetch fresh data
      headers: {
        'Content-Type': 'application/json',
      }
    })
    
    if (!response.ok) {
      if (response.status === 404) {
        return null
      }
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    return await response.json()
  } catch (error) {
    console.error('Error fetching course:', error)
    return null
  }
}

export async function generateStaticParams() {
  // Fetch all active courses from API for static generation
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 
                   (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')
    
    const response = await fetch(`${baseUrl}/api/courses`, {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
      }
    })
    
    if (!response.ok) {
      console.warn('Failed to fetch courses for static params, using empty array')
      return []
    }
    
    const courses = await response.json()
    return courses.map((course: DatabaseCourse) => ({ slug: course.slug }))
  } catch (error) {
    console.warn('Error generating static params:', error)
    return []
  }
}

export async function generateMetadata({ params }: CoursePageProps): Promise<Metadata> {
  const { slug } = await params
  
  // Get course data from API only
  const course = await getCourseFromAPI(slug)

  if (!course) {
    return {
      title: 'Course Not Found | GLITZFUSION Academy',
      description: 'The requested course could not be found.'
    }
  }

  return {
    title: `${course.title} Course | GLITZFUSION Academy`,
    description: course.description,
  }
}

export default async function CourseDetailPage({ params }: CoursePageProps) {
  const { slug } = await params
  
  // Get course data from API only
  const course = await getCourseFromAPI(slug)

  if (!course) {
    notFound()
  }

  // Convert database course to the format expected by CourseDetailContent
  const courseDetails = {
    id: course.id,
    slug: course.slug,
    title: course.title,
    summary: course.summary,
    description: course.description,
    duration: course.duration,
    level: course.level,
    format: course.format,
    investment: course.investment,
    nextStart: course.nextStart,
    color: course.color,
    highlights: course.highlights,
    curriculum: course.curriculum,
    outcomes: course.outcomes,
    heroMedia: course.heroMedia,
    videoUrl: course.videoUrl,
  }

  return (
    <div className="relative">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-spotlight opacity-30" />
      </div>

      <div className="relative z-10">
        <PageHeader
          title={`${course.title} Program`}
          description={course.description}
        />

        <CourseDetailContent course={courseDetails} />
      </div>
    </div>
  )
}
