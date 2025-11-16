import { NextRequest, NextResponse } from 'next/server';
import { testTicketGeneration } from '@/lib/testTicket';

export async function GET() {
  try {
    console.log('🧪 Starting ticket generation test...');
    const success = await testTicketGeneration();
    
    if (success) {
      return NextResponse.json({ 
        success: true, 
        message: '✅ Ticket generation test passed! Font rendering should work in production.' 
      });
    } else {
      return NextResponse.json({ 
        success: false, 
        message: '❌ Ticket generation test failed.' 
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Test endpoint error:', error);
    return NextResponse.json({ 
      success: false, 
      message: '❌ Test failed with error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
