'use client'

import { useState, useEffect } from 'react'
import { useAdmissions } from '@/hooks/useAdmissions'
import { useCourseOptions } from '@/hooks/useCourseOptions'
import { 
  Users, Filter, Search, Eye, Edit, Trash2, 
  CheckCircle, Clock, AlertCircle, XCircle,
  ChevronLeft, ChevronRight, Download, Mail,
  Phone, MapPin, Calendar, GraduationCap,
  Youtube, Instagram, FileText, Loader2,
  Save, X
} from 'lucide-react'
import { GlassPanel } from '@/components/ui/GlassPanel'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import toast, { Toaster } from 'react-hot-toast'
import { IAdmission } from '@/models/Admission'

const statusColors = {
  pending: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
  in_progress: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
  resolved: 'text-green-400 bg-green-400/10 border-green-400/20',
  closed: 'text-gray-400 bg-gray-400/10 border-gray-400/20',
  accepted: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
  rejected: 'text-red-400 bg-red-400/10 border-red-400/20'
}

const statusIcons = {
  pending: Clock,
  in_progress: AlertCircle,
  resolved: CheckCircle,
  closed: XCircle,
  accepted: CheckCircle,
  rejected: XCircle
}

interface AdmissionDetailModalProps {
  admission: IAdmission | null
  isOpen: boolean
  onClose: () => void
  onStatusUpdate: (id: string, status: string, notes?: string) => void
  onDelete: (id: string) => void
}

