'use client'

import { useState, useEffect } from 'react'
import { GlassPanel } from '@/components/ui/GlassPanel'
import { Star, Loader2, CheckCircle, XCircle, Eye, Award, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { ITestimonial } from '@/models/Testimonial'
import TestimonialStats from '@/components/admin/testimonials/TestimonialStats'
import TestimonialFilters from '@/components/admin/testimonials/TestimonialFilters'
import TestimonialTable from '@/components/admin/testimonials/TestimonialTable'
import TestimonialModal from '@/components/admin/testimonials/TestimonialModal'
import Pagination from '@/components/admin/testimonials/Pagination'

interface TestimonialFilters {
  status: string
  isPublished: string
  isFeatured: string
  search: string
  sortBy: string
  sortOrder: 'asc' | 'desc'
  page: number
  limit: number
}

interface TestimonialStats {
  pending: number
  approved: number
  rejected: number
  published: number
  featured: number
  total: number
}

interface PaginationInfo {
  page: number
  limit: number
  total: number
  pages: number
}

export default function TestimonialsAdminPage() {
  const [testimonials, setTestimonials] = useState<ITestimonial[]>([])
  const [stats, setStats] = useState<TestimonialStats>({
    pending: 0,
    approved: 0,
    rejected: 0,
    published: 0,
    featured: 0,
    total: 0
  })
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  })
  const [loading, setLoading] = useState(true)
  const [selectedTestimonial, setSelectedTestimonial] = useState<ITestimonial | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [filters, setFilters] = useState<TestimonialFilters>({
    status: 'all',
    isPublished: 'all',
    isFeatured: 'all',
    search: '',
    sortBy: 'submittedAt',
    sortOrder: 'desc',
    page: 1,
    limit: 10
  })

  const fetchTestimonials = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filters.status !== 'all') params.append('status', filters.status)
      if (filters.isPublished !== 'all') params.append('isPublished', filters.isPublished)
      if (filters.isFeatured !== 'all') params.append('isFeatured', filters.isFeatured)
      if (filters.search) params.append('search', filters.search)
      params.append('sortBy', filters.sortBy)
      params.append('sortOrder', filters.sortOrder)
      params.append('page', filters.page.toString())
      params.append('limit', filters.limit.toString())

      const response = await fetch(`/api/testimonials?${params}`)
      const data = await response.json()

      if (response.ok) {
        setTestimonials(data.testimonials)
        setStats(data.stats)
        if (data.pagination) {
          setPagination(data.pagination)
        }
      } else {
        toast.error('Failed to fetch testimonials')
      }
    } catch (error) {
      toast.error('Network error occurred')
      console.error('Fetch testimonials error:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTestimonials()
  }, [filters])

  const handleViewDetails = (testimonial: ITestimonial) => {
    setSelectedTestimonial(testimonial)
    setIsModalOpen(true)
  }

  const handleDeleteTestimonial = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this testimonial?')) return

    try {
      const response = await fetch(`/api/testimonials/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success('Testimonial deleted successfully')
        fetchTestimonials()
      } else {
        toast.error('Failed to delete testimonial')
      }
    } catch (error) {
      toast.error('Network error occurred')
      console.error('Delete testimonial error:', error)
    }
  }

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }))
  }

  const handleFilterChange = (newFilters: Partial<TestimonialFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: 1 }))
  }

  const handleBulkAction = async (action: string) => {
    const confirmMessages = {
      'approve-all': 'Are you sure you want to approve ALL pending testimonials?',
      'reject-all': 'Are you sure you want to reject ALL pending testimonials?',
      'publish-all-approved': 'Are you sure you want to publish ALL approved testimonials?'
    }

    const message = confirmMessages[action as keyof typeof confirmMessages]
    if (message && !window.confirm(message)) return

    try {
      const response = await fetch('/api/testimonials/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      })

      const data = await response.json()

      if (response.ok) {
        toast.success(data.message)
        fetchTestimonials()
      } else {
        toast.error(data.error || 'Failed to perform bulk action')
      }
    } catch (error) {
      toast.error('Network error occurred')
      console.error('Bulk action error:', error)
    }
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Testimonial Management</h1>
        <p className="text-gray-400">Manage and moderate customer testimonials</p>
      </div>

      {/* Stats Cards */}
      <TestimonialStats stats={stats} />

      {/* Bulk Actions */}
      <GlassPanel className="p-6 mb-8">
        <h3 className="text-lg font-semibold text-white mb-4">Bulk Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={() => handleBulkAction('approve-all')}
            className="flex items-center justify-center px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Approve All Pending
          </button>
          
          <button
            onClick={() => handleBulkAction('reject-all')}
            className="flex items-center justify-center px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
          >
            <XCircle className="w-4 h-4 mr-2" />
            Reject All Pending
          </button>
          
          <button
            onClick={() => handleBulkAction('publish-all-approved')}
            className="flex items-center justify-center px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <Eye className="w-4 h-4 mr-2" />
            Publish All Approved
          </button>
          
          <div className="flex items-center justify-center px-4 py-3 bg-gray-600 text-gray-300 rounded-lg">
            <Award className="w-4 h-4 mr-2" />
            More actions coming soon
          </div>
        </div>
        
        <div className="mt-4 p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
          <p className="text-amber-400 text-sm">
            <strong>Quick Action:</strong> Click "Approve All Pending" to automatically approve and publish all pending testimonials.
          </p>
        </div>
      </GlassPanel>

      {/* Filters */}
      <TestimonialFilters filters={filters} onFilterChange={handleFilterChange} />

      {/* Testimonials List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary-gold" />
          <span className="ml-2 text-gray-300">Loading testimonials...</span>
        </div>
      ) : testimonials.length === 0 ? (
        <GlassPanel className="p-12 text-center">
          <Star className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No testimonials found</h3>
          <p className="text-gray-400">No testimonials match your current filters.</p>
        </GlassPanel>
      ) : (
        <>
          <TestimonialTable
            testimonials={testimonials}
            onViewDetails={handleViewDetails}
            onDelete={handleDeleteTestimonial}
          />
          
          {/* Pagination */}
          <Pagination
            pagination={pagination}
            onPageChange={handlePageChange}
          />
        </>
      )}

      {/* Testimonial Detail Modal */}
      {isModalOpen && selectedTestimonial && (
        <TestimonialModal
          testimonial={selectedTestimonial}
          onClose={() => {
            setIsModalOpen(false)
            setSelectedTestimonial(null)
          }}
          onUpdate={() => {
            fetchTestimonials()
            setIsModalOpen(false)
            setSelectedTestimonial(null)
          }}
        />
      )}
    </div>
  )
}
