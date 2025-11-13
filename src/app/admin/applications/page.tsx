'use client'

import { useState, useEffect } from 'react'
import { GlassPanel } from '@/components/ui/GlassPanel'
import { 
  Users, 
  Search, 
  Eye, 
  Download, 
  Trash2, 
  Loader2,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  UserCheck,
  Award,
  Calendar,
  Mail,
  Phone,
  MapPin,
  Briefcase
} from 'lucide-react'
import toast from 'react-hot-toast'

interface Application {
  _id: string
  careerId: string
  careerTitle: string
  applicantInfo: {
    firstName: string
    lastName: string
    email: string
    phone: string
    countryCode: string
    location: string
  }
  resume: {
    filename: string
    originalName: string
    url: string
    size: number
  }
  experience: string
  status: 'pending' | 'reviewing' | 'shortlisted' | 'interviewed' | 'selected' | 'rejected'
  submittedAt: string
  reviewedAt?: string
  adminNotes?: string
}

interface ApplicationStats {
  pending: number
  reviewing: number
  shortlisted: number
  interviewed: number
  selected: number
  rejected: number
  total: number
}

export default function ApplicationsAdminPage() {
  const [applications, setApplications] = useState<Application[]>([])
  const [stats, setStats] = useState<ApplicationStats>({
    pending: 0,
    reviewing: 0,
    shortlisted: 0,
    interviewed: 0,
    selected: 0,
    rejected: 0,
    total: 0
  })
  const [loading, setLoading] = useState(true)
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    careerId: 'all'
  })

  useEffect(() => {
    fetchApplications()
  }, [filters])

  const fetchApplications = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filters.search) params.append('search', filters.search)
      if (filters.status !== 'all') params.append('status', filters.status)
      if (filters.careerId !== 'all') params.append('careerId', filters.careerId)

      const response = await fetch(`/api/applications?${params}`)
      const data = await response.json()

      if (response.ok) {
        setApplications(data.applications)
        setStats(data.stats)
      } else {
        toast.error('Failed to fetch applications')
      }
    } catch (error) {
      toast.error('Network error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleViewDetails = (application: Application) => {
    setSelectedApplication(application)
    setIsModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this application?')) return

    try {
      const response = await fetch(`/api/applications/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success('Application deleted successfully')
        fetchApplications()
      } else {
        toast.error('Failed to delete application')
      }
    } catch (error) {
      toast.error('Network error occurred')
    }
  }

  const updateApplicationStatus = async (id: string, status: string, adminNotes?: string) => {
    try {
      const response = await fetch(`/api/applications/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status, 
          adminNotes,
          reviewedBy: 'Admin' // In real app, get from auth context
        })
      })

      if (response.ok) {
        toast.success('Application status updated successfully')
        fetchApplications()
        setIsModalOpen(false)
      } else {
        toast.error('Failed to update application status')
      }
    } catch (error) {
      toast.error('Network error occurred')
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />
      case 'reviewing': return <AlertCircle className="w-4 h-4" />
      case 'shortlisted': return <UserCheck className="w-4 h-4" />
      case 'interviewed': return <Users className="w-4 h-4" />
      case 'selected': return <Award className="w-4 h-4" />
      case 'rejected': return <XCircle className="w-4 h-4" />
      default: return <Clock className="w-4 h-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-amber-500/20 text-amber-400 border-amber-500/30'
      case 'reviewing': return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      case 'shortlisted': return 'bg-purple-500/20 text-purple-400 border-purple-500/30'
      case 'interviewed': return 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30'
      case 'selected': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
      case 'rejected': return 'bg-red-500/20 text-red-400 border-red-500/30'
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Application Management</h1>
        <p className="text-gray-400">Review and manage job applications</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-6 mb-8">
        <GlassPanel className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total</p>
              <p className="text-2xl font-bold text-white">{stats.total}</p>
            </div>
            <Users className="w-8 h-8 text-primary-gold" />
          </div>
        </GlassPanel>

        <GlassPanel className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Pending</p>
              <p className="text-2xl font-bold text-amber-400">{stats.pending}</p>
            </div>
            <Clock className="w-8 h-8 text-amber-400" />
          </div>
        </GlassPanel>

        <GlassPanel className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Reviewing</p>
              <p className="text-2xl font-bold text-blue-400">{stats.reviewing}</p>
            </div>
            <AlertCircle className="w-8 h-8 text-blue-400" />
          </div>
        </GlassPanel>

        <GlassPanel className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Shortlisted</p>
              <p className="text-2xl font-bold text-purple-400">{stats.shortlisted}</p>
            </div>
            <UserCheck className="w-8 h-8 text-purple-400" />
          </div>
        </GlassPanel>

        <GlassPanel className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Interviewed</p>
              <p className="text-2xl font-bold text-indigo-400">{stats.interviewed}</p>
            </div>
            <Users className="w-8 h-8 text-indigo-400" />
          </div>
        </GlassPanel>

        <GlassPanel className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Selected</p>
              <p className="text-2xl font-bold text-emerald-400">{stats.selected}</p>
            </div>
            <Award className="w-8 h-8 text-emerald-400" />
          </div>
        </GlassPanel>

        <GlassPanel className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Rejected</p>
              <p className="text-2xl font-bold text-red-400">{stats.rejected}</p>
            </div>
            <XCircle className="w-8 h-8 text-red-400" />
          </div>
        </GlassPanel>
      </div>

      {/* Filters */}
      <GlassPanel className="p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-gold focus:border-transparent"
                placeholder="Search applications..."
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-gold focus:border-transparent"
            >
              <option value="all" className="bg-primary-black">All Status</option>
              <option value="pending" className="bg-primary-black">Pending</option>
              <option value="reviewing" className="bg-primary-black">Reviewing</option>
              <option value="shortlisted" className="bg-primary-black">Shortlisted</option>
              <option value="interviewed" className="bg-primary-black">Interviewed</option>
              <option value="selected" className="bg-primary-black">Selected</option>
              <option value="rejected" className="bg-primary-black">Rejected</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Position</label>
            <select
              value={filters.careerId}
              onChange={(e) => setFilters(prev => ({ ...prev, careerId: e.target.value }))}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-gold focus:border-transparent"
            >
              <option value="all" className="bg-primary-black">All Positions</option>
              {/* TODO: Populate with actual career options */}
            </select>
          </div>
        </div>
      </GlassPanel>

      {/* Applications List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary-gold" />
          <span className="ml-2 text-gray-300">Loading applications...</span>
        </div>
      ) : applications.length === 0 ? (
        <GlassPanel className="p-12 text-center">
          <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No applications found</h3>
          <p className="text-gray-400">No job applications match your current filters.</p>
        </GlassPanel>
      ) : (
        <GlassPanel className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5 border-b border-white/10">
                <tr>
                  <th className="text-left py-4 px-6 text-gray-300 font-medium">Applicant</th>
                  <th className="text-left py-4 px-6 text-gray-300 font-medium">Position</th>
                  <th className="text-left py-4 px-6 text-gray-300 font-medium">Experience</th>
                  <th className="text-left py-4 px-6 text-gray-300 font-medium">Status</th>
                  <th className="text-left py-4 px-6 text-gray-300 font-medium">Applied</th>
                  <th className="text-left py-4 px-6 text-gray-300 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((application) => (
                  <tr key={application._id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="py-4 px-6">
                      <div>
                        <div className="text-white font-medium">
                          {application.applicantInfo.firstName} {application.applicantInfo.lastName}
                        </div>
                        <div className="text-gray-400 text-sm flex items-center mt-1">
                          <Mail className="w-3 h-3 mr-1" />
                          {application.applicantInfo.email}
                        </div>
                        <div className="text-gray-400 text-sm flex items-center mt-1">
                          <MapPin className="w-3 h-3 mr-1" />
                          {application.applicantInfo.location}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-white font-medium">{application.careerTitle}</div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-gray-300">{application.experience}</span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(application.status)}`}>
                        {getStatusIcon(application.status)}
                        <span className="ml-1 capitalize">{application.status}</span>
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-gray-300 text-sm">
                        {formatDate(application.submittedAt)}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleViewDetails(application)}
                          className="p-2 text-gray-400 hover:text-primary-gold transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <a
                          href={application.resume.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 text-gray-400 hover:text-blue-400 transition-colors"
                          title="Download Resume"
                        >
                          <Download className="w-4 h-4" />
                        </a>
                        <button
                          onClick={() => handleDelete(application._id)}
                          className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                          title="Delete Application"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassPanel>
      )}

      {/* Application Detail Modal */}
      {isModalOpen && selectedApplication && (
        <ApplicationModal
          application={selectedApplication}
          onClose={() => {
            setIsModalOpen(false)
            setSelectedApplication(null)
          }}
          onUpdateStatus={updateApplicationStatus}
        />
      )}
    </div>
  )
}

