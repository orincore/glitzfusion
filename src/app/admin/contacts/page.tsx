'use client'

import { useState, useEffect } from 'react'
import { GlassPanel } from '@/components/ui/GlassPanel'
import { 
  MessageCircle, 
  Search, 
  Filter, 
  Eye, 
  Trash2, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  User,
  Mail,
  Phone,
  Calendar,
  Edit,
  Save,
  Loader2
} from 'lucide-react'
import toast from 'react-hot-toast'
import { IContact } from '@/models/Contact'

interface ContactStats {
  pending: number
  in_progress: number
  resolved: number
  closed: number
  total: number
}

interface ContactFilters {
  status: string
  category: string
  priority: string
  search: string
  sortBy: string
  sortOrder: 'asc' | 'desc'
}

const statusColors = {
  pending: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  in_progress: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  resolved: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  closed: 'bg-gray-500/20 text-gray-400 border-gray-500/30'
}

const statusIcons = {
  pending: Clock,
  in_progress: AlertCircle,
  resolved: CheckCircle,
  closed: XCircle
}

const priorityColors = {
  low: 'text-green-400',
  medium: 'text-yellow-400',
  high: 'text-red-400'
}

export default function ContactsAdminPage() {
  const [contacts, setContacts] = useState<IContact[]>([])
  const [stats, setStats] = useState<ContactStats>({
    pending: 0,
    in_progress: 0,
    resolved: 0,
    closed: 0,
    total: 0
  })
  const [loading, setLoading] = useState(true)
  const [selectedContact, setSelectedContact] = useState<IContact | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [filters, setFilters] = useState<ContactFilters>({
    status: 'all',
    category: 'all',
    priority: 'all',
    search: '',
    sortBy: 'submittedAt',
    sortOrder: 'desc'
  })

  const fetchContacts = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filters.status !== 'all') params.append('status', filters.status)
      if (filters.category !== 'all') params.append('category', filters.category)
      if (filters.priority !== 'all') params.append('priority', filters.priority)
      if (filters.search) params.append('search', filters.search)
      params.append('sortBy', filters.sortBy)
      params.append('sortOrder', filters.sortOrder)

      const response = await fetch(`/api/contacts?${params}`)
      const data = await response.json()

      if (response.ok) {
        setContacts(data.contacts)
        setStats(data.stats)
      } else {
        toast.error('Failed to fetch contacts')
      }
    } catch (error) {
      toast.error('Network error occurred')
      console.error('Fetch contacts error:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchContacts()
  }, [filters])

  const handleViewDetails = (contact: IContact) => {
    setSelectedContact(contact)
    setIsModalOpen(true)
  }

  const handleDeleteContact = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this contact?')) return

    try {
      const response = await fetch(`/api/contacts/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success('Contact deleted successfully')
        fetchContacts()
      } else {
        toast.error('Failed to delete contact')
      }
    } catch (error) {
      toast.error('Network error occurred')
      console.error('Delete contact error:', error)
    }
  }

  const getStatusIcon = (status: string) => {
    const Icon = statusIcons[status as keyof typeof statusIcons] || Clock
    return <Icon className="w-4 h-4" />
  }

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Contact Management</h1>
        <p className="text-gray-400">Manage and respond to contact requests</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <GlassPanel className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total</p>
              <p className="text-2xl font-bold text-white">{stats.total}</p>
            </div>
            <MessageCircle className="w-8 h-8 text-primary-gold" />
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
              <p className="text-gray-400 text-sm">In Progress</p>
              <p className="text-2xl font-bold text-blue-400">{stats.in_progress}</p>
            </div>
            <AlertCircle className="w-8 h-8 text-blue-400" />
          </div>
        </GlassPanel>

        <GlassPanel className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Resolved</p>
              <p className="text-2xl font-bold text-emerald-400">{stats.resolved}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-emerald-400" />
          </div>
        </GlassPanel>

        <GlassPanel className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Closed</p>
              <p className="text-2xl font-bold text-gray-400">{stats.closed}</p>
            </div>
            <XCircle className="w-8 h-8 text-gray-400" />
          </div>
        </GlassPanel>
      </div>

      {/* Filters */}
      <GlassPanel className="p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-gold focus:border-transparent"
                placeholder="Search contacts..."
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
              <option value="in_progress" className="bg-primary-black">In Progress</option>
              <option value="resolved" className="bg-primary-black">Resolved</option>
              <option value="closed" className="bg-primary-black">Closed</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
            <select
              value={filters.category}
              onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-gold focus:border-transparent"
            >
              <option value="all" className="bg-primary-black">All Categories</option>
              <option value="general" className="bg-primary-black">General</option>
              <option value="admissions" className="bg-primary-black">Admissions</option>
              <option value="courses" className="bg-primary-black">Courses</option>
              <option value="technical" className="bg-primary-black">Technical</option>
              <option value="partnership" className="bg-primary-black">Partnership</option>
              <option value="other" className="bg-primary-black">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Priority</label>
            <select
              value={filters.priority}
              onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-gold focus:border-transparent"
            >
              <option value="all" className="bg-primary-black">All Priorities</option>
              <option value="low" className="bg-primary-black">Low</option>
              <option value="medium" className="bg-primary-black">Medium</option>
              <option value="high" className="bg-primary-black">High</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Sort By</label>
            <select
              value={`${filters.sortBy}-${filters.sortOrder}`}
              onChange={(e) => {
                const [sortBy, sortOrder] = e.target.value.split('-')
                setFilters(prev => ({ ...prev, sortBy, sortOrder: sortOrder as 'asc' | 'desc' }))
              }}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-gold focus:border-transparent"
            >
              <option value="submittedAt-desc" className="bg-primary-black">Newest First</option>
              <option value="submittedAt-asc" className="bg-primary-black">Oldest First</option>
              <option value="firstName-asc" className="bg-primary-black">Name A-Z</option>
              <option value="firstName-desc" className="bg-primary-black">Name Z-A</option>
              <option value="priority-desc" className="bg-primary-black">High Priority First</option>
            </select>
          </div>
        </div>
      </GlassPanel>

      {/* Contacts List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary-gold" />
          <span className="ml-2 text-gray-300">Loading contacts...</span>
        </div>
      ) : contacts.length === 0 ? (
        <GlassPanel className="p-12 text-center">
          <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No contacts found</h3>
          <p className="text-gray-400">No contact requests match your current filters.</p>
        </GlassPanel>
      ) : (
        <GlassPanel className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5 border-b border-white/10">
                <tr>
                  <th className="text-left py-4 px-6 text-gray-300 font-medium">Contact</th>
                  <th className="text-left py-4 px-6 text-gray-300 font-medium">Subject</th>
                  <th className="text-left py-4 px-6 text-gray-300 font-medium">Category</th>
                  <th className="text-left py-4 px-6 text-gray-300 font-medium">Priority</th>
                  <th className="text-left py-4 px-6 text-gray-300 font-medium">Status</th>
                  <th className="text-left py-4 px-6 text-gray-300 font-medium">Submitted</th>
                  <th className="text-left py-4 px-6 text-gray-300 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {contacts.map((contact) => (
                  <tr key={contact._id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="py-4 px-6">
                      <div>
                        <div className="text-white font-medium">
                          {contact.firstName} {contact.lastName}
                        </div>
                        <div className="text-gray-400 text-sm">{contact.email}</div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-white max-w-xs truncate" title={contact.subject}>
                        {contact.subject}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-gray-300 capitalize">
                        {contact.category}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`font-medium capitalize ${priorityColors[contact.priority as keyof typeof priorityColors]}`}>
                        {contact.priority}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${statusColors[contact.status as keyof typeof statusColors]}`}>
                        {getStatusIcon(contact.status)}
                        <span className="ml-1 capitalize">{contact.status.replace('_', ' ')}</span>
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-gray-300 text-sm">
                        {formatDate(contact.submittedAt)}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleViewDetails(contact)}
                          className="p-2 text-gray-400 hover:text-primary-gold transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteContact(contact._id)}
                          className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                          title="Delete Contact"
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

      {/* Contact Detail Modal */}
      {isModalOpen && selectedContact && (
        <ContactDetailModal
          contact={selectedContact}
          onClose={() => {
            setIsModalOpen(false)
            setSelectedContact(null)
          }}
          onUpdate={() => {
            fetchContacts()
            setIsModalOpen(false)
            setSelectedContact(null)
          }}
        />
      )}
    </div>
  )
}

