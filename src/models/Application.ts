import mongoose, { Document, Schema } from 'mongoose'

export interface IApplication extends Document {
  _id: string
  careerId: string
  careerTitle: string
  applicantInfo: {
    firstName: string
    lastName: string
    email: string
    phone: string
    countryCode: string
    location: string
  }
  resume: {
    filename: string
    originalName: string
    url: string
    size: number
    uploadedAt: Date
  }
  coverLetter?: string
  experience: string
  expectedSalary?: {
    amount: number
    currency: string
    period: 'hourly' | 'monthly' | 'yearly'
  }
  availableFrom?: Date
  portfolioUrl?: string
  linkedinUrl?: string
  additionalInfo?: string
  status: 'pending' | 'reviewing' | 'shortlisted' | 'interviewed' | 'selected' | 'rejected'
  adminNotes?: string
  reviewedBy?: string
  reviewedAt?: Date
  submittedAt: Date
  updatedAt: Date
}

const ApplicationSchema = new Schema<IApplication>({
  careerId: { 
    type: String, 
    required: true,
    ref: 'Career'
  },
  careerTitle: { 
    type: String, 
    required: true, 
    trim: true,
    maxlength: 200
  },
  applicantInfo: {
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
    phone: { 
      type: String, 
      required: true, 
      trim: true,
      maxlength: 20
    },
    countryCode: { 
      type: String, 
      required: true, 
      trim: true,
      maxlength: 5
    },
    location: { 
      type: String, 
      required: true, 
      trim: true,
      maxlength: 100
    }
  },
  resume: {
    filename: { 
      type: String, 
      required: true,
      trim: true
    },
    originalName: { 
      type: String, 
      required: true,
      trim: true
    },
    url: { 
      type: String, 
      required: true,
      trim: true
    },
    size: { 
      type: Number, 
      required: true,
      min: 0
    },
    uploadedAt: { 
      type: Date, 
      default: Date.now
    }
  },
  coverLetter: { 
    type: String, 
    trim: true,
    maxlength: 2000
  },
  experience: { 
    type: String, 
    required: true, 
    trim: true,
    maxlength: 100
  },
  expectedSalary: {
    amount: { type: Number, min: 0 },
    currency: { type: String, default: 'INR', maxlength: 10 },
    period: { 
      type: String, 
      enum: ['hourly', 'monthly', 'yearly'],
      default: 'monthly'
    }
  },
  availableFrom: Date,
  portfolioUrl: { 
    type: String, 
    trim: true,
    maxlength: 500
  },
  linkedinUrl: { 
    type: String, 
    trim: true,
    maxlength: 500
  },
  additionalInfo: { 
    type: String, 
    trim: true,
    maxlength: 1000
  },
  status: { 
    type: String, 
    required: true, 
    enum: ['pending', 'reviewing', 'shortlisted', 'interviewed', 'selected', 'rejected'],
    default: 'pending'
  },
  adminNotes: { 
    type: String, 
    trim: true,
    maxlength: 1000
  },
  reviewedBy: { 
    type: String, 
    trim: true,
    maxlength: 100
  },
  reviewedAt: Date
}, {
  timestamps: { createdAt: 'submittedAt', updatedAt: true }
})

// Indexes for efficient queries
ApplicationSchema.index({ careerId: 1, submittedAt: -1 })
ApplicationSchema.index({ status: 1, submittedAt: -1 })
ApplicationSchema.index({ 'applicantInfo.email': 1 })
ApplicationSchema.index({ submittedAt: -1 })
ApplicationSchema.index({ reviewedAt: -1 })

// Clear the model cache to ensure schema changes take effect
if (mongoose.models.Application) {
  delete mongoose.models.Application
}

export default mongoose.model<IApplication>('Application', ApplicationSchema)
