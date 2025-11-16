import { createCanvas, loadImage } from 'canvas';

// Bitmap-based character rendering - no fonts needed!
// Each character is drawn using canvas shapes

const CHAR_PATTERNS: { [key: string]: number[][] } = {
  'A': [
    [0,1,1,1,0],
    [1,0,0,0,1],
    [1,0,0,0,1],
    [1,1,1,1,1],
    [1,0,0,0,1],
    [1,0,0,0,1],
    [1,0,0,0,1]
  ],
  'B': [
    [1,1,1,1,0],
    [1,0,0,0,1],
    [1,0,0,0,1],
    [1,1,1,1,0],
    [1,0,0,0,1],
    [1,0,0,0,1],
    [1,1,1,1,0]
  ],
  'C': [
    [0,1,1,1,0],
    [1,0,0,0,1],
    [1,0,0,0,0],
    [1,0,0,0,0],
    [1,0,0,0,0],
    [1,0,0,0,1],
    [0,1,1,1,0]
  ],
  'D': [
    [1,1,1,1,0],
    [1,0,0,0,1],
    [1,0,0,0,1],
    [1,0,0,0,1],
    [1,0,0,0,1],
    [1,0,0,0,1],
    [1,1,1,1,0]
  ],
  'E': [
    [1,1,1,1,1],
    [1,0,0,0,0],
    [1,0,0,0,0],
    [1,1,1,1,0],
    [1,0,0,0,0],
    [1,0,0,0,0],
    [1,1,1,1,1]
  ],
  'F': [
    [1,1,1,1,1],
    [1,0,0,0,0],
    [1,0,0,0,0],
    [1,1,1,1,0],
    [1,0,0,0,0],
    [1,0,0,0,0],
    [1,0,0,0,0]
  ],
  'G': [
    [0,1,1,1,0],
    [1,0,0,0,1],
    [1,0,0,0,0],
    [1,0,1,1,1],
    [1,0,0,0,1],
    [1,0,0,0,1],
    [0,1,1,1,0]
  ],
  'H': [
    [1,0,0,0,1],
    [1,0,0,0,1],
    [1,0,0,0,1],
    [1,1,1,1,1],
    [1,0,0,0,1],
    [1,0,0,0,1],
    [1,0,0,0,1]
  ],
  'I': [
    [1,1,1,1,1],
    [0,0,1,0,0],
    [0,0,1,0,0],
    [0,0,1,0,0],
    [0,0,1,0,0],
    [0,0,1,0,0],
    [1,1,1,1,1]
  ],
  'J': [
    [1,1,1,1,1],
    [0,0,0,1,0],
    [0,0,0,1,0],
    [0,0,0,1,0],
    [0,0,0,1,0],
    [1,0,0,1,0],
    [0,1,1,0,0]
  ],
  'K': [
    [1,0,0,0,1],
    [1,0,0,1,0],
    [1,0,1,0,0],
    [1,1,0,0,0],
    [1,0,1,0,0],
    [1,0,0,1,0],
    [1,0,0,0,1]
  ],
  'L': [
    [1,0,0,0,0],
    [1,0,0,0,0],
    [1,0,0,0,0],
    [1,0,0,0,0],
    [1,0,0,0,0],
    [1,0,0,0,0],
    [1,1,1,1,1]
  ],
  'M': [
    [1,0,0,0,1],
    [1,1,0,1,1],
    [1,0,1,0,1],
    [1,0,0,0,1],
    [1,0,0,0,1],
    [1,0,0,0,1],
    [1,0,0,0,1]
  ],
  'N': [
    [1,0,0,0,1],
    [1,1,0,0,1],
    [1,0,1,0,1],
    [1,0,0,1,1],
    [1,0,0,0,1],
    [1,0,0,0,1],
    [1,0,0,0,1]
  ],
  'O': [
    [0,1,1,1,0],
    [1,0,0,0,1],
    [1,0,0,0,1],
    [1,0,0,0,1],
    [1,0,0,0,1],
    [1,0,0,0,1],
    [0,1,1,1,0]
  ],
  'P': [
    [1,1,1,1,0],
    [1,0,0,0,1],
    [1,0,0,0,1],
    [1,1,1,1,0],
    [1,0,0,0,0],
    [1,0,0,0,0],
    [1,0,0,0,0]
  ],
  'Q': [
    [0,1,1,1,0],
    [1,0,0,0,1],
    [1,0,0,0,1],
    [1,0,0,0,1],
    [1,0,1,0,1],
    [1,0,0,1,0],
    [0,1,1,0,1]
  ],
  'R': [
    [1,1,1,1,0],
    [1,0,0,0,1],
    [1,0,0,0,1],
    [1,1,1,1,0],
    [1,0,1,0,0],
    [1,0,0,1,0],
    [1,0,0,0,1]
  ],
  'S': [
    [0,1,1,1,0],
    [1,0,0,0,1],
    [1,0,0,0,0],
    [0,1,1,1,0],
    [0,0,0,0,1],
    [1,0,0,0,1],
    [0,1,1,1,0]
  ],
  'T': [
    [1,1,1,1,1],
    [0,0,1,0,0],
    [0,0,1,0,0],
    [0,0,1,0,0],
    [0,0,1,0,0],
    [0,0,1,0,0],
    [0,0,1,0,0]
  ],
  'U': [
    [1,0,0,0,1],
    [1,0,0,0,1],
    [1,0,0,0,1],
    [1,0,0,0,1],
    [1,0,0,0,1],
    [1,0,0,0,1],
    [0,1,1,1,0]
  ],
  'V': [
    [1,0,0,0,1],
    [1,0,0,0,1],
    [1,0,0,0,1],
    [1,0,0,0,1],
    [1,0,0,0,1],
    [0,1,0,1,0],
    [0,0,1,0,0]
  ],
  'W': [
    [1,0,0,0,1],
    [1,0,0,0,1],
    [1,0,0,0,1],
    [1,0,1,0,1],
    [1,0,1,0,1],
    [1,1,0,1,1],
    [1,0,0,0,1]
  ],
  'X': [
    [1,0,0,0,1],
    [0,1,0,1,0],
    [0,0,1,0,0],
    [0,0,1,0,0],
    [0,0,1,0,0],
    [0,1,0,1,0],
    [1,0,0,0,1]
  ],
  'Y': [
    [1,0,0,0,1],
    [0,1,0,1,0],
    [0,0,1,0,0],
    [0,0,1,0,0],
    [0,0,1,0,0],
    [0,0,1,0,0],
    [0,0,1,0,0]
  ],
  'Z': [
    [1,1,1,1,1],
    [0,0,0,0,1],
    [0,0,0,1,0],
    [0,0,1,0,0],
    [0,1,0,0,0],
    [1,0,0,0,0],
    [1,1,1,1,1]
  ],
  '0': [
    [0,1,1,1,0],
    [1,0,0,0,1],
    [1,0,0,1,1],
    [1,0,1,0,1],
    [1,1,0,0,1],
    [1,0,0,0,1],
    [0,1,1,1,0]
  ],
  '1': [
    [0,0,1,0,0],
    [0,1,1,0,0],
    [0,0,1,0,0],
    [0,0,1,0,0],
    [0,0,1,0,0],
    [0,0,1,0,0],
    [0,1,1,1,0]
  ],
  '2': [
    [0,1,1,1,0],
    [1,0,0,0,1],
    [0,0,0,0,1],
    [0,0,0,1,0],
    [0,0,1,0,0],
    [0,1,0,0,0],
    [1,1,1,1,1]
  ],
  '3': [
    [0,1,1,1,0],
    [1,0,0,0,1],
    [0,0,0,0,1],
    [0,0,1,1,0],
    [0,0,0,0,1],
    [1,0,0,0,1],
    [0,1,1,1,0]
  ],
  '4': [
    [0,0,0,1,0],
    [0,0,1,1,0],
    [0,1,0,1,0],
    [1,0,0,1,0],
    [1,1,1,1,1],
    [0,0,0,1,0],
    [0,0,0,1,0]
  ],
  '5': [
    [1,1,1,1,1],
    [1,0,0,0,0],
    [1,1,1,1,0],
    [0,0,0,0,1],
    [0,0,0,0,1],
    [1,0,0,0,1],
    [0,1,1,1,0]
  ],
  '6': [
    [0,1,1,1,0],
    [1,0,0,0,1],
    [1,0,0,0,0],
    [1,1,1,1,0],
    [1,0,0,0,1],
    [1,0,0,0,1],
    [0,1,1,1,0]
  ],
  '7': [
    [1,1,1,1,1],
    [0,0,0,0,1],
    [0,0,0,1,0],
    [0,0,1,0,0],
    [0,1,0,0,0],
    [0,1,0,0,0],
    [0,1,0,0,0]
  ],
  '8': [
    [0,1,1,1,0],
    [1,0,0,0,1],
    [1,0,0,0,1],
    [0,1,1,1,0],
    [1,0,0,0,1],
    [1,0,0,0,1],
    [0,1,1,1,0]
  ],
  '9': [
    [0,1,1,1,0],
    [1,0,0,0,1],
    [1,0,0,0,1],
    [0,1,1,1,1],
    [0,0,0,0,1],
    [1,0,0,0,1],
    [0,1,1,1,0]
  ],
  ' ': [
    [0,0,0,0,0],
    [0,0,0,0,0],
    [0,0,0,0,0],
    [0,0,0,0,0],
    [0,0,0,0,0],
    [0,0,0,0,0],
    [0,0,0,0,0]
  ],
  ':': [
    [0,0,0,0,0],
    [0,0,1,0,0],
    [0,0,1,0,0],
    [0,0,0,0,0],
    [0,0,1,0,0],
    [0,0,1,0,0],
    [0,0,0,0,0]
  ],
  '-': [
    [0,0,0,0,0],
    [0,0,0,0,0],
    [0,0,0,0,0],
    [1,1,1,1,1],
    [0,0,0,0,0],
    [0,0,0,0,0],
    [0,0,0,0,0]
  ],
  '•': [
    [0,0,0,0,0],
    [0,0,0,0,0],
    [0,0,0,0,0],
    [0,0,1,0,0],
    [0,0,0,0,0],
    [0,0,0,0,0],
    [0,0,0,0,0]
  ]
};

