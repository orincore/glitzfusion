import mongoose, { Document, Schema } from 'mongoose'

export interface ICareer extends Document {
  _id: string
  title: string
  department: string
  location: string
  type: 'full-time' | 'part-time' | 'contract' | 'internship'
  experience: string
  description: string
  responsibilities: string[]
  requirements: string[]
  qualifications: string[]
  benefits: string[]
  salary: {
    min?: number
    max?: number
    currency: string
    period: 'hourly' | 'monthly' | 'yearly'
  }
  isActive: boolean
  isFeatured: boolean
  applicationDeadline?: Date
  postedBy: string
  createdAt: Date
  updatedAt: Date
}

const CareerSchema = new Schema<ICareer>({
  title: { 
    type: String, 
    required: true, 
    trim: true,
    maxlength: 200
  },
  department: { 
    type: String, 
    required: true, 
    trim: true,
    maxlength: 100
  },
  location: { 
    type: String, 
    required: true, 
    trim: true,
    maxlength: 100
  },
  type: { 
    type: String, 
    required: true, 
    enum: ['full-time', 'part-time', 'contract', 'internship'],
    default: 'full-time'
  },
  experience: { 
    type: String, 
    required: true, 
    trim: true,
    maxlength: 100
  },
  description: { 
    type: String, 
    required: true, 
    trim: true,
    maxlength: 2000
  },
  responsibilities: [{ 
    type: String, 
    trim: true,
    maxlength: 500
  }],
  requirements: [{ 
    type: String, 
    trim: true,
    maxlength: 500
  }],
  qualifications: [{ 
    type: String, 
    trim: true,
    maxlength: 500
  }],
  benefits: [{ 
    type: String, 
    trim: true,
    maxlength: 500
  }],
  salary: {
    min: { type: Number, min: 0 },
    max: { type: Number, min: 0 },
    currency: { type: String, default: 'INR', maxlength: 10 },
    period: { 
      type: String, 
      enum: ['hourly', 'monthly', 'yearly'],
      default: 'monthly'
    }
  },
  isActive: { 
    type: Boolean, 
    default: true
  },
  isFeatured: { 
    type: Boolean, 
    default: false
  },
  applicationDeadline: Date,
  postedBy: { 
    type: String, 
    required: true,
    trim: true,
    maxlength: 100
  }
}, {
  timestamps: true
})

// Indexes for efficient queries
CareerSchema.index({ isActive: 1, createdAt: -1 })
CareerSchema.index({ department: 1 })
CareerSchema.index({ type: 1 })
CareerSchema.index({ location: 1 })
CareerSchema.index({ isFeatured: 1 })
CareerSchema.index({ title: 'text', description: 'text' })

// Clear the model cache to ensure schema changes take effect
if (mongoose.models.Career) {
  delete mongoose.models.Career
}

export default mongoose.model<ICareer>('Career', CareerSchema)
