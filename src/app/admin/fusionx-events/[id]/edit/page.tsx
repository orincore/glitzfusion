'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, AlertCircle, Plus, Minus, Upload, Calendar, MapPin, DollarSign, Settings, TrendingUp } from 'lucide-react'

interface TimeSlot {
  startTime: string
  endTime: string
  maxCapacity: number
}

interface DateSlot {
  date: string
  timeSlots: TimeSlot[]
}

interface Location {
  venue: string
  address: string
  city: string
  state: string
  pincode: string
  capacity: number
  facilities: string[]
}

interface Pricing {
  category: string
  basePrice: number
  currentPrice: number
  description: string
  maxTickets: number
}

interface Facility {
  name: string
  description: string
  isIncluded: boolean
}

interface DynamicPricingConfig {
  enabled: boolean
  thresholdPercentage: number
  priceIncreasePercentage: number
  description?: string
}

interface EventFormData {
  title: string
  shortDescription: string
  longDescription: string
  eventType: string
  dateSlots: DateSlot[]
  duration: number
  location: Location
  pricing: Pricing[]
  facilities: Facility[]
  tags: string[]
  ageRestriction?: number
  dresscode?: string
  status: string
  contactPhone?: string
  dynamicPricing: DynamicPricingConfig
  poster?: string
  highlights?: string[]
  ticketTemplate?: string
}

interface FusionXEvent extends EventFormData {
  _id: string
  slug: string
}

