// Test script to verify ticket generation works without fontconfig errors
import { generateDefaultTicket, TicketData } from './ticketGenerator';
import fs from 'fs';
import path from 'path';

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

    console.log('🧪 Testing ticket generation with bundled font...');
    const ticketBuffer = await generateDefaultTicket(testData);
    
    if (ticketBuffer && ticketBuffer.length > 0) {
      console.log('✅ Ticket generation successful! Buffer size:', ticketBuffer.length);
      
      // Save test ticket to verify it works
      try {
        const testPath = path.join(process.cwd(), 'test-ticket.png');
        fs.writeFileSync(testPath, ticketBuffer);
        console.log('💾 Test ticket saved to:', testPath);
      } catch (saveError) {
        console.log('⚠️ Could not save test file, but generation worked');
      }
      
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