// Contact Detail Modal Component
function ContactDetailModal({ 
  contact, 
  onClose, 
  onUpdate 
}: { 
  contact: IContact
  onClose: () => void
  onUpdate: () => void
}) {
  const [status, setStatus] = useState(contact.status)
  const [adminNotes, setAdminNotes] = useState(contact.adminNotes || '')
  const [assignedTo, setAssignedTo] = useState(contact.assignedTo || '')
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    
    console.log('🔄 Updating contact with:', {
      contactId: contact._id,
      originalStatus: contact.status,
      newStatus: status,
      originalNotes: contact.adminNotes || '',
      newNotes: adminNotes,
      assignedTo
    })
    
    try {
      const response = await fetch(`/api/contacts/${contact._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          adminNotes,
          assignedTo
        })
      })

      const responseData = await response.json()
      console.log('📧 API Response:', responseData)

      if (response.ok) {
        toast.success('Contact updated successfully - Check console for email status')
        onUpdate()
      } else {
        toast.error('Failed to update contact')
        console.error('❌ Update failed:', responseData)
      }
    } catch (error) {
      toast.error('Network error occurred')
      console.error('Update contact error:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this contact?')) return

    try {
      const response = await fetch(`/api/contacts/${contact._id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success('Contact deleted successfully')
        onUpdate()
      } else {
        toast.error('Failed to delete contact')
      }
    } catch (error) {
      toast.error('Network error occurred')
      console.error('Delete contact error:', error)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-primary-black border border-white/10 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <GlassPanel className="p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Contact Details</h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white transition-colors"
            >
              <XCircle className="w-6 h-6" />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Contact Information */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Contact Information</h3>
              <div className="space-y-4">
                <div className="flex items-center text-gray-300">
                  <User className="w-4 h-4 mr-3" />
                  <span>{contact.firstName} {contact.lastName}</span>
                </div>
                <div className="flex items-center text-gray-300">
                  <Mail className="w-4 h-4 mr-3" />
                  <span>{contact.email}</span>
                </div>
                {contact.phone && (
                  <div className="flex items-center text-gray-300">
                    <Phone className="w-4 h-4 mr-3" />
                    <span>{contact.countryCode} {contact.phone}</span>
                  </div>
                )}
                <div className="flex items-center text-gray-300">
                  <Calendar className="w-4 h-4 mr-3" />
                  <span>Submitted: {new Date(contact.submittedAt).toLocaleDateString()}</span>
                </div>
              </div>

              <h3 className="text-lg font-semibold text-white mb-4 mt-8">Request Details</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-gray-400 text-sm">Subject</label>
                  <p className="text-white">{contact.subject}</p>
                </div>
                <div>
                  <label className="text-gray-400 text-sm">Category</label>
                  <p className="text-white capitalize">{contact.category}</p>
                </div>
                <div>
                  <label className="text-gray-400 text-sm">Priority</label>
                  <p className={`font-medium capitalize ${priorityColors[contact.priority as keyof typeof priorityColors]}`}>
                    {contact.priority}
                  </p>
                </div>
                <div>
                  <label className="text-gray-400 text-sm">Message</label>
                  <div className="bg-white/5 rounded-lg p-4 mt-2">
                    <p className="text-white whitespace-pre-wrap">{contact.message}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Management Section */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Management</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as 'pending' | 'in_progress' | 'resolved' | 'closed')}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-gold focus:border-transparent"
                  >
                    <option value="pending" className="bg-primary-black">Pending</option>
                    <option value="in_progress" className="bg-primary-black">In Progress</option>
                    <option value="resolved" className="bg-primary-black">Resolved</option>
                    <option value="closed" className="bg-primary-black">Closed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Assigned To</label>
                  <input
                    type="text"
                    value={assignedTo}
                    onChange={(e) => setAssignedTo(e.target.value)}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-gold focus:border-transparent"
                    placeholder="Assign to team member..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Admin Notes</label>
                  <textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    rows={6}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-gold focus:border-transparent resize-vertical"
                    placeholder="Add internal notes or response details..."
                  />
                  <p className="text-gray-400 text-xs mt-1">
                    These notes will be included in status update emails to the user.
                  </p>
                </div>
              </div>
            </div>
          </div>

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
      </div>
    </div>
  )
}