// Application Detail Modal Component
function ApplicationModal({ 
  application, 
  onClose, 
  onUpdateStatus 
}: { 
  application: Application
  onClose: () => void
  onUpdateStatus: (id: string, status: string, adminNotes?: string) => void
}) {
  const [status, setStatus] = useState(application.status)
  const [adminNotes, setAdminNotes] = useState(application.adminNotes || '')
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    await onUpdateStatus(application._id, status, adminNotes)
    setSaving(false)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-primary-black border border-white/10 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <GlassPanel className="p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Application Details</h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white transition-colors"
            >
              <XCircle className="w-6 h-6" />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Applicant Information */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Applicant Information</h3>
              <div className="space-y-4">
                <div className="flex items-center text-gray-300">
                  <Users className="w-4 h-4 mr-3" />
                  <span>{application.applicantInfo.firstName} {application.applicantInfo.lastName}</span>
                </div>
                <div className="flex items-center text-gray-300">
                  <Mail className="w-4 h-4 mr-3" />
                  <span>{application.applicantInfo.email}</span>
                </div>
                <div className="flex items-center text-gray-300">
                  <Phone className="w-4 h-4 mr-3" />
                  <span>{application.applicantInfo.countryCode} {application.applicantInfo.phone}</span>
                </div>
                <div className="flex items-center text-gray-300">
                  <MapPin className="w-4 h-4 mr-3" />
                  <span>{application.applicantInfo.location}</span>
                </div>
                <div className="flex items-center text-gray-300">
                  <Briefcase className="w-4 h-4 mr-3" />
                  <span>{application.experience} experience</span>
                </div>
                <div className="flex items-center text-gray-300">
                  <Calendar className="w-4 h-4 mr-3" />
                  <span>Applied: {new Date(application.submittedAt).toLocaleDateString()}</span>
                </div>
              </div>

              <h3 className="text-lg font-semibold text-white mb-4 mt-8">Position Applied</h3>
              <div className="bg-white/5 rounded-lg p-4">
                <p className="text-white font-medium">{application.careerTitle}</p>
              </div>

              <h3 className="text-lg font-semibold text-white mb-4 mt-8">Resume</h3>
              <div className="bg-white/5 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">{application.resume.originalName}</p>
                    <p className="text-gray-400 text-sm">{formatFileSize(application.resume.size)}</p>
                  </div>
                  <a
                    href={application.resume.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-primary-gold text-primary-black rounded-lg font-semibold hover:shadow-gold-glow transition-all flex items-center"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </a>
                </div>
              </div>
            </div>

            {/* Management Section */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Application Management</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-gold focus:border-transparent"
                  >
                    <option value="pending" className="bg-primary-black">Pending Review</option>
                    <option value="reviewing" className="bg-primary-black">Under Review</option>
                    <option value="shortlisted" className="bg-primary-black">Shortlisted</option>
                    <option value="interviewed" className="bg-primary-black">Interviewed</option>
                    <option value="selected" className="bg-primary-black">Selected</option>
                    <option value="rejected" className="bg-primary-black">Rejected</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Admin Notes</label>
                  <textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    rows={6}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-gold focus:border-transparent resize-vertical"
                    placeholder="Add notes about this application..."
                  />
                  <p className="text-gray-400 text-xs mt-1">
                    These notes will be included in status update emails to the applicant.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/10">
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
                <CheckCircle className="w-4 h-4 mr-2" />
              )}
              Update Application
            </button>
          </div>
        </GlassPanel>
      </div>
    </div>
  )
}
