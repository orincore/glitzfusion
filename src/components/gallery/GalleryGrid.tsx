'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Image, Video, Palette, Camera, Calendar, Play, Star } from 'lucide-react'
import { GlassPanel } from '@/components/ui/GlassPanel'
import { GalleryItem } from '@/hooks/useGallery'

const categories = [
  { value: 'photo', label: 'Photos', icon: Image },
  { value: 'video', label: 'Videos', icon: Video },
  { value: 'artwork', label: 'Artwork', icon: Palette },
  { value: 'behind-scenes', label: 'Behind Scenes', icon: Camera },
  { value: 'events', label: 'Events', icon: Calendar }
]

const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: [0.6, -0.05, 0.01, 0.99] }
}

const staggerContainer = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
}

interface GalleryGridProps {
  items: GalleryItem[]
  onItemClick: (item: GalleryItem) => void
  loading?: boolean
  className?: string
}

export function GalleryGrid({ items, onItemClick, loading = false, className = '' }: GalleryGridProps) {
  if (loading) {
    return (
      <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 ${className}`}>
        {[...Array(12)].map((_, i) => (
          <GlassPanel key={i} className="aspect-square animate-pulse">
            <div className="w-full h-full bg-white/10 rounded-lg" />
          </GlassPanel>
        ))}
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <GlassPanel className="p-12 text-center">
        <Image className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-400 text-lg">No items found</p>
      </GlassPanel>
    )
  }

  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 ${className}`}
    >
      {items.map((item, index) => {
        const category = categories.find(c => c.value === item.category)
        const Icon = category?.icon || Image
        
        return (
          <motion.div
            key={item._id}
            variants={fadeInUp}
            className="group cursor-pointer"
            onClick={() => onItemClick(item)}
          >
            <GalleryItemCard item={item} Icon={Icon} />
          </motion.div>
        )
      })}
    </motion.div>
  )
}

interface GalleryItemCardProps {
  item: GalleryItem
  Icon: React.ComponentType<{ className?: string }>
}

function GalleryItemCard({ item, Icon }: GalleryItemCardProps) {
  return (
    <GlassPanel className="relative aspect-square overflow-hidden hover:scale-105 transition-all duration-500 border-0" highlight={false}>
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
  )
}
