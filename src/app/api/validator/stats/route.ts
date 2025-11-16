import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Attendance from '@/models/Attendance';
import jwt from 'jsonwebtoken';

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

export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const admin = await verifyAdminToken(request);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('eventId');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');

    // Build match conditions
    const matchConditions: any = {};
    
    if (eventId) {
      matchConditions.eventId = eventId;
    }
    
    if (dateFrom || dateTo) {
      matchConditions.validatedAt = {};
      if (dateFrom) matchConditions.validatedAt.$gte = new Date(dateFrom);
      if (dateTo) matchConditions.validatedAt.$lte = new Date(dateTo);
    }

    // Get attendance statistics
    const stats = await Attendance.aggregate([
      { $match: matchConditions },
      {
        $group: {
          _id: null,
          totalAttendees: { $sum: 1 },
          uniqueBookings: { $addToSet: '$bookingCode' },
          uniqueEvents: { $addToSet: '$eventId' },
          validatedToday: {
            $sum: {
              $cond: [
                {
                  $gte: [
                    '$validatedAt',
                    new Date(new Date().setHours(0, 0, 0, 0))
                  ]
                },
                1,
                0
              ]
            }
          }
        }
      },
      {
        $project: {
          _id: 0,
          totalAttendees: 1,
          uniqueBookings: { $size: '$uniqueBookings' },
          uniqueEvents: { $size: '$uniqueEvents' },
          validatedToday: 1
        }
      }
    ]);

    // Get recent validations
    const recentValidations = await Attendance.find(matchConditions)
      .sort({ validatedAt: -1 })
      .limit(10)
      .select('bookingCode eventTitle memberName memberEmail validatedAt validatedBy');

    // Get event-wise breakdown
    const eventBreakdown = await Attendance.aggregate([
      { $match: matchConditions },
      {
        $group: {
          _id: {
            eventId: '$eventId',
            eventTitle: '$eventTitle'
          },
          attendeeCount: { $sum: 1 },
          uniqueBookings: { $addToSet: '$bookingCode' },
          lastValidation: { $max: '$validatedAt' }
        }
      },
      {
        $project: {
          _id: 0,
          eventId: '$_id.eventId',
          eventTitle: '$_id.eventTitle',
          attendeeCount: 1,
          uniqueBookings: { $size: '$uniqueBookings' },
          lastValidation: 1
        }
      },
      { $sort: { attendeeCount: -1 } }
    ]);

    return NextResponse.json({
      success: true,
      stats: stats[0] || {
        totalAttendees: 0,
        uniqueBookings: 0,
        uniqueEvents: 0,
        validatedToday: 0
      },
      recentValidations,
      eventBreakdown
    });

  } catch (error) {
    console.error('Stats retrieval error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
