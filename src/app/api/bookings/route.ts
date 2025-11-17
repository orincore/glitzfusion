import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Booking from '@/models/Booking';
import { FusionXEvent } from '@/models/FusionXEvent';
import { generateUniqueBookingCode, validateMemberData, calculateBookingAmount, generateMemberCodes, formatBookingConfirmation } from '@/lib/bookingUtils';
import { sendBookingConfirmationEmail } from '@/lib/emailService';

function withCors(response: NextResponse, request?: NextRequest) {
  // Production-ready CORS configuration
  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [
    'http://localhost:3000',
    'http://localhost:3001',
    'https://www.glitzfusion.in',
    'https://glitzfusion.in',
    'https://fusionx.glitzfusion.in'
  ];
  
  // Get the origin from the request
  const requestOrigin = request?.headers.get('origin');
  
  // Determine which origin to allow
  let allowedOrigin = '*';
  
  if (process.env.NODE_ENV === 'production') {
    // In production, only allow specific origins
    if (requestOrigin && allowedOrigins.includes(requestOrigin)) {
      allowedOrigin = requestOrigin;
    } else {
      // Default to the main FusionX domain if no match
      allowedOrigin = 'https://fusionx.glitzfusion.in';
    }
  } else {
    // In development, allow all origins
    allowedOrigin = '*';
  }
    
  response.headers.set('Access-Control-Allow-Origin', allowedOrigin);
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  response.headers.set('Access-Control-Allow-Credentials', 'true');
  response.headers.set('Access-Control-Max-Age', '86400');
  return response;
}

