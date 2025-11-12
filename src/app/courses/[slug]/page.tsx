import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import PageHeader from '@/components/ui/PageHeader'
import { courseSlugs, getCourseBySlug } from '@/data/courses'
import { CourseDetailContent } from '@/components/sections/CourseDetailContent'

interface CoursePageProps {
  params: Promise<{ slug: string }>
}

export function generateStaticParams() {
  return courseSlugs.map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: CoursePageProps): Promise<Metadata> {
  const { slug } = await params
  const course = getCourseBySlug(slug)

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
  const course = getCourseBySlug(slug)

  if (!course) {
    notFound()
  }

  const { icon: _icon, ...courseDetails } = course

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
