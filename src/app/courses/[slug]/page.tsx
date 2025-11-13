import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import PageHeader from '@/components/ui/PageHeader'
import { CourseDetailContent } from '@/components/sections/CourseDetailContent'

// Enable dynamic rendering for courses not in static params
export const dynamicParams = true

// Enable ISR (Incremental Static Regeneration)
export const revalidate = 3600 // Revalidate every hour

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

async function getCourseFromDB(slug: string): Promise<DatabaseCourse | null> {
  try {
    // Import database modules only when needed
    const dbConnect = (await import('@/lib/mongodb')).default
    const Course = (await import('@/models/Course')).default
    const Media = (await import('@/models/Media')).default
    const { processCourseMediaUrls } = await import('@/lib/media-proxy')
    
    await dbConnect()
    
    const course = await Course.findOne({ slug, isActive: true })
    
    if (!course) {
      return null
    }

    // Process course data similar to API route
    const rawCourse = course.toObject()

    const courseData: DatabaseCourse = {
      _id: String(course._id),
      id: rawCourse.id,
      slug: rawCourse.slug,
      title: rawCourse.title,
      summary: rawCourse.summary,
      description: rawCourse.description,
      icon: rawCourse.icon,
      duration: rawCourse.duration,
      level: rawCourse.level,
      format: rawCourse.format,
      investment: rawCourse.investment,
      nextStart: rawCourse.nextStart,
      color: rawCourse.color,
      highlights: rawCourse.highlights || [],
      curriculum: rawCourse.curriculum || [],
      outcomes: rawCourse.outcomes || [],
      heroMedia: rawCourse.heroMedia,
      videoUrl: rawCourse.videoUrl,
      isActive: rawCourse.isActive,
      createdAt: course.createdAt ? course.createdAt.toISOString() : '',
      updatedAt: course.updatedAt ? course.updatedAt.toISOString() : ''
    }

    if (courseData.heroMedia?.mediaId) {
      try {
        const media = await Media.findById(courseData.heroMedia.mediaId)
        if (media) {
          const heroMedia = {
            mediaId: media._id.toString(),
            url: media.cloudflareKey,
            mediaType: media.mimeType.startsWith('video/') ? 'video' as const : 'image' as const,
            alt: media.alt || courseData.heroMedia.alt || '',
            cloudflareKey: media.cloudflareKey
          }
          
          courseData.heroMedia = processCourseMediaUrls(heroMedia)
        }
      } catch (mediaError) {
        console.warn('Failed to populate media:', mediaError)
      }
    }

    return courseData
  } catch (error) {
    console.error('Error fetching course from DB:', error)
    return null
  }
}

export async function generateStaticParams() {
  // Fetch all active courses directly from database for static generation
  try {
    const dbConnect = (await import('@/lib/mongodb')).default
    const Course = (await import('@/models/Course')).default
    
    await dbConnect()
    const courses = await Course.find({ isActive: true }, { slug: 1 }).lean()
    
    return courses.map((course) => ({ slug: course.slug }))
  } catch (error) {
    console.warn('Error generating static params:', error)
    return []
  }
}

export async function generateMetadata({ params }: CoursePageProps): Promise<Metadata> {
  const { slug } = await params
  
  // Get course data directly from database for metadata
  const course = await getCourseFromDB(slug)

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
  
  // Get course data directly from database
  const course = await getCourseFromDB(slug)

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
