import mongoose, { Document, Schema } from 'mongoose'

export interface ITestimonial extends Document {
  _id: string
  firstName: string
  lastName: string
  email: string
  rating: number
  review: string
  status: 'pending' | 'approved' | 'rejected'
  isPublished: boolean
  isFeatured: boolean
  adminNotes?: string
  submittedAt: Date
  updatedAt: Date
  publishedAt?: Date
}

const TestimonialSchema = new Schema<ITestimonial>({
  firstName: { 
    type: String, 
    required: true, 
    trim: true,
    maxlength: 50
  },
  lastName: { 
    type: String, 
    required: true, 
    trim: true,
    maxlength: 50
  },
  email: { 
    type: String, 
    required: true, 
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address']
  },
  rating: { 
    type: Number, 
    required: true,
    min: 1,
    max: 5
  },
  review: { 
    type: String, 
    required: true, 
    trim: true,
    maxlength: 1000
  },
  status: { 
    type: String, 
    required: true, 
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  isPublished: { 
    type: Boolean, 
    default: false
  },
  isFeatured: { 
    type: Boolean, 
    default: false
  },
  adminNotes: { 
    type: String, 
    maxlength: 500
  },
  publishedAt: Date
}, {
  timestamps: { createdAt: 'submittedAt', updatedAt: true }
})

// Indexes for efficient queries
TestimonialSchema.index({ status: 1, submittedAt: -1 })
TestimonialSchema.index({ isPublished: 1, rating: -1 })
TestimonialSchema.index({ isFeatured: 1 })
TestimonialSchema.index({ email: 1 })
TestimonialSchema.index({ submittedAt: -1 })

// Clear the model cache to ensure schema changes take effect
if (mongoose.models.Testimonial) {
  delete mongoose.models.Testimonial
}

export default mongoose.model<ITestimonial>('Testimonial', TestimonialSchema)
