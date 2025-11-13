'use client'

import { useState, useEffect } from 'react'
import { GlassPanel } from '@/components/ui/GlassPanel'
import { 
  Briefcase, 
  Search, 
  Plus, 
  Eye, 
  Edit, 
  Trash2, 
  Loader2,
  Building,
  MapPin,
  Clock,
  DollarSign,
  Users,
  Star,
  CheckCircle,
  XCircle
} from 'lucide-react'
import toast from 'react-hot-toast'
import Link from 'next/link'

interface Career {
  _id: string
  title: string
  department: string
  location: string
  type: string
  experience: string
  description: string
  salary: {
    min?: number
    max?: number
    currency: string
    period: string
  }
  isActive: boolean
  isFeatured: boolean
  createdAt: string
}

interface CareerStats {
  'full-time': number
  'part-time': number
  'contract': number
  'internship': number
  active: number
  featured: number
  total: number
}

export default function CareersAdminPage() {
  const [careers, setCareers] = useState<Career[]>([])
  const [stats, setStats] = useState<CareerStats>({
    'full-time': 0,
    'part-time': 0,
    'contract': 0,
    'internship': 0,
    active: 0,
    featured: 0,
    total: 0
  })
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    search: '',
    type: 'all',
    department: 'all',
    isActive: 'all'
  })

  useEffect(() => {
    fetchCareers()
  }, [filters])

  const fetchCareers = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filters.search) params.append('search', filters.search)
      if (filters.type !== 'all') params.append('type', filters.type)
      if (filters.department !== 'all') params.append('department', filters.department)
      if (filters.isActive !== 'all') params.append('isActive', filters.isActive)

      const response = await fetch(`/api/careers?${params}`)
      const data = await response.json()

      if (response.ok) {
        setCareers(data.careers)
        setStats(data.stats)
      } else {
        toast.error('Failed to fetch careers')
      }
    } catch (error) {
      toast.error('Network error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this career?')) return

    try {
      const response = await fetch(`/api/careers/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success('Career deleted successfully')
        fetchCareers()
      } else {
        toast.error('Failed to delete career')
      }
    } catch (error) {
      toast.error('Network error occurred')
    }
  }

  const toggleStatus = async (id: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/careers/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !isActive })
      })

      if (response.ok) {
        toast.success(`Career ${!isActive ? 'activated' : 'deactivated'} successfully`)
        fetchCareers()
      } else {
        toast.error('Failed to update career status')
      }
    } catch (error) {
      toast.error('Network error occurred')
    }
  }

  const formatSalary = (salary: Career['salary']) => {
    if (!salary.min && !salary.max) return 'Competitive'
    
    const formatAmount = (amount: number) => {
      if (amount >= 100000) return `${(amount / 100000).toFixed(1)}L`
      if (amount >= 1000) return `${(amount / 1000).toFixed(0)}K`
      return amount.toString()
    }

    if (salary.min && salary.max) {
      return `${salary.currency} ${formatAmount(salary.min)} - ${formatAmount(salary.max)}`
    } else if (salary.min) {
      return `${salary.currency} ${formatAmount(salary.min)}+`
    }
    
    return 'Competitive'
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Career Management</h1>
            <p className="text-gray-400">Manage job postings and career opportunities</p>
          </div>
          <Link
            href="/admin/careers/new"
            className="px-6 py-3 bg-gradient-gold text-primary-black rounded-lg font-semibold hover:shadow-gold-glow transition-all flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Post New Job
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-6 mb-8">
        <GlassPanel className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total</p>
              <p className="text-2xl font-bold text-white">{stats.total}</p>
            </div>
            <Briefcase className="w-8 h-8 text-primary-gold" />
          </div>
        </GlassPanel>

        <GlassPanel className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Full Time</p>
              <p className="text-2xl font-bold text-emerald-400">{stats['full-time']}</p>
            </div>
            <Clock className="w-8 h-8 text-emerald-400" />
          </div>
        </GlassPanel>

        <GlassPanel className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Part Time</p>
              <p className="text-2xl font-bold text-blue-400">{stats['part-time']}</p>
            </div>
            <Clock className="w-8 h-8 text-blue-400" />
          </div>
        </GlassPanel>

        <GlassPanel className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Contract</p>
              <p className="text-2xl font-bold text-purple-400">{stats.contract}</p>
            </div>
            <Users className="w-8 h-8 text-purple-400" />
          </div>
        </GlassPanel>

        <GlassPanel className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Internship</p>
              <p className="text-2xl font-bold text-amber-400">{stats.internship}</p>
            </div>
            <Users className="w-8 h-8 text-amber-400" />
          </div>
        </GlassPanel>

        <GlassPanel className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Active</p>
              <p className="text-2xl font-bold text-green-400">{stats.active}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-400" />
          </div>
        </GlassPanel>

        <GlassPanel className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Featured</p>
              <p className="text-2xl font-bold text-yellow-400">{stats.featured}</p>
            </div>
            <Star className="w-8 h-8 text-yellow-400" />
          </div>
        </GlassPanel>
      </div>

      {/* Filters */}
      <GlassPanel className="p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-gold focus:border-transparent"
                placeholder="Search careers..."
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Type</label>
            <select
              value={filters.type}
              onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-gold focus:border-transparent"
            >
              <option value="all" className="bg-primary-black">All Types</option>
              <option value="full-time" className="bg-primary-black">Full Time</option>
              <option value="part-time" className="bg-primary-black">Part Time</option>
              <option value="contract" className="bg-primary-black">Contract</option>
              <option value="internship" className="bg-primary-black">Internship</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Department</label>
            <select
              value={filters.department}
              onChange={(e) => setFilters(prev => ({ ...prev, department: e.target.value }))}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-gold focus:border-transparent"
            >
              <option value="all" className="bg-primary-black">All Departments</option>
              <option value="Education" className="bg-primary-black">Education</option>
              <option value="Technology" className="bg-primary-black">Technology</option>
              <option value="Marketing" className="bg-primary-black">Marketing</option>
              <option value="Operations" className="bg-primary-black">Operations</option>
              <option value="HR" className="bg-primary-black">HR</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
            <select
              value={filters.isActive}
              onChange={(e) => setFilters(prev => ({ ...prev, isActive: e.target.value }))}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-gold focus:border-transparent"
            >
              <option value="all" className="bg-primary-black">All Status</option>
              <option value="true" className="bg-primary-black">Active</option>
              <option value="false" className="bg-primary-black">Inactive</option>
            </select>
          </div>
        </div>
      </GlassPanel>

      {/* Careers List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary-gold" />
          <span className="ml-2 text-gray-300">Loading careers...</span>
        </div>
      ) : careers.length === 0 ? (
        <GlassPanel className="p-12 text-center">
          <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No careers found</h3>
          <p className="text-gray-400 mb-6">No career postings match your current filters.</p>
          <Link
            href="/admin/careers/new"
            className="inline-flex items-center px-6 py-3 bg-gradient-gold text-primary-black rounded-lg font-semibold hover:shadow-gold-glow transition-all"
          >
            <Plus className="w-4 h-4 mr-2" />
            Post Your First Job
          </Link>
        </GlassPanel>
      ) : (
        <div className="space-y-6">
          {careers.map((career) => (
            <GlassPanel key={career._id} className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-xl font-bold text-white">{career.title}</h3>
                        {career.isFeatured && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-gold/20 text-primary-gold border border-primary-gold/30">
                            <Star className="w-3 h-3 mr-1" />
                            Featured
                          </span>
                        )}
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          career.isActive 
                            ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                            : 'bg-red-500/20 text-red-400 border border-red-500/30'
                        }`}>
                          {career.isActive ? (
                            <CheckCircle className="w-3 h-3 mr-1" />
                          ) : (
                            <XCircle className="w-3 h-3 mr-1" />
                          )}
                          {career.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <div className="flex items-center space-x-4 text-gray-300 text-sm mb-3">
                        <div className="flex items-center">
                          <Building className="w-4 h-4 mr-1" />
                          {career.department}
                        </div>
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 mr-1" />
                          {career.location}
                        </div>
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          {career.type.charAt(0).toUpperCase() + career.type.slice(1).replace('-', ' ')}
                        </div>
                        <div className="flex items-center">
                          <Users className="w-4 h-4 mr-1" />
                          {career.experience}
                        </div>
                      </div>
                    </div>
                  </div>

                  <p className="text-gray-300 mb-4 line-clamp-2">
                    {career.description}
                  </p>

                  <div className="flex items-center text-primary-gold">
                    <DollarSign className="w-4 h-4 mr-1" />
                    <span className="font-medium">{formatSalary(career.salary)}</span>
                  </div>
                </div>

                <div className="mt-4 lg:mt-0 lg:ml-6">
                  <div className="flex items-center space-x-2">
                    <Link
                      href={`/careers/${career._id}`}
                      className="p-2 text-gray-400 hover:text-primary-gold transition-colors"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                    <Link
                      href={`/admin/careers/${career._id}/edit`}
                      className="p-2 text-gray-400 hover:text-blue-400 transition-colors"
                      title="Edit Career"
                    >
                      <Edit className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => toggleStatus(career._id, career.isActive)}
                      className={`p-2 transition-colors ${
                        career.isActive 
                          ? 'text-gray-400 hover:text-red-400' 
                          : 'text-gray-400 hover:text-green-400'
                      }`}
                      title={career.isActive ? 'Deactivate' : 'Activate'}
                    >
                      {career.isActive ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => handleDelete(career._id)}
                      className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                      title="Delete Career"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </GlassPanel>
          ))}
        </div>
      )}
    </div>
  )
}
