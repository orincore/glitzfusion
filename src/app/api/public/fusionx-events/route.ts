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
      // Primary date/time for simple views
      date: event.dateSlots[0]?.date || event.createdAt,
      time: event.dateSlots[0]?.timeSlots[0]?.startTime || '',
      // Full dateSlots with startTime/endTime for booking UI
      dateSlots: (event.dateSlots || []).map((slot: any) => ({
        date: slot.date,
        timeSlots: (slot.timeSlots || []).map((ts: any) => ({
          startTime: ts.startTime,
          endTime: ts.endTime,
          isAvailable: ts.isAvailable,
        })),
      })),
      // Simple venue string for legacy usages
      venue: `${event.location?.venue || ''}${event.location?.city ? `, ${event.location.city}` : ''}`,
      // Full location object for detailed rendering
      location: event.location
        ? {
            venue: event.location.venue,
            address: event.location.address,
            city: event.location.city,
            state: event.location.state,
            pincode: event.location.pincode,
            landmark: event.location.landmark,
            capacity: event.location.capacity,
          }
        : undefined,
      shortDescription: event.shortDescription,
      longDescription: event.longDescription,
      poster: event.poster,
      gallery: event.gallery || [],
      highlights: event.highlights || [],
      facilities: event.facilities || [],
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

    return withCors(NextResponse.json(transformedEvents));

  } catch (error) {
    console.error('Error fetching public FusionX events:', error);
    return withCors(NextResponse.json(
      { error: 'Failed to fetch events' },
      { status: 500 }
    ));
  }
}

function withCors(response: NextResponse) {
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  response.headers.set('Access-Control-Allow-Credentials', 'true');
  response.headers.set('Access-Control-Max-Age', '86400');
  return response;
}

// OPTIONS for CORS
export async function OPTIONS() {
  return withCors(new NextResponse(null, { status: 204 }));
}
