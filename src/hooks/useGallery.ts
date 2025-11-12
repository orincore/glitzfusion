import { useState, useEffect, useCallback } from 'react'

export interface GalleryItem {
  _id: string
  title: string
  description?: string
  category: 'photo' | 'video' | 'artwork' | 'behind-scenes' | 'events'
  mediaUrl: string
  thumbnailUrl?: string
  cloudflareKey: string
  mimeType: string
  size: number
  originalName: string
  alt?: string
  tags: string[]
  featured: boolean
  sortOrder: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface GalleryResponse {
  items: GalleryItem[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

export interface UseGalleryOptions {
  category?: string
  featured?: boolean
  limit?: number
  page?: number
}

export function useGallery(options: UseGalleryOptions = {}) {
  const [data, setData] = useState<GalleryResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchGallery = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const searchParams = new URLSearchParams()
      
      if (options.category) searchParams.set('category', options.category)
      if (options.featured !== undefined) searchParams.set('featured', options.featured.toString())
      if (options.limit) searchParams.set('limit', options.limit.toString())
      if (options.page) searchParams.set('page', options.page.toString())

      const response = await fetch(`/api/gallery?${searchParams.toString()}`, {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache',
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch gallery: ${response.status}`)
      }

      const galleryData = await response.json()
      setData(galleryData)
    } catch (err) {
      console.error('Gallery fetch error:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch gallery')
    } finally {
      setLoading(false)
    }
  }, [options.category, options.featured, options.limit, options.page])

  useEffect(() => {
    fetchGallery()
  }, [fetchGallery])

  const refetch = useCallback(() => {
    fetchGallery()
  }, [fetchGallery])

  return {
    data,
    items: data?.items || [],
    pagination: data?.pagination,
    loading,
    error,
    refetch
  }
}

// Hook for featured gallery items
export function useFeaturedGallery(limit = 6) {
  return useGallery({ featured: true, limit })
}

// Hook for gallery by category
export function useGalleryByCategory(category: string, limit = 12) {
  return useGallery({ category, limit })
}

// Hook for single gallery item
export function useGalleryItem(id: string) {
  const [item, setItem] = useState<GalleryItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return

    const fetchItem = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch(`/api/gallery/${id}`)
        
        if (!response.ok) {
          throw new Error(`Failed to fetch gallery item: ${response.status}`)
        }

        const itemData = await response.json()
        setItem(itemData)
      } catch (err) {
        console.error('Gallery item fetch error:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch gallery item')
      } finally {
        setLoading(false)
      }
    }

    fetchItem()
  }, [id])

  return { item, loading, error }
}
