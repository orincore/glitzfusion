'use client'

import { useState, useEffect, useRef } from 'react'
import { Plus, Edit, Trash2, Upload, Camera, Loader2, Calendar, Users, Award } from 'lucide-react'
import Image from 'next/image'
import toast from 'react-hot-toast'

interface JourneyMilestone {
  id: string;
  year: string;
  title: string;
  description: string;
  image?: string;
  imageKey?: string;
  stats?: {
    label: string;
    value: string;
  }[];
}

interface JourneyContent {
  title?: string;
  subtitle?: string;
  description?: string;
  founderQuote?: string;
  founderName?: string;
  founderTitle?: string;
  founderImage?: string;
  founderImageKey?: string;
  milestones?: JourneyMilestone[];
}

export function JourneyAdmin() {
  const [content, setContent] = useState<JourneyContent>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [founderImageFile, setFounderImageFile] = useState<File | null>(null)
  const [founderImagePreview, setFounderImagePreview] = useState<string>('')
  const founderFileInputRef = useRef<HTMLInputElement>(null)

  const inputBaseClasses = 'px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent'
  const textareaBaseClasses = 'px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent'

  useEffect(() => {
    fetchJourneyContent()
  }, [])

  const fetchJourneyContent = async () => {
    try {
      const response = await fetch('/api/about/journey')
      if (response.ok) {
        const data = await response.json()
        setContent(data)
        setFounderImagePreview(data.founderImage || '')
      }
    } catch (error) {
      console.error('Error fetching journey content:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFounderImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFounderImageFile(file)
      const reader = new FileReader()
      reader.onload = () => setFounderImagePreview(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  const addMilestone = () => {
    const newMilestone: JourneyMilestone = {
      id: `milestone_${Date.now()}`,
      year: new Date().getFullYear().toString(),
      title: 'New Milestone',
      description: 'Milestone description',
      stats: []
    }
    
    setContent(prev => ({
      ...prev,
      milestones: [...(prev.milestones || []), newMilestone]
    }))
  }

  const updateMilestone = (id: string, updates: Partial<JourneyMilestone>) => {
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

  const addStat = (milestoneId: string) => {
    const newStat = { label: 'New Stat', value: '0' }
    updateMilestone(milestoneId, {
      stats: [...(content.milestones?.find(m => m.id === milestoneId)?.stats || []), newStat]
    })
  }

  const updateStat = (milestoneId: string, statIndex: number, updates: { label?: string; value?: string }) => {
    const milestone = content.milestones?.find(m => m.id === milestoneId)
    if (!milestone) return

    const updatedStats = [...(milestone.stats || [])]
    updatedStats[statIndex] = { ...updatedStats[statIndex], ...updates }
    updateMilestone(milestoneId, { stats: updatedStats })
  }

  const deleteStat = (milestoneId: string, statIndex: number) => {
    const milestone = content.milestones?.find(m => m.id === milestoneId)
    if (!milestone) return

    const updatedStats = milestone.stats?.filter((_, index) => index !== statIndex) || []
    updateMilestone(milestoneId, { stats: updatedStats })
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const formData = new FormData()
      formData.append('contentData', JSON.stringify(content))
      
      if (founderImageFile) {
        formData.append('founderImage', founderImageFile)
      }

      const response = await fetch('/api/about/journey', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) throw new Error('Failed to save journey content')

      const savedContent = await response.json()
      setContent(savedContent)
      setFounderImageFile(null)
      toast.success('Journey content saved successfully!')
    } catch (error) {
      toast.error('Failed to save journey content')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center space-x-2 text-blue-600">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Loading journey content...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 text-gray-900">
      {/* Header Section */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Journey Section Content</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
            <input
              type="text"
              value={content.title || ''}
              onChange={(e) => setContent(prev => ({ ...prev, title: e.target.value }))}
              className={`w-full ${inputBaseClasses}`}
              placeholder="Our Journey"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Subtitle</label>
            <input
              type="text"
              value={content.subtitle || ''}
              onChange={(e) => setContent(prev => ({ ...prev, subtitle: e.target.value }))}
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

      {/* Founder Quote Section */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Founder Quote</h3>
        
        <div className="space-y-4">
          {/* Founder Image */}
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">Founder Photo</label>
            <div className="flex items-center space-x-4">
              <div className="relative w-24 h-24 rounded-full overflow-hidden bg-gray-100">
                {founderImagePreview ? (
                  <Image src={founderImagePreview} alt="Founder" fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Camera className="w-8 h-8 text-gray-400" />
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => founderFileInputRef.current?.click()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
              >
                <Upload className="w-4 h-4" />
                <span>Upload Photo</span>
              </button>
              <input
                ref={founderFileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFounderImageSelect}
                className="hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Founder Name</label>
              <input
                type="text"
                value={content.founderName || ''}
                onChange={(e) => setContent(prev => ({ ...prev, founderName: e.target.value }))}
                className={`w-full ${inputBaseClasses}`}
                placeholder="Sarah Johnson"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Founder Title</label>
              <input
                type="text"
                value={content.founderTitle || ''}
                onChange={(e) => setContent(prev => ({ ...prev, founderTitle: e.target.value }))}
                className={`w-full ${inputBaseClasses}`}
                placeholder="Founder & Creative Director"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Quote</label>
            <textarea
              value={content.founderQuote || ''}
              onChange={(e) => setContent(prev => ({ ...prev, founderQuote: e.target.value }))}
              rows={3}
              className={`w-full ${textareaBaseClasses}`}
              placeholder="Our vision was never just about teaching skills..."
            />
          </div>
        </div>
      </div>

      {/* Milestones Section */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Journey Milestones</h3>
          <button
            onClick={addMilestone}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Milestone</span>
          </button>
        </div>

        <div className="space-y-6">
          {content.milestones?.map((milestone, index) => (
            <div key={milestone.id} className="border border-gray-200 rounded-lg p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  <h4 className="font-medium text-gray-900">Milestone {index + 1}</h4>
                </div>
                <button
                  onClick={() => deleteMilestone(milestone.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
                  <input
                    type="text"
                    value={milestone.year}
                    onChange={(e) => updateMilestone(milestone.id, { year: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="2015"
                  />
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      addStat(milestone.id);
                    }}
                    className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 flex items-center space-x-1"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Stat</span>
                  </button>
                </div>

                {milestone.stats?.map((stat, statIndex) => (
                  <div key={statIndex} className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={stat.label}
                      onChange={(e) => updateStat(milestone.id, statIndex, { label: e.target.value })}
                      className={`flex-1 ${inputBaseClasses} text-sm`}
                      placeholder="Stat label"
                    />
                    <input
                      type="text"
                      value={stat.value}
                      onChange={(e) => updateStat(milestone.id, statIndex, { value: e.target.value })}
                      className={`w-24 ${inputBaseClasses} text-sm`}
                      placeholder="Value"
                    />
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        deleteStat(milestone.id, statIndex);
                      }}
                      className="p-2 text-red-600 hover:bg-red-50 rounded"
                      title="Delete stat"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <input
                      type="text"
                      value={stat.value}
                      onChange={(e) => updateStat(milestone.id, statIndex, { value: e.target.value })}
                      className={`w-24 ${inputBaseClasses} text-sm`}
                      placeholder="Value"
                    />
                    <button
                      onClick={() => deleteStat(milestone.id, statIndex)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
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
          <span>Save Journey Content</span>
        </button>
      </div>
    </div>
  )
}
