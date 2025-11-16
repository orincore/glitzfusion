import { NextRequest, NextResponse } from 'next/server';
import { FusionXEvent } from '@/models/FusionXEvent';
import dbConnect from '@/lib/mongodb';

// Book tickets for a FusionX event
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();

    const { id } = params;
    const body = await request.json();
    const { 
      pricingCategory, 
      ticketCount, 
      dateSlotIndex, 
      timeSlotIndex,
      customerInfo 
    } = body;

    // Validate required fields
    if (!pricingCategory || !ticketCount || dateSlotIndex === undefined || timeSlotIndex === undefined) {
      return NextResponse.json(
        { error: 'Missing required booking information' },
        { status: 400 }
      );
    }

    // Find the event
    const event = await FusionXEvent.findById(id);
    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    // Check if event is available for booking
    if (event.status === 'sold_out') {
      return NextResponse.json(
        { error: 'Event is sold out' },
        { status: 400 }
      );
    }

    if (event.status !== 'published') {
      return NextResponse.json(
        { error: 'Event is not available for booking' },
        { status: 400 }
      );
    }

    // Find the specific date and time slot
    const dateSlot = event.dateSlots[dateSlotIndex];
    const timeSlot = dateSlot?.timeSlots[timeSlotIndex];

    if (!dateSlot || !timeSlot) {
      return NextResponse.json(
        { error: 'Invalid date or time slot' },
        { status: 400 }
      );
    }

    // Check if time slot has enough capacity
    const availableCapacity = timeSlot.maxCapacity - timeSlot.currentBookings;
    if (availableCapacity < ticketCount) {
      return NextResponse.json(
        { error: `Only ${availableCapacity} tickets available for this time slot` },
        { status: 400 }
      );
    }

    // Find the pricing tier
    const pricingTier = event.pricing.find(p => p.category === pricingCategory);
    if (!pricingTier) {
      return NextResponse.json(
        { error: 'Invalid pricing category' },
        { status: 400 }
      );
    }

    // Check if pricing tier has enough tickets
    const availableTickets = pricingTier.maxTickets - pricingTier.soldTickets;
    if (availableTickets < ticketCount) {
      return NextResponse.json(
        { error: `Only ${availableTickets} tickets available for ${pricingCategory} category` },
        { status: 400 }
      );
    }

    // Apply dynamic pricing before booking
    (event as any).applyDynamicPricing();

    // Calculate total cost using current price
    const totalCost = pricingTier.currentPrice * ticketCount;

    // Update bookings
    timeSlot.currentBookings += ticketCount;
    pricingTier.soldTickets += ticketCount;

    // Process the booking (this will apply dynamic pricing and update status)
    (event as any).processBooking(ticketCount);

    // Save the updated event
    await event.save();

    // Create booking record (you might want to create a separate Booking model)
    const bookingData = {
      eventId: event._id,
      eventTitle: event.title,
      pricingCategory,
      ticketCount,
      totalCost,
      pricePerTicket: pricingTier.currentPrice,
      dateSlot: dateSlot.date,
      timeSlot: {
        startTime: timeSlot.startTime,
        endTime: timeSlot.endTime
      },
      customerInfo,
      bookingDate: new Date(),
      status: 'confirmed'
    };

    return NextResponse.json({
      success: true,
      booking: bookingData,
      message: 'Booking confirmed successfully',
      eventStatus: event.status,
      bookingPercentage: (event as any).getBookingPercentage(),
      priceIncreaseApplied: pricingTier.priceIncreaseApplied
    });

  } catch (error) {
    console.error('Error processing booking:', error);
    return NextResponse.json(
      { error: 'Failed to process booking' },
      { status: 500 }
    );
  }
}

// Get booking information for an event (current prices, availability)
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();

    const { id } = params;
    const event = await FusionXEvent.findById(id);

    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    // Apply dynamic pricing to get current prices
    (event as any).applyDynamicPricing();

    const bookingInfo = {
      eventId: event._id,
      title: event.title,
      status: event.status,
      bookingPercentage: (event as any).getBookingPercentage(),
      availableCapacity: (event as any).getAvailableCapacity(),
      totalCapacity: event.totalCapacity,
      pricing: event.pricing.map(p => ({
        category: p.category,
        basePrice: p.basePrice,
        currentPrice: p.currentPrice,
        availableTickets: p.maxTickets - p.soldTickets,
        priceIncreaseApplied: p.priceIncreaseApplied
      })),
      dateSlots: event.dateSlots.map((dateSlot, dateIndex) => ({
        date: dateSlot.date,
        isActive: dateSlot.isActive,
        timeSlots: dateSlot.timeSlots.map((timeSlot, timeIndex) => ({
          startTime: timeSlot.startTime,
          endTime: timeSlot.endTime,
          availableCapacity: timeSlot.maxCapacity - timeSlot.currentBookings,
          maxCapacity: timeSlot.maxCapacity,
          isAvailable: timeSlot.isAvailable && (timeSlot.maxCapacity - timeSlot.currentBookings) > 0
        }))
      }))
    };

    return NextResponse.json(bookingInfo);

  } catch (error) {
    console.error('Error fetching booking info:', error);
    return NextResponse.json(
      { error: 'Failed to fetch booking information' },
      { status: 500 }
    );
  }
}
