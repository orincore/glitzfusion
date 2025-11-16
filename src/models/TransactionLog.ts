import mongoose from 'mongoose';

export interface ITransactionLog {
  _id?: mongoose.Types.ObjectId;
  transactionId: string;
  bookingId: mongoose.Types.ObjectId;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  transactionType: 'payment_order_created' | 'payment_attempted' | 'payment_success' | 'payment_failed' | 'payment_refunded';
  status: 'pending' | 'success' | 'failed' | 'cancelled' | 'refunded';
  amount: number;
  currency: string;
  paymentMethod?: string;
  
  // Detailed tracking
  userAgent?: string;
  ipAddress?: string;
  timestamp: Date;
  
  // Event and booking details
  eventId: mongoose.Types.ObjectId;
  eventTitle: string;
  bookingCode: string;
  customerEmail: string;
  customerPhone: string;
  
  // Error details for failed transactions
  errorCode?: string;
  errorMessage?: string;
  failureReason?: string;
  
  // Razorpay response data
  razorpayResponse?: any;
  
  // Additional metadata
  metadata?: {
    memberCount?: number;
    selectedDate?: string;
    selectedTime?: string;
    selectedPricing?: string;
    [key: string]: any;
  };
  
  // Audit trail
  createdAt: Date;
  updatedAt: Date;
}

const TransactionLogSchema = new mongoose.Schema<ITransactionLog>({
  transactionId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true,
    index: true
  },
  razorpayOrderId: {
    type: String,
    index: true
  },
  razorpayPaymentId: {
    type: String,
    index: true
  },
  razorpaySignature: String,
  transactionType: {
    type: String,
    enum: ['payment_order_created', 'payment_attempted', 'payment_success', 'payment_failed', 'payment_refunded'],
    required: true,
    index: true
  },
  status: {
    type: String,
    enum: ['pending', 'success', 'failed', 'cancelled', 'refunded'],
    required: true,
    index: true
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'INR'
  },
  paymentMethod: String,
  
  // Tracking details
  userAgent: String,
  ipAddress: String,
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  
  // Event and booking details
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FusionXEvent',
    required: true,
    index: true
  },
  eventTitle: {
    type: String,
    required: true
  },
  bookingCode: {
    type: String,
    required: true,
    index: true
  },
  customerEmail: {
    type: String,
    required: true,
    index: true
  },
  customerPhone: {
    type: String,
    required: true
  },
  
  // Error tracking
  errorCode: String,
  errorMessage: String,
  failureReason: String,
  
  // Raw Razorpay response for debugging
  razorpayResponse: mongoose.Schema.Types.Mixed,
  
  // Additional metadata
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true,
  collection: 'transaction_logs'
});

// Indexes for efficient querying
TransactionLogSchema.index({ bookingId: 1, transactionType: 1 });
TransactionLogSchema.index({ razorpayOrderId: 1, razorpayPaymentId: 1 });
TransactionLogSchema.index({ status: 1, timestamp: -1 });
TransactionLogSchema.index({ eventId: 1, timestamp: -1 });
TransactionLogSchema.index({ customerEmail: 1, timestamp: -1 });

// Generate unique transaction ID
TransactionLogSchema.pre('save', function(next) {
  if (!this.transactionId) {
    this.transactionId = `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  }
  next();
});

const TransactionLog = mongoose.models.TransactionLog || mongoose.model<ITransactionLog>('TransactionLog', TransactionLogSchema);

export default TransactionLog;
