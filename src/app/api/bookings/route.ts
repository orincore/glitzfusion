import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Booking from '@/models/Booking';
import FusionXEvent from '@/models/FusionXEvent';
import { generateUniqueBookingCode, validateMemberData, calculateBookingAmount, formatBookingConfirmation } from '@/lib/bookingUtils';
import { sendBookingConfirmationEmail } from '@/lib/emailService';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { eventId, selectedDate, selectedTime, selectedPricing, members } = body;

    // Validation
    if (!eventId || !selectedDate || !selectedTime || !selectedPricing || !members) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate members data
    const memberValidationErrors = validateMemberData(members);
    if (memberValidationErrors.length > 0) {
      return NextResponse.json(
        { error: memberValidationErrors.join(', ') },
        { status: 400 }
      );
    }

    // Fetch event details
    const event = await FusionXEvent.findById(eventId);
    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    // Validate selected date exists in event
    const dateSlot = event.dateSlots.find((slot: any) => slot.date === selectedDate);
    if (!dateSlot) {
      return NextResponse.json(
        { error: 'Selected date not available for this event' },
        { status: 400 }
      );
    }

    // Validate selected time exists in date slot
    if (!dateSlot.timeSlots.includes(selectedTime)) {
      return NextResponse.json(
        { error: 'Selected time not available for this date' },
        { status: 400 }
      );
    }

    // Validate pricing category
    const pricingTier = event.pricingTiers.find((tier: any) => tier.category === selectedPricing);
    if (!pricingTier) {
      return NextResponse.json(
        { error: 'Selected pricing category not available' },
        { status: 400 }
      );
    }

    // Calculate total amount
    const totalAmount = calculateBookingAmount(pricingTier.price, members.length);

    // Generate unique booking code
    const bookingCode = await generateUniqueBookingCode();

    // Create booking
    const booking = new Booking({
      bookingCode,
      eventId: event._id,
      eventTitle: event.title,
      selectedDate,
      selectedTime,
      selectedPricing,
      totalAmount,
      members,
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

    // Update event booking count
    await FusionXEvent.findByIdAndUpdate(eventId, {
      $inc: { totalBookings: members.length }
    });

    // Format booking data for email
    const bookingData = formatBookingConfirmation(booking);

    // Send confirmation emails to all members
    try {
      const emailPromises = members.map((member: any) => 
        sendBookingConfirmationEmail(member.email, bookingData)
      );
      await Promise.all(emailPromises);
      
      // Mark email as sent
      await Booking.findByIdAndUpdate(booking._id, { emailSent: true });
    } catch (emailError) {
      console.error('Error sending confirmation emails:', emailError);
      // Don't fail the booking if email fails
    }

    return NextResponse.json({
      success: true,
      bookingCode,
      message: 'Booking created successfully',
      booking: {
        id: booking._id,
        bookingCode,
        eventTitle: event.title,
        selectedDate,
        selectedTime,
        totalAmount,
        memberCount: members.length
      }
    });

  } catch (error) {
    console.error('Booking creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const bookingCode = searchParams.get('code');
    const email = searchParams.get('email');

    if (bookingCode) {
      // Get booking by code
      const booking = await Booking.findOne({ bookingCode }).populate('eventId');
      if (!booking) {
        return NextResponse.json(
          { error: 'Booking not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
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
      });
    }

    if (email) {
      // Get bookings by email
      const bookings = await Booking.find({
        $or: [
          { 'primaryContact.email': email },
          { 'members.email': email }
        ]
      }).sort({ createdAt: -1 });

      return NextResponse.json({
        bookings: bookings.map(booking => ({
          bookingCode: booking.bookingCode,
          eventTitle: booking.eventTitle,
          selectedDate: booking.selectedDate,
          status: booking.status,
          totalAmount: booking.totalAmount,
          createdAt: booking.createdAt
        }))
      });
    }

    return NextResponse.json(
      { error: 'Missing booking code or email parameter' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Booking retrieval error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