function drawBitmapChar(ctx: any, char: string, x: number, y: number, pixelSize: number) {
  const pattern = CHAR_PATTERNS[char.toUpperCase()] || CHAR_PATTERNS[' '];
  
  ctx.fillStyle = '#000000';
  
  for (let row = 0; row < pattern.length; row++) {
    for (let col = 0; col < pattern[row].length; col++) {
      if (pattern[row][col] === 1) {
        ctx.fillRect(
          x + col * pixelSize,
          y + row * pixelSize,
          pixelSize,
          pixelSize
        );
      }
    }
  }
}

function drawBitmapText(ctx: any, text: string, x: number, y: number, pixelSize: number) {
  const charWidth = 5 * pixelSize + pixelSize; // 5 pixels wide + 1 pixel spacing
  const totalWidth = text.length * charWidth;
  let startX = x - totalWidth / 2;
  
  for (let i = 0; i < text.length; i++) {
    drawBitmapChar(ctx, text[i], startX + i * charWidth, y, pixelSize);
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

    // Draw text using bitmap rendering
    drawBitmapText(ctx, ticketData.bookingCode, centerX, centerY - 40, 4);
    drawBitmapText(ctx, ticketData.memberName, centerX, centerY + 5, 3);
    drawBitmapText(ctx, ticketData.eventTitle, centerX, centerY + 40, 2);
    drawBitmapText(ctx, `${ticketData.date} • ${ticketData.time}`, centerX, centerY + 75, 2);
    
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
  
  // Draw content using bitmap text rendering
  drawBitmapText(ctx, 'FUSIONX EVENT TICKET', centerX, 80, 3);
  drawBitmapText(ctx, ticketData.bookingCode, centerX, centerY - 40, 4);
  drawBitmapText(ctx, ticketData.memberName, centerX, centerY + 10, 3);
  drawBitmapText(ctx, ticketData.eventTitle, centerX, centerY + 50, 2);
  drawBitmapText(ctx, `${ticketData.date} • ${ticketData.time}`, centerX, centerY + 80, 2);
  drawBitmapText(ctx, ticketData.venue, centerX, centerY + 110, 2);
  
  if (ticketData.totalMembers > 1) {
    drawBitmapText(
      ctx,
      `MEMBER ${ticketData.memberIndex + 1} OF ${ticketData.totalMembers}`,
      centerX,
      350,
      1
    );
  }
  
  return canvas.toBuffer('image/png');
}
