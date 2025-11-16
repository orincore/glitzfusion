import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Booking from '@/models/Booking';
import Payment from '@/models/Payment';
import TransactionLog from '@/models/TransactionLog';

export async function GET(
  request: NextRequest,
  { params }: { params: { bookingId: string } }
) {
  try {
    const { bookingId } = params;

    await dbConnect();

    // Get booking details
    const booking = await Booking.findById(bookingId)
      .populate('eventId', 'title type location contactPhone')
      .lean();

    if (!booking) {
      return NextResponse.json(
        { success: false, error: 'Booking not found' },
        { status: 404 }
      );
    }

    // Get payment records
    const payments = await Payment.find({ bookingId })
      .sort({ createdAt: -1 })
      .lean();

    // Get transaction logs
    const transactionLogs = await TransactionLog.find({ bookingId })
      .sort({ timestamp: -1 })
      .lean();

    // Calculate transaction summary
    const transactionSummary = {
      totalAttempts: transactionLogs.filter(log => log.transactionType === 'payment_attempted').length,
      successfulPayments: transactionLogs.filter(log => log.transactionType === 'payment_success').length,
      failedPayments: transactionLogs.filter(log => log.transactionType === 'payment_failed').length,
      totalAmount: (booking as any).totalAmount || 0,
      paidAmount: payments.filter(p => p.status === 'completed').reduce((sum, p) => sum + (p.amount || 0), 0),
      refundedAmount: payments.filter(p => p.status === 'refunded').reduce((sum, p) => sum + (p.amount || 0), 0)
    };

    // Get failure reasons breakdown
    const failureReasons = transactionLogs
      .filter(log => log.transactionType === 'payment_failed')
      .reduce((acc: any, log) => {
        const reason = log.failureReason || 'Unknown';
        acc[reason] = (acc[reason] || 0) + 1;
        return acc;
      }, {});

    return NextResponse.json({
      success: true,
      data: {
        booking,
        payments,
        transactionLogs,
        summary: transactionSummary,
        failureReasons
      }
    });

  } catch (error) {
    console.error('Error fetching transaction details:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch transaction details' },
      { status: 500 }
    );
  }
}
