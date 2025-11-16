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

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const eventId = searchParams.get('eventId') || '';
    const validatedBy = searchParams.get('validatedBy') || '';
    const dateRange = searchParams.get('dateRange') || 'all';

    // Build query
    const query: any = {};

    // Search filter
    if (search) {
      query.$or = [
        { memberName: { $regex: search, $options: 'i' } },
        { memberEmail: { $regex: search, $options: 'i' } },
        { bookingCode: { $regex: search, $options: 'i' } },
        { eventTitle: { $regex: search, $options: 'i' } }
      ];
    }

    // Event filter
    if (eventId) {
      query.eventId = eventId;
    }

    // Validator filter
    if (validatedBy) {
      query.validatedBy = validatedBy;
    }

    // Date range filter
    if (dateRange !== 'all') {
      const now = new Date();
      let startDate: Date;

      switch (dateRange) {
        case 'today':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case 'quarter':
          const quarterStart = Math.floor(now.getMonth() / 3) * 3;
          startDate = new Date(now.getFullYear(), quarterStart, 1);
          break;
        default:
          startDate = new Date(0);
      }

      query.validatedAt = { $gte: startDate };
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Fetch records with pagination
    const [records, totalCount] = await Promise.all([
      Attendance.find(query)
        .sort({ validatedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Attendance.countDocuments(query)
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      records,
      currentPage: page,
      totalPages,
      totalCount,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1
    });

  } catch (error) {
    console.error('Error fetching attendance records:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
