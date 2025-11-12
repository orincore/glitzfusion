'use client'

import React, { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronLeft, ChevronRight, Star, Image, Video, Palette, Camera, Calendar } from 'lucide-react'
import { GlassPanel } from '@/components/ui/GlassPanel'
import { GalleryItem } from '@/hooks/useGallery'

const categories = [
  { value: 'photo', label: 'Photos', icon: Image },
  { value: 'video', label: 'Videos', icon: Video },
  { value: 'artwork', label: 'Artwork', icon: Palette },
  { value: 'behind-scenes', label: 'Behind Scenes', icon: Camera },
  { value: 'events', label: 'Events', icon: Calendar }
]

interface GalleryLightboxProps {
  item: GalleryItem | null
  items: GalleryItem[]
  currentIndex: number
  onClose: () => void
  onNavigate: (direction: 'prev' | 'next') => void
}

export function GalleryLightbox({ item, items, currentIndex, onClose, onNavigate }: GalleryLightboxProps) {
  useEffect(() => {
    if (!item) return

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          onClose()
          break
        case 'ArrowLeft':
          onNavigate('prev')
          break
        case 'ArrowRight':
          onNavigate('next')
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [item, onClose, onNavigate])

  useEffect(() => {
    if (item) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [item])

  if (!item) return null

  const category = categories.find(c => c.value === item.category)
  const Icon = category?.icon || Image

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          className="relative max-w-6xl max-h-[90vh] w-full"
          onClick={(e) => e.stopPropagation()}
        >
          <GlassPanel className="relative overflow-hidden">
            {item.mimeType.startsWith('video/') ? (
              <video
                src={item.mediaUrl}
                className="w-full h-auto max-h-[80vh] object-contain"
                controls
                autoPlay
              />
            ) : (
              <img
                src={item.mediaUrl}
                alt={item.alt || item.title}
                className="w-full h-auto max-h-[80vh] object-contain"
              />
            )}
            
            {/* Info Overlay */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
              <div className="flex items-center gap-2 mb-2">
                <Icon className="w-5 h-5 text-primary-gold" />
                <span className="text-sm text-gray-300 capitalize">
                  {item.category.replace('-', ' ')}
                </span>
                {item.featured && <Star className="w-4 h-4 text-yellow-400 fill-current" />}
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">{item.title}</h2>
              {item.description && (
                <p className="text-gray-300 text-lg">{item.description}</p>
              )}
              {item.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {item.tags.map((tag, index) => (
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
          {items.length > 1 && (
            <>
              <button
                onClick={() => onNavigate('prev')}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-colors"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={() => onNavigate('next')}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-colors"
                aria-label="Next image"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
            aria-label="Close lightbox"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Counter */}
          <div className="absolute top-4 left-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
            {currentIndex + 1} / {items.length}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
