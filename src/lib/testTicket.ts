// Test script to verify ticket generation works without fontconfig errors
import { generateDefaultTicket, TicketData } from './ticketGenerator';

export async function testTicketGeneration(): Promise<boolean> {
  try {
    const testData: TicketData = {
      bookingCode: 'TEST123',
      memberName: 'Test User',
      eventTitle: 'Test Event',
      date: '2025-11-16',
      time: '18:00',
      venue: 'Test Venue',
      memberIndex: 0,
      totalMembers: 1,
    };

    console.log('Testing ticket generation...');
    const ticketBuffer = await generateDefaultTicket(testData);
    
    if (ticketBuffer && ticketBuffer.length > 0) {
      console.log('✅ Ticket generation successful! Buffer size:', ticketBuffer.length);
      return true;
    } else {
      console.log('❌ Ticket generation failed - empty buffer');
      return false;
    }
  } catch (error) {
    console.error('❌ Ticket generation error:', error);
    return false;
  }
}
