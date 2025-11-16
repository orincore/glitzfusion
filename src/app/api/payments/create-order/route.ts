import { NextRequest, NextResponse } from 'next/server';
import { createPaymentOrder } from '@/lib/razorpay';
import dbConnect from '@/lib/mongodb';
import Booking from '@/models/Booking';
import Payment from '@/models/Payment';
import { TransactionLogger } from '@/lib/transactionLogger';

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
    const body = await request.json();
    const { bookingId } = body;

    if (!bookingId) {
      return withCors(NextResponse.json(
        { success: false, error: 'Booking ID is required' },
        { status: 400 }
      ), request);
    }

    // Connect to database
    await dbConnect();

    // Find the booking
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return withCors(NextResponse.json(
        { success: false, error: 'Booking not found' },
        { status: 404 }
      ), request);
    }

    // Check if booking is already paid
    if (booking.paymentStatus === 'paid') {
      return withCors(NextResponse.json(
        { success: false, error: 'Booking is already paid' },
        { status: 400 }
      ), request);
    }

    // Check if there's already a pending payment for this booking
    const existingPayment = await Payment.findOne({
      bookingId: booking._id,
      status: 'pending'
    });

    if (existingPayment) {
      // Return existing order details
      return withCors(NextResponse.json({
        success: true,
        orderId: existingPayment.razorpayOrderId,
        amount: existingPayment.amount,
        currency: existingPayment.currency,
        bookingCode: booking.bookingCode,
        eventTitle: booking.eventTitle,
      }), request);
    }

    // Create new payment order
    const amountInPaise = Math.round(booking.totalAmount * 100); // Convert to paise
    const receipt = `booking_${booking.bookingCode}_${Date.now()}`;

    const orderResult = await createPaymentOrder({
      amount: amountInPaise,
      currency: 'INR',
      receipt,
      notes: {
        bookingId: booking._id.toString(),
        bookingCode: booking.bookingCode,
        eventTitle: booking.eventTitle,
      }
    });

    if (!orderResult.success || !orderResult.order) {
      return withCors(NextResponse.json(
        { success: false, error: orderResult.error || 'Failed to create order' },
        { status: 500 }
      ), request);
    }

    // Save payment record
    const payment = new Payment({
      bookingId: booking._id,
      razorpayOrderId: orderResult.order.id,
      amount: amountInPaise,
      currency: 'INR',
      status: 'pending',
      metadata: {
        receipt,
        eventTitle: booking.eventTitle,
        bookingCode: booking.bookingCode,
      }
    });

    await payment.save();

    // Log payment order creation
    try {
      await TransactionLogger.logPaymentOrderCreated({
        bookingId: booking._id.toString(),
        eventId: booking.eventId.toString(),
        eventTitle: booking.eventTitle,
        bookingCode: booking.bookingCode,
        customerEmail: booking.primaryContact.email,
        customerPhone: booking.primaryContact.phone,
        amount: amountInPaise,
        razorpayOrderId: orderResult.order.id,
        request,
        metadata: {
          memberCount: booking.members.length,
          selectedDate: booking.selectedDate,
          selectedTime: booking.selectedTime,
          selectedPricing: booking.selectedPricing
        }
      });
    } catch (logError) {
      console.error('Error logging payment order creation:', logError);
      // Don't fail the API call for logging errors
    }

    return withCors(NextResponse.json({
      success: true,
      orderId: orderResult.order.id,
      amount: amountInPaise,
      currency: 'INR',
      bookingCode: booking.bookingCode,
      eventTitle: booking.eventTitle,
      key: process.env.RAZORPAY_KEY_ID, // Frontend needs this
    }), request);

  } catch (error) {
    console.error('Error creating payment order:', error);
    return withCors(NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error' 
      },
      { status: 500 }
    ), request);
  }
}
