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

    const total = await FusionXEvent.countDocuments(query);

    return NextResponse.json({
      events,
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
