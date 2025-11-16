'use client'

import { useState, useEffect } from 'react'
import { Calendar, MapPin, Users, Plus, Edit, Trash2, Eye, Filter, DollarSign, TrendingUp } from 'lucide-react'
import Link from 'next/link'

interface FusionXEvent {
  _id: string
  title: string
  slug: string
  shortDescription: string
  eventType: string
  status: string
  isPast: boolean
  totalCapacity: number
  totalBookings: number
  totalRevenue: number
  paidBookings: number
  pendingBookings: number
  failedBookings: number
  // Real revenue data from API
  actualRevenue?: number
  actualBookings?: number
  actualMembers?: number
  dateSlots: Array<{
    date: string
    timeSlots: Array<{
      startTime: string
      endTime: string
      maxCapacity: number
      currentBookings: number
    }>
  }>
  location: {
    venue: string
    city: string
  }
  poster: string
  createdAt: string
  updatedAt: string
}

export default function FusionXEventsPage() {
  const [events, setEvents] = useState<FusionXEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState({
    status: '',
    eventType: '',
    isPast: ''
  })
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  })

  // Analytics stats from booking data
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalBookings: 0,
    totalMembers: 0,
  })

  useEffect(() => {
    fetchEvents()
  }, [filter, pagination.page])

  const fetchEvents = async () => {
    try {
      setIsLoading(true)
      const token = localStorage.getItem('admin_token')
      
      const queryParams = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(filter.status && { status: filter.status }),
        ...(filter.eventType && { eventType: filter.eventType }),
        ...(filter.isPast && { isPast: filter.isPast })
      })

      const response = await fetch(`/api/fusionx-events?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        setEvents(data.events)
        setPagination(data.pagination)

        // Fetch analytics stats for cards
        try {
          const analyticsRes = await fetch('/api/analytics/bookings', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          })

          if (analyticsRes.ok) {
            const analyticsData = await analyticsRes.json()
            if (analyticsData.success && analyticsData.data?.analytics?.revenue) {
              const r = analyticsData.data.analytics.revenue
              setStats({
                totalRevenue: r.totalRevenue || 0, // Already in rupees
                totalBookings: r.totalBookings || 0,
                totalMembers: r.totalMembers || 0,
              })
            } else {
              // Fallback: calculate from events data if analytics fails
              const totalRevenue = data.events.reduce((sum: number, event: FusionXEvent) => sum + (event.actualRevenue || 0), 0)
              const totalBookings = data.events.reduce((sum: number, event: FusionXEvent) => sum + (event.actualBookings || 0), 0)
              const totalMembers = data.events.reduce((sum: number, event: FusionXEvent) => sum + (event.actualMembers || 0), 0)
              
              setStats({
                totalRevenue,
                totalBookings,
                totalMembers,
              })
            }
          } else {
            // Fallback calculation
            const totalRevenue = data.events.reduce((sum: number, event: FusionXEvent) => sum + (event.actualRevenue || 0), 0)
            const totalBookings = data.events.reduce((sum: number, event: FusionXEvent) => sum + (event.actualBookings || 0), 0)
            const totalMembers = data.events.reduce((sum: number, event: FusionXEvent) => sum + (event.actualMembers || 0), 0)
            
            setStats({
              totalRevenue,
              totalBookings,
              totalMembers,
            })
          }
        } catch {
          // Fallback calculation
          const totalRevenue = data.events.reduce((sum: number, event: FusionXEvent) => sum + (event.actualRevenue || 0), 0)
          const totalBookings = data.events.reduce((sum: number, event: FusionXEvent) => sum + (event.actualBookings || 0), 0)
          const totalMembers = data.events.reduce((sum: number, event: FusionXEvent) => sum + (event.actualMembers || 0), 0)
          
          setStats({
            totalRevenue,
            totalBookings,
            totalMembers,
          })
        }
      } else {
        console.error('Failed to fetch events')
      }
    } catch (error) {
      console.error('Error fetching events:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const deleteEvent = async (eventId: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return

    try {
      const token = localStorage.getItem('admin_token')
      const response = await fetch(`/api/fusionx-events/${eventId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        fetchEvents() // Refresh the list
      } else {
        console.error('Failed to delete event')
      }
    } catch (error) {
      console.error('Error deleting event:', error)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusColors = {
      draft: 'bg-gray-600 text-gray-100',
      published: 'bg-green-600 text-green-100',
      sold_out: 'bg-red-600 text-red-100',
      cancelled: 'bg-red-800 text-red-100',
      completed: 'bg-blue-600 text-blue-100'
    }

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[status as keyof typeof statusColors] || 'bg-gray-600 text-gray-100'}`}>
        {status.replace('_', ' ').toUpperCase()}
      </span>
    )
  }

  const getEventTypeBadge = (eventType: string) => {
    const typeColors = {
      festival: 'bg-purple-600 text-purple-100',
      campus_tour: 'bg-blue-600 text-blue-100',
      brand_launch: 'bg-green-600 text-green-100',
      immersive_theatre: 'bg-pink-600 text-pink-100',
      neon_night: 'bg-yellow-600 text-yellow-900',
      other: 'bg-gray-600 text-gray-100'
    }

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${typeColors[eventType as keyof typeof typeColors] || 'bg-gray-600 text-gray-100'}`}>
        {eventType.replace('_', ' ').toUpperCase()}
      </span>
    )
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    }).format((amount || 0) / 100)
  }

  const formatCurrencyRupees = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    }).format(amount || 0)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-yellow-400"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">FusionX Events</h1>
          <p className="mt-2 text-gray-400">Manage FusionX events and experiences</p>
        </div>
        <Link
          href="/admin/fusionx-events/create"
          className="bg-yellow-500 hover:bg-yellow-600 text-black px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Create Event
        </Link>
      </div>

      {/* Revenue Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">Total Revenue</p>
              <p className="text-2xl font-bold text-white">
                {formatCurrencyRupees(stats.totalRevenue)}
              </p>
            </div>
            <DollarSign className="h-8 w-8 text-green-400" />
          </div>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">Total Bookings</p>
              <p className="text-2xl font-bold text-white">
                {stats.totalBookings}
              </p>
            </div>
            <Users className="h-8 w-8 text-blue-400" />
          </div>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">Total Members</p>
              <p className="text-2xl font-bold text-white">
                {stats.totalMembers}
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-emerald-400" />
          </div>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">Paid Bookings</p>
              <p className="text-2xl font-bold text-white">
                {events.reduce((sum, event) => sum + (event.paidBookings || 0), 0)}
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-emerald-400" />
          </div>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">Pending Bookings</p>
              <p className="text-2xl font-bold text-white">
                {events.reduce((sum, event) => sum + (event.pendingBookings || 0), 0)}
              </p>
            </div>
            <Calendar className="h-8 w-8 text-yellow-400" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-400">Filters:</span>
          </div>
          
          <select
            value={filter.status}
            onChange={(e) => setFilter(prev => ({ ...prev, status: e.target.value }))}
            className="bg-gray-700 border border-gray-600 text-white px-3 py-1 rounded text-sm"
          >
            <option value="">All Status</option>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="sold_out">Sold Out</option>
            <option value="cancelled">Cancelled</option>
            <option value="completed">Completed</option>
          </select>

          <select
            value={filter.eventType}
            onChange={(e) => setFilter(prev => ({ ...prev, eventType: e.target.value }))}
            className="bg-gray-700 border border-gray-600 text-white px-3 py-1 rounded text-sm"
          >
            <option value="">All Types</option>
            <option value="festival">Festival</option>
            <option value="campus_tour">Campus Tour</option>
            <option value="brand_launch">Brand Launch</option>
            <option value="immersive_theatre">Immersive Theatre</option>
            <option value="neon_night">Neon Night</option>
            <option value="other">Other</option>
          </select>

          <select
            value={filter.isPast}
            onChange={(e) => setFilter(prev => ({ ...prev, isPast: e.target.value }))}
            className="bg-gray-700 border border-gray-600 text-white px-3 py-1 rounded text-sm"
          >
            <option value="">All Events</option>
            <option value="false">Upcoming Events</option>
            <option value="true">Past Events</option>
          </select>
          
          <button
            onClick={() => setFilter({ status: '', eventType: '', isPast: '' })}
            className="px-3 py-1 bg-gray-600 hover:bg-gray-500 text-white rounded text-sm transition-colors"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Events List */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Event</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Location</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Capacity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Revenue</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {events.map((event) => (
                <tr key={event._id} className="hover:bg-gray-750">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <img
                          className="h-10 w-10 rounded-lg object-cover"
                          src={event.poster}
                          alt={event.title}
                        />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-white">{event.title}</div>
                        <div className="text-sm text-gray-400">{event.shortDescription.substring(0, 60)}...</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {getEventTypeBadge(event.eventType)}
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(event.status)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center text-sm text-gray-300">
                      <MapPin className="h-4 w-4 mr-1" />
                      <div>
                        <div>{event.location.venue}</div>
                        <div className="text-gray-500">{event.location.city}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center text-sm text-gray-300">
                      <Users className="h-4 w-4 mr-1" />
                      <div>
                        <div>{event.totalBookings}/{event.totalCapacity}</div>
                        <div className="text-gray-500">
                          {Math.round((event.totalBookings / event.totalCapacity) * 100)}% filled
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-300">
                      {formatCurrencyRupees(event.actualRevenue || event.totalRevenue || 0)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/admin/fusionx-events/${event._id}`}
                        className="text-blue-400 hover:text-blue-300 p-1"
                        title="View"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                      <Link
                        href={`/admin/fusionx-events/${event._id}/edit`}
                        className="text-green-400 hover:text-green-300 p-1"
                        title="Edit"
                      >
                        <Edit className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => deleteEvent(event._id)}
                        className="text-red-400 hover:text-red-300 p-1"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="px-6 py-3 border-t border-gray-700 flex items-center justify-between">
            <div className="text-sm text-gray-400">
              Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} events
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                disabled={pagination.page === 1}
                className="px-3 py-1 bg-gray-700 text-white rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                disabled={pagination.page === pagination.pages}
                className="px-3 py-1 bg-gray-700 text-white rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {events.length === 0 && (
        <div className="text-center py-12">
          <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No events found</h3>
          <p className="text-gray-400 mb-4">Get started by creating your first FusionX event.</p>
          <Link
            href="/admin/fusionx-events/create"
            className="bg-yellow-500 hover:bg-yellow-600 text-black px-4 py-2 rounded-lg font-medium inline-flex items-center gap-2 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Create Event
          </Link>
        </div>
      )}
    </div>
  )
}
