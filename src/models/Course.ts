import mongoose, { Schema, Document } from 'mongoose'

export interface ICurriculumModule {
  title: string
  description: string
  points: string[]
}

export interface ICourse extends Document {
  id: string
  slug: string
  title: string
  summary: string
  description: string
  icon: string
  duration: string
  level: string
  format: string
  investment: string
  nextStart: string
  color: string
  highlights: string[]
  curriculum: ICurriculumModule[]
  outcomes: string[]
  heroMedia?: {
    mediaId: string
    url: string
    mediaType: 'image' | 'video'
    alt?: string
  }
  videoUrl?: string // Direct video URL fallback
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

const CurriculumModuleSchema = new Schema<ICurriculumModule>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  points: [{ type: String, required: true }]
})

const HeroMediaSchema = new Schema({
  mediaId: { type: String, required: true },
  url: { type: String, required: true },
  mediaType: { type: String, enum: ['image', 'video'], required: true },
  alt: { type: String }
}, { _id: false })

const CourseSchema = new Schema<ICourse>({
  id: { type: String, required: true, unique: true },
  slug: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  summary: { type: String, required: true },
  description: { type: String, required: true },
  icon: { type: String, required: true },
  duration: { type: String, required: true },
  level: { type: String, required: true },
  format: { type: String, required: true },
  investment: { type: String, required: true },
  nextStart: { type: String, required: true },
  color: { type: String, required: true },
  highlights: [{ type: String, required: true }],
  curriculum: [CurriculumModuleSchema],
  outcomes: [{ type: String, required: true }],
  heroMedia: { type: HeroMediaSchema, required: false },
  videoUrl: { type: String }, // Direct video URL fallback
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true
})

// Clear the model cache to ensure schema changes take effect
if (mongoose.models.Course) {
  delete mongoose.models.Course
}

export default mongoose.model<ICourse>('Course', CourseSchema)
