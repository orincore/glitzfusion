import { NextRequest, NextResponse } from 'next/server';
import { FusionXEvent } from '@/models/FusionXEvent';
import dbConnect from '@/lib/mongodb';

// Public API endpoint for FusionX website to fetch events
export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'published';
    const eventType = searchParams.get('eventType');
    const isPast = searchParams.get('isPast');
    const limit = parseInt(searchParams.get('limit') || '50');

    // Build query for published and completed events
    const query: any = { 
      status: status === 'published' ? { $in: ['published', 'completed'] } : status 
    };
    if (eventType) query.eventType = eventType;
    if (isPast !== null) query.isPast = isPast === 'true';

    let events = await FusionXEvent.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .select('-createdBy -lastModifiedBy -__v'); // Exclude admin fields

    // Apply dynamic pricing to each event
    events = await Promise.all(events.map(async (event: any) => {
      event.applyDynamicPricing();
      event.updateSoldOutStatus();
      await event.save();
      return event.toObject();
    }));

    // Transform data for FusionX frontend format
    const transformedEvents = events.map((event: any) => ({
      id: event._id.toString(),
      title: event.title,
      slug: event.slug,
      date: event.dateSlots[0]?.date || event.createdAt, // Use first date slot
      time: event.dateSlots[0]?.timeSlots[0]?.startTime || '',
      venue: `${event.location.venue}, ${event.location.city}`,
      shortDescription: event.shortDescription,
      longDescription: event.longDescription,
      poster: event.poster,
      gallery: event.gallery || [],
      highlights: event.highlights || [],
      tags: event.tags || [],
      isPast: event.isPast,
      attendeesCount: event.totalBookings || 0,
      contactPhone: event.contactPhone || '',
      status: event.status,
      bookingPercentage: Math.round((event.totalBookings / event.totalCapacity) * 100),
      pricing: event.pricing?.map((p: any) => ({
        category: p.category,
        currentPrice: p.currentPrice,
        basePrice: p.basePrice,
        priceIncreaseApplied: p.priceIncreaseApplied,
        availableTickets: p.maxTickets - p.soldTickets
      })) || []
    }));

    return NextResponse.json(transformedEvents);

  } catch (error) {
    console.error('Error fetching public FusionX events:', error);
    return NextResponse.json(
      { error: 'Failed to fetch events' },
      { status: 500 }
    );
  }
}

// OPTIONS for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
