import { useState, useEffect } from 'react'
import { CourseInfo } from '@/data/courses'

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
    mediaId?: string
    url: string
    type: 'image' | 'video'
    alt?: string
  } | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export function useCourses() {
  const [courses, setCourses] = useState<CourseInfo[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchCourses()
  }, [])

  const fetchCourses = async () => {
    try {
      const response = await fetch('/api/courses')
      if (response.ok) {
        const data: DatabaseCourse[] = await response.json()
        console.log('Fetched courses from API:', data.length, 'courses')
        
        // Convert API data back to CourseInfo format
        const formattedCourses: CourseInfo[] = data.map((course) => ({
          id: course.id,
          slug: course.slug,
          title: course.title,
          summary: course.summary,
          description: course.description,
          icon: getIconComponent(course.icon),
          duration: course.duration,
          level: course.level,
          format: course.format,
          investment: course.investment,
          nextStart: course.nextStart,
          color: course.color,
          highlights: course.highlights || [],
          curriculum: course.curriculum || [],
          outcomes: course.outcomes || [],
        }))
        
        setCourses(formattedCourses)
      } else {
        console.error('Failed to fetch courses:', response.status, response.statusText)
        setError('Failed to fetch courses')
      }
    } catch (err) {
      console.error('Network error fetching courses:', err)
      setError('Network error')
    } finally {
      setIsLoading(false)
    }
  }

  return { courses, isLoading, error, refetch: fetchCourses }
}

// Helper function to map icon names to components
function getIconComponent(iconName: string) {
  const { Camera, Film, Palette, Star, Users } = require('lucide-react')
  
  const iconMap: { [key: string]: any } = {
    Camera,
    Film,
    Palette,
    Star,
    Users
  }

  return iconMap[iconName] || Users
}
