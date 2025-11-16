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

// Convert array of objects to CSV
function arrayToCSV(data: any[]): string {
  if (data.length === 0) return '';

  const headers = Object.keys(data[0]);
  const csvHeaders = headers.join(',');
  
  const csvRows = data.map(row => 
    headers.map(header => {
      const value = row[header];
      // Escape quotes and wrap in quotes if contains comma, quote, or newline
      if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    }).join(',')
  );

  return [csvHeaders, ...csvRows].join('\n');
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
    const search = searchParams.get('search') || '';
    const eventId = searchParams.get('eventId') || '';
    const validatedBy = searchParams.get('validatedBy') || '';
    const dateRange = searchParams.get('dateRange') || 'all';

    // Build query (same as main attendance API)
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

    // Fetch all matching records (no pagination for export)
    const records = await Attendance.find(query)
      .sort({ validatedAt: -1 })
      .lean();

    // Transform data for CSV export
    const csvData = records.map(record => ({
      'Booking Code': record.bookingCode,
      'Event Title': record.eventTitle,
      'Member Name': record.memberName,
      'Member Email': record.memberEmail,
      'Member Phone': record.memberPhone,
      'Validated At': new Date(record.validatedAt).toLocaleString(),
      'Validated By': record.validatedBy,
      'IP Address': record.ipAddress || 'N/A',
      'Created At': new Date(record.createdAt).toLocaleString()
    }));

    const csv = arrayToCSV(csvData);

    // Return CSV file
    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="attendance-export-${new Date().toISOString().split('T')[0]}.csv"`
      }
    });

  } catch (error) {
    console.error('Error exporting attendance data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
