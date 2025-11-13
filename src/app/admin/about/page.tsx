'use client'

import { useState, useEffect } from 'react'
import { useAbout, AboutContent, TeamMember, Founder } from '@/hooks/useAbout'
import { Save, Upload, Eye, EyeOff, Loader2, CheckCircle, XCircle, Mail, Phone, MapPin, Instagram, Facebook, Twitter, Youtube, Plus, Edit, Trash2, Users, Crown, Camera } from 'lucide-react'
import toast, { Toaster } from 'react-hot-toast'
import Image from 'next/image'
import { AboutAdminTabs } from '@/components/admin/AboutAdminTabs'

interface MediaUploadProps {
  onUpload: (url: string) => void
  currentUrl?: string
  label: string
}

function MediaUpload({ onUpload, currentUrl, label }: MediaUploadProps) {
  const [uploading, setUploading] = useState(false)

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('alt', `About section ${label}`)
      formData.append('description', `Media for about section ${label}`)

      const response = await fetch('/api/media/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Upload failed')
      }

      const result = await response.json()
      onUpload(result.url)
      toast.success(
        <div className="flex items-center space-x-2">
          <CheckCircle className="w-5 h-5 text-green-500" />
          <div>
            <p className="font-semibold">Media Uploaded!</p>
            <p className="text-sm text-gray-600">File uploaded successfully to R2 storage.</p>
          </div>
        </div>,
        {
          duration: 3000,
          style: {
            background: '#10B981',
            color: 'white',
            padding: '16px',
            borderRadius: '8px',
          },
        }
      )
    } catch (error) {
      console.error('Upload error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Upload failed'
      toast.error(
        <div className="flex items-center space-x-2">
          <XCircle className="w-5 h-5 text-red-500" />
          <div>
            <p className="font-semibold">Upload Failed</p>
            <p className="text-sm text-gray-600">{errorMessage}</p>
          </div>
        </div>,
        {
          duration: 4000,
          style: {
            background: '#EF4444',
            color: 'white',
            padding: '16px',
            borderRadius: '8px',
          },
        }
      )
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-300">
        {label}
      </label>
      <div className="flex items-center space-x-4">
        <input
          type="file"
          accept="image/*,video/*"
          onChange={handleFileUpload}
          disabled={uploading}
          className="block w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary-gold file:text-primary-black hover:file:bg-primary-gold-light disabled:opacity-50"
        />
        {uploading && <Loader2 className="w-4 h-4 animate-spin text-primary-gold" />}
      </div>
      {currentUrl && (
        <div className="mt-2">
          <p className="text-xs text-gray-400">Current: {currentUrl}</p>
          {currentUrl.includes('video') || currentUrl.includes('.mp4') ? (
            <video src={currentUrl} className="mt-2 w-32 h-20 object-cover rounded" controls />
          ) : (
            <img src={currentUrl} alt={label} className="mt-2 w-32 h-20 object-cover rounded" />
          )}
        </div>
      )}
    </div>
  )
}

