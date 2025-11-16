import { createCanvas, loadImage, registerFont } from 'canvas';
import path from 'path';

// Initialize font configuration for serverless environments
let fontConfigured = false;

function initializeFonts() {
  if (fontConfigured) return;
  
  try {
    // Register bundled Arial font for serverless environments
    const arialPath = require.resolve('@canvas-fonts/arial');
    registerFont(arialPath, { family: 'Arial' });
    console.log('✅ Successfully registered bundled Arial font');
    fontConfigured = true;
    return;
  } catch (error) {
    console.warn('Failed to register bundled font, trying alternatives:', error instanceof Error ? error.message : 'Unknown error');
  }

  try {
    // Fallback: Set environment variables to handle fontconfig issues
    process.env.FONTCONFIG_PATH = '/dev/null';
    process.env.FC_CONFIG_FILE = '/dev/null';
    console.log('⚠️ Using fallback font configuration');
  } catch (error) {
    console.warn('Font initialization warning:', error instanceof Error ? error.message : 'Unknown error');
  }
  
  fontConfigured = true;
}

// Font function that uses bundled font
function getFontString(size: number, weight: string = 'normal'): string {
  // Try to use the registered Arial font first, fallback to system fonts
  return `${weight} ${size}px Arial, Helvetica, sans-serif`;
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
    // Initialize fonts to prevent fontconfig errors
    initializeFonts();
    
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

    // Draw text directly on the template using black to blend with the existing design
    ctx.fillStyle = '#000000';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Draw booking code (large, prominent)
    ctx.font = getFontString(48, 'bold');
    ctx.fillText(ticketData.bookingCode, centerX, centerY - 40);

    // Draw member name
    ctx.font = getFontString(32, 'bold');
    ctx.fillText(ticketData.memberName, centerX, centerY + 5);

    // Draw event title
    ctx.font = getFontString(24);
    ctx.fillText(ticketData.eventTitle, centerX, centerY + 40);

    // Draw date and slot time
    ctx.font = getFontString(20);
    ctx.fillText(`${ticketData.date} • ${ticketData.time}`, centerX, centerY + 75);
    
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
  // Initialize fonts to prevent fontconfig errors
  initializeFonts();
  
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
  
  // Set text properties
  ctx.fillStyle = '#000000';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  const centerX = 400;
  const centerY = 200;
  
  // Draw content
  ctx.font = getFontString(36, 'bold');
  ctx.fillText('FusionX EVENT TICKET', centerX, 80);
  
  ctx.font = getFontString(48, 'bold');
  ctx.fillText(ticketData.bookingCode, centerX, centerY - 40);
  
  ctx.font = getFontString(28, 'bold');
  ctx.fillText(ticketData.memberName, centerX, centerY + 10);
  
  ctx.font = getFontString(20);
  ctx.fillText(ticketData.eventTitle, centerX, centerY + 50);
  
  ctx.font = getFontString(18);
  ctx.fillText(`${ticketData.date} • ${ticketData.time}`, centerX, centerY + 80);
  
  ctx.font = getFontString(16);
  ctx.fillText(ticketData.venue, centerX, centerY + 110);
  
  if (ticketData.totalMembers > 1) {
    ctx.font = getFontString(14);
    ctx.fillText(
      `Member ${ticketData.memberIndex + 1} of ${ticketData.totalMembers}`,
      centerX,
      350
    );
  }
  
  return canvas.toBuffer('image/png');
}
