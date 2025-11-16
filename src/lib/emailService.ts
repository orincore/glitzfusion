import nodemailer from 'nodemailer';
import { generateTicket, generateDefaultTicket, TicketData } from './ticketGenerator';

// Email configuration based on env
const SMTP_HOST = process.env.SMTP_HOST || 'smtp.gmail.com';
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '587', 10);
// Prefer explicit SMTP_SECURE env, otherwise infer from port (465 => secure)
const SMTP_SECURE = process.env.SMTP_SECURE
  ? process.env.SMTP_SECURE === 'true'
  : SMTP_PORT === 465;

// Let nodemailer infer the transport options type
const emailConfig = {
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: SMTP_SECURE,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
};

// Create reusable transporter
let transporter: nodemailer.Transporter | null = null;

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport(emailConfig);
  }
  return transporter;
}

// Email templates
function generateBookingConfirmationHTML(bookingData: any) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>FusionX Booking Confirmation</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #00ff7a, #22c55e); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .booking-code { font-size: 24px; font-weight: bold; color: #00ff7a; text-align: center; margin: 20px 0; padding: 15px; background: #000; border-radius: 8px; }
        .details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .detail-row { display: flex; justify-content: space-between; margin: 10px 0; padding: 8px 0; border-bottom: 1px solid #eee; }
        .members { margin-top: 20px; }
        .member { background: #f0f0f0; padding: 10px; margin: 5px 0; border-radius: 5px; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 Booking Confirmed!</h1>
          <p>Your FusionX event booking has been successfully confirmed</p>
        </div>
        
        <div class="content">
          <div class="booking-code">
            Booking Code: ${bookingData.bookingCode}
          </div>
          
          <div class="details">
            <h3>Event Details</h3>
            <div class="detail-row">
              <span><strong>Event:</strong></span>
              <span>${bookingData.eventTitle}</span>
            </div>
            <div class="detail-row">
              <span><strong>Date:</strong></span>
              <span>${bookingData.date}</span>
            </div>
            <div class="detail-row">
              <span><strong>Time:</strong></span>
              <span>${bookingData.time}</span>
            </div>
            <div class="detail-row">
              <span><strong>Pricing:</strong></span>
              <span>${bookingData.pricing}</span>
            </div>
            <div class="detail-row">
              <span><strong>Total Amount:</strong></span>
              <span>₹${bookingData.totalAmount.toLocaleString()}</span>
            </div>
            <div class="detail-row">
              <span><strong>Members:</strong></span>
              <span>${bookingData.memberCount} people</span>
            </div>
          </div>

          <div class="members">
            <h3>Registered Members</h3>
            ${bookingData.members.map((member: any, index: number) => `
              <div class="member">
                <strong>${index === 0 ? '👤 Primary Contact' : `Member ${index + 1}`}:</strong><br>
                ${member.name}<br>
                📧 ${member.email}<br>
                📞 ${member.phone}
              </div>
            `).join('')}
          </div>

          <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h4 style="margin: 0 0 10px 0; color: #856404;">Important Instructions:</h4>
            <ul style="margin: 0; padding-left: 20px;">
              <li>Save this booking code: <strong>${bookingData.bookingCode}</strong></li>
              <li>Present this code at the event for entry verification</li>
              <li>All registered members must be present with valid ID</li>
              <li>Arrive 30 minutes before the event start time</li>
            </ul>
          </div>
        </div>

        <div class="footer">
          <p>This is an automated email from FusionX Events by GlitzFusion Studios</p>
          <p>For queries, contact: ${bookingData.eventContactPhone || bookingData.primaryContact?.phone || ''}</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

// Send booking confirmation email with tickets
export async function sendBookingConfirmationEmail(email: string, bookingData: any, ticketTemplateUrl?: string) {
  try {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.warn('SMTP credentials not configured. Email not sent.');
      return { success: false, error: 'SMTP not configured' };
    }

    const transporter = getTransporter();
    const fromAddress = process.env.SMTP_FROM || process.env.SMTP_USER || '';

    // Generate a single ticket for this recipient (or primary member if not found)
    let ticketBuffer: Buffer | null = null;
    let ticketMemberName = '';

    try {
      const member = bookingData.members.find((m: any) => m.email === email) || bookingData.members[0];
      if (member) {
        ticketMemberName = member.name;
        const ticketData: TicketData = {
          bookingCode: bookingData.bookingCode,
          memberName: member.name,
          eventTitle: bookingData.eventTitle,
          date: bookingData.date,
          time: bookingData.time,
          venue: bookingData.venue || 'Event Venue',
          memberIndex: 0,
          totalMembers: bookingData.members.length,
        };

        ticketBuffer = ticketTemplateUrl
          ? await generateTicket(ticketTemplateUrl, ticketData)
          : await generateDefaultTicket(ticketData);
      }
    } catch (ticketError) {
      console.error('Error generating ticket:', ticketError);
      ticketBuffer = null;
    }

    // Prepare attachments (single ticket, used inline via CID)
    const attachments = ticketBuffer
      ? [{
          filename: `ticket-${bookingData.bookingCode}-${ticketMemberName.replace(/\s+/g, '_')}.png`,
          content: ticketBuffer,
          contentType: 'image/png',
          cid: 'ticket-inline',
        }]
      : [];

    const baseHtml = generateBookingConfirmationHTML(bookingData);
    const htmlWithTicket = ticketBuffer
      ? `${baseHtml}

        <div style="margin-top:24px; text-align:center;">
          <p style="font-size:14px;color:#444;margin-bottom:8px;">
            Your ticket for entry:
          </p>
          <img src="cid:ticket-inline" alt="FusionX Event Ticket" style="max-width:100%;border-radius:8px;border:1px solid #ddd;" />
        </div>
      `
      : baseHtml;

    const mailOptions = {
      from: {
        name: 'FusionX Events',
        address: fromAddress,
      },
      to: email,
      subject: `🎉 FusionX Booking Confirmed - ${bookingData.bookingCode}`,
      html: htmlWithTicket,
      text: `
        FusionX Booking Confirmation
        
        Booking Code: ${bookingData.bookingCode}
        Event: ${bookingData.eventTitle}
        Date: ${bookingData.date}
        Time: ${bookingData.time}
        Total Amount: ₹${bookingData.totalAmount}
        Members: ${bookingData.memberCount}
        
        Please save your booking code and present it at the event for entry.
        Your individual tickets are attached to this email.
        
        FusionX Events by GlitzFusion Studios
      `,
      attachments,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully with tickets:', result.messageId);
    
    return { success: true, messageId: result.messageId, ticketsGenerated: ticketBuffer ? 1 : 0 };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// Test email configuration
export async function testEmailConfiguration() {
  try {
    const transporter = getTransporter();
    await transporter.verify();
    return { success: true, message: 'SMTP configuration is valid' };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}
