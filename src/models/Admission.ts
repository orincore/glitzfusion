import mongoose, { Schema, Document } from 'mongoose'

export interface IAdmission extends Document {
  _id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  countryCode: string
  age: number
  gender: 'male' | 'female' | 'other' | 'prefer-not-to-say'
  location: {
    city: string
    state: string
    country: string
  }
  course: string
  resumeUrl?: string
  youtubeUrl?: string
  instagramUrl?: string
  portfolioUrl?: string
  experience: 'beginner' | 'intermediate' | 'advanced'
  motivation: string
  previousTraining?: string
  availability: string[]
  emergencyContact: {
    name: string
    phone: string
    relationship: string
  }
  status: 'pending' | 'in_progress' | 'resolved' | 'closed' | 'accepted' | 'rejected'
  adminNotes?: string
  submittedAt: Date
  updatedAt: Date
}

const AdmissionSchema = new Schema<IAdmission>({
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  email: { type: String, required: true, lowercase: true, trim: true },
  phone: { type: String, required: true, trim: true },
  countryCode: { type: String, required: true, default: '+91' },
  age: { type: Number, required: true, min: 16, max: 65 },
  gender: { 
    type: String, 
    required: true, 
    enum: ['male', 'female', 'other', 'prefer-not-to-say'] 
  },
  location: {
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    country: { type: String, required: true, default: 'India', trim: true }
  },
  course: { type: String, required: true },
  resumeUrl: { type: String, trim: true },
  youtubeUrl: { type: String, trim: true },
  instagramUrl: { type: String, trim: true },
  portfolioUrl: { type: String, trim: true },
  experience: { 
    type: String, 
    required: true, 
    enum: ['beginner', 'intermediate', 'advanced'] 
  },
  motivation: { type: String, required: true, maxlength: 1000 },
  previousTraining: { type: String, maxlength: 500 },
  availability: [{ type: String, required: true }],
  emergencyContact: {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    relationship: { type: String, required: true, trim: true }
  },
  status: { 
    type: String, 
    required: true, 
    enum: ['pending', 'in_progress', 'resolved', 'closed', 'accepted', 'rejected'],
    default: 'pending' 
  },
  adminNotes: { type: String, maxlength: 2000 }
}, {
  timestamps: { createdAt: 'submittedAt', updatedAt: true }
})

// Index for efficient queries
AdmissionSchema.index({ status: 1, submittedAt: -1 })
AdmissionSchema.index({ email: 1 })
AdmissionSchema.index({ course: 1 })

// Clear the model cache to ensure schema changes take effect
if (mongoose.models.Admission) {
  delete mongoose.models.Admission
}

export default mongoose.model<IAdmission>('Admission', AdmissionSchema)
