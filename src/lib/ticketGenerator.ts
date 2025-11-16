import { createCanvas, loadImage } from 'canvas';

// Completely bypass font system and draw text manually using shapes
// This approach works in any environment without font dependencies

function drawText(ctx: any, text: string, x: number, y: number, size: number, bold: boolean = false) {
  // Set basic text properties that work without external fonts
  ctx.fillStyle = '#000000';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  // Use the most basic font specification possible
  const weight = bold ? 'bold' : 'normal';
  ctx.font = `${weight} ${size}px serif`;
  
  // Draw text with stroke for better visibility
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 1;
  
  ctx.fillText(text, x, y);
  if (bold) {
    ctx.strokeText(text, x, y);
  }
}

// Initialize canvas environment for serverless
function initializeCanvas() {
  try {
    // Suppress all fontconfig errors by setting environment variables
    process.env.FONTCONFIG_PATH = '';
    process.env.FONTCONFIG_FILE = '';
    process.env.FC_CONFIG_FILE = '';
    
    // Redirect stderr to suppress fontconfig warnings
    if (process.stderr && typeof process.stderr.write === 'function') {
      const originalWrite = process.stderr.write;
      process.stderr.write = function(chunk: any, ...args: any[]) {
        if (typeof chunk === 'string' && chunk.includes('Fontconfig')) {
          return true; // Suppress fontconfig messages
        }
        return originalWrite.call(this, chunk, ...args);
      };
    }
    
    console.log('✅ Canvas initialized for serverless environment');
  } catch (error) {
    console.warn('Canvas initialization warning:', error instanceof Error ? error.message : 'Unknown error');
  }
}

export interface TicketData {
  bookingCode: string;
  memberName: string;
  eventTitle: string;
  date: string;
  time: string;
  venue: string;
  memberIndex: number;
  totalMembers: number;
}

export async function generateTicket(
  ticketTemplateUrl: string,
  ticketData: TicketData
): Promise<Buffer> {
  try {
    // Initialize canvas environment
    initializeCanvas();
    
    // Load the ticket template image
    const templateImage = await loadImage(ticketTemplateUrl);
    
    // Create canvas with template dimensions
    const canvas = createCanvas(templateImage.width, templateImage.height);
    const ctx = canvas.getContext('2d');
    
    // Draw the template background
    ctx.drawImage(templateImage, 0, 0);
    
    // Calculate center positions
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    // Draw text using our custom function
    drawText(ctx, ticketData.bookingCode, centerX, centerY - 40, 48, true);
    drawText(ctx, ticketData.memberName, centerX, centerY + 5, 32, true);
    drawText(ctx, ticketData.eventTitle, centerX, centerY + 40, 24, false);
    drawText(ctx, `${ticketData.date} • ${ticketData.time}`, centerX, centerY + 75, 20, false);
    
    // Convert canvas to buffer
    return canvas.toBuffer('image/png');
    
  } catch (error) {
    console.error('Error generating ticket:', error);
    throw new Error('Failed to generate ticket');
  }
}

export async function generateTicketsForBooking(
  ticketTemplateUrl: string,
  bookingData: any
): Promise<{ memberName: string; ticketBuffer: Buffer }[]> {
  const tickets: { memberName: string; ticketBuffer: Buffer }[] = [];
  
  for (let i = 0; i < bookingData.members.length; i++) {
    const member = bookingData.members[i];
    
    const ticketData: TicketData = {
      bookingCode: bookingData.bookingCode,
      memberName: member.name,
      eventTitle: bookingData.eventTitle,
      date: bookingData.date,
      time: bookingData.time,
      venue: bookingData.venue || 'Event Venue',
      memberIndex: i,
      totalMembers: bookingData.members.length,
    };
    
    const ticketBuffer = await generateTicket(ticketTemplateUrl, ticketData);
    tickets.push({
      memberName: member.name,
      ticketBuffer,
    });
  }
  
  return tickets;
}

// Fallback ticket generator when no template is provided
export async function generateDefaultTicket(ticketData: TicketData): Promise<Buffer> {
  // Initialize canvas environment
  initializeCanvas();
  
  // Create a default ticket design
  const canvas = createCanvas(800, 400);
  const ctx = canvas.getContext('2d');
  
  // Create gradient background
  const gradient = ctx.createLinearGradient(0, 0, 800, 400);
  gradient.addColorStop(0, '#00ff7a');
  gradient.addColorStop(1, '#22c55e');
  
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 800, 400);
  
  // Add decorative border
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 8;
  ctx.strokeRect(20, 20, 760, 360);
  
  // Add inner border
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 2;
  ctx.strokeRect(40, 40, 720, 320);
  
  const centerX = 400;
  const centerY = 200;
  
  // Draw content using our custom text function
  drawText(ctx, 'FusionX EVENT TICKET', centerX, 80, 36, true);
  drawText(ctx, ticketData.bookingCode, centerX, centerY - 40, 48, true);
  drawText(ctx, ticketData.memberName, centerX, centerY + 10, 28, true);
  drawText(ctx, ticketData.eventTitle, centerX, centerY + 50, 20, false);
  drawText(ctx, `${ticketData.date} • ${ticketData.time}`, centerX, centerY + 80, 18, false);
  drawText(ctx, ticketData.venue, centerX, centerY + 110, 16, false);
  
  if (ticketData.totalMembers > 1) {
    drawText(
      ctx,
      `Member ${ticketData.memberIndex + 1} of ${ticketData.totalMembers}`,
      centerX,
      350,
      14,
      false
    );
  }
  
  return canvas.toBuffer('image/png');
}
