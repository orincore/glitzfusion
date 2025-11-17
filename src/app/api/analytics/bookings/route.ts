import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Booking from '@/models/Booking';
import Payment from '@/models/Payment';
import TransactionLog from '@/models/TransactionLog';
// Ensure FusionXEvent schema is registered for Mongoose populate
import '@/models/FusionXEvent';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('eventId');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    await dbConnect();

    // Build query filters
    const query: any = {};
    if (eventId) query.eventId = eventId;
    if (status) query.paymentStatus = status;
    if (dateFrom || dateTo) {
      query.createdAt = {};
      if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
      if (dateTo) query.createdAt.$lte = new Date(dateTo);
    }

    // Get bookings with pagination
    const bookings = await Booking.find(query)
      .populate('eventId', 'title type location')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    // Get total count
    const totalCount = await Booking.countDocuments(query);

    // Get revenue analytics
    // IMPORTANT: For core revenue/booking metrics, only treat bookings
    // as valid when paymentStatus is 'paid' AND status is 'confirmed'.
    const revenueStats = await Booking.aggregate([
      { $match: { ...query, paymentStatus: 'paid', status: 'confirmed' } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalAmount' },
          totalBookings: { $sum: 1 },
          totalMembers: { $sum: { $size: '$members' } }
        }
      }
    ]);

    // Get payment status breakdown
    const statusBreakdown = await Booking.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$paymentStatus',
          count: { $sum: 1 },
          revenue: { $sum: '$totalAmount' }
        }
      }
    ]);

    // Get monthly revenue trend (last 12 months)
    // Only confirmed+paid bookings are counted
    const monthlyRevenue = await Booking.aggregate([
      {
        $match: {
          paymentStatus: 'paid',
          status: 'confirmed',
          createdAt: { $gte: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          revenue: { $sum: '$totalAmount' },
          bookings: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Get event-wise revenue
    // Only confirmed+paid bookings are counted
    const eventRevenue = await Booking.aggregate([
      { $match: { paymentStatus: 'paid', status: 'confirmed' } },
      {
        $group: {
          _id: '$eventId',
          revenue: { $sum: '$totalAmount' },
          bookings: { $sum: 1 },
          members: { $sum: { $size: '$members' } }
        }
      },
      {
        $lookup: {
          from: 'fusionxevents',
          localField: '_id',
          foreignField: '_id',
          as: 'event'
        }
      },
      { $unwind: '$event' },
      {
        $project: {
          eventTitle: '$event.title',
          eventType: '$event.type',
          revenue: 1,
          bookings: 1,
          members: 1
        }
      },
      { $sort: { revenue: -1 } }
    ]);

    return NextResponse.json({
      success: true,
      data: {
        bookings,
        pagination: {
          page,
          limit,
          total: totalCount,
          pages: Math.ceil(totalCount / limit)
        },
        analytics: {
          revenue: revenueStats[0] || { totalRevenue: 0, totalBookings: 0, totalMembers: 0 },
          statusBreakdown,
          monthlyRevenue,
          eventRevenue
        }
      }
    });

  } catch (error) {
    console.error('Error fetching booking analytics:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch booking analytics' },
      { status: 500 }
    );
  }
}
