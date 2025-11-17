import { NextRequest, NextResponse } from 'next/server';
import { FusionXEvent } from '@/models/FusionXEvent';
import dbConnect from '@/lib/mongodb';
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

// GET - Fetch all FusionX events
export async function GET(request: NextRequest) {
  try {
    const admin = await verifyAdminToken(request);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const eventType = searchParams.get('eventType');
    const isPast = searchParams.get('isPast');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    // Build query
    const query: any = {};
    if (status) query.status = status;
    if (eventType) query.eventType = eventType;
    if (isPast !== null) query.isPast = isPast === 'true';

    const skip = (page - 1) * limit;

    const events = await FusionXEvent.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('createdBy', 'name email')
      .populate('lastModifiedBy', 'name email');

    // Get actual revenue data from bookings for each event
    const Booking = (await import('@/models/Booking')).default;
    
    console.log('Fetching revenue data for events...');
    
    // Quick check: are there any bookings at all in the database?
    const totalBookingsCount = await Booking.countDocuments();
    console.log(`Total bookings in database: ${totalBookingsCount}`);
    
    const eventsWithRevenue = await Promise.all(events.map(async (event) => {
      const eventObj = event.toObject();
      
      try {
        // First, let's see if there are any bookings at all for this event
        // Try both ObjectId and string matching since eventId might be stored differently
        const allBookings = await Booking.find({ 
          $or: [
            { eventId: event._id },
            { eventId: event._id.toString() }
          ]
        }).lean();
        console.log(`Event ${event.title} (${event._id}): Found ${allBookings.length} total bookings`);
        
        if (allBookings.length > 0) {
          console.log('Booking details:', allBookings.map(b => ({
            id: b._id,
            paymentStatus: b.paymentStatus,
            totalAmount: b.totalAmount,
            memberCount: b.members?.length || 0
          })));
        }
        
        // Get aggregated stats
        const bookingStats = await Booking.aggregate([
          { 
            $match: { 
              $or: [
                { eventId: event._id },
                { eventId: event._id.toString() }
              ]
            }
          },
          {
            $group: {
              _id: '$paymentStatus',
              count: { $sum: 1 },
              revenue: { $sum: '$totalAmount' },
              members: { $sum: { $size: '$members' } }
            }
          }
        ]);
        
        console.log(`Event ${event.title} aggregation result:`, bookingStats);
        
        // Calculate totals
        // IMPORTANT: In our system, a booking should only be fully counted
        // when it is both confirmed AND paid. Since paymentStatus 'paid'
        // is only set after successful payment (where we also mark
        // status = 'confirmed'), we treat only the 'paid' bucket as
        // confirmed+paid bookings for progress analytics.
        let actualRevenue = 0;
        let actualBookings = 0;
        let actualMembers = 0;
        let paidBookings = 0;
        let pendingBookings = 0;
        let failedBookings = 0;
        
        bookingStats.forEach(stat => {
          if (stat._id === 'paid') {
            // Only paid bookings are considered confirmed+paid
            actualRevenue = stat.revenue || 0;
            actualBookings = stat.count || 0;
            actualMembers = stat.members || 0;
            paidBookings = stat.count || 0;
          } else if (stat._id === 'pending') {
            pendingBookings = stat.count || 0;
          } else if (stat._id === 'failed') {
            failedBookings = stat.count || 0;
          }
        });
        
        console.log(`Event ${event.title} final stats: revenue=${actualRevenue}, bookings=${actualBookings}, paid=${paidBookings}`);
        
        // Override with real data
        return {
          ...eventObj,
          actualRevenue, // Revenue from paid bookings (in rupees)
          actualBookings, // Total bookings
          actualMembers, // Total members from paid bookings
          paidBookings,
          pendingBookings,
          failedBookings,
        };
      } catch (error) {
        console.error(`Error fetching revenue for event ${event.title}:`, error);
        return {
          ...eventObj,
          actualRevenue: 0,
          actualBookings: 0,
          actualMembers: 0,
          paidBookings: 0,
          pendingBookings: 0,
          failedBookings: 0,
        };
      }
    }));

    const total = await FusionXEvent.countDocuments(query);

    return NextResponse.json({
      events: eventsWithRevenue,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching FusionX events:', error);
    return NextResponse.json(
      { error: 'Failed to fetch events' },
      { status: 500 }
    );
  }
}

// POST - Create new FusionX event
export async function POST(request: NextRequest) {
  try {
    const admin = await verifyAdminToken(request);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const eventData = await request.json();

    // Generate slug if not provided
    if (!eventData.slug && eventData.title) {
      eventData.slug = eventData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
    }

    // Transform pricing data to match schema (basePrice/currentPrice instead of price)
    if (eventData.pricing) {
      eventData.pricing = eventData.pricing.map((pricing: any) => ({
        ...pricing,
        basePrice: pricing.basePrice || pricing.price || 0,
        currentPrice: pricing.currentPrice || pricing.basePrice || pricing.price || 0,
        priceIncreaseApplied: pricing.priceIncreaseApplied || false
      }));
    }

    // Set default poster if not provided
    if (!eventData.poster) {
      eventData.poster = '/images/default-event-poster.jpg'; // You can change this to your default image
    }

    // Set default gallery if not provided
    if (!eventData.gallery) {
      eventData.gallery = [];
    }

    // Set default highlights if not provided
    if (!eventData.highlights) {
      eventData.highlights = [];
    }

    // Add admin info
    eventData.createdBy = admin.userId;
    eventData.lastModifiedBy = admin.userId;

    // Calculate total capacity from date slots
    eventData.totalCapacity = eventData.dateSlots.reduce((total: number, dateSlot: any) => {
      return total + dateSlot.timeSlots.reduce((slotTotal: number, timeSlot: any) => {
        return slotTotal + timeSlot.maxCapacity;
      }, 0);
    }, 0);

    const event = new FusionXEvent(eventData);
    await event.save();

    return NextResponse.json(event, { status: 201 });

  } catch (error) {
    console.error('Error creating FusionX event:', error);
    return NextResponse.json(
      { error: 'Failed to create event' },
      { status: 500 }
    );
  }
}
