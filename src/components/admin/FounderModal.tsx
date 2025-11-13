'use client'

import { useState, useRef, useEffect } from 'react'
import { Founder } from '@/hooks/useAbout'
import { X, Upload, Camera, Loader2, Plus, Trash2 } from 'lucide-react'
import Image from 'next/image'
import toast from 'react-hot-toast'

interface FounderModalProps {
  isOpen: boolean
  onClose: () => void
  founder?: Founder | null
  onSave: (founder: Founder) => void
}

export function FounderModal({ isOpen, onClose, founder, onSave }: FounderModalProps) {
  const [formData, setFormData] = useState<Partial<Founder>>({
    name: '',
    role: '',
    bio: '',
    longBio: '',
    image: '',
    achievements: [],
    socialLinks: {},
    order: 0,
    isActive: true,
    id: ''
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>('')
  const [saving, setSaving] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: founder?.name || '',
        role: founder?.role || '',
        bio: founder?.bio || '',
        longBio: founder?.longBio || '',
        image: founder?.image || '',
        achievements: founder?.achievements || [],
        socialLinks: founder?.socialLinks || {},
        order: founder?.order || 0,
        isActive: founder?.isActive ?? true,
        id: founder?.id || ''
      })
      setImagePreview(founder?.image || '')
      setImageFile(null)
    }
  }, [isOpen, founder])

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onload = () => setImagePreview(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  const addAchievement = () => {
    setFormData(prev => ({
      ...prev,
      achievements: [...(prev.achievements || []), '']
    }))
  }

  const updateAchievement = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      achievements: prev.achievements?.map((achievement, i) => 
        i === index ? value : achievement
      ) || []
    }))
  }

  const removeAchievement = (index: number) => {
    setFormData(prev => ({
      ...prev,
      achievements: prev.achievements?.filter((_, i) => i !== index) || []
    }))
  }

  const handleSave = async () => {
    if (!formData.name || !formData.role) {
      toast.error('Name and role are required')
      return
    }

    setSaving(true)
    try {
      const formDataToSend = new FormData()
      formDataToSend.append('founderData', JSON.stringify(formData))
      
      if (imageFile) {
        formDataToSend.append('image', imageFile)
      }

      const response = await fetch('/api/about/founders', {
        method: 'POST',
        body: formDataToSend
      })

      if (!response.ok) throw new Error('Failed to save founder')

      const savedFounder = await response.json()
      onSave(savedFounder)
      toast.success('Founder saved successfully!')
      onClose()
    } catch (error) {
      toast.error('Failed to save founder')
    } finally {
      setSaving(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">
            {founder ? 'Edit Founder' : 'Add Founder'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Image Upload */}
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">Photo</label>
            <div className="flex items-center space-x-4">
              <div className="relative w-32 h-32 rounded-lg overflow-hidden bg-gray-100">
                {imagePreview ? (
                  <Image src={imagePreview} alt="Preview" fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Camera className="w-12 h-12 text-gray-400" />
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
              >
                <Upload className="w-4 h-4" />
                <span>Upload Photo</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
              />
            </div>
          </div>

          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder:text-gray-400"
                placeholder="Full name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Role *</label>
              <input
                type="text"
                value={formData.role}
                onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder:text-gray-400"
                placeholder="Founder title or role"
              />
            </div>
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Short Bio</label>
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder:text-gray-400"
              placeholder="Brief description for cards and previews"
            />
          </div>

          {/* Long Bio */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Detailed Bio</label>
            <textarea
              value={formData.longBio}
              onChange={(e) => setFormData(prev => ({ ...prev, longBio: e.target.value }))}
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder:text-gray-400"
              placeholder="Detailed biography for founder profile pages"
            />
          </div>

          {/* Achievements */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">Achievements</label>
              <button
                type="button"
                onClick={addAchievement}
                className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center space-x-1 text-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Add Achievement</span>
              </button>
            </div>
            <div className="space-y-2">
              {formData.achievements?.map((achievement, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={achievement}
                    onChange={(e) => updateAchievement(index, e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder:text-gray-400"
                    placeholder="Achievement or milestone"
                  />
                  <button
                    type="button"
                    onClick={() => removeAchievement(index)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Social Links */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Social Links</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="url"
                value={formData.socialLinks?.twitter || ''}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  socialLinks: { ...prev.socialLinks, twitter: e.target.value }
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder:text-gray-400"
                placeholder="Twitter URL"
              />
              <input
                type="url"
                value={formData.socialLinks?.linkedin || ''}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  socialLinks: { ...prev.socialLinks, linkedin: e.target.value }
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder:text-gray-400"
                placeholder="LinkedIn URL"
              />
              <input
                type="url"
                value={formData.socialLinks?.instagram || ''}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  socialLinks: { ...prev.socialLinks, instagram: e.target.value }
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder:text-gray-400"
                placeholder="Instagram URL"
              />
              <input
                type="url"
                value={formData.socialLinks?.facebook || ''}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  socialLinks: { ...prev.socialLinks, facebook: e.target.value }
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder:text-gray-400"
                placeholder="Facebook URL"
              />
            </div>
          </div>

          {/* Order & Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Display Order</label>
              <input
                type="number"
                value={formData.order}
                onChange={(e) => setFormData(prev => ({ ...prev, order: parseInt(e.target.value) || 0 }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                min="0"
              />
            </div>
            <div className="flex items-center space-x-2 pt-8">
              <input
                type="checkbox"
                id="founderIsActive"
                checked={formData.isActive}
                onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="founderIsActive" className="text-sm font-medium text-gray-700">
                Active (visible on website)
              </label>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>Save Founder</span>
          </button>
        </div>
      </div>
    </div>
  )
}
