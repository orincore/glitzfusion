'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import { GlassPanel } from '@/components/ui/GlassPanel'
import { cn, fadeInUp, staggerContainer } from '@/lib/utils'
import { useFeaturedGallery } from '@/hooks/useGallery'
import Link from 'next/link'

// Fallback data for when no database items are available
const fallbackGalleryItems = [
  {
    _id: '1',
    title: 'Method Acting Workshop',
    description: 'Students practicing emotional range and character development',
    category: 'photo',
    mediaUrl: '/api/placeholder/600/400',
    thumbnailUrl: '/api/placeholder/600/400',
    mimeType: 'image/jpeg',
    featured: true,
    aspect: 'landscape'
  },
  {
    _id: '2',
    title: 'Contemporary Performance',
    description: 'Graceful movements in our state-of-the-art dance studio',
    category: 'photo',
    mediaUrl: '/api/placeholder/400/600',
    thumbnailUrl: '/api/placeholder/400/600',
    mimeType: 'image/jpeg',
    featured: true,
    aspect: 'portrait'
  },
  {
    _id: '3',
    title: 'Fashion Shoot Session',
    description: 'Professional photography training with industry equipment',
    category: 'photo',
    mediaUrl: '/api/placeholder/600/400',
    thumbnailUrl: '/api/placeholder/600/400',
    mimeType: 'image/jpeg',
    featured: true,
    aspect: 'landscape'
  },
  {
    _id: '4',
    title: 'Behind the Scenes',
    description: 'Students directing their first short film project',
    category: 'video',
    mediaUrl: '/api/placeholder/500/500',
    thumbnailUrl: '/api/placeholder/500/500',
    mimeType: 'video/mp4',
    featured: true,
    aspect: 'square'
  },
  {
    _id: '5',
    title: 'Runway Training',
    description: 'Confidence building on our professional runway',
    category: 'events',
    mediaUrl: '/api/placeholder/400/600',
    thumbnailUrl: '/api/placeholder/400/600',
    mimeType: 'image/jpeg',
    featured: true,
    aspect: 'portrait'
  },
  {
    _id: '6',
    title: 'Scene Study Class',
    description: 'Collaborative learning in intimate class settings',
    category: 'behind-scenes',
    mediaUrl: '/api/placeholder/600/400',
    thumbnailUrl: '/api/placeholder/600/400',
    mimeType: 'image/jpeg',
    featured: true,
    aspect: 'landscape'
  }
]

const categories = ['All', 'Photo', 'Video', 'Artwork', 'Behind Scenes', 'Events']

