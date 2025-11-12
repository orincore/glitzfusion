'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Image, Video, Palette, Camera, Calendar, X, Play, ChevronLeft, ChevronRight, Star, Filter, Loader2 } from 'lucide-react'
import { GlassPanel } from '@/components/ui/GlassPanel'
import PageHeader from '@/components/ui/PageHeader'
import { useGallery, GalleryItem } from '@/hooks/useGallery'
import { cn, fadeInUp, staggerContainer } from '@/lib/utils'

const categories = [
  { value: 'all', label: 'All', icon: Image, color: 'from-gray-500 to-gray-600' },
  { value: 'photo', label: 'Photos', icon: Image, color: 'from-blue-500 to-cyan-500' },
  { value: 'video', label: 'Videos', icon: Video, color: 'from-purple-500 to-pink-500' },
  { value: 'artwork', label: 'Artwork', icon: Palette, color: 'from-orange-500 to-red-500' },
  { value: 'behind-scenes', label: 'Behind Scenes', icon: Camera, color: 'from-green-500 to-emerald-500' },
  { value: 'events', label: 'Events', icon: Calendar, color: 'from-yellow-500 to-amber-500' }
]

export default function GalleryClient() {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  
  const { items, loading, error } = useGallery({ 
    category: selectedCategory === 'all' ? undefined : selectedCategory,
    limit: 50 
  })

  const filteredItems = items.filter(item => item.isActive)
  const featuredItems = filteredItems.filter(item => item.featured)

  useEffect(() => {
    if (selectedItem) {
      const index = filteredItems.findIndex(item => item._id === selectedItem._id)
      setCurrentIndex(index)
    }
  }, [selectedItem, filteredItems])

  const openLightbox = (item: GalleryItem) => {
    setSelectedItem(item)
    document.body.style.overflow = 'hidden'
  }

  const closeLightbox = () => {
    setSelectedItem(null)
    document.body.style.overflow = 'unset'
  }

  const navigateLightbox = (direction: 'prev' | 'next') => {
    const newIndex = direction === 'prev' 
      ? (currentIndex - 1 + filteredItems.length) % filteredItems.length
      : (currentIndex + 1) % filteredItems.length
    
    setSelectedItem(filteredItems[newIndex])
    setCurrentIndex(newIndex)
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedItem) return
      
      switch (e.key) {
        case 'Escape':
          closeLightbox()
          break
        case 'ArrowLeft':
          navigateLightbox('prev')
          break
        case 'ArrowRight':
          navigateLightbox('next')
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedItem, currentIndex])

  if (loading) {
    return (
      <div className="relative">
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-spotlight opacity-30" />
        </div>
        <div className="relative z-10 pt-20">
          <PageHeader 
            title="Our Gallery"
            description="Explore our creative journey through stunning visuals, behind-the-scenes moments, and artistic expressions that showcase the magic of GLITZFUSION."
          />
          <section className="py-20 relative">
            <div className="container-custom">
              <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                  <Loader2 className="h-8 w-8 animate-spin text-primary-gold mx-auto mb-4" />
                  <p className="text-gray-300">Loading gallery...</p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="relative">
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-spotlight opacity-30" />
        </div>
        <div className="relative z-10 pt-20">
          <PageHeader 
            title="Our Gallery"
            description="Explore our creative journey through stunning visuals, behind-the-scenes moments, and artistic expressions that showcase the magic of GLITZFUSION."
          />
          <section className="py-20 relative">
            <div className="container-custom">
              <GlassPanel className="p-12 text-center">
                <p className="text-red-400 text-lg mb-4">Error loading gallery</p>
                <p className="text-gray-400">{error}</p>
              </GlassPanel>
            </div>
          </section>
        </div>
      </div>
    )
  }

  return (
    <div className="relative">
      {/* Background Effects - matching courses page */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-spotlight opacity-30" />
      </div>

      {/* Page Content */}
      <div className="relative z-10 pt-20">
        <PageHeader 
          title="Our Gallery"
          description="Explore our creative journey through stunning visuals, behind-the-scenes moments, and artistic expressions that showcase the magic of GLITZFUSION."
        />

        {/* Gallery Content */}
        <section className="py-20 relative">
          <div className="container-custom">
            {/* Featured Section */}
            {featuredItems.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="mb-16"
              >
                <div className="flex items-center gap-3 mb-8">
                  <Star className="w-6 h-6 text-yellow-400 fill-current" />
                  <h2 className="text-3xl font-bold text-white">Featured</h2>
                </div>
                
                <motion.div
                  variants={staggerContainer}
                  initial="initial"
                  animate="animate"
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                  {featuredItems.slice(0, 6).map((item, index) => (
                    <motion.div
                      key={item._id}
                      variants={fadeInUp}
                      className="group cursor-pointer"
                      onClick={() => openLightbox(item)}
                    >
                      <GlassPanel className="relative aspect-[4/3] overflow-hidden hover:scale-105 transition-all duration-500" border={false} highlight={false}>
                        {item.mimeType.startsWith('video/') ? (
                          <div className="relative w-full h-full">
                            <video
                              src={item.mediaUrl}
                              className="w-full h-full object-cover"
                              muted
                              loop
                              onMouseEnter={(e) => e.currentTarget.play()}
                              onMouseLeave={(e) => e.currentTarget.pause()}
                            />
                            <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <Play className="w-12 h-12 text-white" />
                            </div>
                          </div>
                        ) : (
                          <img
                            src={item.thumbnailUrl || item.mediaUrl}
                            alt={item.alt || item.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          />
                        )}
                        
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <div className="absolute bottom-0 left-0 right-0 p-6">
                            <div className="flex items-center gap-2 mb-2">
                              <Star className="w-4 h-4 text-yellow-400 fill-current" />
                              <span className="text-xs text-yellow-400 font-medium">FEATURED</span>
                            </div>
                            <h3 className="text-white font-bold text-lg mb-2">{item.title}</h3>
                            {item.description && (
                              <p className="text-gray-300 text-sm line-clamp-2">{item.description}</p>
                            )}
                          </div>
                        </div>
                      </GlassPanel>
                    </motion.div>
                  ))}
                </motion.div>
              </motion.div>
            )}

            {/* Category Filters */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mb-12"
            >
              <GlassPanel className="p-6" border={false} highlight={false}>
                <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Filter className="w-5 h-5 text-primary-gold" />
                    <h3 className="text-lg font-semibold text-white">Filter by Category</h3>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {categories.map((category) => {
                      const Icon = category.icon
                      const count = category.value === 'all' 
                        ? filteredItems.length 
                        : filteredItems.filter(item => item.category === category.value).length
                      
                      return (
                        <button
                          key={category.value}
                          onClick={() => setSelectedCategory(category.value)}
                          className={cn(
                            'px-4 py-2 rounded-xl transition-all duration-300 flex items-center gap-2',
                            selectedCategory === category.value
                              ? 'bg-gradient-to-r from-primary-gold to-yellow-500 text-primary-black font-medium shadow-lg shadow-primary-gold/25'
                              : 'bg-white/10 text-gray-300 hover:bg-white/20 hover:text-white'
                          )}
                        >
                          <Icon className="w-4 h-4" />
                          {category.label}
                          <span className="text-xs opacity-75">({count})</span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              </GlassPanel>
            </motion.div>

            {/* Gallery Grid */}
            {filteredItems.length === 0 ? (
              <GlassPanel className="p-12 text-center" border={false} highlight={false}>
                <Image className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-400 text-lg">No items found in this category</p>
              </GlassPanel>
            ) : (
              <motion.div
                variants={staggerContainer}
                initial="initial"
                animate="animate"
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              >
                {filteredItems.map((item, index) => {
                  const category = categories.find(c => c.value === item.category)
                  const Icon = category?.icon || Image
                  
                  return (
                    <motion.div
                      key={item._id}
                      variants={fadeInUp}
                      className="group cursor-pointer"
                      onClick={() => openLightbox(item)}
                    >
                      <GlassPanel className="relative aspect-square overflow-hidden hover:scale-105 transition-all duration-500" border={false} highlight={false}>
                        {item.mimeType.startsWith('video/') ? (
                          <div className="relative w-full h-full">
                            <video
                              src={item.mediaUrl}
                              className="w-full h-full object-cover"
                              muted
                              loop
                              onMouseEnter={(e) => e.currentTarget.play()}
                              onMouseLeave={(e) => e.currentTarget.pause()}
                            />
                            <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <Play className="w-8 h-8 text-white" />
                            </div>
                          </div>
                        ) : (
                          <img
                            src={item.thumbnailUrl || item.mediaUrl}
                            alt={item.alt || item.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          />
                        )}
                        
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <div className="absolute bottom-0 left-0 right-0 p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <Icon className="w-4 h-4 text-primary-gold" />
                              <span className="text-xs text-gray-300 capitalize">{item.category.replace('-', ' ')}</span>
                              {item.featured && <Star className="w-4 h-4 text-yellow-400 fill-current" />}
                            </div>
                            <h3 className="text-white font-medium text-sm line-clamp-2">{item.title}</h3>
                          </div>
                        </div>
                      </GlassPanel>
                    </motion.div>
                  )
                })}
              </motion.div>
            )}
          </div>
        </section>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={closeLightbox}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="relative max-w-6xl max-h-[90vh] w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <GlassPanel className="relative overflow-hidden" border={false} highlight={false}>
                {selectedItem.mimeType.startsWith('video/') ? (
                  <video
                    src={selectedItem.mediaUrl}
                    className="w-full h-auto max-h-[80vh] object-contain"
                    controls
                    autoPlay
                  />
                ) : (
                  <img
                    src={selectedItem.mediaUrl}
                    alt={selectedItem.alt || selectedItem.title}
                    className="w-full h-auto max-h-[80vh] object-contain"
                  />
                )}
                
                {/* Info Overlay */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
                  <div className="flex items-center gap-2 mb-2">
                    {categories.find(c => c.value === selectedItem.category)?.icon && (
                      <div className="w-5 h-5 text-primary-gold">
                        {React.createElement(categories.find(c => c.value === selectedItem.category)!.icon)}
                      </div>
                    )}
                    <span className="text-sm text-gray-300 capitalize">
                      {selectedItem.category.replace('-', ' ')}
                    </span>
                    {selectedItem.featured && <Star className="w-4 h-4 text-yellow-400 fill-current" />}
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">{selectedItem.title}</h2>
                  {selectedItem.description && (
                    <p className="text-gray-300 text-lg">{selectedItem.description}</p>
                  )}
                  {selectedItem.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-4">
                      {selectedItem.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-white/20 text-gray-300 text-xs rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </GlassPanel>

              {/* Navigation */}
              {filteredItems.length > 1 && (
                <>
                  <button
                    onClick={() => navigateLightbox('prev')}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-colors"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    onClick={() => navigateLightbox('next')}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-colors"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </>
              )}

              {/* Close Button */}
              <button
                onClick={closeLightbox}
                className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>

              {/* Counter */}
              <div className="absolute top-4 left-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                {currentIndex + 1} / {filteredItems.length}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
