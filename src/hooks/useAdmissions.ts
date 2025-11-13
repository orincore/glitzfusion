'use client'

import { useState, useEffect, useCallback } from 'react'
import { IAdmission } from '@/models/Admission'

interface AdmissionFilters {
  status?: string
  course?: string
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

interface AdmissionStats {
  pending: number
  in_progress: number
  resolved: number
  closed: number
  accepted: number
  rejected: number
  total: number
}

interface UseAdmissionsReturn {
  admissions: IAdmission[]
  loading: boolean
  error: string | null
  stats: AdmissionStats
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
  fetchAdmissions: (filters?: AdmissionFilters) => Promise<void>
  updateAdmissionStatus: (id: string, status: string, adminNotes?: string) => Promise<void>
  deleteAdmission: (id: string) => Promise<void>
  submitAdmission: (data: Partial<IAdmission>) => Promise<void>
}

export function useAdmissions(): UseAdmissionsReturn {
  const [admissions, setAdmissions] = useState<IAdmission[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState<AdmissionStats>({
    pending: 0,
    in_progress: 0,
    resolved: 0,
    closed: 0,
    accepted: 0,
    rejected: 0,
    total: 0
  })
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  })

  const fetchAdmissions = useCallback(async (filters: AdmissionFilters = {}) => {
    setLoading(true)
    setError(null)
    
    try {
      const params = new URLSearchParams()
      
      if (filters.status) params.append('status', filters.status)
      if (filters.course) params.append('course', filters.course)
      if (filters.page) params.append('page', filters.page.toString())
      if (filters.limit) params.append('limit', filters.limit.toString())
      if (filters.sortBy) params.append('sortBy', filters.sortBy)
      if (filters.sortOrder) params.append('sortOrder', filters.sortOrder)
      
      const response = await fetch(`/api/admissions?${params.toString()}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch admissions')
      }
      
      const data = await response.json()
      
      setAdmissions(data.admissions)
      setStats(data.statusStats)
      setPagination(data.pagination)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }, [])

  const updateAdmissionStatus = useCallback(async (
    id: string, 
    status: string, 
    adminNotes?: string
  ) => {
    try {
      const response = await fetch(`/api/admissions/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status, adminNotes }),
      })
      
      if (!response.ok) {
        throw new Error('Failed to update admission')
      }
      
      // Refresh the admissions list
      await fetchAdmissions()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      throw err
    }
  }, [fetchAdmissions])

  const deleteAdmission = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/admissions/${id}`, {
        method: 'DELETE',
      })
      
      if (!response.ok) {
        throw new Error('Failed to delete admission')
      }
      
      // Refresh the admissions list
      await fetchAdmissions()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      throw err
    }
  }, [fetchAdmissions])

  const submitAdmission = useCallback(async (data: Partial<IAdmission>) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/admissions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to submit admission')
      }
      
      const result = await response.json()
      return result
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Initial fetch
  useEffect(() => {
    fetchAdmissions()
  }, [fetchAdmissions])

  return {
    admissions,
    loading,
    error,
    stats,
    pagination,
    fetchAdmissions,
    updateAdmissionStatus,
    deleteAdmission,
    submitAdmission
  }
}
