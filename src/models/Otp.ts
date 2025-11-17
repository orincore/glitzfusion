import mongoose from 'mongoose';

export interface IOtp extends mongoose.Document {
  email: string;
  otp: string;
  expiresAt: Date;
  attempts: number;
  createdAt: Date;
  updatedAt: Date;
}

const OtpSchema = new mongoose.Schema<IOtp>({
  email: {
    type: String,
    required: true,
    index: true,
    lowercase: true,
    trim: true,
  },
  otp: {
    type: String,
    required: true,
  },
  expiresAt: {
    type: Date,
    required: true,
    index: true,
  },
  attempts: {
    type: Number,
    required: true,
    default: 0,
  },
}, {
  timestamps: true,
  collection: 'otps',
});

// Optional: ensure only one active OTP per email
OtpSchema.index({ email: 1 }, { unique: true });

const Otp = mongoose.models.Otp || mongoose.model<IOtp>('Otp', OtpSchema);

export default Otp;
