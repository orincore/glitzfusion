import mongoose, { Schema, Document } from 'mongoose'

export interface IBlogSEO {
  metaTitle?: string
  metaDescription?: string
  keywords?: string[]
  canonicalUrl?: string
  ogTitle?: string
  ogDescription?: string
  ogImage?: string
  twitterTitle?: string
  twitterDescription?: string
  twitterImage?: string
}

export interface IBlogAuthor {
  name: string
  bio?: string
  avatar?: string
  social?: {
    twitter?: string
    linkedin?: string
    instagram?: string
  }
}

export interface IBlog extends Document {
  id: string
  slug: string
  title: string
  excerpt: string
  content: string
  featuredImage?: {
    mediaId: string
    url: string
    alt?: string
  }
  author: IBlogAuthor
  category: string
  tags: string[]
  status: 'draft' | 'published' | 'archived'
  isFeatured: boolean
  readTime: number // in minutes
  views: number
  seo: IBlogSEO
  publishedAt?: Date
  createdAt: Date
  updatedAt: Date
}

const BlogSEOSchema = new Schema<IBlogSEO>({
  metaTitle: { type: String },
  metaDescription: { type: String },
  keywords: [{ type: String }],
  canonicalUrl: { type: String },
  ogTitle: { type: String },
  ogDescription: { type: String },
  ogImage: { type: String },
  twitterTitle: { type: String },
  twitterDescription: { type: String },
  twitterImage: { type: String }
}, { _id: false })

const BlogAuthorSchema = new Schema<IBlogAuthor>({
  name: { type: String, required: true },
  bio: { type: String },
  avatar: { type: String },
  social: {
    twitter: { type: String },
    linkedin: { type: String },
    instagram: { type: String }
  }
}, { _id: false })

const FeaturedImageSchema = new Schema({
  mediaId: { type: String, required: true },
  url: { type: String, required: true },
  alt: { type: String }
}, { _id: false })

const BlogSchema = new Schema<IBlog>({
  id: { type: String, required: true, unique: true },
  slug: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  excerpt: { 
    type: String, 
    required: function(this: IBlog) {
      return this.status === 'published';
    }
  },
  content: { 
    type: String, 
    required: function(this: IBlog) {
      return this.status === 'published';
    }
  },
  featuredImage: { type: FeaturedImageSchema },
  author: { type: BlogAuthorSchema, required: true },
  category: { 
    type: String, 
    required: function(this: IBlog) {
      return this.status === 'published';
    }
  },
  tags: [{ type: String }],
  status: { 
    type: String, 
    enum: ['draft', 'published', 'archived'], 
    default: 'draft' 
  },
  isFeatured: { type: Boolean, default: false },
  readTime: { type: Number, default: 5 },
  views: { type: Number, default: 0 },
  seo: { type: BlogSEOSchema, default: {} },
  publishedAt: { type: Date }
}, {
  timestamps: true
})

// Index for better performance
BlogSchema.index({ slug: 1 })
BlogSchema.index({ status: 1, publishedAt: -1 })
BlogSchema.index({ category: 1 })
BlogSchema.index({ tags: 1 })
BlogSchema.index({ isFeatured: 1 })

// Auto-set publishedAt when status changes to published
BlogSchema.pre('save', function(next) {
  if (this.isModified('status') && this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date()
  }
  next()
})

// Clear the model cache to ensure schema changes take effect
if (mongoose.models.Blog) {
  delete mongoose.models.Blog
}

export default mongoose.model<IBlog>('Blog', BlogSchema)