export function GallerySection() {
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  
  // Fetch featured gallery items from database
  const { items: dbItems, loading, error } = useFeaturedGallery(6)
  
  // Use database items if available, otherwise fallback to static data
  const galleryItems = dbItems.length > 0 ? dbItems.map(item => ({
    ...item,
    aspect: getAspectRatio(item.mimeType, item._id)
  })) : fallbackGalleryItems

  // Helper function to determine aspect ratio
  function getAspectRatio(mimeType: string, id: string) {
    if (mimeType.startsWith('video/')) return 'square'
    // Distribute aspect ratios for visual variety
    const index = parseInt(id.slice(-1)) || 0
    if (index % 3 === 0) return 'portrait'
    if (index % 3 === 1) return 'landscape'
    return 'square'
  }

  const filteredItems = selectedCategory === 'All' 
    ? galleryItems 
    : galleryItems.filter(item => {
        const categoryMap: { [key: string]: string } = {
          'Photo': 'photo',
          'Video': 'video', 
          'Artwork': 'artwork',
          'Behind Scenes': 'behind-scenes',
          'Events': 'events'
        }
        return item.category === categoryMap[selectedCategory]
      })

  const openLightbox = (id: string) => {
    setSelectedImage(id)
  }

  const closeLightbox = () => {
    setSelectedImage(null)
  }

  const navigateImage = (direction: 'prev' | 'next') => {
    if (selectedImage === null) return
    
    const currentIndex = filteredItems.findIndex(item => item._id === selectedImage)
    let newIndex
    
    if (direction === 'prev') {
      newIndex = currentIndex > 0 ? currentIndex - 1 : filteredItems.length - 1
    } else {
      newIndex = currentIndex < filteredItems.length - 1 ? currentIndex + 1 : 0
    }
    
    setSelectedImage(filteredItems[newIndex]._id)
  }

  const selectedItem = selectedImage ? filteredItems.find(item => item._id === selectedImage) : null

  return (
    <section className="py-20 relative">
      <div className="container-custom">
        {/* Section Header */}
        <motion.div
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: "-100px" }}
          className="text-center mb-16"
        >
          <motion.h2 
            variants={fadeInUp}
            className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-gradient-gold mb-6"
          >
            Gallery
          </motion.h2>
          <motion.p 
            variants={fadeInUp}
            className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed mb-12"
          >
            Witness the creativity and passion of our students through their journey of artistic discovery
          </motion.p>

          {/* Category Filter */}
          <motion.div 
            variants={fadeInUp}
            className="flex flex-wrap justify-center gap-4"
          >
            {categories.map((category) => (
              <motion.button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={cn(
                  'px-6 py-3 rounded-full font-medium transition-all duration-300',
                  selectedCategory === category
                    ? 'bg-gradient-gold text-primary-black shadow-gold-glow'
                    : 'bg-glass-dark border border-white/10 text-white hover:border-primary-gold/50 hover:text-primary-gold'
                )}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {category}
              </motion.button>
            ))}
          </motion.div>
        </motion.div>

        {/* Gallery Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <GlassPanel key={i} className="aspect-video animate-pulse">
                <div className="w-full h-full bg-gradient-to-br from-white/5 to-white/10 rounded-lg flex items-center justify-center">
                  <Loader2 className="w-8 h-8 text-primary-gold animate-spin" />
                </div>
              </GlassPanel>
            ))}
          </div>
        ) : (
          <motion.div
            layout
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            <AnimatePresence mode="popLayout">
              {filteredItems.map((item, index) => (
                <motion.div
                  key={item._id}
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ 
                    duration: 0.4, 
                    delay: index * 0.1,
                    ease: [0.25, 0.46, 0.45, 0.94]
                  }}
                  className={cn(
                    'group cursor-pointer',
                    item.aspect === 'portrait' && 'md:row-span-2',
                    item.aspect === 'landscape' && 'md:col-span-2 lg:col-span-1'
                  )}
                  onClick={() => openLightbox(item._id)}
                >
                  <GlassPanel 
                    className={cn(
                      'relative overflow-hidden rounded-2xl transition-all duration-500',
                      'hover:shadow-gold-glow-lg hover:-translate-y-2',
                      item.aspect === 'portrait' ? 'aspect-[3/4]' : 
                      item.aspect === 'square' ? 'aspect-square' : 'aspect-video'
                    )}
                  >
                    {/* Media Content */}
                    <div className="absolute inset-0">
                      {item.mimeType.startsWith('video/') ? (
                        <video
                          src={item.mediaUrl}
                          className="w-full h-full object-cover"
                          muted
                          loop
                          onMouseEnter={(e) => e.currentTarget.play()}
                          onMouseLeave={(e) => e.currentTarget.pause()}
                        />
                      ) : (
                        <img
                          src={item.thumbnailUrl || item.mediaUrl}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                      )}
                      
                      {/* Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-primary-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-300" />
                      
                      {/* Content */}
                      <div className="absolute bottom-0 left-0 right-0 p-6 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                        <div className="space-y-2">
                          <div className="text-xs font-semibold text-primary-gold uppercase tracking-wider">
                            {item.category.replace('-', ' ')}
                          </div>
                          <h3 className="text-lg font-bold text-white group-hover:text-primary-gold transition-colors duration-300">
                            {item.title}
                          </h3>
                          <p className="text-sm text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            {item.description}
                          </p>
                        </div>
                      </div>

                      {/* Hover Effect */}
                      <div className="absolute inset-0 bg-primary-gold/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>

                    {/* Film grain */}
                    <div className="absolute inset-0 film-grain opacity-20" />
                  </GlassPanel>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {/* View More Button */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <Link href="/gallery">
            <motion.button
              suppressHydrationWarning
              className={cn(
                'px-8 py-4 text-lg font-semibold rounded-xl',
                'bg-gradient-gold text-primary-black',
                'hover:shadow-gold-glow-lg focus:shadow-gold-glow-lg',
                'focus:outline-none focus:ring-2 focus:ring-primary-gold focus:ring-offset-2 focus:ring-offset-primary-black',
                'transition-all duration-300'
              )}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              View Full Gallery
            </motion.button>
          </Link>
        </motion.div>
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {selectedImage && selectedItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={closeLightbox}
          >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-primary-black/90 backdrop-blur-sm" />
            
            {/* Modal Content */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="relative max-w-4xl max-h-[90vh] w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <GlassPanel className="relative overflow-hidden rounded-2xl">
                {/* Media Content */}
                <div className="relative">
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
                      alt={selectedItem.title}
                      className="w-full h-auto max-h-[80vh] object-contain"
                    />
                  )}
                  
                  {/* Info Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
                    <div className="text-sm text-primary-gold uppercase tracking-wider mb-2">
                      {selectedItem.category.replace('-', ' ')}
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">{selectedItem.title}</h3>
                    <p className="text-gray-300">{selectedItem.description}</p>
                  </div>
                </div>

                {/* Navigation */}
                <button
                  onClick={() => navigateImage('prev')}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 p-2 rounded-full bg-glass-dark hover:bg-primary-gold/20 transition-colors duration-200"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="w-6 h-6 text-white" />
                </button>
                
                <button
                  onClick={() => navigateImage('next')}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 rounded-full bg-glass-dark hover:bg-primary-gold/20 transition-colors duration-200"
                  aria-label="Next image"
                >
                  <ChevronRight className="w-6 h-6 text-white" />
                </button>

                {/* Close Button */}
                <button
                  onClick={closeLightbox}
                  className="absolute top-4 right-4 p-2 rounded-full bg-glass-dark hover:bg-primary-gold/20 transition-colors duration-200"
                  aria-label="Close lightbox"
                >
                  <X className="w-6 h-6 text-white" />
                </button>
              </GlassPanel>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
