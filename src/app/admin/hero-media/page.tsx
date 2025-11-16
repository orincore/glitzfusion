'use client'

import { useState, useEffect } from 'react'
import { Plus, Upload, Edit, Trash2, Eye, EyeOff, GripVertical } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

interface HeroMedia {
  _id: string
  title: string
  description?: string
  mediaUrl: string
  mediaType: 'image' | 'video'
  isActive: boolean
  position: number
  createdAt: string
  updatedAt: string
  createdBy: {
    name: string
    email: string
  }
}

export default function HeroMediaPage() {
  const [heroMedia, setHeroMedia] = useState<HeroMedia[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchHeroMedia()
  }, [])

  const fetchHeroMedia = async () => {
    try {
      const token = localStorage.getItem('admin_token')
      const response = await fetch('/api/hero-media', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setHeroMedia(data)
      } else {
        setError('Failed to fetch hero media')
      }
    } catch (error) {
      setError('Error fetching hero media')
    } finally {
      setIsLoading(false)
    }
  }

  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const token = localStorage.getItem('admin_token')
      const response = await fetch(`/api/hero-media/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isActive: !currentStatus })
      })

      if (response.ok) {
        fetchHeroMedia() // Refresh the list
      } else {
        setError('Failed to update hero media status')
      }
    } catch (error) {
      setError('Error updating hero media')
    }
  }

  const deleteHeroMedia = async (id: string) => {
    if (!confirm('Are you sure you want to delete this hero media? This action cannot be undone.')) {
      return
    }

    try {
      const token = localStorage.getItem('admin_token')
      const response = await fetch(`/api/hero-media/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        fetchHeroMedia() // Refresh the list
      } else {
        setError('Failed to delete hero media')
      }
    } catch (error) {
      setError('Error deleting hero media')
    }
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-700 rounded w-1/4"></div>
          <div className="h-32 bg-gray-700 rounded"></div>
          <div className="h-32 bg-gray-700 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Hero Media Management</h1>
          <p className="text-gray-400 mt-1">Manage background media for FusionX hero section</p>
        </div>
        <Link
          href="/admin/hero-media/create"
          className="bg-yellow-500 hover:bg-yellow-600 text-black px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Hero Media
        </Link>
      </div>

      {error && (
        <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {heroMedia.length === 0 ? (
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-8 text-center">
          <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">No Hero Media</h3>
          <p className="text-gray-400 mb-4">
            Upload images or videos to display in the FusionX hero section background.
          </p>
          <Link
            href="/admin/hero-media/create"
            className="bg-yellow-500 hover:bg-yellow-600 text-black px-4 py-2 rounded-lg font-medium inline-flex items-center gap-2 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add First Hero Media
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {heroMedia.map((media) => (
            <div
              key={media._id}
              className={`bg-gray-800 rounded-lg border p-4 transition-all ${
                media.isActive ? 'border-green-500/50 bg-green-900/10' : 'border-gray-700'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="flex items-center">
                  <GripVertical className="h-5 w-5 text-gray-500" />
                </div>
                
                <div className="relative w-24 h-16 rounded-lg overflow-hidden bg-gray-700 flex-shrink-0">
                  {media.mediaType === 'image' ? (
                    <Image
                      src={media.mediaUrl}
                      alt={media.title}
                      fill
                      className="object-cover"
                      sizes="96px"
                    />
                  ) : (
                    <video
                      src={media.mediaUrl}
                      className="w-full h-full object-cover"
                      muted
                    />
                  )}
                  <div className="absolute top-1 right-1 bg-black/60 text-white text-xs px-1 rounded">
                    {media.mediaType}
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-white truncate">
                        {media.title}
                      </h3>
                      {media.description && (
                        <p className="text-gray-400 text-sm mt-1 line-clamp-2">
                          {media.description}
                        </p>
                      )}
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        <span>Position: {media.position}</span>
                        <span>Created: {new Date(media.createdAt).toLocaleDateString()}</span>
                        <span>By: {media.createdBy.name}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => toggleActive(media._id, media.isActive)}
                        className={`p-2 rounded-lg transition-colors ${
                          media.isActive
                            ? 'bg-green-600 hover:bg-green-700 text-white'
                            : 'bg-gray-600 hover:bg-gray-700 text-gray-300'
                        }`}
                        title={media.isActive ? 'Hide from hero' : 'Show in hero'}
                      >
                        {media.isActive ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                      </button>

                      <Link
                        href={`/admin/hero-media/edit/${media._id}`}
                        className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                        title="Edit hero media"
                      >
                        <Edit className="h-4 w-4" />
                      </Link>

                      <button
                        onClick={() => deleteHeroMedia(media._id)}
                        className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                        title="Delete hero media"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
