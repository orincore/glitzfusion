import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Booking from '@/models/Booking';
import Payment from '@/models/Payment';

function withCors(response: NextResponse) {
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  response.headers.set('Access-Control-Allow-Credentials', 'true');
  response.headers.set('Access-Control-Max-Age', '86400');
  return response;
}

export async function OPTIONS() {
  return withCors(new NextResponse(null, { status: 204 }));
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const bookingId = searchParams.get('bookingId');
    const orderId = searchParams.get('orderId');

    if (!bookingId && !orderId) {
      return withCors(NextResponse.json(
        { success: false, error: 'Booking ID or Order ID is required' },
        { status: 400 }
      ));
    }

    await dbConnect();

    let payment;
    let booking;

    if (orderId) {
      payment = await Payment.findOne({ razorpayOrderId: orderId });
      if (payment) {
        booking = await Booking.findById(payment.bookingId);
      }
    } else if (bookingId) {
      booking = await Booking.findById(bookingId);
      if (booking) {
        payment = await Payment.findOne({ bookingId: booking._id });
      }
    }

    if (!booking) {
      return withCors(NextResponse.json(
        { success: false, error: 'Booking not found' },
        { status: 404 }
      ));
    }

    return withCors(NextResponse.json({
      success: true,
      booking: {
        id: booking._id,
        bookingCode: booking.bookingCode,
        status: booking.status,
        paymentStatus: booking.paymentStatus,
        totalAmount: booking.totalAmount,
        eventTitle: booking.eventTitle,
        emailSent: booking.emailSent,
      },
      payment: payment ? {
        status: payment.status,
        razorpayOrderId: payment.razorpayOrderId,
        razorpayPaymentId: payment.razorpayPaymentId,
        amount: payment.amount,
        failureReason: payment.failureReason,
        createdAt: payment.createdAt,
        completedAt: payment.completedAt,
      } : null
    }));

  } catch (error) {
    console.error('Error checking payment status:', error);
    return withCors(NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error' 
      },
      { status: 500 }
    ));
  }
}