function AdmissionDetailModal({ admission, isOpen, onClose, onStatusUpdate, onDelete }: AdmissionDetailModalProps) {
  const [status, setStatus] = useState('')
  const [adminNotes, setAdminNotes] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (admission) {
      setStatus(admission.status)
      setAdminNotes(admission.adminNotes || '')
    }
  }, [admission])

  const handleSave = async () => {
    if (!admission) return
    
    setSaving(true)
    try {
      await onStatusUpdate(admission._id, status, adminNotes)
      toast.success('Admission updated successfully')
      onClose()
    } catch (error) {
      toast.error('Failed to update admission')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!admission) return
    
    if (confirm('Are you sure you want to delete this admission? This action cannot be undone.')) {
      try {
        await onDelete(admission._id)
        toast.success('Admission deleted successfully')
        onClose()
      } catch (error) {
        toast.error('Failed to delete admission')
      }
    }
  }

  if (!isOpen || !admission) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-4xl max-h-[90vh] overflow-y-auto"
      >
        <GlassPanel className="p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gradient-gold">
              Admission Details
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Personal Information */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <Users className="w-5 h-5 mr-2 text-primary-gold" />
                  Personal Information
                </h3>
                <div className="space-y-3">
                  <div>
                    <span className="text-gray-400 text-sm">Name:</span>
                    <p className="text-white">{admission.firstName} {admission.lastName}</p>
                  </div>
                  <div>
                    <span className="text-gray-400 text-sm">Email:</span>
                    <p className="text-white flex items-center">
                      <Mail className="w-4 h-4 mr-2" />
                      {admission.email}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-400 text-sm">Phone:</span>
                    <p className="text-white flex items-center">
                      <Phone className="w-4 h-4 mr-2" />
                      {admission.countryCode} {admission.phone}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-400 text-sm">Age:</span>
                    <p className="text-white">{admission.age} years</p>
                  </div>
                  <div>
                    <span className="text-gray-400 text-sm">Gender:</span>
                    <p className="text-white capitalize">{admission.gender.replace('-', ' ')}</p>
                  </div>
                  <div>
                    <span className="text-gray-400 text-sm">Location:</span>
                    <p className="text-white flex items-center">
                      <MapPin className="w-4 h-4 mr-2" />
                      {admission.location.city}, {admission.location.state}, {admission.location.country}
                    </p>
                  </div>
                </div>
              </div>

              {/* Course Information */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <GraduationCap className="w-5 h-5 mr-2 text-primary-gold" />
                  Course Information
                </h3>
                <div className="space-y-3">
                  <div>
                    <span className="text-gray-400 text-sm">Course:</span>
                    <p className="text-white">{admission.course}</p>
                  </div>
                  <div>
                    <span className="text-gray-400 text-sm">Experience Level:</span>
                    <p className="text-white capitalize">{admission.experience}</p>
                  </div>
                  {admission.previousTraining && (
                    <div>
                      <span className="text-gray-400 text-sm">Previous Training:</span>
                      <p className="text-white">{admission.previousTraining}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Portfolio Links */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Portfolio & Links</h3>
                <div className="space-y-2">
                  {admission.resumeUrl && (
                    <a
                      href={admission.resumeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-primary-gold hover:text-primary-gold-light transition-colors"
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      Resume
                    </a>
                  )}
                  {admission.youtubeUrl && (
                    <a
                      href={admission.youtubeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-primary-gold hover:text-primary-gold-light transition-colors"
                    >
                      <Youtube className="w-4 h-4 mr-2" />
                      YouTube
                    </a>
                  )}
                  {admission.instagramUrl && (
                    <a
                      href={admission.instagramUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-primary-gold hover:text-primary-gold-light transition-colors"
                    >
                      <Instagram className="w-4 h-4 mr-2" />
                      Instagram
                    </a>
                  )}
                  {admission.portfolioUrl && (
                    <a
                      href={admission.portfolioUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-primary-gold hover:text-primary-gold-light transition-colors"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Portfolio
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Motivation */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Motivation</h3>
                <p className="text-gray-300 leading-relaxed">{admission.motivation}</p>
              </div>

              {/* Availability */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Availability</h3>
                <div className="grid grid-cols-2 gap-2">
                  {admission.availability.map((slot) => (
                    <span
                      key={slot}
                      className="px-3 py-1 bg-primary-gold/10 text-primary-gold text-sm rounded-lg border border-primary-gold/20"
                    >
                      {slot}
                    </span>
                  ))}
                </div>
              </div>

              {/* Emergency Contact */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Emergency Contact</h3>
                <div className="space-y-2">
                  <p className="text-white">{admission.emergencyContact.name}</p>
                  <p className="text-gray-300">{admission.emergencyContact.phone}</p>
                  <p className="text-gray-300 capitalize">{admission.emergencyContact.relationship}</p>
                </div>
              </div>

              {/* Status Management */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Status Management</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Status
                    </label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-gold"
                    >
                      <option value="pending" className="bg-primary-black">Pending</option>
                      <option value="in_progress" className="bg-primary-black">In Progress</option>
                      <option value="accepted" className="bg-primary-black">✅ Accepted</option>
                      <option value="rejected" className="bg-primary-black">❌ Rejected</option>
                      <option value="resolved" className="bg-primary-black">Resolved</option>
                      <option value="closed" className="bg-primary-black">Closed</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Admin Notes
                    </label>
                    <textarea
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      rows={4}
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-gold resize-none"
                      placeholder="Add notes about this admission..."
                    />
                  </div>
                </div>
              </div>

              {/* Submission Info */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Submission Info</h3>
                <div className="space-y-2">
                  <div className="flex items-center text-gray-300">
                    <Calendar className="w-4 h-4 mr-2" />
                    Submitted: {new Date(admission.submittedAt).toLocaleDateString()}
                  </div>
                  <div className="flex items-center text-gray-300">
                    <Clock className="w-4 h-4 mr-2" />
                    Last Updated: {new Date(admission.updatedAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions for Pending Applications */}
          {admission.status === 'pending' && (
            <div className="flex items-center justify-center space-x-4 mt-6 p-4 bg-white/5 rounded-lg border border-white/10">
              <button
                onClick={() => {
                  setStatus('accepted')
                  handleSave()
                }}
                className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Accept Application
              </button>
              <button
                onClick={() => {
                  setStatus('rejected')
                  handleSave()
                }}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center"
              >
                <XCircle className="w-4 h-4 mr-2" />
                Reject Application
              </button>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/10">
            <button
              onClick={handleDelete}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </button>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={onClose}
                className="px-6 py-2 border border-white/20 text-white rounded-lg hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-2 bg-gradient-gold text-primary-black rounded-lg hover:shadow-gold-glow transition-all flex items-center"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Save Changes
              </button>
            </div>
          </div>
        </GlassPanel>
      </motion.div>
    </div>
  )
}

export default function AdmissionsAdminPage() {
  const { 
    admissions, 
    loading, 
    error, 
    stats, 
    pagination, 
    fetchAdmissions, 
    updateAdmissionStatus, 
    deleteAdmission 
  } = useAdmissions()
  
  const { courses } = useCourseOptions()
  
  const [selectedAdmission, setSelectedAdmission] = useState<IAdmission | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [filters, setFilters] = useState({
    status: 'all',
    course: 'all',
    search: '',
    sortBy: 'submittedAt',
    sortOrder: 'desc' as 'asc' | 'desc'
  })

  const handleQuickStatusUpdate = async (id: string, status: 'accepted' | 'rejected') => {
    const admission = admissions.find(a => a._id === id)
    if (!admission) return

    const action = status === 'accepted' ? 'accept' : 'reject'
    const confirmed = window.confirm(
      `Are you sure you want to ${action} the application from ${admission.firstName} ${admission.lastName} for ${admission.course}?`
    )
    
    if (confirmed) {
      try {
        await updateAdmissionStatus(id, status)
        toast.success(`Application ${status} successfully!`)
      } catch (error) {
        toast.error(`Failed to ${action} application`)
      }
    }
  }

  useEffect(() => {
    fetchAdmissions({
      status: filters.status !== 'all' ? filters.status : undefined,
      course: filters.course !== 'all' ? filters.course : undefined,
      sortBy: filters.sortBy,
      sortOrder: filters.sortOrder,
      page: pagination.page,
      limit: pagination.limit
    })
  }, [filters, pagination.page, fetchAdmissions])

  const handleViewDetails = (admission: IAdmission) => {
    setSelectedAdmission(admission)
    setIsModalOpen(true)
  }

  const handleStatusUpdate = async (id: string, status: string, notes?: string) => {
    await updateAdmissionStatus(id, status, notes)
  }

  const handleDelete = async (id: string) => {
    await deleteAdmission(id)
  }

  const handlePageChange = (newPage: number) => {
    fetchAdmissions({
      ...filters,
      page: newPage
    })
  }

  const getStatusIcon = (status: string) => {
    const Icon = statusIcons[status as keyof typeof statusIcons]
    return Icon ? <Icon className="w-4 h-4" /> : null
  }

  const filteredAdmissions = admissions.filter(admission => {
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase()
      return (
        admission.firstName.toLowerCase().includes(searchTerm) ||
        admission.lastName.toLowerCase().includes(searchTerm) ||
        admission.email.toLowerCase().includes(searchTerm) ||
        admission.course.toLowerCase().includes(searchTerm)
      )
    }
    return true
  })

  return (
    <div className="min-h-screen bg-primary-black">
      <Toaster position="top-right" />
      
      {/* Header */}
      <div className="border-b border-white/10 bg-glass-dark backdrop-blur-xl">
        <div className="container-custom py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gradient-gold mb-2">
                Admissions Management
              </h1>
              <p className="text-gray-300">
                Manage and track admission applications
              </p>
            </div>
            
            {/* Stats Cards */}
            <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-amber-400">{stats.pending || 0}</div>
                <div className="text-xs text-gray-400">Pending</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">{stats.in_progress || 0}</div>
                <div className="text-xs text-gray-400">In Progress</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-emerald-400">{stats.accepted || 0}</div>
                <div className="text-xs text-gray-400">Accepted</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-400">{stats.rejected || 0}</div>
                <div className="text-xs text-gray-400">Rejected</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">{stats.resolved || 0}</div>
                <div className="text-xs text-gray-400">Resolved</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary-gold">{stats.total || 0}</div>
                <div className="text-xs text-gray-400">Total</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container-custom py-8">
        {/* Filters */}
        <GlassPanel className="p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Search
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-gold"
                  placeholder="Search admissions..."
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-gold"
              >
                <option value="all" className="bg-primary-black">All Status</option>
                <option value="pending" className="bg-primary-black">Pending</option>
                <option value="in_progress" className="bg-primary-black">In Progress</option>
                <option value="accepted" className="bg-primary-black">✅ Accepted</option>
                <option value="rejected" className="bg-primary-black">❌ Rejected</option>
                <option value="resolved" className="bg-primary-black">Resolved</option>
                <option value="closed" className="bg-primary-black">Closed</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Course
              </label>
              <select
                value={filters.course}
                onChange={(e) => setFilters(prev => ({ ...prev, course: e.target.value }))}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-gold"
              >
                <option value="all" className="bg-primary-black">All Courses</option>
                {courses.map((course) => (
                  <option key={course.id} value={course.title} className="bg-primary-black">
                    {course.title}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Sort By
              </label>
              <select
                value={`${filters.sortBy}-${filters.sortOrder}`}
                onChange={(e) => {
                  const [sortBy, sortOrder] = e.target.value.split('-')
                  setFilters(prev => ({ ...prev, sortBy, sortOrder: sortOrder as 'asc' | 'desc' }))
                }}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-gold"
              >
                <option value="submittedAt-desc" className="bg-primary-black">Newest First</option>
                <option value="submittedAt-asc" className="bg-primary-black">Oldest First</option>
                <option value="firstName-asc" className="bg-primary-black">Name A-Z</option>
                <option value="firstName-desc" className="bg-primary-black">Name Z-A</option>
              </select>
            </div>
          </div>
        </GlassPanel>

        {/* Admissions List */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary-gold" />
            <span className="ml-2 text-gray-300">Loading admissions...</span>
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <XCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <p className="text-red-400">{error}</p>
          </div>
        ) : (
          <>
            <GlassPanel className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-white/10">
                    <tr>
                      <th className="text-left py-4 px-6 text-gray-300 font-medium">Name</th>
                      <th className="text-left py-4 px-6 text-gray-300 font-medium">Course</th>
                      <th className="text-left py-4 px-6 text-gray-300 font-medium">Status</th>
                      <th className="text-left py-4 px-6 text-gray-300 font-medium">Submitted</th>
                      <th className="text-left py-4 px-6 text-gray-300 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAdmissions.map((admission) => (
                      <tr key={admission._id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="py-4 px-6">
                          <div>
                            <div className="text-white font-medium">
                              {admission.firstName} {admission.lastName}
                            </div>
                            <div className="text-gray-400 text-sm">{admission.email}</div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span className="text-white">{admission.course}</span>
                        </td>
                        <td className="py-4 px-6">
                          <span className={cn(
                            'inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border',
                            statusColors[admission.status as keyof typeof statusColors]
                          )}>
                            {getStatusIcon(admission.status)}
                            <span className="ml-1 capitalize">{admission.status.replace('_', ' ')}</span>
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <span className="text-gray-300">
                            {new Date(admission.submittedAt).toLocaleDateString()}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center space-x-2">
                            {admission.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => handleQuickStatusUpdate(admission._id, 'accepted')}
                                  className="p-2 text-emerald-400 hover:text-emerald-300 transition-colors hover:bg-emerald-400/10 rounded"
                                  title="Accept Application - Will send acceptance email"
                                >
                                  <CheckCircle className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleQuickStatusUpdate(admission._id, 'rejected')}
                                  className="p-2 text-red-400 hover:text-red-300 transition-colors hover:bg-red-400/10 rounded"
                                  title="Reject Application - Will send rejection email"
                                >
                                  <XCircle className="w-4 h-4" />
                                </button>
                              </>
                            )}
                            {(admission.status === 'accepted' || admission.status === 'rejected') && (
                              <span className={cn(
                                'px-2 py-1 rounded text-xs font-medium',
                                admission.status === 'accepted' 
                                  ? 'bg-emerald-400/20 text-emerald-400' 
                                  : 'bg-red-400/20 text-red-400'
                              )}>
                                {admission.status === 'accepted' ? '✅ Accepted' : '❌ Rejected'}
                              </span>
                            )}
                            <button
                              onClick={() => handleViewDetails(admission)}
                              className="p-2 text-gray-400 hover:text-primary-gold transition-colors"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </GlassPanel>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex items-center justify-between mt-8">
                <div className="text-gray-300">
                  Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} results
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className="p-2 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  
                  {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={cn(
                        'px-3 py-1 rounded-lg transition-colors',
                        page === pagination.page
                          ? 'bg-primary-gold text-primary-black'
                          : 'text-gray-400 hover:text-white'
                      )}
                    >
                      {page}
                    </button>
                  ))}
                  
                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.pages}
                    className="p-2 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Detail Modal */}
      <AdmissionDetailModal
        admission={selectedAdmission}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedAdmission(null)
        }}
        onStatusUpdate={handleStatusUpdate}
        onDelete={handleDelete}
      />
    </div>
  )
}
