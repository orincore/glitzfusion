import mongoose, { Schema, Document } from 'mongoose'

export interface IGalleryItem extends Document {
  title: string
  description?: string
  category: 'photo' | 'video' | 'artwork' | 'behind-scenes' | 'events'
  mediaUrl: string
  thumbnailUrl?: string
  cloudflareKey: string
  mimeType: string
  size: number
  originalName: string
  alt?: string
  tags: string[]
  featured: boolean
  sortOrder: number
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

const GallerySchema = new Schema<IGalleryItem>({
  title: { type: String, required: true },
  description: { type: String },
  category: { 
    type: String, 
    required: true,
    enum: ['photo', 'video', 'artwork', 'behind-scenes', 'events'],
    default: 'photo'
  },
  mediaUrl: { type: String, required: true },
  thumbnailUrl: { type: String },
  cloudflareKey: { type: String, required: true },
  mimeType: { type: String, required: true },
  size: { type: Number, required: true },
  originalName: { type: String, required: true },
  alt: { type: String },
  tags: [{ type: String }],
  featured: { type: Boolean, default: false },
  sortOrder: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true
})

// Index for better query performance
GallerySchema.index({ category: 1, featured: -1, sortOrder: 1 })
GallerySchema.index({ isActive: 1, createdAt: -1 })

export default mongoose.models.Gallery || mongoose.model<IGalleryItem>('Gallery', GallerySchema)
