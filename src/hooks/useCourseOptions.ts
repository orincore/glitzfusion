'use client'

import { useState, useEffect } from 'react'

export interface CourseOption {
  id: string
  title: string
  duration: string
  level: string
  investment: string
  nextStart: string
  displayText: string
}

interface UseCourseOptionsReturn {
  courses: CourseOption[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function useCourseOptions(): UseCourseOptionsReturn {
  const [courses, setCourses] = useState<CourseOption[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCourses = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/courses/options')
      
      if (!response.ok) {
        throw new Error('Failed to fetch courses')
      }
      
      const data = await response.json()
      setCourses(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      setCourses([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCourses()
  }, [])

  return {
    courses,
    loading,
    error,
    refetch: fetchCourses
  }
}
