import mongoose from 'mongoose';

export interface IAttendance extends mongoose.Document {
  bookingId: mongoose.Types.ObjectId;
  bookingCode: string;
  memberCode: string; // Individual member code
  eventId: mongoose.Types.ObjectId;
  eventTitle: string;
  memberEmail: string;
  memberName: string;
  memberPhone: string;
  validatedAt: Date;
  validatedBy: string; // Admin email who validated
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AttendanceSchema = new mongoose.Schema<IAttendance>({
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true,
    index: true
  },
  bookingCode: {
    type: String,
    required: true,
    index: true
  },
  memberCode: {
    type: String,
    required: true,
    index: true
  },
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
  memberEmail: {
    type: String,
    required: true,
    index: true
  },
  memberName: {
    type: String,
    required: true
  },
  memberPhone: {
    type: String,
    required: true
  },
  validatedAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  validatedBy: {
    type: String,
    required: true
  },
  ipAddress: String,
  userAgent: String
}, {
  timestamps: true,
  collection: 'attendances'
});

// Compound indexes for efficient queries
AttendanceSchema.index({ memberCode: 1, memberEmail: 1 }, { unique: true });
AttendanceSchema.index({ bookingCode: 1, memberEmail: 1 }); // Keep for backward compatibility but not unique
AttendanceSchema.index({ eventId: 1, validatedAt: -1 });
AttendanceSchema.index({ validatedBy: 1, validatedAt: -1 });

const Attendance = mongoose.models.Attendance || mongoose.model<IAttendance>('Attendance', AttendanceSchema);

export default Attendance;
