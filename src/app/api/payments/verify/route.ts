import { NextRequest, NextResponse } from 'next/server';
import { verifyPaymentSignature, getPaymentDetails } from '@/lib/razorpay';
import dbConnect from '@/lib/mongodb';
import Booking from '@/models/Booking';
import Payment from '@/models/Payment';
import { FusionXEvent } from '@/models/FusionXEvent';
import { sendPaymentConfirmationEmailWithAllTickets } from '@/lib/emailService';
import { formatBookingConfirmation } from '@/lib/bookingUtils';
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
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature,
      bookingId 
    } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return withCors(NextResponse.json(
        { success: false, error: 'Missing payment verification data' },
        { status: 400 }
      ), request);
    }

    // Connect to database
    await dbConnect();

    // Find the payment record
    const payment = await Payment.findOne({ razorpayOrderId: razorpay_order_id });
    if (!payment) {
      return withCors(NextResponse.json(
        { success: false, error: 'Payment record not found' },
        { status: 404 }
      ), request);
    }

    // Find the booking
    const booking = await Booking.findById(payment.bookingId);
    if (!booking) {
      return withCors(NextResponse.json(
        { success: false, error: 'Booking not found' },
        { status: 404 }
      ), request);
    }

    // Verify payment signature
    const isValidSignature = verifyPaymentSignature({
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    });

    if (!isValidSignature) {
      // Mark payment as failed
      payment.status = 'failed';
      payment.failureReason = 'Invalid payment signature';
      await payment.save();

      // Update booking payment status
      booking.paymentStatus = 'failed';
      await booking.save();

      // Log failed payment verification
      try {
        await TransactionLogger.logPaymentFailed({
          bookingId: booking._id.toString(),
          eventId: booking.eventId.toString(),
          eventTitle: booking.eventTitle,
          bookingCode: booking.bookingCode,
          customerEmail: booking.primaryContact.email,
          customerPhone: booking.primaryContact.phone,
          amount: payment.amount,
          razorpayOrderId: razorpay_order_id,
          razorpayPaymentId: razorpay_payment_id,
          errorCode: 'SIGNATURE_VERIFICATION_FAILED',
          errorMessage: 'Payment signature verification failed',
          failureReason: 'Invalid payment signature',
          request,
          metadata: {
            signature: razorpay_signature
          }
        });
      } catch (logError) {
        console.error('Error logging payment failure:', logError);
      }

      return withCors(NextResponse.json(
        { success: false, error: 'Payment verification failed' },
        { status: 400 }
      ), request);
    }

    // Get payment details from Razorpay
    const paymentDetailsResult = await getPaymentDetails(razorpay_payment_id);
    
    if (!paymentDetailsResult.success || !paymentDetailsResult.payment) {
      // Mark payment as failed
      payment.status = 'failed';
      payment.failureReason = 'Could not fetch payment details';
      await payment.save();

      return withCors(NextResponse.json(
        { success: false, error: 'Payment verification failed' },
        { status: 500 }
      ), request);
    }

    const paymentDetails = paymentDetailsResult.payment;

    // Check if payment is captured/successful
    if (paymentDetails.status !== 'captured') {
      // Mark payment as failed
      payment.status = 'failed';
      payment.failureReason = `Payment status: ${paymentDetails.status}`;
      await payment.save();

      // Update booking payment status
      booking.paymentStatus = 'failed';
      await booking.save();

      return withCors(NextResponse.json(
        { success: false, error: `Payment not successful. Status: ${paymentDetails.status}` },
        { status: 400 }
      ), request);
    }

    // Payment is successful - update records
    payment.razorpayPaymentId = razorpay_payment_id;
    payment.razorpaySignature = razorpay_signature;
    payment.status = 'completed';
    payment.paymentMethod = paymentDetails.method;
    payment.completedAt = new Date();
    await payment.save();

    // Update booking status
    booking.paymentStatus = 'paid';
    booking.status = 'confirmed';
    await booking.save();

    // Update event booking count and revenue now that payment is successful
    try {
      await FusionXEvent.findByIdAndUpdate(booking.eventId, {
        $inc: { 
          totalBookings: booking.members.length,
          totalRevenue: payment.amount,
          paidBookings: 1
        }
      });
    } catch (eventUpdateError) {
      console.error('Error updating event booking count and revenue:', eventUpdateError);
      // Don't fail payment verification for this
    }

    // Get event details for email
    const event = await FusionXEvent.findById(booking.eventId);

    // Log successful payment
    try {
      await TransactionLogger.logPaymentSuccess({
        bookingId: booking._id.toString(),
        eventId: booking.eventId.toString(),
        eventTitle: booking.eventTitle,
        bookingCode: booking.bookingCode,
        customerEmail: booking.primaryContact.email,
        customerPhone: booking.primaryContact.phone,
        amount: payment.amount,
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
        paymentMethod: paymentDetails.method,
        razorpayResponse: paymentDetails,
        request,
        metadata: {
          memberCount: booking.members.length,
          selectedDate: booking.selectedDate,
          selectedTime: booking.selectedTime,
          selectedPricing: booking.selectedPricing,
          eventContactPhone: event?.contactPhone
        }
      });
    } catch (logError) {
      console.error('Error logging payment success:', logError);
    }

    // Send payment confirmation email with invoice and all tickets to primary contact only
    try {
      const bookingData = formatBookingConfirmation(booking);
      // Add additional booking information
      (bookingData as any).eventContactPhone = event?.contactPhone || booking.primaryContact?.phone;
      (bookingData as any).venue = event?.location?.address || 'Event Venue';

      // Prepare payment data for invoice generation
      const paymentData = {
        paymentId: razorpay_payment_id,
        paymentMethod: paymentDetails.method || 'Online Payment',
        paymentDate: new Date().toISOString(),
        amount: payment.amount / 100 // Convert from paise to rupees
      };

      // Send enhanced email with invoice and all tickets to primary contact only
      const primaryEmail = booking.primaryContact.email;
      const emailResult = await sendPaymentConfirmationEmailWithAllTickets(
        primaryEmail, 
        bookingData, 
        paymentData,
        event?.ticketTemplate
      );
      
      // Log email result
      if (emailResult.success) {
        console.log(`Payment confirmation email with all tickets sent to primary contact: ${primaryEmail}`);
        booking.emailSent = true;
        await booking.save();
      } else {
        console.error(`Failed to send payment confirmation email to primary contact: ${primaryEmail}`, emailResult.error);
      }

    } catch (emailError) {
      console.error('Error sending payment confirmation email:', emailError);
      // Don't fail the payment verification if email fails
      // Just log it for manual follow-up
    }

    return withCors(NextResponse.json({
      success: true,
      message: 'Payment verified successfully',
      bookingCode: booking.bookingCode,
      paymentId: razorpay_payment_id,
      amount: payment.amount / 100, // Convert back to rupees
    }), request);

  } catch (error) {
    console.error('Error verifying payment:', error);
    
    // Try to mark payment as failed if we have the order ID
    try {
      const body = await request.json();
      if (body.razorpay_order_id) {
        await dbConnect();
        const payment = await Payment.findOne({ razorpayOrderId: body.razorpay_order_id });
        if (payment && payment.status === 'pending') {
          payment.status = 'failed';
          payment.failureReason = 'Server error during verification';
          await payment.save();
        }
      }
    } catch (updateError) {
      console.error('Error updating payment status:', updateError);
    }

    return withCors(NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error' 
      },
      { status: 500 }
    ), request);
  }
}
