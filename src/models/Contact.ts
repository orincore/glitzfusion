import mongoose, { Document, Schema } from 'mongoose'

export interface IContact extends Document {
  _id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  countryCode?: string
  subject: string
  message: string
  category: 'general' | 'admissions' | 'courses' | 'technical' | 'partnership' | 'other'
  priority: 'low' | 'medium' | 'high'
  status: 'pending' | 'in_progress' | 'resolved' | 'closed'
  adminNotes?: string
  submittedAt: Date
  updatedAt: Date
  resolvedAt?: Date
  assignedTo?: string
}

const ContactSchema = new Schema<IContact>({
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
    trim: true,
    maxlength: 20
  },
  countryCode: { 
    type: String, 
    trim: true,
    maxlength: 5
  },
  subject: { 
    type: String, 
    required: true, 
    trim: true,
    maxlength: 200
  },
  message: { 
    type: String, 
    required: true, 
    trim: true,
    maxlength: 2000
  },
  category: { 
    type: String, 
    required: true, 
    enum: ['general', 'admissions', 'courses', 'technical', 'partnership', 'other'],
    default: 'general'
  },
  priority: { 
    type: String, 
    required: true, 
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  status: { 
    type: String, 
    required: true, 
    enum: ['pending', 'in_progress', 'resolved', 'closed'],
    default: 'pending'
  },
  adminNotes: { 
    type: String, 
    maxlength: 2000
  },
  resolvedAt: Date,
  assignedTo: { 
    type: String, 
    trim: true,
    maxlength: 100
  }
}, {
  timestamps: { createdAt: 'submittedAt', updatedAt: true }
})

// Indexes for efficient queries
ContactSchema.index({ status: 1, submittedAt: -1 })
ContactSchema.index({ email: 1 })
ContactSchema.index({ category: 1 })
ContactSchema.index({ priority: 1 })
ContactSchema.index({ submittedAt: -1 })

// Clear the model cache to ensure schema changes take effect
if (mongoose.models.Contact) {
  delete mongoose.models.Contact
}

export default mongoose.model<IContact>('Contact', ContactSchema)
