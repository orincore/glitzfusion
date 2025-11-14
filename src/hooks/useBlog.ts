'use client'

import { useState, useEffect } from 'react'

export interface BlogPost {
  _id: string
  id: string
  slug: string
  title: string
  excerpt: string
  content: string
  featuredImage?: {
    mediaId: string
    url: string
    alt?: string
  }
  author: {
    name: string
    bio?: string
    avatar?: string
    social?: {
      twitter?: string
      linkedin?: string
      instagram?: string
    }
  }
  category: string
  tags: string[]
  status: 'draft' | 'published' | 'archived'
  isFeatured: boolean
  readTime: number
  views: number
  seo: {
    metaTitle?: string
    metaDescription?: string
    keywords?: string[]
    canonicalUrl?: string
    ogTitle?: string
    ogDescription?: string
    ogImage?: string
    twitterTitle?: string
    twitterDescription?: string
    twitterImage?: string
  }
  publishedAt?: string
  createdAt: string
  updatedAt: string
}

export interface BlogFilters {
  page?: number
  limit?: number
  category?: string
  tag?: string
  status?: string
  featured?: boolean
  search?: string
  sort?: string
  order?: 'asc' | 'desc'
}

export interface BlogResponse {
  blogs: BlogPost[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
  filters: {
    categories: string[]
    tags: string[]
  }
}

interface UseBlogReturn {
  blogs: BlogPost[]
  pagination: BlogResponse['pagination'] | null
  filters: BlogResponse['filters'] | null
  loading: boolean
  error: string | null
  refetch: (filters?: BlogFilters) => Promise<void>
  createBlog: (blogData: Partial<BlogPost>) => Promise<BlogPost | null>
  updateBlog: (id: string, blogData: Partial<BlogPost>) => Promise<BlogPost | null>
  deleteBlog: (id: string) => Promise<boolean>
  getBlogBySlug: (slug: string) => Promise<{ blog: BlogPost; relatedPosts: BlogPost[] } | null>
  getBlogById: (id: string) => Promise<BlogPost | null>
}

export function useBlog(initialFilters?: BlogFilters): UseBlogReturn {
  const [blogs, setBlogs] = useState<BlogPost[]>([])
  const [pagination, setPagination] = useState<BlogResponse['pagination'] | null>(null)
  const [filters, setFilters] = useState<BlogResponse['filters'] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchBlogs = async (fetchFilters?: BlogFilters) => {
    setLoading(true)
    setError(null)
    
    try {
      const params = new URLSearchParams()
      
      const allFilters = { ...initialFilters, ...fetchFilters }
      
      Object.entries(allFilters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString())
        }
      })
      
      const response = await fetch(`/api/blog?${params.toString()}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch blogs')
      }
      
      const data: BlogResponse = await response.json()
      setBlogs(data.blogs)
      setPagination(data.pagination)
      setFilters(data.filters)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      setBlogs([])
      setPagination(null)
      setFilters(null)
    } finally {
      setLoading(false)
    }
  }

  const createBlog = async (blogData: Partial<BlogPost>): Promise<BlogPost | null> => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null
      const response = await fetch('/api/blog', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(blogData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create blog')
      }

      const newBlog = await response.json()
      
      // Refresh the blog list
      await fetchBlogs()
      
      return newBlog
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create blog')
      return null
    }
  }

  const updateBlog = async (id: string, blogData: Partial<BlogPost>): Promise<BlogPost | null> => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null
      const response = await fetch(`/api/blog/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(blogData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update blog')
      }

      const updatedBlog = await response.json()
      
      // Update the blog in the current list
      setBlogs(prev => prev.map(blog => 
        blog._id === updatedBlog._id ? updatedBlog : blog
      ))
      
      return updatedBlog
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update blog')
      return null
    }
  }

  const deleteBlog = async (id: string): Promise<boolean> => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null
      const response = await fetch(`/api/blog/${id}`, {
        method: 'DELETE',
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        }
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete blog')
      }

      // Remove the blog from the current list
      setBlogs(prev => prev.filter(blog => blog._id !== id && blog.id !== id))
      
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete blog');
      throw err;
    }
  };

  const getBlogBySlug = async (slug: string): Promise<{ blog: BlogPost; relatedPosts: BlogPost[] } | null> => {
    try {
      const response = await fetch(`/api/blog/slug/${slug}`)
      
      if (!response.ok) {
        throw new Error('Blog not found')
      }
      
      const data = await response.json()
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch blog')
      return null
    }
  }

  const getBlogById = async (id: string): Promise<BlogPost | null> => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`/api/blog/${id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch blog');
      }

      const blog = await response.json();
      return blog;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch blog');
      throw err;
    }
  };

  useEffect(() => {
    fetchBlogs()
  }, [])

  return {
    blogs,
    pagination,
    filters,
    loading,
    error,
    refetch: fetchBlogs,
    createBlog,
    updateBlog,
    deleteBlog,
    getBlogBySlug,
    getBlogById
  }
}
