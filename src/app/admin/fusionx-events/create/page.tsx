'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Minus, Upload, Calendar, MapPin, DollarSign, Settings, TrendingUp } from 'lucide-react'
import Link from 'next/link'

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
  gallery?: string[]
}

export default function CreateFusionXEventPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [uploadingPoster, setUploadingPoster] = useState(false)
  const [formData, setFormData] = useState<EventFormData>({
    title: '',
    shortDescription: '',
    longDescription: '',
    eventType: 'festival',
    dateSlots: [{
      date: '',
      timeSlots: [{
        startTime: '18:00',
        endTime: '23:00',
        maxCapacity: 100
      }]
    }],
    duration: 5,
    location: {
      venue: '',
      address: '',
      city: '',
      state: '',
      pincode: '',
      capacity: 100,
      facilities: []
    },
    pricing: [{
      category: 'regular',
      basePrice: 1000,
      currentPrice: 1000,
      description: 'Regular Entry',
      maxTickets: 100
    }],
    facilities: [
      { name: 'Parking', description: 'Free parking available', isIncluded: true },
      { name: 'Food Court', description: 'Multiple food vendors', isIncluded: true },
      { name: 'Security', description: '24/7 security coverage', isIncluded: true },
      { name: 'Restrooms', description: 'Clean restroom facilities', isIncluded: true }
    ],
    tags: [],
    status: 'draft',
    contactPhone: '',
    dynamicPricing: {
      enabled: true,
      thresholdPercentage: 50,
      priceIncreasePercentage: 20,
      description: 'Automatic price increase when bookings cross threshold'
    }
  })

  const handlePosterUpload = async (file: File) => {
    setUploadingPoster(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', 'poster')
      formData.append('eventId', `temp_${Date.now()}`) // Temporary ID for new events

      const token = localStorage.getItem('admin_token')
      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      })

      if (response.ok) {
        const result = await response.json()
        setFormData(prev => ({ ...prev, poster: result.url }))
      } else {
        console.error('Failed to upload poster')
      }
    } catch (error) {
      console.error('Error uploading poster:', error)
    } finally {
      setUploadingPoster(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const token = localStorage.getItem('admin_token')
      const response = await fetch('/api/fusionx-events', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        router.push('/admin/fusionx-events')
      } else {
        console.error('Failed to create event')
      }
    } catch (error) {
      console.error('Error creating event:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const addDateSlot = () => {
    setFormData(prev => ({
      ...prev,
      dateSlots: [...prev.dateSlots, {
        date: '',
        timeSlots: [{
          startTime: '18:00',
          endTime: '23:00',
          maxCapacity: 100
        }]
      }]
    }))
  }

  const removeDateSlot = (index: number) => {
    setFormData(prev => ({
      ...prev,
      dateSlots: prev.dateSlots.filter((_, i) => i !== index)
    }))
  }

  const addTimeSlot = (dateIndex: number) => {
    setFormData(prev => ({
      ...prev,
      dateSlots: prev.dateSlots.map((dateSlot, i) => 
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
    }))
  }

  const removeTimeSlot = (dateIndex: number, timeIndex: number) => {
    setFormData(prev => ({
      ...prev,
      dateSlots: prev.dateSlots.map((dateSlot, i) => 
        i === dateIndex 
          ? {
              ...dateSlot,
              timeSlots: dateSlot.timeSlots.filter((_, j) => j !== timeIndex)
            }
          : dateSlot
      )
    }))
  }

  const addPricing = () => {
    setFormData(prev => ({
      ...prev,
      pricing: [...prev.pricing, {
        category: 'regular',
        basePrice: 1000,
        currentPrice: 1000,
        description: '',
        maxTickets: 100
      }]
    }))
  }

  const removePricing = (index: number) => {
    setFormData(prev => ({
      ...prev,
      pricing: prev.pricing.filter((_, i) => i !== index)
    }))
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Create FusionX Event</h1>
          <p className="mt-2 text-gray-400">Create a new immersive event experience</p>
        </div>
        <Link
          href="/admin/fusionx-events"
          className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          Back to Events
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <h2 className="text-lg font-semibold text-white mb-4">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Event Title *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full bg-gray-700 border border-gray-600 text-white px-3 py-2 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                placeholder="FusionX Neon Night 2025"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Contact Number
              </label>
              <input
                type="tel"
                value={formData.contactPhone || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, contactPhone: e.target.value }))}
                className="w-full bg-gray-700 border border-gray-600 text-white px-3 py-2 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                placeholder="Contact phone for event queries"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Event Type *
              </label>
              <select
                required
                value={formData.eventType}
                onChange={(e) => setFormData(prev => ({ ...prev, eventType: e.target.value }))}
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
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Short Description *
              </label>
              <textarea
                required
                value={formData.shortDescription}
                onChange={(e) => setFormData(prev => ({ ...prev, shortDescription: e.target.value }))}
                rows={2}
                maxLength={300}
                className="w-full bg-gray-700 border border-gray-600 text-white px-3 py-2 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                placeholder="A high-energy collision of music, motion graphics, and interactive light sculptures."
              />
              <p className="text-xs text-gray-500 mt-1">{formData.shortDescription.length}/300 characters</p>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Long Description *
              </label>
              <textarea
                required
                value={formData.longDescription}
                onChange={(e) => setFormData(prev => ({ ...prev, longDescription: e.target.value }))}
                rows={4}
                maxLength={2000}
                className="w-full bg-gray-700 border border-gray-600 text-white px-3 py-2 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                placeholder="Detailed description of the event experience..."
              />
              <p className="text-xs text-gray-500 mt-1">{formData.longDescription.length}/2000 characters</p>
            </div>
          </div>
        </div>

        {/* Poster Upload */}
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Event Poster
          </h2>
          <div className="space-y-4">
            {formData.poster ? (
              <div className="flex items-start gap-4">
                <div className="relative">
                  <img
                    src={formData.poster}
                    alt="Event poster"
                    className="w-32 h-48 object-cover rounded-lg border border-gray-600"
                  />
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, poster: undefined }))}
                    className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm"
                  >
                    ×
                  </button>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-300 mb-2">Poster uploaded successfully!</p>
                  <p className="text-xs text-gray-500">Click the × to remove and upload a different image.</p>
                </div>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center">
                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-300 mb-2">Upload Event Poster</p>
                <p className="text-sm text-gray-500 mb-4">
                  Recommended: 800x1200px, JPG/PNG, Max 10MB
                </p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      handlePosterUpload(file)
                    }
                  }}
                  className="hidden"
                  id="poster-upload"
                  disabled={uploadingPoster}
                />
                <label
                  htmlFor="poster-upload"
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors cursor-pointer ${
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
                      Choose File
                    </>
                  )}
                </label>
              </div>
            )}
          </div>
        </div>

        {/* Date & Time Slots */}
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Date & Time Slots
            </h2>
            <button
              type="button"
              onClick={addDateSlot}
              className="bg-yellow-500 hover:bg-yellow-600 text-black px-3 py-1 rounded text-sm font-medium flex items-center gap-1"
            >
              <Plus className="h-4 w-4" />
              Add Date
            </button>
          </div>
          
          {formData.dateSlots.map((dateSlot, dateIndex) => (
            <div key={dateIndex} className="border border-gray-600 rounded-lg p-4 mb-4">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-white font-medium">Date Slot {dateIndex + 1}</h3>
                {formData.dateSlots.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeDateSlot(dateIndex)}
                    className="text-red-400 hover:text-red-300"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={dateSlot.date}
                    onChange={(e) => {
                      setFormData(prev => ({
                        ...prev,
                        dateSlots: prev.dateSlots.map((ds, i) => 
                          i === dateIndex ? { ...ds, date: e.target.value } : ds
                        )
                      }))
                    }}
                    className="w-full bg-gray-700 border border-gray-600 text-white px-3 py-2 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={() => addTimeSlot(dateIndex)}
                    className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded text-sm font-medium flex items-center gap-1"
                  >
                    <Plus className="h-4 w-4" />
                    Add Time Slot
                  </button>
                </div>
              </div>

              {dateSlot.timeSlots.map((timeSlot, timeIndex) => (
                <div key={timeIndex} className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3 p-3 bg-gray-700 rounded">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Start Time</label>
                    <input
                      type="time"
                      required
                      value={timeSlot.startTime}
                      onChange={(e) => {
                        setFormData(prev => ({
                          ...prev,
                          dateSlots: prev.dateSlots.map((ds, i) => 
                            i === dateIndex 
                              ? {
                                  ...ds,
                                  timeSlots: ds.timeSlots.map((ts, j) => 
                                    j === timeIndex ? { ...ts, startTime: e.target.value } : ts
                                  )
                                }
                              : ds
                          )
                        }))
                      }}
                      className="w-full bg-gray-600 border border-gray-500 text-white px-2 py-1 rounded text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">End Time</label>
                    <input
                      type="time"
                      required
                      value={timeSlot.endTime}
                      onChange={(e) => {
                        setFormData(prev => ({
                          ...prev,
                          dateSlots: prev.dateSlots.map((ds, i) => 
                            i === dateIndex 
                              ? {
                                  ...ds,
                                  timeSlots: ds.timeSlots.map((ts, j) => 
                                    j === timeIndex ? { ...ts, endTime: e.target.value } : ts
                                  )
                                }
                              : ds
                          )
                        }))
                      }}
                      className="w-full bg-gray-600 border border-gray-500 text-white px-2 py-1 rounded text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Capacity</label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={timeSlot.maxCapacity}
                      onChange={(e) => {
                        setFormData(prev => ({
                          ...prev,
                          dateSlots: prev.dateSlots.map((ds, i) => 
                            i === dateIndex 
                              ? {
                                  ...ds,
                                  timeSlots: ds.timeSlots.map((ts, j) => 
                                    j === timeIndex ? { ...ts, maxCapacity: parseInt(e.target.value) } : ts
                                  )
                                }
                              : ds
                          )
                        }))
                      }}
                      className="w-full bg-gray-600 border border-gray-500 text-white px-2 py-1 rounded text-sm"
                    />
                  </div>
                  <div className="flex items-end">
                    {dateSlot.timeSlots.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeTimeSlot(dateIndex, timeIndex)}
                        className="text-red-400 hover:text-red-300 p-1"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Location */}
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Location Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Venue Name *
              </label>
              <input
                type="text"
                required
                value={formData.location.venue}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  location: { ...prev.location, venue: e.target.value }
                }))}
                className="w-full bg-gray-700 border border-gray-600 text-white px-3 py-2 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                placeholder="GlitzFusion Arena"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                City *
              </label>
              <input
                type="text"
                required
                value={formData.location.city}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  location: { ...prev.location, city: e.target.value }
                }))}
                className="w-full bg-gray-700 border border-gray-600 text-white px-3 py-2 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                placeholder="Mumbai"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Address *
              </label>
              <textarea
                required
                value={formData.location.address}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  location: { ...prev.location, address: e.target.value }
                }))}
                rows={2}
                className="w-full bg-gray-700 border border-gray-600 text-white px-3 py-2 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                placeholder="Complete venue address"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                State *
              </label>
              <input
                type="text"
                required
                value={formData.location.state}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  location: { ...prev.location, state: e.target.value }
                }))}
                className="w-full bg-gray-700 border border-gray-600 text-white px-3 py-2 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                placeholder="Maharashtra"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Pincode *
              </label>
              <input
                type="text"
                required
                value={formData.location.pincode}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  location: { ...prev.location, pincode: e.target.value }
                }))}
                className="w-full bg-gray-700 border border-gray-600 text-white px-3 py-2 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                placeholder="400001"
              />
            </div>
          </div>
        </div>

        {/* Pricing */}
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Pricing Tiers
            </h2>
            <button
              type="button"
              onClick={addPricing}
              className="bg-yellow-500 hover:bg-yellow-600 text-black px-3 py-1 rounded text-sm font-medium flex items-center gap-1"
            >
              <Plus className="h-4 w-4" />
              Add Tier
            </button>
          </div>
          
          {formData.pricing.map((pricing, index) => (
            <div key={index} className="border border-gray-600 rounded-lg p-4 mb-4">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-white font-medium">Pricing Tier {index + 1}</h3>
                {formData.pricing.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removePricing(index)}
                    className="text-red-400 hover:text-red-300"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Category *
                  </label>
                  <select
                    required
                    value={pricing.category}
                    onChange={(e) => {
                      setFormData(prev => ({
                        ...prev,
                        pricing: prev.pricing.map((p, i) => 
                          i === index ? { ...p, category: e.target.value } : p
                        )
                      }))
                    }}
                    className="w-full bg-gray-700 border border-gray-600 text-white px-3 py-2 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
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
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Base Price (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={pricing.basePrice}
                    onChange={(e) => {
                      const newPrice = parseInt(e.target.value);
                      setFormData(prev => ({
                        ...prev,
                        pricing: prev.pricing.map((p, i) => 
                          i === index ? { ...p, basePrice: newPrice, currentPrice: newPrice } : p
                        )
                      }))
                    }}
                    className="w-full bg-gray-700 border border-gray-600 text-white px-3 py-2 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Current: ₹{pricing.currentPrice} {pricing.currentPrice > pricing.basePrice && '(+20% applied)'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Max Tickets *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={pricing.maxTickets}
                    onChange={(e) => {
                      setFormData(prev => ({
                        ...prev,
                        pricing: prev.pricing.map((p, i) => 
                          i === index ? { ...p, maxTickets: parseInt(e.target.value) } : p
                        )
                      }))
                    }}
                    className="w-full bg-gray-700 border border-gray-600 text-white px-3 py-2 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Description
                  </label>
                  <input
                    type="text"
                    value={pricing.description}
                    onChange={(e) => {
                      setFormData(prev => ({
                        ...prev,
                        pricing: prev.pricing.map((p, i) => 
                          i === index ? { ...p, description: e.target.value } : p
                        )
                      }))
                    }}
                    className="w-full bg-gray-700 border border-gray-600 text-white px-3 py-2 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                    placeholder="Regular Entry"
                  />
                </div>
              </div>
            </div>
          ))}
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
                id="dynamicPricingEnabled"
                checked={formData.dynamicPricing.enabled}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  dynamicPricing: { ...prev.dynamicPricing, enabled: e.target.checked }
                }))}
                className="h-4 w-4 text-yellow-400 bg-gray-700 border-gray-600 rounded focus:ring-yellow-400 focus:ring-2"
              />
              <label htmlFor="dynamicPricingEnabled" className="text-sm font-medium text-gray-300">
                Enable Dynamic Pricing
              </label>
            </div>
            
            {formData.dynamicPricing.enabled && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        dynamicPricing: { ...prev.dynamicPricing, thresholdPercentage: parseInt(e.target.value) }
                      }))}
                      className="w-full bg-gray-700 border border-gray-600 text-white px-3 py-2 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                      placeholder="50"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Price increase triggers when bookings reach this percentage
                    </p>
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
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        dynamicPricing: { ...prev.dynamicPricing, priceIncreasePercentage: parseInt(e.target.value) }
                      }))}
                      className="w-full bg-gray-700 border border-gray-600 text-white px-3 py-2 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                      placeholder="20"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Percentage to increase prices by
                    </p>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.dynamicPricing.description || ''}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      dynamicPricing: { ...prev.dynamicPricing, description: e.target.value }
                    }))}
                    rows={2}
                    className="w-full bg-gray-700 border border-gray-600 text-white px-3 py-2 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                    placeholder="Describe the dynamic pricing strategy..."
                  />
                </div>
                
                <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
                  <h4 className="text-blue-300 font-medium mb-2">Preview</h4>
                  <p className="text-sm text-gray-300">
                    When bookings reach <span className="text-yellow-400 font-medium">{formData.dynamicPricing.thresholdPercentage}%</span> capacity, 
                    ticket prices will automatically increase by <span className="text-yellow-400 font-medium">{formData.dynamicPricing.priceIncreasePercentage}%</span>.
                  </p>
                  <p className="text-xs text-gray-400 mt-2">
                    Example: ₹1000 → ₹{Math.round(1000 * (1 + formData.dynamicPricing.priceIncreasePercentage / 100))}
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Additional Settings */}
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Additional Settings
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Duration (Hours) *
              </label>
              <input
                type="number"
                required
                min="1"
                max="24"
                value={formData.duration}
                onChange={(e) => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                className="w-full bg-gray-700 border border-gray-600 text-white px-3 py-2 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Age Restriction
              </label>
              <input
                type="number"
                min="0"
                max="21"
                value={formData.ageRestriction || ''}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  ageRestriction: e.target.value ? parseInt(e.target.value) : undefined 
                }))}
                className="w-full bg-gray-700 border border-gray-600 text-white px-3 py-2 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                placeholder="18"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Status *
              </label>
              <select
                required
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                className="w-full bg-gray-700 border border-gray-600 text-white px-3 py-2 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>
            <div className="md:col-span-3">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Dress Code
              </label>
              <input
                type="text"
                value={formData.dresscode || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, dresscode: e.target.value }))}
                className="w-full bg-gray-700 border border-gray-600 text-white px-3 py-2 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                placeholder="Casual, Neon colors encouraged"
              />
            </div>
            <div className="md:col-span-3">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Tags (comma separated)
              </label>
              <input
                type="text"
                value={formData.tags.join(', ')}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  tags: e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag) 
                }))}
                className="w-full bg-gray-700 border border-gray-600 text-white px-3 py-2 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                placeholder="music, neon, interactive, festival"
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end gap-4">
          <Link
            href="/admin/fusionx-events"
            className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isLoading}
            className="bg-yellow-500 hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed text-black px-6 py-2 rounded-lg font-medium transition-colors"
          >
            {isLoading ? 'Creating...' : 'Create Event'}
          </button>
        </div>
      </form>
    </div>
  )
}
