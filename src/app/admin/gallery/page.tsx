'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, Plus, Edit, Trash2, Star, Image, Video, Palette, Camera, Calendar, X, Save, Eye } from 'lucide-react'
import { GlassPanel } from '@/components/ui/GlassPanel'
import { useGallery, GalleryItem } from '@/hooks/useGallery'
import { toast } from 'react-hot-toast'

const categories = [
  { value: 'photo', label: 'Photo', icon: Image, color: 'from-blue-500 to-cyan-500' },
  { value: 'video', label: 'Video', icon: Video, color: 'from-purple-500 to-pink-500' },
  { value: 'artwork', label: 'Artwork', icon: Palette, color: 'from-orange-500 to-red-500' },
  { value: 'behind-scenes', label: 'Behind Scenes', icon: Camera, color: 'from-green-500 to-emerald-500' },
  { value: 'events', label: 'Events', icon: Calendar, color: 'from-yellow-500 to-amber-500' }
]

interface UploadFormData {
  title: string
  description: string
  category: string
  alt: string
  tags: string
  featured: boolean
}

interface SelectedFile {
  file: File
  preview: string
}

export default function AdminGalleryPage() {
  const { items, loading, error, refetch } = useGallery()
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [editingItem, setEditingItem] = useState<GalleryItem | null>(null)
  const [uploading, setUploading] = useState(false)
  const [formData, setFormData] = useState<UploadFormData>({
    title: '',
    description: '',
    category: 'photo',
    alt: '',
    tags: '',
    featured: false
  })
  const [selectedFile, setSelectedFile] = useState<SelectedFile | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const filteredItems = selectedCategory === 'all' 
    ? items 
    : items.filter(item => item.category === selectedCategory)

  const handleFileSelect = (file: File) => {
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
      toast.error('Only image and video files are allowed')
      return
    }

    // Validate file size (50MB limit)
    if (file.size > 50 * 1024 * 1024) {
      toast.error('File size must be less than 50MB')
      return
    }

    // Create preview URL
    const preview = URL.createObjectURL(file)
    setSelectedFile({ file, preview })

    // Auto-fill title from filename if empty
    if (!formData.title) {
      const nameWithoutExt = file.name.replace(/\.[^/.]+$/, "")
      setFormData(prev => ({ ...prev, title: nameWithoutExt }))
    }
  }

  const handleUpload = async () => {
    if (!selectedFile || !formData.title.trim()) {
      toast.error('Please select a file and provide a title')
      return
    }

    setUploading(true)
    try {
      const uploadFormData = new FormData()
      uploadFormData.append('file', selectedFile.file)
      uploadFormData.append('title', formData.title)
      uploadFormData.append('description', formData.description)
      uploadFormData.append('category', formData.category)
      uploadFormData.append('alt', formData.alt || formData.title)
      uploadFormData.append('tags', formData.tags)
      uploadFormData.append('featured', formData.featured.toString())

      const response = await fetch('/api/gallery', {
        method: 'POST',
        body: uploadFormData
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Upload failed')
      }

      toast.success('Gallery item uploaded successfully!')
      setShowUploadModal(false)
      resetForm()
      refetch()
    } catch (error) {
      console.error('Upload error:', error)
      toast.error(error instanceof Error ? error.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (item: GalleryItem) => {
    if (!confirm(`Are you sure you want to delete "${item.title}"?`)) return

    try {
      const response = await fetch(`/api/gallery/${item._id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Delete failed')
      }

      toast.success('Gallery item deleted successfully!')
      refetch()
    } catch (error) {
      console.error('Delete error:', error)
      toast.error('Failed to delete gallery item')
    }
  }

  const handleUpdate = async (item: GalleryItem) => {
    try {
      const response = await fetch(`/api/gallery/${item._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: item.title,
          description: item.description,
          category: item.category,
          alt: item.alt,
          tags: item.tags,
          featured: item.featured
        })
      })

      if (!response.ok) {
        throw new Error('Update failed')
      }

      toast.success('Gallery item updated successfully!')
      setEditingItem(null)
      refetch()
    } catch (error) {
      console.error('Update error:', error)
      toast.error('Failed to update gallery item')
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      category: 'photo',
      alt: '',
      tags: '',
      featured: false
    })
    if (selectedFile) {
      URL.revokeObjectURL(selectedFile.preview)
      setSelectedFile(null)
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-dark via-black to-primary-dark/80 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-display font-bold text-gradient-gold mb-4">Gallery Management</h1>
          <p className="text-lg text-gray-300 max-w-2xl">Upload, organize, and manage your gallery content with our intuitive admin interface</p>
        </motion.div>

        {/* Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <GlassPanel className="p-8 backdrop-blur-xl" border={false} highlight={false}>
            <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
              {/* Category Filter */}
              <div className="flex flex-col gap-4 flex-1">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Eye className="w-5 h-5 text-primary-gold" />
                  Filter Gallery Items
                </h3>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => setSelectedCategory('all')}
                    className={`px-5 py-3 rounded-xl transition-all duration-300 font-medium ${
                      selectedCategory === 'all'
                        ? 'bg-gradient-to-r from-primary-gold to-yellow-500 text-primary-black shadow-lg shadow-primary-gold/25'
                        : 'bg-white/10 text-gray-300 hover:bg-white/20 hover:text-white border border-white/10'
                    }`}
                  >
                    All Items ({items.length})
                  </button>
                  {categories.map((category) => {
                    const Icon = category.icon
                    const count = items.filter(item => item.category === category.value).length
                    return (
                      <button
                        key={category.value}
                        onClick={() => setSelectedCategory(category.value)}
                        className={`px-5 py-3 rounded-xl transition-all duration-300 flex items-center gap-2 font-medium ${
                          selectedCategory === category.value
                            ? 'bg-gradient-to-r from-primary-gold to-yellow-500 text-primary-black shadow-lg shadow-primary-gold/25'
                            : 'bg-white/10 text-gray-300 hover:bg-white/20 hover:text-white border border-white/10'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        {category.label} ({count})
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Upload Button */}
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => setShowUploadModal(true)}
                  className="bg-gradient-to-r from-primary-gold to-yellow-500 text-primary-black px-8 py-4 rounded-xl font-bold flex items-center gap-3 hover:shadow-xl hover:shadow-primary-gold/30 transition-all duration-300 hover:scale-105"
                >
                  <Plus className="w-5 h-5" />
                  Upload New Item
                </button>
                <p className="text-xs text-gray-400 text-center">Add photos, videos & artwork</p>
              </div>
            </div>
          </GlassPanel>
        </motion.div>

        {/* Gallery Grid */}
        {loading ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {[...Array(8)].map((_, i) => (
              <GlassPanel key={i} className="aspect-square animate-pulse backdrop-blur-xl" border={false} highlight={false}>
                <div className="w-full h-full bg-gradient-to-br from-white/5 to-white/10 rounded-lg" />
              </GlassPanel>
            ))}
          </motion.div>
        ) : error ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <GlassPanel className="p-12 text-center backdrop-blur-xl" border={false} highlight={false}>
              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center">
                  <X className="w-8 h-8 text-red-400" />
                </div>
                <div>
                  <p className="text-red-400 text-lg font-semibold mb-2">Error loading gallery</p>
                  <p className="text-gray-400 mb-4">{error}</p>
                </div>
                <button
                  onClick={refetch}
                  className="bg-gradient-to-r from-primary-gold to-yellow-500 text-primary-black px-6 py-3 rounded-xl font-medium hover:shadow-lg hover:shadow-primary-gold/25 transition-all duration-300"
                >
                  Try Again
                </button>
              </div>
            </GlassPanel>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {filteredItems.map((item, index) => {
              const category = categories.find(c => c.value === item.category)
              const Icon = category?.icon || Image
              
              return (
                <motion.div
                  key={item._id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <GlassPanel className="group relative aspect-square overflow-hidden hover:scale-[1.02] transition-all duration-500 backdrop-blur-xl" border={false} highlight={false}>
                    {/* Media */}
                    <div className="absolute inset-0">
                      {item.mimeType.startsWith('video/') ? (
                        <video
                          src={item.mediaUrl}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          muted
                          loop
                          onMouseEnter={(e) => e.currentTarget.play()}
                          onMouseLeave={(e) => e.currentTarget.pause()}
                        />
                      ) : (
                        <img
                          src={item.thumbnailUrl || item.mediaUrl}
                          alt={item.alt || item.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                      )}
                    </div>

                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="absolute bottom-0 left-0 right-0 p-6">
                        <div className="flex items-center gap-2 mb-3">
                          <div className={`p-1.5 rounded-lg bg-gradient-to-r ${category?.color || 'from-gray-500 to-gray-600'}`}>
                            <Icon className="w-3 h-3 text-white" />
                          </div>
                          <span className="text-xs text-gray-200 capitalize font-medium">{item.category.replace('-', ' ')}</span>
                          {item.featured && (
                            <div className="bg-yellow-400/90 text-primary-black px-2 py-0.5 rounded-full text-xs font-bold flex items-center gap-1">
                              <Star className="w-2.5 h-2.5 fill-current" />
                              FEATURED
                            </div>
                          )}
                        </div>
                        <h3 className="text-white font-bold text-base mb-2 line-clamp-2">{item.title}</h3>
                        {item.description && (
                          <p className="text-gray-300 text-sm line-clamp-2 leading-relaxed">{item.description}</p>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                      <button
                        onClick={() => setEditingItem(item)}
                        className="bg-blue-500/90 hover:bg-blue-500 text-white p-2.5 rounded-xl backdrop-blur-sm transition-all duration-300 hover:scale-110 shadow-lg"
                        title="Edit item"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(item)}
                        className="bg-red-500/90 hover:bg-red-500 text-white p-2.5 rounded-xl backdrop-blur-sm transition-all duration-300 hover:scale-110 shadow-lg"
                        title="Delete item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Status Indicator */}
                    <div className="absolute top-3 left-3">
                      <div className={`w-3 h-3 rounded-full ${item.isActive ? 'bg-green-400' : 'bg-gray-400'} shadow-lg`} 
                           title={item.isActive ? 'Active' : 'Inactive'} />
                    </div>
                  </GlassPanel>
                </motion.div>
              )
            })}
          </motion.div>
        )}

        {/* Upload Modal */}
        <AnimatePresence>
          {showUploadModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4"
              onClick={(e) => e.target === e.currentTarget && setShowUploadModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="w-full max-w-3xl max-h-[90vh] overflow-y-auto"
              >
                <GlassPanel className="p-8 backdrop-blur-xl" border={false} highlight={false}>
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h2 className="text-3xl font-display font-bold text-gradient-gold mb-2">Upload New Item</h2>
                      <p className="text-gray-400">Add photos, videos, or artwork to your gallery</p>
                    </div>
                    <button
                      onClick={() => setShowUploadModal(false)}
                      className="text-gray-400 hover:text-white transition-all duration-300 p-2 rounded-xl hover:bg-white/10"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>

                  <div className="space-y-6">
                    {/* File Upload */}
                    <div>
                      <label className="block text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <Upload className="w-5 h-5 text-primary-gold" />
                        Media File *
                      </label>
                      <div className="border-2 border-dashed border-white/20 rounded-2xl p-8 text-center hover:border-primary-gold/50 transition-all duration-300 bg-white/5 hover:bg-white/10">
                        <div className="flex flex-col items-center gap-4">
                          <div className="w-16 h-16 bg-primary-gold/20 rounded-full flex items-center justify-center">
                            <Upload className="w-8 h-8 text-primary-gold" />
                          </div>
                          <div>
                            <p className="text-white font-medium mb-1">Click to upload or drag and drop</p>
                            <p className="text-sm text-gray-400">Images and videos up to 50MB</p>
                            <p className="text-xs text-gray-500 mt-1">Supported: JPG, PNG, GIF, MP4, MOV, WebM</p>
                          </div>
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*,video/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0]
                              if (file) {
                                handleFileSelect(file)
                              }
                            }}
                          />
                          <button
                            onClick={() => fileInputRef.current?.click()}
                            className="bg-gradient-to-r from-primary-gold to-yellow-500 text-primary-black px-6 py-3 rounded-xl font-bold hover:shadow-lg hover:shadow-primary-gold/25 transition-all duration-300 hover:scale-105"
                          >
                            Choose File
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* File Preview */}
                    {selectedFile && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-6"
                      >
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                          <Eye className="w-5 h-5 text-primary-gold" />
                          File Preview
                        </h3>
                        <div className="relative aspect-video max-w-md mx-auto rounded-xl overflow-hidden bg-black/20">
                          {selectedFile.file.type.startsWith('video/') ? (
                            <video
                              src={selectedFile.preview}
                              className="w-full h-full object-cover"
                              controls
                            />
                          ) : (
                            <img
                              src={selectedFile.preview}
                              alt="Preview"
                              className="w-full h-full object-cover"
                            />
                          )}
                          <button
                            onClick={() => {
                              URL.revokeObjectURL(selectedFile.preview)
                              setSelectedFile(null)
                              if (fileInputRef.current) {
                                fileInputRef.current.value = ''
                              }
                            }}
                            className="absolute top-2 right-2 bg-red-500/80 hover:bg-red-500 text-white p-2 rounded-lg backdrop-blur-sm transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="text-center mt-3 text-sm text-gray-400">
                          <p>{selectedFile.file.name}</p>
                          <p>{(selectedFile.file.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                      </motion.div>
                    )}

                    {/* Form Fields Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Title */}
                      <div className="md:col-span-2">
                        <label className="block text-lg font-semibold text-white mb-3">
                          Title *
                        </label>
                        <input
                          type="text"
                          value={formData.title}
                          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                          className="w-full bg-white/10 border border-white/20 rounded-xl px-5 py-4 text-white placeholder-gray-400 focus:outline-none focus:border-primary-gold focus:ring-2 focus:ring-primary-gold/20 transition-all duration-300"
                          placeholder="Enter a descriptive title..."
                        />
                      </div>

                      {/* Category */}
                      <div>
                        <label className="block text-lg font-semibold text-white mb-3">
                          Category
                        </label>
                        <div className="relative">
                          <select
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            className="w-full bg-white/10 border border-white/20 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-primary-gold focus:ring-2 focus:ring-primary-gold/20 transition-all duration-300 appearance-none"
                          >
                            {categories.map((category) => (
                              <option key={category.value} value={category.value} className="bg-gray-800 text-white">
                                {category.label}
                              </option>
                            ))}
                          </select>
                          <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </div>
                      </div>

                      {/* Alt Text */}
                      <div>
                        <label className="block text-lg font-semibold text-white mb-3">
                          Alt Text
                        </label>
                        <input
                          type="text"
                          value={formData.alt}
                          onChange={(e) => setFormData({ ...formData, alt: e.target.value })}
                          className="w-full bg-white/10 border border-white/20 rounded-xl px-5 py-4 text-white placeholder-gray-400 focus:outline-none focus:border-primary-gold focus:ring-2 focus:ring-primary-gold/20 transition-all duration-300"
                          placeholder="Alt text for accessibility..."
                        />
                      </div>

                      {/* Description */}
                      <div className="md:col-span-2">
                        <label className="block text-lg font-semibold text-white mb-3">
                          Description
                        </label>
                        <textarea
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          rows={4}
                          className="w-full bg-white/10 border border-white/20 rounded-xl px-5 py-4 text-white placeholder-gray-400 focus:outline-none focus:border-primary-gold focus:ring-2 focus:ring-primary-gold/20 resize-none transition-all duration-300"
                          placeholder="Enter a detailed description..."
                        />
                      </div>

                      {/* Tags */}
                      <div>
                        <label className="block text-lg font-semibold text-white mb-3">
                          Tags
                        </label>
                        <input
                          type="text"
                          value={formData.tags}
                          onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                          className="w-full bg-white/10 border border-white/20 rounded-xl px-5 py-4 text-white placeholder-gray-400 focus:outline-none focus:border-primary-gold focus:ring-2 focus:ring-primary-gold/20 transition-all duration-300"
                          placeholder="dance, performance, art..."
                        />
                      </div>

                      {/* Featured Toggle */}
                      <div className="flex items-center justify-center">
                        <label className="flex items-center gap-4 cursor-pointer p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all duration-300 border border-white/10">
                          <input
                            type="checkbox"
                            checked={formData.featured}
                            onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                            className="w-5 h-5 text-primary-gold bg-transparent border-2 border-white/30 rounded focus:ring-primary-gold focus:ring-2 transition-all duration-300"
                          />
                          <div className="flex items-center gap-2">
                            <Star className="w-5 h-5 text-yellow-400" />
                            <span className="text-white font-medium">Featured Item</span>
                          </div>
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4 mt-8 pt-6 border-t border-white/10">
                    <button
                      onClick={() => {
                        setShowUploadModal(false)
                        resetForm()
                      }}
                      className="flex-1 bg-white/10 text-gray-300 py-4 px-6 rounded-xl hover:bg-white/20 transition-all duration-300 font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleUpload}
                      disabled={!selectedFile || !formData.title.trim() || uploading}
                      className="flex-1 bg-gradient-to-r from-primary-gold to-yellow-500 text-primary-black py-4 px-6 rounded-xl font-bold hover:shadow-lg hover:shadow-primary-gold/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {uploading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-primary-black border-t-transparent rounded-full animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="w-5 h-5" />
                          Upload to Gallery
                        </>
                      )}
                    </button>
                  </div>
                </GlassPanel>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Edit Modal */}
        <AnimatePresence>
          {editingItem && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={(e) => e.target === e.currentTarget && setEditingItem(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="w-full max-w-2xl"
              >
                <GlassPanel className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gradient-gold">Edit Gallery Item</h2>
                    <button
                      onClick={() => setEditingItem(null)}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    {/* Preview */}
                    <div className="aspect-video rounded-lg overflow-hidden bg-black/20">
                      {editingItem.mimeType.startsWith('video/') ? (
                        <video
                          src={editingItem.mediaUrl}
                          className="w-full h-full object-cover"
                          controls
                        />
                      ) : (
                        <img
                          src={editingItem.mediaUrl}
                          alt={editingItem.alt || editingItem.title}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>

                    {/* Edit Fields */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Title</label>
                      <input
                        type="text"
                        value={editingItem.title}
                        onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                        className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary-gold"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                      <textarea
                        value={editingItem.description || ''}
                        onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                        rows={3}
                        className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white resize-none focus:outline-none focus:border-primary-gold"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
                      <select
                        value={editingItem.category}
                        onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value as any })}
                        className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary-gold"
                      >
                        {categories.map((category) => (
                          <option key={category.value} value={category.value} className="bg-gray-800">
                            {category.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Alt Text</label>
                      <input
                        type="text"
                        value={editingItem.alt || ''}
                        onChange={(e) => setEditingItem({ ...editingItem, alt: e.target.value })}
                        className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary-gold"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Tags</label>
                      <input
                        type="text"
                        value={editingItem.tags.join(', ')}
                        onChange={(e) => setEditingItem({ ...editingItem, tags: e.target.value.split(',').map(tag => tag.trim()) })}
                        className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary-gold"
                      />
                    </div>

                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="edit-featured"
                        checked={editingItem.featured}
                        onChange={(e) => setEditingItem({ ...editingItem, featured: e.target.checked })}
                        className="w-4 h-4 text-primary-gold bg-white/10 border-white/20 rounded focus:ring-primary-gold focus:ring-2"
                      />
                      <label htmlFor="edit-featured" className="text-sm text-gray-300 flex items-center gap-2">
                        <Star className="w-4 h-4 text-yellow-400" />
                        Featured Item
                      </label>
                    </div>
                  </div>

                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={() => setEditingItem(null)}
                      className="flex-1 bg-white/10 text-gray-300 py-2 px-4 rounded-lg hover:bg-white/20 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleUpdate(editingItem)}
                      className="flex-1 bg-gradient-to-r from-primary-gold to-yellow-500 text-primary-black py-2 px-4 rounded-lg hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
                    >
                      <Save className="w-4 h-4" />
                      Save Changes
                    </button>
                  </div>
                </GlassPanel>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
