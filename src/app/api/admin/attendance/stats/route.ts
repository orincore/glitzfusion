import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Attendance from '@/models/Attendance';
import { FusionXEvent } from '@/models/FusionXEvent';
import User from '@/models/User';
import jwt from 'jsonwebtoken';

// Ensure models are registered
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

export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const admin = await verifyAdminToken(request);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Get basic stats
    const [
      totalAttendees,
      totalEvents,
      todayAttendees,
      thisWeekAttendees
    ] = await Promise.all([
      Attendance.countDocuments(),
      Attendance.distinct('eventId').then(events => events.length),
      Attendance.countDocuments({ validatedAt: { $gte: todayStart } }),
      Attendance.countDocuments({ validatedAt: { $gte: weekStart } })
    ]);

    // Get top events by attendance
    const topEventsAggregation = await Attendance.aggregate([
      {
        $group: {
          _id: '$eventTitle',
          attendeeCount: { $sum: 1 }
        }
      },
      {
        $sort: { attendeeCount: -1 }
      },
      {
        $limit: 10
      },
      {
        $project: {
          _id: 0,
          eventTitle: '$_id',
          attendeeCount: 1
        }
      }
    ]);

    // Get top validators
    const topValidatorsAggregation = await Attendance.aggregate([
      {
        $group: {
          _id: '$validatedBy',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      },
      {
        $limit: 10
      },
      {
        $project: {
          _id: 0,
          validatedBy: '$_id',
          count: 1
        }
      }
    ]);

    // Get attendance trends (last 30 days)
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const attendanceTrends = await Attendance.aggregate([
      {
        $match: {
          validatedAt: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$validatedAt'
            }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id': 1 }
      },
      {
        $project: {
          _id: 0,
          date: '$_id',
          count: 1
        }
      }
    ]);

    // Get recent activity (last 10 validations)
    const recentActivity = await Attendance.find()
      .sort({ validatedAt: -1 })
      .limit(10)
      .select('memberName eventTitle validatedAt validatedBy')
      .lean();

    // Get event-wise attendance summary
    const eventSummary = await Attendance.aggregate([
      {
        $group: {
          _id: {
            eventId: '$eventId',
            eventTitle: '$eventTitle'
          },
          totalAttendees: { $sum: 1 },
          uniqueEmails: { $addToSet: '$memberEmail' },
          lastValidation: { $max: '$validatedAt' },
          firstValidation: { $min: '$validatedAt' }
        }
      },
      {
        $project: {
          _id: 0,
          eventId: '$_id.eventId',
          eventTitle: '$_id.eventTitle',
          totalAttendees: 1,
          uniqueAttendees: { $size: '$uniqueEmails' },
          lastValidation: 1,
          firstValidation: 1
        }
      },
      {
        $sort: { totalAttendees: -1 }
      },
      {
        $limit: 20
      }
    ]);

    return NextResponse.json({
      totalAttendees,
      totalEvents,
      todayAttendees,
      thisWeekAttendees,
      topEvents: topEventsAggregation,
      recentValidators: topValidatorsAggregation,
      attendanceTrends,
      recentActivity,
      eventSummary
    });

  } catch (error) {
    console.error('Error fetching attendance stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
