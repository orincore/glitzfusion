import { NextRequest, NextResponse } from 'next/server';
import { FusionXEvent } from '@/models/FusionXEvent';
import dbConnect from '@/lib/mongodb';
import { getTokenFromRequest, verifyToken } from '@/lib/auth';
import { deleteEventAssetsFromR2, extractR2KeyFromUrl, deleteFromR2 } from '@/lib/r2';
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

// GET - Fetch single FusionX event
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await verifyAdminToken(request);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const event = await FusionXEvent.findById(params.id)
      .populate('createdBy', 'name email')
      .populate('lastModifiedBy', 'name email');

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    return NextResponse.json(event);

  } catch (error) {
    console.error('Error fetching FusionX event:', error);
    return NextResponse.json(
      { error: 'Failed to fetch event' },
      { status: 500 }
    );
  }
}

// PUT - Update FusionX event
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await verifyAdminToken(request);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const eventData = await request.json();
    
    // Validate required fields
    if (!eventData.title || !eventData.shortDescription || !eventData.longDescription) {
      return NextResponse.json(
        { error: 'Missing required fields: title, shortDescription, or longDescription' },
        { status: 400 }
      );
    }

    // Validate ObjectId format for the event ID
    if (!params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return NextResponse.json({ error: 'Invalid event ID format' }, { status: 400 });
    }

    // Update admin info
    eventData.lastModifiedBy = admin.userId;

    // Ensure dynamicPricing has required structure
    if (!eventData.dynamicPricing) {
      eventData.dynamicPricing = {
        enabled: true,
        thresholdPercentage: 50,
        priceIncreasePercentage: 20
      };
    }

    // Recalculate total capacity if dateSlots changed
    if (eventData.dateSlots && Array.isArray(eventData.dateSlots)) {
      eventData.totalCapacity = eventData.dateSlots.reduce((total: number, dateSlot: any) => {
        if (dateSlot.timeSlots && Array.isArray(dateSlot.timeSlots)) {
          return total + dateSlot.timeSlots.reduce((slotTotal: number, timeSlot: any) => {
            return slotTotal + (timeSlot.maxCapacity || 0);
          }, 0);
        }
        return total;
      }, 0);
    }

    // Ensure pricing array exists and has valid structure
    if (!eventData.pricing || !Array.isArray(eventData.pricing)) {
      eventData.pricing = [];
    }

    // Validate pricing entries
    eventData.pricing = eventData.pricing.map((price: any) => ({
      ...price,
      basePrice: price.basePrice || 0,
      currentPrice: price.currentPrice || price.basePrice || 0,
      currency: price.currency || 'INR',
      maxTickets: price.maxTickets || 0,
      soldTickets: price.soldTickets || 0,
      isActive: price.isActive !== undefined ? price.isActive : true,
      priceIncreaseApplied: price.priceIncreaseApplied || false
    }));

    // Ensure facilities array exists
    if (!eventData.facilities || !Array.isArray(eventData.facilities)) {
      eventData.facilities = [];
    }

    // Ensure tags array exists
    if (!eventData.tags || !Array.isArray(eventData.tags)) {
      eventData.tags = [];
    }

    // Ensure gallery array exists
    if (!eventData.gallery || !Array.isArray(eventData.gallery)) {
      eventData.gallery = [];
    }

    // Ensure highlights array exists
    if (!eventData.highlights || !Array.isArray(eventData.highlights)) {
      eventData.highlights = [];
    }

    const event = await FusionXEvent.findByIdAndUpdate(
      params.id,
      eventData,
      { new: true, runValidators: true }
    ).populate('createdBy', 'name email')
     .populate('lastModifiedBy', 'name email');

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    return NextResponse.json(event);

  } catch (error) {
    console.error('Error updating FusionX event:', error);
    
    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes('validation failed')) {
        return NextResponse.json(
          { error: 'Validation failed', details: error.message },
          { status: 400 }
        );
      }
      if (error.message.includes('Cast to ObjectId failed')) {
        return NextResponse.json(
          { error: 'Invalid ID format' },
          { status: 400 }
        );
      }
    }
    
    return NextResponse.json(
      { error: 'Failed to update event', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete FusionX event
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await verifyAdminToken(request);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    // First, get the event to access its assets
    const event = await FusionXEvent.findById(params.id);

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    // Delete all R2 assets for this event
    try {
      await deleteEventAssetsFromR2(params.id);
      console.log(`Cleaned up R2 assets for event ${params.id}`);
    } catch (r2Error) {
      console.error('Error cleaning up R2 assets:', r2Error);
      // Continue with deletion even if R2 cleanup fails
    }

    // Delete the event from MongoDB
    await FusionXEvent.findByIdAndDelete(params.id);

    return NextResponse.json({ 
      message: 'Event and all associated assets deleted successfully' 
    });

  } catch (error) {
    console.error('Error deleting FusionX event:', error);
    return NextResponse.json(
      { error: 'Failed to delete event' },
      { status: 500 }
    );
  }
}
