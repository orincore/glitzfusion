'use client'

import { useState, useEffect, useRef } from 'react'
import { Plus, Edit, Trash2, Upload, Camera, Loader2, BookOpen, Quote } from 'lucide-react'
import Image from 'next/image'
import toast from 'react-hot-toast'

interface StoryMilestone {
  id: string;
  year: string;
  description: string;
}

interface StoryContent {
  subtitle?: string;
  title?: string;
  description?: string;
  mainImage?: string;
  mainImageKey?: string;
  mainImageCaption?: string;
  mainImageTitle?: string;
  secondaryImage?: string;
  secondaryImageKey?: string;
  milestones?: StoryMilestone[];
  quote?: string;
  quoteAuthor?: string;
  quoteAuthorTitle?: string;
}

export function StoryAdmin() {
  const [content, setContent] = useState<StoryContent>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [mainImageFile, setMainImageFile] = useState<File | null>(null)
  const [secondaryImageFile, setSecondaryImageFile] = useState<File | null>(null)
  const [mainImagePreview, setMainImagePreview] = useState<string>('')
  const [secondaryImagePreview, setSecondaryImagePreview] = useState<string>('')
  const mainFileInputRef = useRef<HTMLInputElement>(null)
  const secondaryFileInputRef = useRef<HTMLInputElement>(null)

  const inputBaseClasses = 'px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent'
  const textareaBaseClasses = 'px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent'

  useEffect(() => {
    fetchStoryContent()
  }, [])

  const fetchStoryContent = async () => {
    try {
      const response = await fetch('/api/about/story')
      if (response.ok) {
        const data = await response.json()
        setContent(data)
        setMainImagePreview(data.mainImage || '')
        setSecondaryImagePreview(data.secondaryImage || '')
      }
    } catch (error) {
      console.error('Error fetching story content:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleMainImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setMainImageFile(file)
      const reader = new FileReader()
      reader.onload = () => setMainImagePreview(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  const handleSecondaryImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSecondaryImageFile(file)
      const reader = new FileReader()
      reader.onload = () => setSecondaryImagePreview(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  const addMilestone = () => {
    const newMilestone: StoryMilestone = {
      id: `milestone_${Date.now()}`,
      year: new Date().getFullYear().toString(),
      description: 'New milestone description'
    }
    
    setContent(prev => ({
      ...prev,
      milestones: [...(prev.milestones || []), newMilestone]
    }))
  }

  const updateMilestone = (id: string, updates: Partial<StoryMilestone>) => {
    setContent(prev => ({
      ...prev,
      milestones: prev.milestones?.map(milestone =>
        milestone.id === id ? { ...milestone, ...updates } : milestone
      )
    }))
  }

  const deleteMilestone = (id: string) => {
    if (!confirm('Are you sure you want to delete this milestone?')) return
    
    setContent(prev => ({
      ...prev,
      milestones: prev.milestones?.filter(milestone => milestone.id !== id)
    }))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const formData = new FormData()
      formData.append('contentData', JSON.stringify(content))
      
      if (mainImageFile) {
        formData.append('mainImage', mainImageFile)
      }
      
      if (secondaryImageFile) {
        formData.append('secondaryImage', secondaryImageFile)
      }

      const response = await fetch('/api/about/story', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) throw new Error('Failed to save story content')

      const savedContent = await response.json()
      setContent(savedContent)
      setMainImageFile(null)
      setSecondaryImageFile(null)
      toast.success('Story content saved successfully!')
    } catch (error) {
      toast.error('Failed to save story content')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center space-x-2 text-blue-600">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Loading story content...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 text-gray-900">
      {/* Header Section */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
          <BookOpen className="w-5 h-5 mr-2 text-blue-600" />
          Our Story Section Content
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Subtitle</label>
            <input
              type="text"
              value={content.subtitle || ''}
              onChange={(e) => setContent(prev => ({ ...prev, subtitle: e.target.value }))}
              className={`w-full ${inputBaseClasses}`}
              placeholder="Our Journey"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
            <input
              type="text"
              value={content.title || ''}
              onChange={(e) => setContent(prev => ({ ...prev, title: e.target.value }))}
              className={`w-full ${inputBaseClasses}`}
              placeholder="Crafting Excellence in Performing Arts Since 2015"
            />
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
          <textarea
            value={content.description || ''}
            onChange={(e) => setContent(prev => ({ ...prev, description: e.target.value }))}
            rows={3}
            className={`w-full ${textareaBaseClasses}`}
            placeholder="What started as a small studio with a big dream..."
          />
        </div>
      </div>

      {/* Images Section */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Images</h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Main Image */}
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">Main Image</label>
            <div className="space-y-4">
              <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-100 border-2 border-dashed border-gray-300">
                {mainImagePreview ? (
                  <Image src={mainImagePreview} alt="Main" fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Camera className="w-12 h-12 text-gray-400" />
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => mainFileInputRef.current?.click()}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center space-x-2"
              >
                <Upload className="w-4 h-4" />
                <span>Upload Main Image</span>
              </button>
              <input
                ref={mainFileInputRef}
                type="file"
                accept="image/*"
                onChange={handleMainImageSelect}
                className="hidden"
              />
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Image Caption</label>
                <input
                  type="text"
                  value={content.mainImageCaption || ''}
                  onChange={(e) => setContent(prev => ({ ...prev, mainImageCaption: e.target.value }))}
                  className={`w-full ${inputBaseClasses}`}
                  placeholder="Our First Studio, 2015"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Image Title</label>
                <input
                  type="text"
                  value={content.mainImageTitle || ''}
                  onChange={(e) => setContent(prev => ({ ...prev, mainImageTitle: e.target.value }))}
                  className={`w-full ${inputBaseClasses}`}
                  placeholder="Where It All Began"
                />
              </div>
            </div>
          </div>

          {/* Secondary Image */}
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">Secondary Image (Optional)</label>
            <div className="space-y-4">
              <div className="relative w-48 h-48 rounded-lg overflow-hidden bg-gray-100 border-2 border-dashed border-gray-300 mx-auto">
                {secondaryImagePreview ? (
                  <Image src={secondaryImagePreview} alt="Secondary" fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Camera className="w-8 h-8 text-gray-400" />
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => secondaryFileInputRef.current?.click()}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center space-x-2"
              >
                <Upload className="w-4 h-4" />
                <span>Upload Secondary Image</span>
              </button>
              <input
                ref={secondaryFileInputRef}
                type="file"
                accept="image/*"
                onChange={handleSecondaryImageSelect}
                className="hidden"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Milestones Section */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Timeline Milestones</h3>
          <button
            onClick={addMilestone}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Milestone</span>
          </button>
        </div>

        <div className="space-y-4">
          {content.milestones?.map((milestone, index) => (
            <div key={milestone.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start mb-4">
                <h4 className="font-medium text-gray-900">Milestone {index + 1}</h4>
                <button
                  onClick={() => deleteMilestone(milestone.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
                  <input
                    type="text"
                    value={milestone.year}
                    onChange={(e) => updateMilestone(milestone.id, { year: e.target.value })}
                    className={`w-full ${inputBaseClasses}`}
                    placeholder="2015"
                  />
                </div>
                
                <div className="md:col-span-3">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <input
                    type="text"
                    value={milestone.description}
                    onChange={(e) => updateMilestone(milestone.id, { description: e.target.value })}
                    className={`w-full ${inputBaseClasses}`}
                    placeholder="Milestone description"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quote Section */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
          <Quote className="w-5 h-5 mr-2 text-blue-600" />
          Founder Quote (Optional)
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Quote</label>
            <textarea
              value={content.quote || ''}
              onChange={(e) => setContent(prev => ({ ...prev, quote: e.target.value }))}
              rows={3}
              className={`w-full ${textareaBaseClasses}`}
              placeholder="Our vision was never just about teaching skills..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Author Name</label>
              <input
                type="text"
                value={content.quoteAuthor || ''}
                onChange={(e) => setContent(prev => ({ ...prev, quoteAuthor: e.target.value }))}
                className={`w-full ${inputBaseClasses}`}
                placeholder="Sarah Johnson"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Author Title</label>
              <input
                type="text"
                value={content.quoteAuthorTitle || ''}
                onChange={(e) => setContent(prev => ({ ...prev, quoteAuthorTitle: e.target.value }))}
                className={`w-full ${inputBaseClasses}`}
                placeholder="Founder & Creative Director"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
        >
          {saving && <Loader2 className="w-4 h-4 animate-spin" />}
          <span>Save Story Content</span>
        </button>
      </div>
    </div>
  )
}
