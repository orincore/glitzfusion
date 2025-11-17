import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Booking from '@/models/Booking';
import { generateMemberCodes } from '@/lib/bookingUtils';

// Force model registration
import '@/models/FusionXEvent';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const { bookingCode } = await request.json();
    
    if (!bookingCode) {
      return NextResponse.json(
        { success: false, error: 'Booking code is required' },
        { status: 400 }
      );
    }

    // Find the specific booking
    const booking = await Booking.findOne({ bookingCode });
    
    if (!booking) {
      return NextResponse.json(
        { success: false, error: 'Booking not found' },
        { status: 404 }
      );
    }

    console.log(`Updating booking: ${booking.bookingCode}`);
    console.log(`Current members:`, booking.members.map((m: any) => ({ name: m.name, code: m.memberCode })));
    
    // Generate member codes for this booking
    const memberCodes = generateMemberCodes(booking.bookingCode, booking.members.length);
    console.log(`Generated codes:`, memberCodes);
    
    // Update each member with their code using direct assignment
    for (let i = 0; i < booking.members.length; i++) {
      booking.members[i].memberCode = memberCodes[i];
    }
    
    // Mark the members array as modified
    booking.markModified('members');
    
    // Save the booking
    const savedBooking = await booking.save();
    console.log(`After save:`, savedBooking.members.map((m: any) => ({ name: m.name, code: m.memberCode })));
    
    // Verify by fetching again
    const verifyBooking = await Booking.findOne({ bookingCode });
    console.log(`Verification:`, verifyBooking?.members.map((m: any) => ({ name: m.name, code: m.memberCode })));

    return NextResponse.json({
      success: true,
      message: `Successfully updated booking ${bookingCode}`,
      memberCodes: memberCodes,
      booking: {
        bookingCode: verifyBooking?.bookingCode,
        members: verifyBooking?.members.map((m: any) => ({
          name: m.name,
          memberCode: m.memberCode
        }))
      }
    });

  } catch (error) {
    console.error('Fix booking codes failed:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Fix failed' 
      },
      { status: 500 }
    );
  }
}