export async function OPTIONS(request: NextRequest) {
  return withCors(new NextResponse(null, { status: 204 }), request);
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    console.log('Booking request body:', JSON.stringify(body, null, 2));
    const { eventId, selectedDate, selectedTime, selectedPricing, members } = body;

    // Normalize selectedTime: accept either 'HH:MM' or 'HH:MM – HH:MM'
    // Frontend label format is e.g. '12:00 – 16:00', but backend only needs the startTime ('12:00').
    const normalizedSelectedTime = typeof selectedTime === 'string'
      ? selectedTime.split('–')[0].trim()
      : selectedTime;
    console.log('Normalized selectedTime for matching:', normalizedSelectedTime);

    // Validation
    if (!eventId || !selectedDate || !selectedTime || !selectedPricing || !members) {
      console.log('Missing fields check:', { eventId, selectedDate, selectedTime, selectedPricing, members: !!members });
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate members data
    const memberValidationErrors = validateMemberData(members);
    if (memberValidationErrors.length > 0) {
      console.log('Member validation errors:', memberValidationErrors);
      return NextResponse.json(
        { error: memberValidationErrors.join(', ') },
        { status: 400 }
      );
    }

    // Fetch event details
    console.log('Looking for event with ID:', eventId);
    const event = await FusionXEvent.findById(eventId);
    if (!event) {
      console.log('Event not found for ID:', eventId);
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }
    console.log('Found event:', event.title, 'with dateSlots:', event.dateSlots?.length || 0);

    // Validate selected date exists in event (compare by ISO date string)
    console.log('Validating date. Selected:', selectedDate, 'Available dates:', event.dateSlots.map((s: any) => s.date));
    const dateSlot = event.dateSlots.find((slot: any) => {
      const slotDateIso = new Date(slot.date).toISOString();
      const selectedDateIso = new Date(selectedDate).toISOString();
      return slotDateIso === selectedDateIso;
    });
    if (!dateSlot) {
      console.log('Date slot not found for:', selectedDate);
      return NextResponse.json(
        { error: 'Selected date not available for this event' },
        { status: 400 }
      );
    }

    // Validate selected time exists in date slot (match startTime coming from frontend)
    console.log('Validating time. Selected (raw):', selectedTime, 'Normalized:', normalizedSelectedTime, 'Available times:', dateSlot.timeSlots.map((ts: any) => ts.startTime));
    const hasTimeSlot = dateSlot.timeSlots.some((ts: any) => ts.startTime === normalizedSelectedTime);
    if (!hasTimeSlot) {
      console.log('Time slot not found for:', selectedTime);
      return NextResponse.json(
        { error: 'Selected time not available for this date' },
        { status: 400 }
      );
    }

    // Validate pricing category against event.pricing (admin schema)
    console.log('Validating pricing. Selected:', selectedPricing, 'Available pricing:', event.pricing?.map((p: any) => p.category) || 'none');
    const pricingTier = event.pricing?.find((tier: any) => tier.category === selectedPricing);
    if (!pricingTier) {
      console.log('Pricing tier not found for:', selectedPricing);
      return NextResponse.json(
        { error: 'Selected pricing category not available' },
        { status: 400 }
      );
    }

    // Calculate total amount
    const totalAmount = calculateBookingAmount(pricingTier.currentPrice, members.length);

    // Generate unique booking code
    const bookingCode = await generateUniqueBookingCode();
    
    // Generate individual member codes
    const memberCodes = generateMemberCodes(bookingCode, members.length);
    
    // Assign member codes to each member
    const membersWithCodes = members.map((member: any, index: number) => ({
      ...member,
      memberCode: memberCodes[index]
    }));

    // Create booking
    const booking = new Booking({
      bookingCode,
      eventId: event._id,
      eventTitle: event.title,
      selectedDate,
      selectedTime,
      selectedPricing,
      totalAmount,
      members: membersWithCodes,
      primaryContact: {
        name: members[0].name,
        email: members[0].email,
        phone: members[0].phone
      },
      status: 'pending',
      paymentStatus: 'pending',
      emailSent: false
    });

    await booking.save();

    // Update event pending booking count
    try {
      await FusionXEvent.findByIdAndUpdate(event._id, {
        $inc: { pendingBookings: 1 }
      });
    } catch (eventUpdateError) {
      console.error('Error updating event pending booking count:', eventUpdateError);
      // Don't fail booking creation for this
    }

    // NOTE: Don't update totalBookings and revenue yet - only after successful payment
    // NOTE: Don't send emails yet - only after successful payment

    return withCors(NextResponse.json({
      success: true,
      bookingCode,
      message: 'Booking created successfully. Please proceed with payment.',
      booking: {
        id: booking._id,
        bookingCode,
        eventTitle: event.title,
        selectedDate,
        selectedTime,
        totalAmount,
        memberCount: members.length,
        paymentStatus: 'pending',
        status: 'pending'
      },
      // Frontend will use this to initiate payment
      nextStep: 'payment'
    }), request);

  } catch (error) {
    console.error('Booking creation error:', error);
    return withCors(NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    ), request);
  }
}

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const bookingCode = searchParams.get('code');
    const email = searchParams.get('email');

    if (bookingCode) {
      // Get booking by code
      const booking = await Booking.findOne({ bookingCode }).populate('eventId');

      // Only treat booking codes as active if payment is completed
      if (!booking || booking.paymentStatus !== 'paid') {
        return withCors(NextResponse.json(
          { error: 'Booking not found or payment not completed' },
          { status: 404 }
        ), request);
      }

      return withCors(NextResponse.json({
        booking: {
          bookingCode: booking.bookingCode,
          eventTitle: booking.eventTitle,
          selectedDate: booking.selectedDate,
          selectedTime: booking.selectedTime,
          status: booking.status,
          paymentStatus: booking.paymentStatus,
          totalAmount: booking.totalAmount,
          members: booking.members,
          createdAt: booking.createdAt
        }
      }), request);
    }

    if (email) {
      // Get bookings by email
      const bookings = await Booking.find({
        $or: [
          { 'primaryContact.email': email },
          { 'members.email': email }
        ]
      }).sort({ createdAt: -1 });

      return withCors(NextResponse.json({
        bookings: bookings.map(booking => ({
          bookingCode: booking.bookingCode,
          eventTitle: booking.eventTitle,
          selectedDate: booking.selectedDate,
          status: booking.status,
          totalAmount: booking.totalAmount,
          createdAt: booking.createdAt
        }))
      }), request);
    }

    return withCors(NextResponse.json(
      { error: 'Missing booking code or email parameter' },
      { status: 400 }
    ), request);

  } catch (error) {
    console.error('Booking retrieval error:', error);
    return withCors(NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    ), request);
  }
}
