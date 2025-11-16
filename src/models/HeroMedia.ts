import mongoose from 'mongoose';

export interface IHeroMedia {
  _id?: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  mediaUrl: string; // R2 URL
  mediaType: 'image' | 'video';
  isActive: boolean;
  position: number; // For ordering multiple media items
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  
  // Admin
  createdBy: mongoose.Types.ObjectId;
  lastModifiedBy: mongoose.Types.ObjectId;
}

const HeroMediaSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500
  },
  mediaUrl: {
    type: String,
    required: true
  },
  mediaType: {
    type: String,
    required: true,
    enum: ['image', 'video']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  position: {
    type: Number,
    default: 0
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lastModifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Indexes
HeroMediaSchema.index({ isActive: 1, position: 1 });
HeroMediaSchema.index({ createdAt: -1 });

// In development with Next.js, the model can be compiled multiple times due to HMR.
// Remove any existing model so we always use the latest schema definition.
if (mongoose.models.HeroMedia) {
  delete mongoose.models.HeroMedia;
}

export const HeroMedia = mongoose.model<IHeroMedia>('HeroMedia', HeroMediaSchema);