export default function AboutAdminPage() {
  const { content, loading, error, updateContent } = useAbout()
  const [formData, setFormData] = useState<AboutContent>({})
  const [saving, setSaving] = useState(false)
  const [previewMode, setPreviewMode] = useState(false)

  useEffect(() => {
    if (content) {
      setFormData(content)
    }
  }, [content])

  const handleInputChange = (key: keyof AboutContent, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }))
  }

  const handleSave = async () => {
    setSaving(true)
    
    // Show loading toast
    const loadingToast = toast.loading('Saving about content...', {
      duration: Infinity,
    })
    
    try {
      const success = await updateContent(formData)
      
      // Dismiss loading toast
      toast.dismiss(loadingToast)
      
      if (success) {
        toast.success(
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <div>
              <p className="font-semibold">Content Updated Successfully!</p>
              <p className="text-sm text-gray-600">All about section changes have been saved.</p>
            </div>
          </div>,
          {
            duration: 4000,
            style: {
              background: '#10B981',
              color: 'white',
              padding: '16px',
              borderRadius: '8px',
            },
          }
        )
      } else {
        toast.error(
          <div className="flex items-center space-x-2">
            <XCircle className="w-5 h-5 text-red-500" />
            <div>
              <p className="font-semibold">Update Failed</p>
              <p className="text-sm text-gray-600">Please try again or check your connection.</p>
            </div>
          </div>,
          {
            duration: 5000,
            style: {
              background: '#EF4444',
              color: 'white',
              padding: '16px',
              borderRadius: '8px',
            },
          }
        )
      }
    } catch (error) {
      // Dismiss loading toast
      toast.dismiss(loadingToast)
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      toast.error(
        <div className="flex items-center space-x-2">
          <XCircle className="w-5 h-5 text-red-500" />
          <div>
            <p className="font-semibold">Save Error</p>
            <p className="text-sm text-gray-600">{errorMessage}</p>
          </div>
        </div>,
        {
          duration: 6000,
          style: {
            background: '#EF4444',
            color: 'white',
            padding: '16px',
            borderRadius: '8px',
          },
        }
      )
    } finally {
      setSaving(false)
    }
  }

  const handleMediaUpload = (key: keyof AboutContent, url: string) => {
    setFormData(prev => ({ ...prev, [key]: url }))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-primary-dark flex items-center justify-center">
        <div className="flex items-center space-x-2 text-primary-gold">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Loading about content...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-primary-dark flex items-center justify-center">
        <div className="text-red-400 text-center">
          <p className="text-xl mb-2">Error loading content</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-primary-dark">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">About Section Management</h1>
            <p className="text-gray-400">Edit and manage all About section content across multiple pages</p>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-3">
                <h3 className="text-blue-200 font-semibold text-sm mb-1">📄 About Page Only</h3>
                <p className="text-blue-300 text-xs">Hero Section</p>
              </div>
              <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-3">
                <h3 className="text-green-200 font-semibold text-sm mb-1">🏠 Homepage + About</h3>
                <p className="text-green-300 text-xs">Main About, Features, Stats, CTA</p>
              </div>
              <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-3">
                <h3 className="text-purple-200 font-semibold text-sm mb-1">🎯 Impact</h3>
                <p className="text-purple-300 text-xs">Changes reflect immediately on both pages</p>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setPreviewMode(!previewMode)}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
            >
              {previewMode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              <span>{previewMode ? 'Edit Mode' : 'Preview Mode'}</span>
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center space-x-2 px-6 py-2 bg-primary-gold hover:bg-primary-gold-light text-primary-black font-semibold rounded-lg transition-colors disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>{saving ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </div>

        {/* Color Legend */}
        <div className="mb-6 bg-gray-800 rounded-lg p-4 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-3">📋 Section Guide</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-3 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded"></div>
              <span className="text-blue-200">About Page Only</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span className="text-green-200">Homepage + About</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-purple-500 rounded"></div>
              <span className="text-purple-200">Feature Cards</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-yellow-500 rounded"></div>
              <span className="text-yellow-200">Statistics</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded"></div>
              <span className="text-red-200">Call to Action</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-orange-500 rounded"></div>
              <span className="text-orange-200">Global Contact</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Hero Section */}
          <div className="bg-gray-800 rounded-lg p-6 border-l-4 border-blue-500">
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-white mb-2">Hero Section</h2>
              <div className="bg-blue-900/30 rounded-lg p-3 mb-4">
                <p className="text-blue-200 text-sm font-medium mb-1">📍 Appears on: <span className="text-blue-100 font-semibold">/about page</span></p>
                <p className="text-blue-200 text-sm">The large banner section at the top of the About page with animated particles background</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Hero Title
                </label>
                <input
                  type="text"
                  value={formData.heroTitle || ''}
                  onChange={(e) => handleInputChange('heroTitle', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-primary-gold focus:border-transparent"
                  placeholder="Where Talent Meets Opportunity"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Hero Subtitle
                </label>
                <input
                  type="text"
                  value={formData.heroSubtitle || ''}
                  onChange={(e) => handleInputChange('heroSubtitle', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-primary-gold focus:border-transparent"
                  placeholder="Our Story"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Hero Description
                </label>
                <textarea
                  value={formData.heroDescription || ''}
                  onChange={(e) => handleInputChange('heroDescription', e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-primary-gold focus:border-transparent"
                  placeholder="At Glitz Fusion, we believe in the transformative power of performing arts..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Primary Button Text
                  </label>
                  <input
                    type="text"
                    value={formData.heroButtonPrimary || ''}
                    onChange={(e) => handleInputChange('heroButtonPrimary', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-primary-gold focus:border-transparent"
                    placeholder="Join Our Community"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Secondary Button Text
                  </label>
                  <input
                    type="text"
                    value={formData.heroButtonSecondary || ''}
                    onChange={(e) => handleInputChange('heroButtonSecondary', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-primary-gold focus:border-transparent"
                    placeholder="Watch Our Story"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Main About Section */}
          <div className="bg-gray-800 rounded-lg p-6 border-l-4 border-green-500">
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-white mb-2">Main About Section</h2>
              <div className="bg-green-900/30 rounded-lg p-3 mb-4">
                <p className="text-green-200 text-sm font-medium mb-1">📍 Appears on: <span className="text-green-100 font-semibold">Homepage & /about page</span></p>
                <p className="text-green-200 text-sm">Main content section with title, descriptions, video, and feature cards. Shows on both homepage and dedicated about page</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  About Title
                </label>
                <input
                  type="text"
                  value={formData.aboutTitle || ''}
                  onChange={(e) => handleInputChange('aboutTitle', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-primary-gold focus:border-transparent"
                  placeholder="About Glitz Fusion"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  First Description Paragraph
                </label>
                <textarea
                  value={formData.aboutDescription1 || ''}
                  onChange={(e) => handleInputChange('aboutDescription1', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-primary-gold focus:border-transparent"
                  placeholder="For over a decade, Glitz Fusion has been the premier destination..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Second Description Paragraph
                </label>
                <textarea
                  value={formData.aboutDescription2 || ''}
                  onChange={(e) => handleInputChange('aboutDescription2', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-primary-gold focus:border-transparent"
                  placeholder="We believe that every individual has a unique creative voice..."
                />
              </div>

              <MediaUpload
                label="About Video"
                currentUrl={formData.aboutVideoUrl}
                onUpload={(url) => handleMediaUpload('aboutVideoUrl', url)}
              />
            </div>
          </div>

          {/* Features Section */}
          <div className="bg-gray-800 rounded-lg p-6 lg:col-span-2 border-l-4 border-purple-500">
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-white mb-2">Features Section</h2>
              <div className="bg-purple-900/30 rounded-lg p-3 mb-4">
                <p className="text-purple-200 text-sm font-medium mb-1">📍 Appears on: <span className="text-purple-100 font-semibold">Homepage & /about page</span></p>
                <p className="text-purple-200 text-sm">Four feature cards highlighting academy strengths (Industry Excellence, Personalized Training, etc.)</p>
                <p className="text-purple-200 text-xs mt-1 opacity-80">💡 Tip: These appear as a 2x2 grid on both pages</p>
                <p className="text-purple-200 text-sm">These features are displayed on both the homepage and the about page, providing a clear overview of the academy's benefits.</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((num) => (
                <div key={num} className="space-y-4 p-4 bg-gray-700 rounded-lg border border-purple-500/20">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-white">Feature {num}</h3>
                    <span className="text-xs bg-purple-600 text-white px-2 py-1 rounded">Card {num}</span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Title
                    </label>
                    <input
                      type="text"
                      value={(formData[`feature${num}Title` as keyof AboutContent] as string) || ''}
                      onChange={(e) => handleInputChange(`feature${num}Title` as keyof AboutContent, e.target.value)}
                      className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white focus:ring-2 focus:ring-primary-gold focus:border-transparent"
                      placeholder={`Feature ${num} Title`}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Description
                    </label>
                    <textarea
                      value={(formData[`feature${num}Description` as keyof AboutContent] as string) || ''}
                      onChange={(e) => handleInputChange(`feature${num}Description` as keyof AboutContent, e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white focus:ring-2 focus:ring-primary-gold focus:border-transparent"
                      placeholder={`Feature ${num} Description`}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Icon (Lucide icon name)
                    </label>
                    <input
                      type="text"
                      value={(formData[`feature${num}Icon` as keyof AboutContent] as string) || ''}
                      onChange={(e) => handleInputChange(`feature${num}Icon` as keyof AboutContent, e.target.value)}
                      className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white focus:ring-2 focus:ring-primary-gold focus:border-transparent"
                      placeholder="Award, Users, Target, Zap"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Stats Section */}
          <div className="bg-gray-800 rounded-lg p-6 border-l-4 border-yellow-500">
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-white mb-2">Statistics</h2>
              <div className="bg-yellow-900/30 rounded-lg p-3 mb-4">
                <p className="text-yellow-200 text-sm font-medium mb-1">📍 Appears on: <span className="text-yellow-100 font-semibold">Homepage & /about page</span></p>
                <p className="text-yellow-200 text-sm">Floating stat cards next to the video (e.g., "10+ Years Experience", "500+ Success Stories")</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4 p-3 bg-yellow-900/20 rounded-lg border border-yellow-500/20">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-white">Stat 1</h3>
                  <span className="text-xs bg-yellow-600 text-white px-2 py-1 rounded">Left Card</span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Value
                  </label>
                  <input
                    type="text"
                    value={formData.stat1Value || ''}
                    onChange={(e) => handleInputChange('stat1Value', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-primary-gold focus:border-transparent"
                    placeholder="10+"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Label
                  </label>
                  <input
                    type="text"
                    value={formData.stat1Label || ''}
                    onChange={(e) => handleInputChange('stat1Label', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-primary-gold focus:border-transparent"
                    placeholder="Years Experience"
                  />
                </div>
              </div>
              <div className="space-y-4 p-3 bg-yellow-900/20 rounded-lg border border-yellow-500/20">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-white">Stat 2</h3>
                  <span className="text-xs bg-yellow-600 text-white px-2 py-1 rounded">Right Card</span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Value
                  </label>
                  <input
                    type="text"
                    value={formData.stat2Value || ''}
                    onChange={(e) => handleInputChange('stat2Value', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-primary-gold focus:border-transparent"
                    placeholder="500+"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Label
                  </label>
                  <input
                    type="text"
                    value={formData.stat2Label || ''}
                    onChange={(e) => handleInputChange('stat2Label', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-primary-gold focus:border-transparent"
                    placeholder="Success Stories"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="bg-gray-800 rounded-lg p-6 border-l-4 border-red-500">
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-white mb-2">Call to Action Section</h2>
              <div className="bg-red-900/30 rounded-lg p-3 mb-4">
                <p className="text-red-200 text-sm font-medium mb-1">📍 Appears on: <span className="text-red-100 font-semibold">Homepage & /about page</span></p>
                <p className="text-red-200 text-sm">Bottom section with glass panel containing title, description, and action buttons</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  CTA Title
                </label>
                <input
                  type="text"
                  value={formData.ctaTitle || ''}
                  onChange={(e) => handleInputChange('ctaTitle', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-primary-gold focus:border-transparent"
                  placeholder="Ready to Begin Your Creative Journey?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  CTA Description
                </label>
                <textarea
                  value={formData.ctaDescription || ''}
                  onChange={(e) => handleInputChange('ctaDescription', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-primary-gold focus:border-transparent"
                  placeholder="Join hundreds of successful graduates who have transformed their passion into thriving careers."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Primary Button Text
                  </label>
                  <input
                    type="text"
                    value={formData.ctaButtonPrimary || ''}
                    onChange={(e) => handleInputChange('ctaButtonPrimary', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-primary-gold focus:border-transparent"
                    placeholder="Apply Now"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Secondary Button Text
                  </label>
                  <input
                    type="text"
                    value={formData.ctaButtonSecondary || ''}
                    onChange={(e) => handleInputChange('ctaButtonSecondary', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-primary-gold focus:border-transparent"
                    placeholder="Schedule Tour"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Contact Information Section */}
          <div className="bg-gray-800 rounded-lg p-6 lg:col-span-2 border-l-4 border-orange-500">
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-white mb-2">Global Contact Information</h2>
              <div className="bg-orange-900/30 rounded-lg p-3 mb-4">
                <p className="text-orange-200 text-sm font-medium mb-1">🌐 Appears on: <span className="text-orange-100 font-semibold">All pages (Footer, Contact, etc.)</span></p>
                <p className="text-orange-200 text-sm">Global contact details and social media links used throughout the entire website</p>
                <p className="text-orange-200 text-xs mt-1 opacity-80">💡 Tip: These details will be available site-wide for components to use</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Contact Details */}
              <div className="space-y-4 p-4 bg-gray-700 rounded-lg border border-orange-500/20">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-white">Contact Details</h3>
                  <span className="text-xs bg-orange-600 text-white px-2 py-1 rounded">Global Info</span>
                </div>
                
                <div>
                  <label className="flex items-center space-x-2 text-sm font-medium text-gray-300 mb-2">
                    <Mail className="w-4 h-4" />
                    <span>Email Address</span>
                  </label>
                  <input
                    type="email"
                    value={formData.contactEmail || ''}
                    onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white focus:ring-2 focus:ring-primary-gold focus:border-transparent"
                    placeholder="info@glitzfusion.com"
                  />
                </div>

                <div>
                  <label className="flex items-center space-x-2 text-sm font-medium text-gray-300 mb-2">
                    <Phone className="w-4 h-4" />
                    <span>Phone Number</span>
                  </label>
                  <input
                    type="tel"
                    value={formData.contactPhone || ''}
                    onChange={(e) => handleInputChange('contactPhone', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white focus:ring-2 focus:ring-primary-gold focus:border-transparent"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>

                <div>
                  <label className="flex items-center space-x-2 text-sm font-medium text-gray-300 mb-2">
                    <MapPin className="w-4 h-4" />
                    <span>Address</span>
                  </label>
                  <textarea
                    value={formData.contactAddress || ''}
                    onChange={(e) => handleInputChange('contactAddress', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white focus:ring-2 focus:ring-primary-gold focus:border-transparent"
                    placeholder="123 Creative Arts Blvd, Los Angeles, CA"
                  />
                </div>
              </div>

              {/* Social Media Links */}
              <div className="space-y-4 p-4 bg-gray-700 rounded-lg border border-orange-500/20">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-white">Social Media Links</h3>
                  <span className="text-xs bg-orange-600 text-white px-2 py-1 rounded">Social Links</span>
                </div>

                <div>
                  <label className="flex items-center space-x-2 text-sm font-medium text-gray-300 mb-2">
                    <Instagram className="w-4 h-4" />
                    <span>Instagram URL</span>
                  </label>
                  <input
                    type="url"
                    value={formData.socialInstagram || ''}
                    onChange={(e) => handleInputChange('socialInstagram', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white focus:ring-2 focus:ring-primary-gold focus:border-transparent"
                    placeholder="https://instagram.com/glitzfusion"
                  />
                </div>

                <div>
                  <label className="flex items-center space-x-2 text-sm font-medium text-gray-300 mb-2">
                    <Facebook className="w-4 h-4" />
                    <span>Facebook URL</span>
                  </label>
                  <input
                    type="url"
                    value={formData.socialFacebook || ''}
                    onChange={(e) => handleInputChange('socialFacebook', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white focus:ring-2 focus:ring-primary-gold focus:border-transparent"
                    placeholder="https://facebook.com/glitzfusion"
                  />
                </div>

                <div>
                  <label className="flex items-center space-x-2 text-sm font-medium text-gray-300 mb-2">
                    <Twitter className="w-4 h-4" />
                    <span>Twitter URL</span>
                  </label>
                  <input
                    type="url"
                    value={formData.socialTwitter || ''}
                    onChange={(e) => handleInputChange('socialTwitter', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white focus:ring-2 focus:ring-primary-gold focus:border-transparent"
                    placeholder="https://twitter.com/glitzfusion"
                  />
                </div>

                <div>
                  <label className="flex items-center space-x-2 text-sm font-medium text-gray-300 mb-2">
                    <Youtube className="w-4 h-4" />
                    <span>YouTube URL</span>
                  </label>
                  <input
                    type="url"
                    value={formData.socialYoutube || ''}
                    onChange={(e) => handleInputChange('socialYoutube', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white focus:ring-2 focus:ring-primary-gold focus:border-transparent"
                    placeholder="https://youtube.com/@glitzfusion"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Team & Founders Management */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-white mb-6">Team & Founders Management</h2>
          <AboutAdminTabs />
        </div>

        {/* Save Button (Mobile) */}
        <div className="mt-8 lg:hidden">
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-primary-gold hover:bg-primary-gold-light text-primary-black font-semibold rounded-lg transition-colors disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>{saving ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>
      </div>
      
      {/* Toast Container */}
      <Toaster
        position="top-right"
        reverseOrder={false}
        gutter={8}
        containerClassName=""
        containerStyle={{}}
        toastOptions={{
          // Define default options
          className: '',
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          // Default options for specific types
          success: {
            duration: 3000,
            style: {
              background: '#10B981',
              color: 'white',
            },
          },
          error: {
            duration: 4000,
            style: {
              background: '#EF4444',
              color: 'white',
            },
          },
          loading: {
            duration: Infinity,
          },
        }}
      />
    </div>
  )
}
