import mongoose, { Schema, Document } from 'mongoose';

// Interface for individual booking member
export interface IBookingMember {
  name: string;
  email: string;
  phone: string;
  memberCode?: string; // Individual code for each member
}

// Interface for the main booking document
export interface IBooking extends Document {
  bookingCode: string;
  eventId: string;
  eventTitle: string;
  selectedDate: string;
  selectedTime: string;
  selectedPricing: string;
  totalAmount: number;
  members: IBookingMember[];
  primaryContact: {
    name: string;
    email: string;
    phone: string;
  };
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  createdAt: Date;
  updatedAt: Date;
  emailSent: boolean;
  notes?: string;
}

// Schema for booking member
const BookingMemberSchema = new Schema<IBookingMember>({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  email: {
    type: String,
    required: false, // We'll validate this in the booking validation logic
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  phone: {
    type: String,
    required: false, // We'll validate this in the booking validation logic
    trim: true,
    match: [/^[+]?[\d\s\-\(\)]{10,15}$/, 'Please enter a valid phone number']
  },
  memberCode: {
    type: String,
    required: false,
    trim: true,
    maxlength: 10
  }
});

// Main booking schema
const BookingSchema = new Schema<IBooking>({
  bookingCode: {
    type: String,
    required: true,
    uppercase: true,
    length: 6,
    match: [/^[A-Z0-9]{6}$/, 'Booking code must be 6 characters of letters and numbers']
  },
  eventId: {
    type: String,
    required: true,
    ref: 'FusionXEvent'
  },
  eventTitle: {
    type: String,
    required: true,
    trim: true
  },
  selectedDate: {
    type: String,
    required: true
  },
  selectedTime: {
    type: String,
    required: true
  },
  selectedPricing: {
    type: String,
    required: true
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  members: {
    type: [BookingMemberSchema],
    required: true,
    validate: {
      validator: function(members: IBookingMember[]) {
        return members.length >= 1 && members.length <= 5;
      },
      message: 'Booking must have between 1 and 5 members'
    }
  },
  primaryContact: {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true
    },
    phone: {
      type: String,
      required: true,
      trim: true
    }
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  emailSent: {
    type: Boolean,
    default: false
  },
  notes: {
    type: String,
    trim: true,
    maxlength: 500
  }
}, {
  timestamps: true
});

// Indexes for better query performance
BookingSchema.index({ bookingCode: 1 });
BookingSchema.index({ eventId: 1 });
BookingSchema.index({ 'primaryContact.email': 1 });
BookingSchema.index({ status: 1 });
BookingSchema.index({ createdAt: -1 });

// Export the model
export default mongoose.models.Booking || mongoose.model<IBooking>('Booking', BookingSchema);
