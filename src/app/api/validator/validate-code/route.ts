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

    // Find the booking by main booking code OR individual member code
    let booking = await Booking.findOne({ bookingCode }).populate('eventId');
    let memberIndex = 0; // Default to primary member
    let isIndividualMemberCode = false;

    if (!booking) {
      // Try to find booking by individual member code
      try {
        booking = await Booking.findOne({ 
          'members.memberCode': bookingCode 
        }).populate('eventId');
        
        if (booking) {
          // Find which member this code belongs to
          memberIndex = booking.members.findIndex((m: any) => m.memberCode === bookingCode);
          if (memberIndex !== -1) {
            isIndividualMemberCode = true;
          } else {
            booking = null;
          }
        }
      } catch (queryError) {
        console.error('Error querying for member code:', queryError);
        booking = null;
      }
    }

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

    // Resolve the specific member we are validating in this request
    const currentMember = booking.members[memberIndex];
    
    if (!currentMember) {
      return NextResponse.json(
        { 
          error: 'Member not found',
          message: 'The specified member could not be found in this booking.'
        },
        { status: 404 }
      );
    }
    
    // Always validate a single member per request. For booking codes, we treat the
    // primary member (index 0) as the one being validated.
    const memberCodeToCheck = isIndividualMemberCode
      ? bookingCode
      : currentMember.memberCode || booking.bookingCode;
    
    // Check for existing attendance records for this specific member within this booking
    const existingAttendances = await Attendance.find({ 
      bookingId: booking._id,
      memberCode: memberCodeToCheck
    }).sort({ validatedAt: -1 });

    if (existingAttendances.length > 0) {
      // Code has been validated before - DENY ACCESS and show validation history
      return NextResponse.json(
        {
          success: false,
          error: 'Access denied - Code already used',
          message: `This ${isIndividualMemberCode ? 'member' : 'booking'} code has already been used for entry. Access denied.`,
          validation: {
            bookingCode: booking.bookingCode,
            validatedCode: memberCodeToCheck,
            codeType: 'individual',
            eventTitle: booking.eventTitle,
            eventDate: booking.selectedDate,
            eventTime: booking.selectedTime,
            totalMemberCount: booking.members.length,
            validatedMemberCount: existingAttendances.length,
            validatedMembers: (await Attendance.find({ bookingId: booking._id })).map((attendance: any) => ({
              name: attendance.memberName,
              email: attendance.memberEmail,
              phone: attendance.memberPhone,
              memberCode: attendance.memberCode
            })),
            validationHistory: existingAttendances.map((attendance: any) => ({
              memberName: attendance.memberName,
              memberEmail: attendance.memberEmail,
              memberCode: attendance.memberCode,
              validatedAt: attendance.validatedAt,
              validatedBy: attendance.validatedBy,
              ipAddress: attendance.ipAddress
            })),
            allMembers: booking.members.map((m: any) => ({
              name: m.name,
              email: m.email,
              phone: m.phone,
              memberCode: m.memberCode
            })),
            firstValidatedAt: existingAttendances[existingAttendances.length - 1].validatedAt,
            lastValidatedAt: existingAttendances[0].validatedAt,
            validatedBy: existingAttendances[0].validatedBy
          }
        },
        { status: 200 }
      );
    }

    // Get request details
    const userAgent = request.headers.get('user-agent') || undefined;
    const ipAddress = request.headers.get('x-forwarded-for')?.split(',')[0] || 
                     request.headers.get('x-real-ip') || 'unknown';

    // Mark attendance for a single specific member per request
    const member = currentMember;
    const memberCode = member.memberCode || booking.bookingCode;
    
    const attendance = new Attendance({
      bookingId: booking._id,
      bookingCode: booking.bookingCode,
      memberCode: memberCode,
      eventId: booking.eventId._id,
      eventTitle: booking.eventTitle,
      memberEmail: member.email || 'no-email-provided',
      memberName: member.name,
      memberPhone: member.phone || 'no-phone-provided',
      validatedBy: admin.email,
      ipAddress,
      userAgent
    });

    await attendance.save();

    const allAttendancesForBooking = await Attendance.find({
      bookingId: booking._id
    }).sort({ validatedAt: -1 });

    // Send welcome email to the validated member - only if they have an email
    if (member.email && member.email !== 'no-email-provided') {
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
      message: `Member code validated successfully for ${currentMember.name}!`,
      validation: {
        bookingCode: booking.bookingCode,
        validatedCode: memberCodeToCheck,
        codeType: 'individual',
        eventTitle: booking.eventTitle,
        eventDate: booking.selectedDate,
        eventTime: booking.selectedTime,
        totalMemberCount: booking.members.length,
        validatedMemberCount: allAttendancesForBooking.length,
        validatedMembers: allAttendancesForBooking.map((attendance: any) => ({
          name: attendance.memberName,
          email: attendance.memberEmail,
          phone: attendance.memberPhone,
          memberCode: attendance.memberCode
        })),
        allMembers: booking.members.map((m: any) => ({
          name: m.name,
          email: m.email,
          phone: m.phone,
          memberCode: m.memberCode
        })),
        validatedAt: new Date(),
        validatedBy: admin.email
      }
    });

  } catch (error: any) {
    console.error('Code validation error:', error);
    
    // Handle duplicate key error specifically
    if (error.code === 11000 && error.keyPattern && error.keyPattern.memberCode && error.keyPattern.memberEmail) {
      try {
        // Extract the memberCode from the error
        const memberCode = error.keyValue?.memberCode;
        if (memberCode) {
          // Find the existing attendance record to show validation history
          const existingAttendance = await Attendance.findOne({ memberCode });
          if (existingAttendance) {
            // Get the full booking to show complete validation history
            const booking = await Booking.findById(existingAttendance.bookingId).populate('eventId');
            if (booking) {
              const allAttendances = await Attendance.find({ 
                bookingId: booking._id 
              }).sort({ validatedAt: -1 });
              
              return NextResponse.json(
                {
                  success: false,
                  error: 'Access denied - Code already used',
                  message: `This code has already been used for entry. Access denied.`,
                  validation: {
                    bookingCode: booking.bookingCode,
                    validatedCode: memberCode,
                    eventTitle: booking.eventTitle,
                    eventDate: booking.selectedDate,
                    eventTime: booking.selectedTime,
                    totalMemberCount: booking.members.length,
                    validatedMemberCount: allAttendances.length,
                    validatedMembers: allAttendances.map((attendance: any) => ({
                      name: attendance.memberName,
                      email: attendance.memberEmail,
                      phone: attendance.memberPhone,
                      memberCode: attendance.memberCode
                    })),
                    validationHistory: allAttendances.map((attendance: any) => ({
                      memberName: attendance.memberName,
                      memberEmail: attendance.memberEmail,
                      memberCode: attendance.memberCode,
                      validatedAt: attendance.validatedAt,
                      validatedBy: attendance.validatedBy,
                      ipAddress: attendance.ipAddress
                    })),
                    firstValidatedAt: allAttendances[allAttendances.length - 1].validatedAt,
                    lastValidatedAt: allAttendances[0].validatedAt,
                    validatedBy: allAttendances[0].validatedBy
                  }
                },
                { status: 200 }
              );
            }
          }
        }
      } catch (recoveryError) {
        console.error('Error recovering from duplicate key error:', recoveryError);
      }
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