export default function EditFusionXEventPage() {
  const router = useRouter()
  const params = useParams()
  const id = params?.id as string | undefined

  const [event, setEvent] = useState<FusionXEvent | null>(null)
  const [formData, setFormData] = useState<EventFormData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [uploadingPoster, setUploadingPoster] = useState(false)
  const [uploadingTicketTemplate, setUploadingTicketTemplate] = useState(false)
  const [uploadingHighlights, setUploadingHighlights] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    ;(async () => {
      try {
        const token = localStorage.getItem('admin_token')
        const res = await fetch(`/api/fusionx-events/${id}`, {
          headers: {
            Authorization: `Bearer ${token ?? ''}`,
          },
        })

        if (!res.ok) {
          setError('Failed to load event')
          return
        }

        const data = (await res.json()) as FusionXEvent
        setEvent(data)

        // Normalize dateSlots for form inputs
        const normalizedDateSlots: DateSlot[] = (data.dateSlots && data.dateSlots.length > 0)
          ? data.dateSlots.map((slot) => ({
              date: slot.date ? new Date(slot.date as any).toISOString().slice(0, 10) : '',
              timeSlots: (slot.timeSlots && slot.timeSlots.length > 0)
                ? slot.timeSlots
                : [{ startTime: '18:00', endTime: '23:00', maxCapacity: 100 }]
            }))
          : [{
              date: '',
              timeSlots: [{ startTime: '18:00', endTime: '23:00', maxCapacity: 100 }]
            }]

        setFormData({
          title: data.title,
          shortDescription: data.shortDescription,
          longDescription: data.longDescription,
          eventType: data.eventType,
          dateSlots: normalizedDateSlots,
          duration: data.duration || 5,
          location: data.location || {
            venue: '',
            address: '',
            city: '',
            state: '',
            pincode: '',
            capacity: 100,
            facilities: []
          },
          pricing: data.pricing || [{
            category: 'regular',
            basePrice: 1000,
            currentPrice: 1000,
            description: 'Regular Entry',
            maxTickets: 100
          }],
          facilities: data.facilities || [
            { name: 'Parking', description: 'Free parking available', isIncluded: true },
            { name: 'Food Court', description: 'Multiple food vendors', isIncluded: true },
            { name: 'Security', description: '24/7 security coverage', isIncluded: true },
            { name: 'Restrooms', description: 'Clean restroom facilities', isIncluded: true }
          ],
          tags: data.tags || [],
          ageRestriction: data.ageRestriction,
          dresscode: data.dresscode,
          status: data.status,
          contactPhone: data.contactPhone ?? '',
          dynamicPricing: data.dynamicPricing || {
            enabled: true,
            thresholdPercentage: 50,
            priceIncreasePercentage: 20,
            description: 'Automatic price increase when bookings cross threshold'
          },
          poster: data.poster,
          highlights: data.highlights || [],
          ticketTemplate: (data as any).ticketTemplate,
        })
      } catch (e) {
        setError('Error loading event')
      } finally {
        setIsLoading(false)
      }
    })()
  }, [id])

  const handleChange = (field: keyof EventFormData, value: any) => {
    if (!formData) return
    setFormData({ ...formData, [field]: value })
  }

  const handlePosterUpload = async (file: File) => {
    if (!id) return
    setUploadingPoster(true)
    try {
      const token = localStorage.getItem('admin_token')
      if (!token) {
        setError('Not authenticated')
        return
      }

      // 1) Ask backend for a signed R2 upload URL
      const signRes = await fetch('/api/upload/sign', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          fileName: file.name,
          fileType: file.type,
          uploadType: 'poster',
          eventId: id,
        }),
      })

      if (!signRes.ok) {
        setError('Failed to prepare poster upload')
        return
      }

      const { uploadUrl, publicUrl } = await signRes.json()

      // 2) Upload file directly to R2 using signed URL
      const putRes = await fetch(uploadUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': file.type,
        },
        body: file,
      })

      if (!putRes.ok) {
        setError('Failed to upload poster to storage')
        return
      }

      // 3) Save final public URL in form state
      setFormData(prev => prev ? { ...prev, poster: publicUrl } : null)
    } catch (error) {
      setError('Error uploading poster')
    } finally {
      setUploadingPoster(false)
    }
  }

  const handleTicketTemplateUpload = async (file: File) => {
    if (!id) return
    setUploadingTicketTemplate(true)
    try {
      const token = localStorage.getItem('admin_token')
      if (!token) {
        setError('Not authenticated')
        return
      }

      // 1) Get signed URL for ticket template upload
      const signRes = await fetch('/api/upload/sign', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          fileName: file.name,
          fileType: file.type,
          uploadType: 'ticket-template',
          eventId: id,
        }),
      })

      if (!signRes.ok) {
        setError('Failed to prepare ticket template upload')
        return
      }

      const { uploadUrl, publicUrl } = await signRes.json()

      // 2) Upload file directly to R2
      const putRes = await fetch(uploadUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': file.type,
        },
        body: file,
      })

      if (!putRes.ok) {
        setError('Failed to upload ticket template to storage')
        return
      }

      // 3) Store final URL
      setFormData(prev => prev ? { ...prev, ticketTemplate: publicUrl } : null)
    } catch (error) {
      setError('Error uploading ticket template')
    } finally {
      setUploadingTicketTemplate(false)
    }
  }

  const handleTicketTemplateRemove = async () => {
    if (!formData?.ticketTemplate) return

    try {
      const token = localStorage.getItem('admin_token')
      const response = await fetch('/api/upload/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ url: formData.ticketTemplate })
      })

      if (!response.ok) {
        console.error('Failed to delete ticket template from R2')
      }
    } catch (error) {
      console.error('Error deleting ticket template from R2:', error)
    } finally {
      setFormData(prev => prev ? { ...prev, ticketTemplate: undefined } : null)
    }
  }

  const handleHighlightsUpload = async (files: FileList) => {
    if (!id || !files.length) return
    setUploadingHighlights(true)
    try {
      const token = localStorage.getItem('admin_token')
      if (!token) {
        setError('Not authenticated')
        return
      }

      const uploadPromises = Array.from(files).map(async (file) => {
        // 1) Get signed URL for each highlight file
        const signRes = await fetch('/api/upload/sign', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            fileName: file.name,
            fileType: file.type,
            uploadType: 'highlights',
            eventId: id,
          }),
        })

        if (!signRes.ok) {
          throw new Error(`Failed to prepare upload for ${file.name}`)
        }

        const { uploadUrl, publicUrl } = await signRes.json()

        // 2) Upload directly to R2
        const putRes = await fetch(uploadUrl, {
          method: 'PUT',
          headers: {
            'Content-Type': file.type,
          },
          body: file,
        })

        if (!putRes.ok) {
          throw new Error(`Failed to upload ${file.name} to storage`)
        }

        return publicUrl as string
      })

      const uploadedUrls = await Promise.all(uploadPromises)
      
      setFormData(prev => prev ? {
        ...prev,
        highlights: [...(prev.highlights || []), ...uploadedUrls]
      } : null)
    } catch (error) {
      console.error('Highlights upload error:', error)
      setError(error instanceof Error ? error.message : 'Failed to upload highlight media')
    } finally {
      setUploadingHighlights(false)
    }
  }

  const handleHighlightsRemove = async (mediaUrl: string, index: number) => {
    if (!formData?.highlights) return

    try {
      const token = localStorage.getItem('admin_token')
      const response = await fetch('/api/upload/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ url: mediaUrl })
      })

      if (!response.ok) {
        console.error('Failed to delete highlight media from R2')
      }
    } catch (error) {
      console.error('Error deleting highlight media from R2:', error)
    } finally {
      setFormData(prev => prev ? { 
        ...prev, 
        highlights: prev.highlights?.filter((_, i) => i !== index) || []
      } : null)
    }
  }

  const addDateSlot = () => {
    if (!formData) return
    setFormData({
      ...formData,
      dateSlots: [...formData.dateSlots, {
        date: '',
        timeSlots: [{
          startTime: '18:00',
          endTime: '23:00',
          maxCapacity: 100
        }]
      }]
    })
  }

  const removeDateSlot = (index: number) => {
    if (!formData) return
    setFormData({
      ...formData,
      dateSlots: formData.dateSlots.filter((_, i) => i !== index)
    })
  }

  const addTimeSlot = (dateIndex: number) => {
    if (!formData) return
    setFormData({
      ...formData,
      dateSlots: formData.dateSlots.map((dateSlot, i) => 
        i === dateIndex 
          ? {
              ...dateSlot,
              timeSlots: [...dateSlot.timeSlots, {
                startTime: '18:00',
                endTime: '23:00',
                maxCapacity: 100
              }]
            }
          : dateSlot
      )
    })
  }

  const removeTimeSlot = (dateIndex: number, timeIndex: number) => {
    if (!formData) return
    setFormData({
      ...formData,
      dateSlots: formData.dateSlots.map((dateSlot, i) => 
        i === dateIndex 
          ? {
              ...dateSlot,
              timeSlots: dateSlot.timeSlots.filter((_, j) => j !== timeIndex)
            }
          : dateSlot
      )
    })
  }

  const addPricing = () => {
    if (!formData) return
    setFormData({
      ...formData,
      pricing: [...formData.pricing, {
        category: 'regular',
        basePrice: 1000,
        currentPrice: 1000,
        description: '',
        maxTickets: 100
      }]
    })
  }

  const removePricing = (index: number) => {
    if (!formData) return
    setFormData({
      ...formData,
      pricing: formData.pricing.filter((_, i) => i !== index)
    })
  }

  const addFacility = () => {
    setFormData(prev => prev ? {
      ...prev,
      facilities: [
        ...prev.facilities,
        {
          name: '',
          description: '',
          isIncluded: true,
        },
      ],
    } : prev)
  }

  const removeFacility = (index: number) => {
    setFormData(prev => prev ? {
      ...prev,
      facilities: prev.facilities.filter((_, i) => i !== index),
    } : prev)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!event || !formData || !id) return

    setIsSaving(true)
    setError(null)
    try {
      const token = localStorage.getItem('admin_token')
      const res = await fetch(`/api/fusionx-events/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token ?? ''}`,
        },
        body: JSON.stringify({
          ...event,
          ...formData,
        }),
      })

      if (!res.ok) {
        setError('Failed to save changes')
        return
      }

      router.push('/admin/fusionx-events')
    } catch (e) {
      setError('Error saving changes')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading || !formData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-yellow-400" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/fusionx-events"
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-400" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white">Edit FusionX Event</h1>
            <p className="mt-1 text-gray-400 text-sm">Update basic details for this event</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-lg border border-red-500 bg-red-900/40 px-4 py-3 text-sm text-red-100">
          <AlertCircle className="h-4 w-4 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form id="event-edit-form" onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <h2 className="text-lg font-semibold text-white mb-4">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Event Title *</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 text-white px-3 py-2 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Event Type *</label>
              <select
                required
                value={formData.eventType}
                onChange={(e) => handleChange('eventType', e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 text-white px-3 py-2 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
              >
                <option value="festival">Festival</option>
                <option value="campus_tour">Campus Tour</option>
                <option value="brand_launch">Brand Launch</option>
                <option value="immersive_theatre">Immersive Theatre</option>
                <option value="neon_night">Neon Night</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Duration (hours) *</label>
              <input
                type="number"
                required
                min="1"
                max="24"
                value={formData.duration}
                onChange={(e) => handleChange('duration', parseInt(e.target.value))}
                className="w-full bg-gray-700 border border-gray-600 text-white px-3 py-2 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Status *</label>
              <select
                required
                value={formData.status}
                onChange={(e) => handleChange('status', e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 text-white px-3 py-2 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="sold_out">Sold Out</option>
                <option value="cancelled">Cancelled</option>
                <option value="completed">Completed (Past)</option>
              </select>
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">Short Description *</label>
            <textarea
              required
              rows={2}
              value={formData.shortDescription}
              onChange={(e) => handleChange('shortDescription', e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 text-white px-3 py-2 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
              placeholder="Brief description for event cards and previews"
            />
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">Long Description *</label>
            <textarea
              required
              rows={4}
              value={formData.longDescription}
              onChange={(e) => handleChange('longDescription', e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 text-white px-3 py-2 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
              placeholder="Detailed description with event highlights, what to expect, etc."
            />
          </div>
        </div>

        {/* Poster Upload */}
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <h2 className="text-lg font-semibold text-white mb-4">Event Poster</h2>
          <div className="flex items-start gap-6">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-300 mb-2">Upload Poster *</label>
              <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => e.target.files?.[0] && handlePosterUpload(e.target.files[0])}
                  className="hidden"
                  id="poster-upload"
                  disabled={uploadingPoster}
                />
                <label
                  htmlFor="poster-upload"
                  className={`cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                    uploadingPoster
                      ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                      : 'bg-yellow-500 hover:bg-yellow-600 text-black'
                  }`}
                >
                  {uploadingPoster ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-400 border-t-transparent"></div>
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4" />
                      Choose Poster Image
                    </>
                  )}
                </label>
                <p className="text-gray-400 text-sm mt-2">PNG, JPG up to 10MB</p>
              </div>
            </div>
            {formData.poster && (
              <div className="w-32 h-40">
                <img
                  src={formData.poster}
                  alt="Event poster"
                  className="w-full h-full object-cover rounded-lg border border-gray-600"
                />
              </div>
            )}
          </div>
        </div>

        {/* Event Highlights */}
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Event Highlights
          </h2>
          
          <div className="space-y-4">
            {/* Upload Control */}
            <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center">
              <input
                type="file"
                accept="image/*,video/*"
                multiple
                onChange={(e) => e.target.files && handleHighlightsUpload(e.target.files)}
                className="hidden"
                id="highlights-upload"
                disabled={uploadingHighlights}
              />
              <label
                htmlFor="highlights-upload"
                className={`cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  uploadingHighlights
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    : 'bg-purple-500 hover:bg-purple-600 text-white'
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
                    Upload Event Highlights
                  </>
                )}
              </label>
              <p className="text-gray-400 text-sm mt-2">Images (PNG, JPG) up to 10MB, Videos (MP4, MOV) up to 100MB each.</p>
            </div>

            {/* Highlights Grid */}
            {formData.highlights && formData.highlights.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {formData.highlights.map((mediaUrl, index) => (
                  <div key={index} className="relative group">
                    {mediaUrl.match(/\.(mp4|webm|mov|avi)$/i) ? (
                      <video
                        src={mediaUrl}
                        className="w-full h-32 object-cover rounded-lg border border-gray-600"
                        muted
                        preload="metadata"
                      />
                    ) : (
                      <img
                        src={mediaUrl}
                        alt={`Highlight ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg border border-gray-600"
                      />
                    )}
                    <button
                      type="button"
                      onClick={() => handleHighlightsRemove(mediaUrl, index)}
                      className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}

            {(!formData.highlights || formData.highlights.length === 0) && (
              <div className="text-center py-8 text-gray-400">
                <p>No event highlights uploaded yet.</p>
                <p className="text-sm">Upload images and videos to showcase event highlights and recap content.</p>
              </div>
            )}
          </div>
        </div>

        {/* Ticket Template (Optional) */}
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Ticket Template (Optional)
          </h2>
          <div className="space-y-6">
            {/* Upload Control */}
            {formData.ticketTemplate ? (
              <div className="flex items-start gap-4">
                <div className="relative">
                  <img
                    src={formData.ticketTemplate}
                    alt="Ticket template"
                    className="w-48 h-24 object-cover rounded-lg border border-gray-600"
                  />
                  <button
                    type="button"
                    onClick={handleTicketTemplateRemove}
                    className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm"
                  >
                    ×
                  </button>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-300 mb-2">Ticket template uploaded successfully!</p>
                  <p className="text-xs text-gray-500">This will be used as the background for generated tickets in future booking emails. Click × to remove.</p>
                </div>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center">
                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-300 mb-2">Upload Ticket Template</p>
                <p className="text-sm text-gray-500 mb-4">
                  Optional: Upload a custom ticket background. Recommended: 800x400px, JPG/PNG, Max 5MB
                </p>
                <p className="text-xs text-gray-400 mb-4">
                  If no template is uploaded, a default FusionX ticket design will be used.
                </p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      handleTicketTemplateUpload(file)
                    }
                  }}
                  className="hidden"
                  id="ticket-template-upload"
                  disabled={uploadingTicketTemplate}
                />
                <label
                  htmlFor="ticket-template-upload"
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors cursor-pointer ${
                    uploadingTicketTemplate
                      ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                      : 'bg-blue-500 hover:bg-blue-600 text-white'
                  }`}
                >
                  {uploadingTicketTemplate ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-400 border-t-transparent"></div>
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4" />
                      Choose Template
                    </>
                  )}
                </label>
              </div>
            )}

            {/* Live Ticket Preview (dummy data) */}
            <div>
              <p className="text-sm font-semibold text-gray-200 mb-2">Ticket Preview (dummy data)</p>
              <p className="text-xs text-gray-500 mb-3">
                This preview mirrors the final printed ticket: only code, name, event, and date/time are printed on top of your template.
              </p>
              <div className="relative w-full max-w-2xl aspect-[16/7] rounded-xl border border-gray-700 overflow-hidden bg-gradient-to-br from-amber-100 to-amber-200 mx-auto">
                {formData.ticketTemplate && (
                  <img
                    src={formData.ticketTemplate}
                    alt="Ticket preview"
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                )}

                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-black translate-y-2">
                    <p className="text-3xl font-bold mb-2 tracking-[0.18em]">
                      FX9A22
                    </p>
                    <p className="text-xl font-semibold mb-1">
                      Member Name
                    </p>
                    <p className="text-base mb-1">
                      {formData.title || 'Event Name Preview'}
                    </p>
                    <p className="text-sm">
                      10 Dec 2025 • 12:00 – 16:00
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Date & Time Slots */}
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Date & Time Slots
            </h2>
            <button
              type="button"
              onClick={addDateSlot}
              className="flex items-center gap-2 px-3 py-1 bg-yellow-500 hover:bg-yellow-600 text-black rounded-lg text-sm font-medium transition-colors"
            >
              <Plus className="h-4 w-4" />
              Add Date
            </button>
          </div>

          <div className="space-y-4">
            {formData.dateSlots.map((dateSlot, dateIndex) => (
              <div key={dateIndex} className="bg-gray-700 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-white font-medium">Date {dateIndex + 1}</h3>
                  {formData.dateSlots.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeDateSlot(dateIndex)}
                      className="text-red-400 hover:text-red-300 p-1"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                  )}
                </div>

                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Date *</label>
                  <input
                    type="date"
                    required
                    value={dateSlot.date}
                    onChange={(e) => {
                      const newDateSlots = [...formData.dateSlots]
                      newDateSlots[dateIndex].date = e.target.value
                      handleChange('dateSlots', newDateSlots)
                    }}
                    className="w-full bg-gray-600 border border-gray-500 text-white px-3 py-2 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-300">Time Slots</label>
                    <button
                      type="button"
                      onClick={() => addTimeSlot(dateIndex)}
                      className="flex items-center gap-1 px-2 py-1 bg-gray-600 hover:bg-gray-500 text-white rounded text-xs"
                    >
                      <Plus className="h-3 w-3" />
                      Add Time
                    </button>
                  </div>

                  <div className="space-y-2">
                    {dateSlot.timeSlots.map((timeSlot, timeIndex) => (
                      <div key={timeIndex} className="grid grid-cols-1 md:grid-cols-4 gap-2 items-end">
                        <div>
                          <label className="block text-xs text-gray-400 mb-1">Start Time</label>
                          <input
                            type="time"
                            required
                            value={timeSlot.startTime}
                            onChange={(e) => {
                              const newDateSlots = [...formData.dateSlots]
                              newDateSlots[dateIndex].timeSlots[timeIndex].startTime = e.target.value
                              handleChange('dateSlots', newDateSlots)
                            }}
                            className="w-full bg-gray-600 border border-gray-500 text-white px-2 py-1 rounded text-sm focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                          />
                        </div>

                        <div>
                          <label className="block text-xs text-gray-400 mb-1">End Time</label>
                          <input
                            type="time"
                            required
                            value={timeSlot.endTime}
                            onChange={(e) => {
                              const newDateSlots = [...formData.dateSlots]
                              newDateSlots[dateIndex].timeSlots[timeIndex].endTime = e.target.value
                              handleChange('dateSlots', newDateSlots)
                            }}
                            className="w-full bg-gray-600 border border-gray-500 text-white px-2 py-1 rounded text-sm focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                          />
                        </div>

                        <div>
                          <label className="block text-xs text-gray-400 mb-1">Max Capacity</label>
                          <input
                            type="number"
                            required
                            min="1"
                            value={timeSlot.maxCapacity}
                            onChange={(e) => {
                              const newDateSlots = [...formData.dateSlots]
                              newDateSlots[dateIndex].timeSlots[timeIndex].maxCapacity = parseInt(e.target.value)
                              handleChange('dateSlots', newDateSlots)
                            }}
                            className="w-full bg-gray-600 border border-gray-500 text-white px-2 py-1 rounded text-sm focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                          />
                        </div>

                        <div>
                          {dateSlot.timeSlots.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeTimeSlot(dateIndex, timeIndex)}
                              className="w-full p-1 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded"
                            >
                              <Minus className="h-4 w-4 mx-auto" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Location Details */}
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Location Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Venue Name *</label>
              <input
                type="text"
                required
                value={formData.location.venue}
                onChange={(e) => handleChange('location', { ...formData.location, venue: e.target.value })}
                className="w-full bg-gray-700 border border-gray-600 text-white px-3 py-2 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                placeholder="e.g., Grand Ballroom, Central Park"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Venue Capacity *</label>
              <input
                type="number"
                required
                min="1"
                value={formData.location.capacity}
                onChange={(e) => handleChange('location', { ...formData.location, capacity: parseInt(e.target.value) })}
                className="w-full bg-gray-700 border border-gray-600 text-white px-3 py-2 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-2">Address *</label>
              <input
                type="text"
                required
                value={formData.location.address}
                onChange={(e) => handleChange('location', { ...formData.location, address: e.target.value })}
                className="w-full bg-gray-700 border border-gray-600 text-white px-3 py-2 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                placeholder="Full street address"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">City *</label>
              <input
                type="text"
                required
                value={formData.location.city}
                onChange={(e) => handleChange('location', { ...formData.location, city: e.target.value })}
                className="w-full bg-gray-700 border border-gray-600 text-white px-3 py-2 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">State *</label>
              <input
                type="text"
                required
                value={formData.location.state}
                onChange={(e) => handleChange('location', { ...formData.location, state: e.target.value })}
                className="w-full bg-gray-700 border border-gray-600 text-white px-3 py-2 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">PIN Code *</label>
              <input
                type="text"
                required
                value={formData.location.pincode}
                onChange={(e) => handleChange('location', { ...formData.location, pincode: e.target.value })}
                className="w-full bg-gray-700 border border-gray-600 text-white px-3 py-2 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
              />
            </div>
          </div>

        </div>

        {/* Facilities (Event-level) */}
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Facilities
            </h2>
            <button
              type="button"
              onClick={addFacility}
              className="bg-yellow-500 hover:bg-yellow-600 text-black px-3 py-1 rounded text-sm font-medium flex items-center gap-1"
            >
              <Plus className="h-4 w-4" />
              Add Facility
            </button>
          </div>
          <p className="text-sm text-gray-400 mb-4">
            Configure event-level facilities (e.g. parking, food court, security, restrooms) that are shown on the FusionX event page.
          </p>

          <div className="space-y-4">
            {formData.facilities.map((facility, index) => (
              <div key={index} className="border border-gray-600 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={facility.isIncluded}
                      onChange={(e) => {
                        const checked = e.target.checked
                        setFormData(prev => prev ? ({
                          ...prev,
                          facilities: prev.facilities.map((f, i) =>
                            i === index ? { ...f, isIncluded: checked } : f
                          )
                        }) : prev)
                      }}
                      className="h-4 w-4 text-yellow-500 border-gray-500 rounded bg-gray-700 focus:ring-yellow-400"
                    />
                    <span className="text-sm text-gray-200 font-medium">
                      {facility.name || `Facility ${index + 1}`}
                    </span>
                  </div>

                  {formData.facilities.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeFacility(index)}
                      className="text-red-400 hover:text-red-300 text-xs"
                    >
                      Remove
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Name
                    </label>
                    <input
                      type="text"
                      value={facility.name}
                      onChange={(e) => {
                        const value = e.target.value
                        setFormData(prev => prev ? ({
                          ...prev,
                          facilities: prev.facilities.map((f, i) =>
                            i === index ? { ...f, name: value } : f
                          )
                        }) : prev)
                      }}
                      className="w-full bg-gray-700 border border-gray-600 text-white px-3 py-2 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                      placeholder="Parking, Food Court, Security, Restrooms, etc."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Description
                    </label>
                    <input
                      type="text"
                      value={facility.description}
                      onChange={(e) => {
                        const value = e.target.value
                        setFormData(prev => prev ? ({
                          ...prev,
                          facilities: prev.facilities.map((f, i) =>
                            i === index ? { ...f, description: value } : f
                          )
                        }) : prev)
                      }}
                      className="w-full bg-gray-700 border border-gray-600 text-white px-3 py-2 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                      placeholder="Short description of this facility"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pricing Tiers */}
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Pricing Tiers
            </h2>
            <button
              type="button"
              onClick={addPricing}
              className="flex items-center gap-2 px-3 py-1 bg-yellow-500 hover:bg-yellow-600 text-black rounded-lg text-sm font-medium transition-colors"
            >
              <Plus className="h-4 w-4" />
              Add Tier
            </button>
          </div>

          <div className="space-y-4">
            {formData.pricing.map((pricing, index) => (
              <div key={index} className="bg-gray-700 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-white font-medium">Pricing Tier {index + 1}</h3>
                  {formData.pricing.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removePricing(index)}
                      className="text-red-400 hover:text-red-300 p-1"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Category *</label>
                    <select
                      required
                      value={pricing.category}
                      onChange={(e) => {
                        const newPricing = [...formData.pricing]
                        newPricing[index].category = e.target.value
                        handleChange('pricing', newPricing)
                      }}
                      className="w-full bg-gray-600 border border-gray-500 text-white px-3 py-2 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                    >
                      <option value="early_bird">Early Bird</option>
                      <option value="regular">Regular</option>
                      <option value="vip">VIP</option>
                      <option value="premium">Premium</option>
                      <option value="student">Student</option>
                      <option value="group">Group</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Base Price (₹) *</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={pricing.basePrice}
                      onChange={(e) => {
                        const newPricing = [...formData.pricing]
                        newPricing[index].basePrice = parseInt(e.target.value)
                        newPricing[index].currentPrice = parseInt(e.target.value) // Reset current price
                        handleChange('pricing', newPricing)
                      }}
                      className="w-full bg-gray-600 border border-gray-500 text-white px-3 py-2 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Max Tickets *</label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={pricing.maxTickets}
                      onChange={(e) => {
                        const newPricing = [...formData.pricing]
                        newPricing[index].maxTickets = parseInt(e.target.value)
                        handleChange('pricing', newPricing)
                      }}
                      className="w-full bg-gray-600 border border-gray-500 text-white px-3 py-2 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="mt-3">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                  <input
                    type="text"
                    value={pricing.description}
                    onChange={(e) => {
                      const newPricing = [...formData.pricing]
                      newPricing[index].description = e.target.value
                      handleChange('pricing', newPricing)
                    }}
                    className="w-full bg-gray-600 border border-gray-500 text-white px-3 py-2 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                    placeholder="Brief description of this pricing tier"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Dynamic Pricing Configuration */}
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Dynamic Pricing Configuration
          </h2>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="dynamic-pricing-enabled"
                checked={formData.dynamicPricing.enabled}
                onChange={(e) => handleChange('dynamicPricing', { ...formData.dynamicPricing, enabled: e.target.checked })}
                className="rounded border-gray-600 bg-gray-700 text-yellow-500 focus:ring-yellow-400"
              />
              <label htmlFor="dynamic-pricing-enabled" className="text-white font-medium">
                Enable Dynamic Pricing
              </label>
            </div>

            {formData.dynamicPricing.enabled && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-700 rounded-lg">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Booking Threshold (%) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    max="100"
                    value={formData.dynamicPricing.thresholdPercentage}
                    onChange={(e) => handleChange('dynamicPricing', { 
                      ...formData.dynamicPricing, 
                      thresholdPercentage: parseInt(e.target.value) 
                    })}
                    className="w-full bg-gray-600 border border-gray-500 text-white px-3 py-2 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-400 mt-1">Price increases when bookings reach this percentage</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Price Increase (%) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    max="200"
                    value={formData.dynamicPricing.priceIncreasePercentage}
                    onChange={(e) => handleChange('dynamicPricing', { 
                      ...formData.dynamicPricing, 
                      priceIncreasePercentage: parseInt(e.target.value) 
                    })}
                    className="w-full bg-gray-600 border border-gray-500 text-white px-3 py-2 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-400 mt-1">Percentage by which prices will increase</p>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                  <input
                    type="text"
                    value={formData.dynamicPricing.description || ''}
                    onChange={(e) => handleChange('dynamicPricing', { 
                      ...formData.dynamicPricing, 
                      description: e.target.value 
                    })}
                    className="w-full bg-gray-600 border border-gray-500 text-white px-3 py-2 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                    placeholder="Describe your dynamic pricing strategy"
                  />
                </div>

                <div className="md:col-span-2 p-3 bg-yellow-900/20 border border-yellow-600/30 rounded-lg">
                  <p className="text-yellow-400 text-sm font-medium mb-1">Preview:</p>
                  <p className="text-gray-300 text-sm">
                    Example: ₹1000 → ₹{Math.round(1000 * (1 + formData.dynamicPricing.priceIncreasePercentage / 100))} 
                    (when {formData.dynamicPricing.thresholdPercentage}% capacity is reached)
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Additional Settings */}
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Additional Settings
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Contact Phone</label>
              <input
                type="tel"
                value={formData.contactPhone || ''}
                onChange={(e) => handleChange('contactPhone', e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 text-white px-3 py-2 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                placeholder="Event contact number"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Age Restriction</label>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.ageRestriction || ''}
                onChange={(e) => handleChange('ageRestriction', e.target.value ? parseInt(e.target.value) : undefined)}
                className="w-full bg-gray-700 border border-gray-600 text-white px-3 py-2 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                placeholder="Minimum age (leave empty for no restriction)"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-2">Dress Code</label>
              <input
                type="text"
                value={formData.dresscode || ''}
                onChange={(e) => handleChange('dresscode', e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 text-white px-3 py-2 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                placeholder="e.g., Formal, Casual, Theme-based"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-2">Tags</label>
              <input
                type="text"
                value={formData.tags.join(', ')}
                onChange={(e) => handleChange('tags', e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag))}
                className="w-full bg-gray-700 border border-gray-600 text-white px-3 py-2 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                placeholder="Enter tags separated by commas (e.g., music, dance, entertainment)"
              />
              <p className="text-xs text-gray-400 mt-1">Separate multiple tags with commas</p>
            </div>
          </div>

          <div className="mt-6">
            <h3 className="text-md font-medium text-white mb-3">Event Facilities</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {formData.facilities.map((facility, index) => (
                <div key={index} className="bg-gray-700 p-3 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <input
                      type="text"
                      value={facility.name}
                      onChange={(e) => {
                        const newFacilities = [...formData.facilities]
                        newFacilities[index].name = e.target.value
                        handleChange('facilities', newFacilities)
                      }}
                      className="flex-1 bg-gray-600 border border-gray-500 text-white px-2 py-1 rounded text-sm focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                      placeholder="Facility name"
                    />
                    <label className="flex items-center gap-2 ml-3">
                      <input
                        type="checkbox"
                        checked={facility.isIncluded}
                        onChange={(e) => {
                          const newFacilities = [...formData.facilities]
                          newFacilities[index].isIncluded = e.target.checked
                          handleChange('facilities', newFacilities)
                        }}
                        className="rounded border-gray-600 bg-gray-700 text-yellow-500 focus:ring-yellow-400"
                      />
                      <span className="text-xs text-gray-300">Included</span>
                    </label>
                  </div>
                  <input
                    type="text"
                    value={facility.description}
                    onChange={(e) => {
                      const newFacilities = [...formData.facilities]
                      newFacilities[index].description = e.target.value
                      handleChange('facilities', newFacilities)
                    }}
                    className="w-full bg-gray-600 border border-gray-500 text-white px-2 py-1 rounded text-sm focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                    placeholder="Facility description"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Link
            href="/admin/fusionx-events"
            className="px-4 py-2 rounded-lg border border-gray-600 text-gray-300 hover:bg-gray-700 transition-colors text-sm"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-yellow-500 hover:bg-yellow-600 text-black font-medium text-sm disabled:bg-gray-600 disabled:text-gray-400 transition-colors"
          >
            <Save className="h-4 w-4" />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>

      {/* Floating Save Button - Always Visible */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          type="submit"
          form="event-edit-form"
          disabled={isSaving}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-yellow-500 hover:bg-yellow-600 text-black font-semibold text-sm disabled:bg-gray-600 disabled:text-gray-400 transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          <Save className="h-5 w-5" />
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  )
}
