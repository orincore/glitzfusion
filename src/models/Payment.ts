import mongoose from 'mongoose';

export interface IPayment extends mongoose.Document {
  bookingId: mongoose.Types.ObjectId;
  razorpayOrderId: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  amount: number; // in paise
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  paymentMethod?: string;
  failureReason?: string;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  metadata?: Record<string, any>;
}

const PaymentSchema = new mongoose.Schema<IPayment>({
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true,
  },
  razorpayOrderId: {
    type: String,
    required: true,
    unique: true, // Keep unique constraint for data integrity
  },
  razorpayPaymentId: {
    type: String,
    sparse: true, // Allow multiple null values
    index: true, // Use index instead of separate schema index
  },
  razorpaySignature: {
    type: String,
  },
  amount: {
    type: Number,
    required: true,
  },
  currency: {
    type: String,
    required: true,
    default: 'INR',
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'cancelled'],
    default: 'pending',
  },
  paymentMethod: {
    type: String,
  },
  failureReason: {
    type: String,
  },
  completedAt: {
    type: Date,
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
  },
}, {
  timestamps: true,
});

// Index for efficient queries (removed duplicates)
PaymentSchema.index({ bookingId: 1 });
PaymentSchema.index({ status: 1 });
PaymentSchema.index({ createdAt: -1 });

export default mongoose.models.Payment || mongoose.model<IPayment>('Payment', PaymentSchema);
