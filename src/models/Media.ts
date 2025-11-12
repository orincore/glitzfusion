import mongoose, { Schema, Document } from 'mongoose'

export interface IMedia extends Document {
  filename: string
  originalName: string
  mimeType: string
  size: number
  url: string
  cloudflareKey: string
  alt?: string
  description?: string
  tags: string[]
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

const MediaSchema = new Schema<IMedia>({
  filename: { type: String, required: true },
  originalName: { type: String, required: true },
  mimeType: { type: String, required: true },
  size: { type: Number, required: true },
  url: { type: String, required: true },
  cloudflareKey: { type: String, required: true },
  alt: { type: String },
  description: { type: String },
  tags: [{ type: String }],
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true
})

export default mongoose.models.Media || mongoose.model<IMedia>('Media', MediaSchema)
