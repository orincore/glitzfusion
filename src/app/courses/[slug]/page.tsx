import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import PageHeader from '@/components/ui/PageHeader'
import { courseSlugs, getCourseBySlug } from '@/data/courses'
import { CourseDetailContent } from '@/components/sections/CourseDetailContent'

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
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    const response = await fetch(`${baseUrl}/api/courses/slug/${slug}`, {
      cache: 'no-store' // Always fetch fresh data
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

export function generateStaticParams() {
  // Generate static params from hardcoded data for build time
  // This ensures existing courses work even if DB is not available during build
  return courseSlugs.map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: CoursePageProps): Promise<Metadata> {
  const { slug } = await params
  
  // Try to get from API first, fallback to static data
  let course = await getCourseFromAPI(slug)
  if (!course) {
    const staticCourse = getCourseBySlug(slug)
    if (staticCourse) {
      // Convert static course to database format
      course = {
        _id: '',
        id: staticCourse.id,
        slug: staticCourse.slug,
        title: staticCourse.title,
        summary: staticCourse.summary,
        description: staticCourse.description,
        icon: staticCourse.icon.name || 'Users', // Convert LucideIcon to string
        duration: staticCourse.duration,
        level: staticCourse.level,
        format: staticCourse.format,
        investment: staticCourse.investment,
        nextStart: staticCourse.nextStart,
        color: staticCourse.color,
        highlights: staticCourse.highlights,
        curriculum: staticCourse.curriculum,
        outcomes: staticCourse.outcomes,
        isActive: true,
        createdAt: '',
        updatedAt: ''
      }
    }
  }

  if (!course) {
    return {
      title: 'Course Not Found | Glitz Fusion Academy',
    }
  }

  return {
    title: `${course.title} Course | Glitz Fusion Academy`,
    description: course.description,
  }
}

export default async function CourseDetailPage({ params }: CoursePageProps) {
  const { slug } = await params
  
  // Try to get from API first, fallback to static data
  let course = await getCourseFromAPI(slug)
  if (!course) {
    const staticCourse = getCourseBySlug(slug)
    if (staticCourse) {
      // Convert static course to database format
      course = {
        _id: '',
        id: staticCourse.id,
        slug: staticCourse.slug,
        title: staticCourse.title,
        summary: staticCourse.summary,
        description: staticCourse.description,
        icon: staticCourse.icon.name || 'Users', // Convert LucideIcon to string
        duration: staticCourse.duration,
        level: staticCourse.level,
        format: staticCourse.format,
        investment: staticCourse.investment,
        nextStart: staticCourse.nextStart,
        color: staticCourse.color,
        highlights: staticCourse.highlights,
        curriculum: staticCourse.curriculum,
        outcomes: staticCourse.outcomes,
        isActive: true,
        createdAt: '',
        updatedAt: ''
      }
    }
  }

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
