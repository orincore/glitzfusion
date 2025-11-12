import mongoose, { Schema, Document } from 'mongoose'

export interface IContent extends Document {
  key: string
  type: 'text' | 'image' | 'video' | 'json'
  value: any
  section: string
  description?: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

const ContentSchema = new Schema<IContent>({
  key: { type: String, required: true, unique: true },
  type: { type: String, enum: ['text', 'image', 'video', 'json'], required: true },
  value: { type: Schema.Types.Mixed, required: true },
  section: { type: String, required: true },
  description: { type: String },
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true
})

export default mongoose.models.Content || mongoose.model<IContent>('Content', ContentSchema)
