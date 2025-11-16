'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Upload, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface HeroMediaFormData {
  title: string
  description: string
  mediaType: 'image' | 'video'
  isActive: boolean
  position: number
  mediaUrl?: string
}

export default function CreateHeroMediaPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [uploadingMedia, setUploadingMedia] = useState(false)
  const [formData, setFormData] = useState<HeroMediaFormData>({
    title: 'Hero Media',
    description: '',
    mediaType: 'image',
    isActive: true,
    position: 0
  })

  const handleMediaUpload = async (file: File) => {
    setUploadingMedia(true)
    try {
      const uploadFormData = new FormData()
      uploadFormData.append('file', file)
      uploadFormData.append('type', 'hero')

      const token = localStorage.getItem('admin_token')
      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: uploadFormData
      })

      if (response.ok) {
        const result = await response.json()
        setFormData(prev => ({ 
          ...prev, 
          mediaUrl: result.url,
          mediaType: result.filename.match(/\.(mp4|webm|mov)$/i) ? 'video' : 'image'
        }))
      } else {
        console.error('Failed to upload media')
      }
    } catch (error) {
      console.error('Error uploading media:', error)
    } finally {
      setUploadingMedia(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.mediaUrl) {
      alert('Please upload a media file first')
      return
    }

    setIsLoading(true)

    try {
      const token = localStorage.getItem('admin_token')
      const response = await fetch('/api/hero-media', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        router.push('/admin/hero-media')
      } else {
        console.error('Failed to create hero media')
      }
    } catch (error) {
      console.error('Error creating hero media:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Link
          href="/admin/hero-media"
          className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-gray-400" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">Add Hero Media</h1>
          <p className="text-gray-400">Upload background media for FusionX hero section</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Media Upload */}
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Media Upload
          </h2>
          
          {formData.mediaUrl ? (
            <div className="space-y-4">
              <div className="relative w-full h-64 rounded-lg overflow-hidden bg-gray-700">
                {formData.mediaType === 'image' ? (
                  <img
                    src={formData.mediaUrl}
                    alt="Hero media preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <video
                    src={formData.mediaUrl}
                    className="w-full h-full object-cover"
                    controls
                    muted
                  />
                )}
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, mediaUrl: undefined }))}
                  className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm"
                >
                  ×
                </button>
              </div>
              <p className="text-sm text-gray-300">Media uploaded successfully!</p>
            </div>
          ) : (
            <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center">
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-300 mb-2">Upload Hero Media</p>
              <p className="text-sm text-gray-500 mb-4">
                Images: JPG, PNG, WebP (max 10MB)<br />
                Videos: MP4, WebM, MOV (max 100MB)
              </p>
              <input
                type="file"
                accept="image/*,video/*"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) {
                    handleMediaUpload(file)
                  }
                }}
                className="hidden"
                id="media-upload"
                disabled={uploadingMedia}
              />
              <label
                htmlFor="media-upload"
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors cursor-pointer ${
                  uploadingMedia
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    : 'bg-yellow-500 hover:bg-yellow-600 text-black'
                }`}
              >
                {uploadingMedia ? (
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

        {/* Submit Button */}
        <div className="flex justify-end gap-4">
          <Link
            href="/admin/hero-media"
            className="px-6 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isLoading || !formData.mediaUrl}
            className="px-6 py-2 bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-600 disabled:text-gray-400 text-black font-medium rounded-lg transition-colors"
          >
            {isLoading ? 'Creating...' : 'Create Hero Media'}
          </button>
        </div>
      </form>
    </div>
  )
}
