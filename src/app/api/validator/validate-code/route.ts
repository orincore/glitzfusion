import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Booking from '@/models/Booking';
import Attendance from '@/models/Attendance';
import { FusionXEvent } from '@/models/FusionXEvent';
import User from '@/models/User';
import jwt from 'jsonwebtoken';
import { sendWelcomeEmail } from '@/lib/emailService';

// Ensure all models are registered with Mongoose
FusionXEvent;
User;

// Verify admin token
async function verifyAdminToken(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    return decoded;
  } catch (error) {
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const admin = await verifyAdminToken(request);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const { bookingCode } = await request.json();

    if (!bookingCode) {
      return NextResponse.json(
        { error: 'Booking code is required' },
        { status: 400 }
      );
    }

    // Find the booking
    const booking = await Booking.findOne({ bookingCode }).populate('eventId');

    if (!booking) {
      return NextResponse.json(
        { 
          error: 'Invalid booking code',
          message: 'This booking code does not exist in our system.'
        },
        { status: 404 }
      );
    }

    // Check if payment is completed
    if (booking.paymentStatus !== 'paid') {
      return NextResponse.json(
        {
          error: 'Payment not completed',
          message: 'This booking code is not valid because payment was not completed.',
          bookingInfo: {
            eventTitle: booking.eventTitle,
            createdAt: booking.createdAt,
            paymentStatus: booking.paymentStatus
          }
        },
        { status: 400 }
      );
    }

    // Check if code has already been used for attendance
    const existingAttendance = await Attendance.findOne({ bookingCode });

    if (existingAttendance) {
      return NextResponse.json(
        {
          error: 'Code already used',
          message: 'This booking code has already been used for attendance.',
          usageInfo: {
            eventTitle: existingAttendance.eventTitle,
            validatedAt: existingAttendance.validatedAt,
            validatedBy: existingAttendance.validatedBy,
            memberName: existingAttendance.memberName
          }
        },
        { status: 400 }
      );
    }

    // Get request details
    const userAgent = request.headers.get('user-agent') || undefined;
    const ipAddress = request.headers.get('x-forwarded-for')?.split(',')[0] || 
                     request.headers.get('x-real-ip') || 'unknown';

    // Mark attendance for all members in the booking
    const attendanceRecords = [];
    
    for (const member of booking.members) {
      const attendance = new Attendance({
        bookingId: booking._id,
        bookingCode: booking.bookingCode,
        eventId: booking.eventId._id,
        eventTitle: booking.eventTitle,
        memberEmail: member.email,
        memberName: member.name,
        memberPhone: member.phone,
        validatedBy: admin.email,
        ipAddress,
        userAgent
      });

      await attendance.save();
      attendanceRecords.push(attendance);

      // Send welcome email to each member
      try {
        await sendWelcomeEmail({
          memberName: member.name,
          memberEmail: member.email,
          eventTitle: booking.eventTitle,
          bookingCode: booking.bookingCode,
          eventDate: booking.selectedDate,
          eventTime: booking.selectedTime
        });
      } catch (emailError) {
        console.error(`Failed to send welcome email to ${member.email}:`, emailError);
        // Don't fail validation for email errors
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Booking code validated successfully!',
      validation: {
        bookingCode: booking.bookingCode,
        eventTitle: booking.eventTitle,
        eventDate: booking.selectedDate,
        eventTime: booking.selectedTime,
        memberCount: booking.members.length,
        members: booking.members.map((m: any) => ({
          name: m.name,
          email: m.email,
          phone: m.phone
        })),
        validatedAt: new Date(),
        validatedBy: admin.email
      }
    });

  } catch (error) {
    console.error('Code validation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
