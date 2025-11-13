import { useState, useEffect } from 'react'
import { ITestimonial } from '@/models/Testimonial'

interface UseTestimonialsOptions {
  limit?: number
  random?: boolean
  published?: boolean
  featured?: boolean
}

interface UseTestimonialsReturn {
  testimonials: ITestimonial[]
  loading: boolean
  error: string | null
  refetch: () => void
}

export function useTestimonials(options: UseTestimonialsOptions = {}): UseTestimonialsReturn {
  const [testimonials, setTestimonials] = useState<ITestimonial[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTestimonials = async () => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams()
      
      if (options.limit) params.append('limit', options.limit.toString())
      if (options.random) params.append('random', 'true')
      if (options.published !== undefined) params.append('isPublished', options.published.toString())
      if (options.featured !== undefined) params.append('isFeatured', options.featured.toString())

      const response = await fetch(`/api/testimonials?${params}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch testimonials')
      }

      const data = await response.json()
      setTestimonials(data.testimonials || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      console.error('Error fetching testimonials:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTestimonials()
  }, [options.limit, options.random, options.published, options.featured])

  return {
    testimonials,
    loading,
    error,
    refetch: fetchTestimonials
  }
}
