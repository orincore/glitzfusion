'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Calendar, 
  MapPin, 
  Users, 
  DollarSign, 
  Clock, 
  Phone, 
  Tag, 
  TrendingUp,
  Upload,
  X,
  Eye,
  EyeOff,
  RotateCcw,
  RotateCw,
  Image as ImageIcon,
  Video
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

interface FusionXEvent {
  _id: string
  title: string
  slug: string
  shortDescription: string
  longDescription: string
  eventType: string
  status: string
  isPast: boolean
  totalCapacity: number
  totalBookings: number
  revenue: number
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
    address: string
    city: string
    state: string
    pincode: string
    capacity: number
    facilities: string[]
  }
  pricing: Array<{
    category: string
    basePrice: number
    currentPrice: number
    description: string
    maxTickets: number
    soldTickets: number
  }>
  dynamicPricing: {
    enabled: boolean
    thresholdPercentage: number
    priceIncreasePercentage: number
    description?: string
  }
  poster: string
  gallery: string[]
  highlights: string[]
  videoTrailer?: string
  facilities: Array<{
    name: string
    description: string
    isIncluded: boolean
  }>
  tags: string[]
  ageRestriction?: number
  dresscode?: string
  contactPhone?: string
  createdAt: string
  updatedAt: string
}

export default function EventDetailsPage() {
  const router = useRouter()
  const params = useParams() as { id: string }
  const eventId = params.id

  const [event, setEvent] = useState<FusionXEvent | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [uploadingHighlights, setUploadingHighlights] = useState(false)
  const [selectedMedia, setSelectedMedia] = useState<string | null>(null)

  useEffect(() => {
    if (eventId) {
      fetchEvent()
    }
  }, [eventId])

  const fetchEvent = async () => {
    try {
      const token = localStorage.getItem('admin_token')
      const response = await fetch(`/api/fusionx-events/${eventId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setEvent(data)
      } else {
        setError('Failed to fetch event details')
      }
    } catch (error) {
      setError('Error fetching event details')
    } finally {
      setIsLoading(false)
    }
  }

  const handleStatusChange = async (newStatus: string) => {
    if (!event) return

    try {
      const token = localStorage.getItem('admin_token')
      const response = await fetch(`/api/fusionx-events/${eventId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          ...event, 
          status: newStatus,
          isPast: newStatus === 'completed'
        })
      })

      if (response.ok) {
        fetchEvent() // Refresh event data
      } else {
        setError('Failed to update event status')
      }
    } catch (error) {
      setError('Error updating event status')
    }
  }

  const handleHighlightsUpload = async (files: FileList) => {
    if (!files.length) return

    setUploadingHighlights(true)
    try {
      const token = localStorage.getItem('admin_token')
      const uploadPromises = Array.from(files).map(async (file) => {
        // 1) Get signed URL for highlights upload
        const signRes = await fetch('/api/upload/sign', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            fileName: file.name,
            fileType: file.type,
            uploadType: 'highlights',
            eventId: eventId
          })
        })

        if (!signRes.ok) {
          throw new Error('Failed to get signed URL')
        }

        const { uploadUrl, publicUrl } = await signRes.json()

        // 2) Upload directly to R2
        const uploadRes = await fetch(uploadUrl, {
          method: 'PUT',
          body: file,
          headers: {
            'Content-Type': file.type
          }
        })

        if (!uploadRes.ok) {
          throw new Error('Failed to upload to R2')
        }

        return publicUrl
      })

      const uploadedUrls = await Promise.all(uploadPromises)
      
      // Update event with new highlights
      const updatedHighlights = [...(event?.highlights || []), ...uploadedUrls]
      const response = await fetch(`/api/fusionx-events/${eventId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          ...event, 
          highlights: updatedHighlights
        })
      })

      if (response.ok) {
        fetchEvent() // Refresh event data
      }
    } catch (error) {
      setError('Error uploading highlights')
    } finally {
      setUploadingHighlights(false)
    }
  }

  const removeHighlight = async (urlToRemove: string) => {
    if (!event) return

    try {
      const token = localStorage.getItem('admin_token')
      const updatedHighlights = event.highlights.filter(url => url !== urlToRemove)
      
      const response = await fetch(`/api/fusionx-events/${eventId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          ...event, 
          highlights: updatedHighlights
        })
      })

      if (response.ok) {
        fetchEvent() // Refresh event data
      }
    } catch (error) {
      setError('Error removing highlight')
    }
  }

  const deleteEvent = async () => {
    if (!confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      return
    }

    try {
      const token = localStorage.getItem('admin_token')
      const response = await fetch(`/api/fusionx-events/${eventId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        router.push('/admin/fusionx-events')
      } else {
        setError('Failed to delete event')
      }
    } catch (error) {
      setError('Error deleting event')
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
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[status as keyof typeof statusColors] || 'bg-gray-600 text-gray-100'}`}>
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
      dandiya: 'bg-orange-600 text-orange-100',
      garba: 'bg-red-600 text-red-100',
      party: 'bg-indigo-600 text-indigo-100',
      other: 'bg-gray-600 text-gray-100'
    }

    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${typeColors[eventType as keyof typeof typeColors] || 'bg-gray-600 text-gray-100'}`}>
        {eventType === 'dandiya'
          ? 'DANDIYA NIGHT'
          : eventType === 'garba'
          ? 'GARBA NIGHT'
          : eventType === 'party'
          ? 'PARTY / CLUB NIGHT'
          : eventType.replace('_', ' ').toUpperCase()}
      </span>
    )
  }

  const isMediaVideo = (url: string) => {
    return url.match(/\.(mp4|webm|mov|avi)$/i)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-yellow-400"></div>
      </div>
    )
  }

  if (error || !event) {
    return (
      <div className="p-6">
        <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded-lg">
          {error || 'Event not found'}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/fusionx-events"
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-400" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white">{event.title}</h1>
            <div className="flex items-center gap-3 mt-2">
              {getEventTypeBadge(event.eventType)}
              {getStatusBadge(event.status)}
              {event.isPast && (
                <span className="px-2 py-1 bg-blue-600 text-blue-100 rounded-full text-xs font-medium">
                  PAST EVENT
                </span>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Status Conversion Buttons */}
          {event.isPast ? (
            <button
              onClick={() => handleStatusChange('published')}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
              title="Convert to Upcoming Event"
            >
              <RotateCcw className="h-4 w-4" />
              Make Upcoming
            </button>
          ) : (
            <button
              onClick={() => handleStatusChange('completed')}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              title="Convert to Past Event"
            >
              <RotateCw className="h-4 w-4" />
              Mark as Past
            </button>
          )}
          
          <Link
            href={`/admin/fusionx-events/${eventId}/edit`}
            className="flex items-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-black rounded-lg transition-colors"
          >
            <Edit className="h-4 w-4" />
            Edit Event
          </Link>
          
          <button
            onClick={deleteEvent}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Event Overview */}
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Event Overview</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-300 mb-2">Short Description</h3>
                <p className="text-white">{event.shortDescription}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-300 mb-2">Long Description</h3>
                <p className="text-white whitespace-pre-wrap">{event.longDescription}</p>
              </div>
            </div>
          </div>

          {/* Schedule & Location */}
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Schedule & Location
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-300 mb-3">Date & Time Slots</h3>
                <div className="space-y-3">
                  {event.dateSlots.map((dateSlot, dateIndex) => (
                    <div key={dateIndex} className="bg-gray-700 rounded-lg p-3">
                      <div className="text-white font-medium mb-2">
                        {new Date(dateSlot.date).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </div>
                      <div className="space-y-1">
                        {dateSlot.timeSlots.map((timeSlot, timeIndex) => (
                          <div key={timeIndex} className="flex justify-between text-sm">
                            <span className="text-gray-300">
                              {timeSlot.startTime} - {timeSlot.endTime}
                            </span>
                            <span className="text-gray-400">
                              {timeSlot.currentBookings}/{timeSlot.maxCapacity}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-300 mb-3">Location Details</h3>
                <div className="bg-gray-700 rounded-lg p-3 space-y-2">
                  <div className="text-white font-medium">{event.location.venue}</div>
                  <div className="text-gray-300 text-sm">{event.location.address}</div>
                  <div className="text-gray-300 text-sm">
                    {event.location.city}, {event.location.state} {event.location.pincode}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-400 mt-2">
                    <Users className="h-4 w-4" />
                    Capacity: {event.location.capacity}
                  </div>
                  {event.location.facilities.length > 0 && (
                    <div className="mt-2">
                      <div className="text-xs text-gray-400 mb-1">Facilities:</div>
                      <div className="flex flex-wrap gap-1">
                        {event.location.facilities.map((facility, index) => (
                          <span key={index} className="px-2 py-1 bg-gray-600 text-gray-200 rounded text-xs">
                            {facility}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Pricing Information */}
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Pricing Information
            </h2>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {event.pricing.map((price, index) => (
                  <div key={index} className="bg-gray-700 rounded-lg p-4">
                    <div className="text-white font-medium capitalize mb-1">
                      {price.category.replace('_', ' ')}
                    </div>
                    <div className="text-2xl font-bold text-yellow-400 mb-1">
                      ₹{price.currentPrice}
                      {price.currentPrice !== price.basePrice && (
                        <span className="text-sm text-gray-400 line-through ml-2">
                          ₹{price.basePrice}
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-300 mb-2">{price.description}</div>
                    <div className="text-xs text-gray-400">
                      Sold: {price.soldTickets}/{price.maxTickets}
                    </div>
                  </div>
                ))}
              </div>
              
              {event.dynamicPricing.enabled && (
                <div className="bg-yellow-900/20 border border-yellow-600/30 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-yellow-400 font-medium mb-2">
                    <TrendingUp className="h-4 w-4" />
                    Dynamic Pricing Active
                  </div>
                  <div className="text-sm text-gray-300">
                    Price increases by {event.dynamicPricing.priceIncreasePercentage}% when bookings reach {event.dynamicPricing.thresholdPercentage}%
                  </div>
                  {event.dynamicPricing.description && (
                    <div className="text-sm text-gray-400 mt-1">
                      {event.dynamicPricing.description}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Event Highlights Media */}
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <ImageIcon className="h-5 w-5" />
                Event Highlights
              </h2>
              <div>
                <input
                  type="file"
                  multiple
                  accept="image/*,video/*"
                  onChange={(e) => e.target.files && handleHighlightsUpload(e.target.files)}
                  className="hidden"
                  id="highlights-upload"
                  disabled={uploadingHighlights}
                />
                <label
                  htmlFor="highlights-upload"
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors cursor-pointer ${
                    uploadingHighlights
                      ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                      : 'bg-yellow-500 hover:bg-yellow-600 text-black'
                  }`}
                >
                  {uploadingHighlights ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-400 border-t-transparent"></div>
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4" />
                      Add Media
                    </>
                  )}
                </label>
              </div>
            </div>
            
            {event.highlights.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {event.highlights.map((url, index) => (
                  <div key={index} className="relative group">
                    <div className="aspect-square rounded-lg overflow-hidden bg-gray-700">
                      {isMediaVideo(url) ? (
                        <div className="relative w-full h-full">
                          <video
                            src={url}
                            className="w-full h-full object-cover"
                            muted
                          />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Video className="h-8 w-8 text-white/80" />
                          </div>
                        </div>
                      ) : (
                        <Image
                          src={url}
                          alt={`Highlight ${index + 1}`}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        />
                      )}
                    </div>
                    <div className="absolute top-2 right-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          removeHighlight(url)
                        }}
                        className="p-1 bg-red-500 hover:bg-red-600 text-white rounded-full"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedMedia(url)}
                      className="absolute inset-0 z-10 bg-black/0 hover:bg-black/20 transition-colors"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                <ImageIcon className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No highlights uploaded yet</p>
                <p className="text-sm">Upload images and videos to showcase this event</p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Event Poster */}
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Event Poster</h3>
            <div className="aspect-[3/4] rounded-lg overflow-hidden bg-gray-700">
              <Image
                src={event.poster}
                alt={event.title}
                width={300}
                height={400}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Quick Stats</h3>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-300">Total Capacity</span>
                <span className="text-white font-medium">{event.totalCapacity}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Total Bookings</span>
                <span className="text-white font-medium">{event.totalBookings}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Booking Rate</span>
                <span className="text-white font-medium">
                  {Math.round((event.totalBookings / event.totalCapacity) * 100)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Revenue</span>
                <span className="text-green-400 font-medium">₹{event.revenue.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Additional Details */}
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Additional Details</h3>
            <div className="space-y-3">
              {event.contactPhone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-300">Contact:</span>
                  <span className="text-white">{event.contactPhone}</span>
                </div>
              )}
              
              {event.ageRestriction && (
                <div className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-300">Age Restriction:</span>
                  <span className="text-white">{event.ageRestriction}+</span>
                </div>
              )}
              
              {event.dresscode && (
                <div className="flex items-center gap-2 text-sm">
                  <Tag className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-300">Dress Code:</span>
                  <span className="text-white">{event.dresscode}</span>
                </div>
              )}
              
              {event.tags.length > 0 && (
                <div>
                  <div className="text-sm text-gray-300 mb-2">Tags:</div>
                  <div className="flex flex-wrap gap-1">
                    {event.tags.map((tag, index) => (
                      <span key={index} className="px-2 py-1 bg-gray-700 text-gray-200 rounded text-xs">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Timestamps */}
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Timestamps</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-300">Created:</span>
                <span className="text-white">
                  {new Date(event.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Updated:</span>
                <span className="text-white">
                  {new Date(event.updatedAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Media Lightbox */}
      {selectedMedia && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
          <div className="relative max-w-4xl max-h-full">
            <button
              onClick={() => setSelectedMedia(null)}
              className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full z-10"
            >
              <X className="h-6 w-6" />
            </button>
            {isMediaVideo(selectedMedia) ? (
              <video
                src={selectedMedia}
                controls
                className="max-w-full max-h-full rounded-lg"
                autoPlay
              />
            ) : (
              <Image
                src={selectedMedia}
                alt="Event highlight"
                width={800}
                height={600}
                className="max-w-full max-h-full object-contain rounded-lg"
              />
            )}
          </div>
        </div>
      )}
    </div>
  )
}
