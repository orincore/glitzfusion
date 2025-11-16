import mongoose from 'mongoose';

export interface ITimeSlot {
  startTime: string; // "18:30"
  endTime: string;   // "23:00"
  isAvailable: boolean;
  maxCapacity: number;
  currentBookings: number;
}

export interface IDateSlot {
  date: Date;
  timeSlots: ITimeSlot[];
  isActive: boolean;
}

export interface ILocation {
  venue: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  capacity: number;
  facilities: string[]; // ["parking", "food_court", "restrooms", "security"]
}

export interface IPricing {
  category: string; // "early_bird", "regular", "vip", "premium"
  basePrice: number; // Original price
  currentPrice: number; // Current price (may be increased)
  currency: string; // "INR"
  description?: string;
  maxTickets: number;
  soldTickets: number;
  isActive: boolean;
  priceIncreaseApplied: boolean; // Track if 20% increase has been applied
}

export interface IFacility {
  name: string;
  description: string;
  icon?: string; // icon name or path
  isIncluded: boolean;
}

export interface IDynamicPricingConfig {
  enabled: boolean;
  thresholdPercentage: number; // e.g., 50 for 50%
  priceIncreasePercentage: number; // e.g., 20 for 20%
  description?: string;
}

export interface IFusionXEvent {
  _id?: mongoose.Types.ObjectId;
  title: string;
  slug: string;
  shortDescription: string;
  longDescription: string;
  
  // Event Type
  eventType: 'festival' | 'campus_tour' | 'brand_launch' | 'immersive_theatre' | 'neon_night' | 'other';
  
  // Scheduling
  dateSlots: IDateSlot[];
  duration: number; // in hours
  
  // Location
  location: ILocation;
  
  // Pricing
  pricing: IPricing[];
  
  // Dynamic Pricing Configuration
  dynamicPricing: IDynamicPricingConfig;
  
  // Media
  poster: string; // R2 URL
  gallery: string[]; // R2 URLs
  videoTrailer?: string; // R2 URL
  highlights: string[]; // R2 URLs for event highlights/recap media
  ticketTemplate?: string; // R2 URL for ticket background template
  
  // Event Details
  facilities: IFacility[];
  tags: string[];
  ageRestriction?: number; // minimum age
  dresscode?: string;
  contactPhone?: string;
  
  // Status
  status: 'draft' | 'published' | 'sold_out' | 'cancelled' | 'completed';
  isPast: boolean;
  
  // Analytics
  totalCapacity: number;
  totalBookings: number;
  revenue: number;
  
  // SEO & Marketing
  metaTitle?: string;
  metaDescription?: string;
  socialImage?: string; // R2 URL
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
  
  // Admin
  createdBy: mongoose.Types.ObjectId; // Admin user ID
  lastModifiedBy: mongoose.Types.ObjectId;
}

const TimeSlotSchema = new mongoose.Schema({
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  isAvailable: { type: Boolean, default: true },
  maxCapacity: { type: Number, required: true },
  currentBookings: { type: Number, default: 0 }
});

const DateSlotSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  timeSlots: [TimeSlotSchema],
  isActive: { type: Boolean, default: true }
});

const LocationSchema = new mongoose.Schema({
  venue: { type: String, required: true },
  address: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  pincode: { type: String, required: true },
  coordinates: {
    latitude: Number,
    longitude: Number
  },
  capacity: { type: Number, required: true },
  facilities: [{ type: String }]
});

const PricingSchema = new mongoose.Schema({
  category: { 
    type: String, 
    required: true,
    enum: ['early_bird', 'regular', 'vip', 'premium', 'student', 'group']
  },
  basePrice: { type: Number, required: true },
  currentPrice: { type: Number, required: true },
  currency: { type: String, default: 'INR' },
  description: String,
  maxTickets: { type: Number, required: true },
  soldTickets: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  priceIncreaseApplied: { type: Boolean, default: false }
});

const FacilitySchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  icon: String,
  isIncluded: { type: Boolean, default: true }
});

const DynamicPricingConfigSchema = new mongoose.Schema({
  enabled: { type: Boolean, default: true },
  thresholdPercentage: { type: Number, default: 50, min: 0, max: 100 },
  priceIncreasePercentage: { type: Number, default: 20, min: 0, max: 200 },
  description: String
});

const FusionXEventSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true,
    trim: true,
    maxlength: 200
  },
  slug: { 
    type: String, 
    required: true, 
    lowercase: true,
    trim: true
  },
  shortDescription: { 
    type: String, 
    required: true,
    maxlength: 300
  },
  longDescription: { 
    type: String, 
    required: true,
    maxlength: 2000
  },
  
  eventType: {
    type: String,
    required: true,
    enum: ['festival', 'campus_tour', 'brand_launch', 'immersive_theatre', 'neon_night', 'other']
  },
  
  dateSlots: [DateSlotSchema],
  duration: { type: Number, required: true }, // hours
  
  location: { type: LocationSchema, required: true },
  
  pricing: [PricingSchema],
  
  dynamicPricing: { type: DynamicPricingConfigSchema, required: true },
  
  poster: { type: String, required: true },
  gallery: [{ type: String }],
  videoTrailer: String,
  highlights: [{ type: String }], // Event highlights/recap media
  ticketTemplate: String, // R2 URL for ticket background template
  
  facilities: [FacilitySchema],
  tags: [{ type: String, trim: true }],
  ageRestriction: Number,
  dresscode: String,
  contactPhone: String,
  
  status: {
    type: String,
    enum: ['draft', 'published', 'sold_out', 'cancelled', 'completed'],
    default: 'draft'
  },
  isPast: { type: Boolean, default: false },
  
  totalCapacity: { type: Number, required: true },
  totalBookings: { type: Number, default: 0 },
  revenue: { type: Number, default: 0 },
  
  metaTitle: String,
  metaDescription: String,
  socialImage: String,
  
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

// Indexes for performance
FusionXEventSchema.index({ slug: 1 });
FusionXEventSchema.index({ status: 1 });
FusionXEventSchema.index({ isPast: 1 });
FusionXEventSchema.index({ 'dateSlots.date': 1 });
FusionXEventSchema.index({ eventType: 1 });
FusionXEventSchema.index({ 'location.city': 1 });
FusionXEventSchema.index({ createdAt: -1 });

// Virtual for getting upcoming events
FusionXEventSchema.virtual('isUpcoming').get(function() {
  const now = new Date();
  return this.dateSlots.some((slot: any) => slot.date > now && slot.isActive);
});

// Method to check if event has available slots
FusionXEventSchema.methods.hasAvailableSlots = function() {
  return this.dateSlots.some((dateSlot: any) => 
    dateSlot.isActive && 
    dateSlot.timeSlots.some((timeSlot: any) => 
      timeSlot.isAvailable && timeSlot.currentBookings < timeSlot.maxCapacity
    )
  );
};

// Method to get total available capacity
FusionXEventSchema.methods.getAvailableCapacity = function() {
  return this.dateSlots.reduce((total: number, dateSlot: any) => {
    if (!dateSlot.isActive) return total;
    
    return total + dateSlot.timeSlots.reduce((slotTotal: number, timeSlot: any) => {
      if (!timeSlot.isAvailable) return slotTotal;
      return slotTotal + (timeSlot.maxCapacity - timeSlot.currentBookings);
    }, 0);
  }, 0);
};

// Method to calculate booking percentage
FusionXEventSchema.methods.getBookingPercentage = function() {
  const totalCapacity = this.totalCapacity;
  const totalBookings = this.totalBookings;
  return totalCapacity > 0 ? (totalBookings / totalCapacity) * 100 : 0;
};

// Method to apply dynamic pricing
FusionXEventSchema.methods.applyDynamicPricing = function() {
  // Check if dynamic pricing is enabled
  if (!this.dynamicPricing?.enabled) {
    return this;
  }
  
  const bookingPercentage = this.getBookingPercentage();
  const threshold = this.dynamicPricing.thresholdPercentage || 50;
  const increasePercentage = this.dynamicPricing.priceIncreasePercentage || 20;
  
  // If bookings cross threshold and price increase hasn't been applied yet
  if (bookingPercentage >= threshold) {
    this.pricing.forEach((pricingTier: any) => {
      if (!pricingTier.priceIncreaseApplied) {
        const multiplier = 1 + (increasePercentage / 100);
        pricingTier.currentPrice = Math.round(pricingTier.basePrice * multiplier);
        pricingTier.priceIncreaseApplied = true;
      }
    });
  }
  
  return this;
};

// Method to check and update sold out status
FusionXEventSchema.methods.updateSoldOutStatus = function() {
  const availableCapacity = this.getAvailableCapacity();
  
  if (availableCapacity === 0 && this.status !== 'sold_out') {
    this.status = 'sold_out';
  }
  
  return this;
};

// Method to process booking and update pricing/status
FusionXEventSchema.methods.processBooking = function(ticketCount: number) {
  // Update total bookings
  this.totalBookings += ticketCount;
  
  // Apply dynamic pricing if needed
  this.applyDynamicPricing();
  
  // Update sold out status if needed
  this.updateSoldOutStatus();
  
  return this;
};

// Pre-save middleware to generate slug if not provided
FusionXEventSchema.pre('save', function(next) {
  if (!this.slug && this.title) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  
  // Update isPast based on dateSlots
  const now = new Date();
  const hasUpcomingSlots = this.dateSlots.some((slot: any) => slot.date > now);
  this.isPast = !hasUpcomingSlots;
  
  // Apply dynamic pricing and status updates before saving
  (this as any).applyDynamicPricing();
  (this as any).updateSoldOutStatus();
  
  next();
});

// In development with Next.js, the model can be compiled multiple times due to HMR.
// Remove any existing model so we always use the latest schema definition.
if (mongoose.models.FusionXEvent) {
  delete mongoose.models.FusionXEvent;
}

export const FusionXEvent = mongoose.model<IFusionXEvent>('FusionXEvent', FusionXEventSchema);
