import nodemailer from 'nodemailer';
import { generateTicket, generateDefaultTicket, TicketData } from './ticketGenerator';
import { generateInvoicePDF, generateInvoiceNumber, formatInvoiceDate, InvoiceData } from './invoiceGenerator';

// Helper function to generate fallback member code
function generateFallbackMemberCode(bookingCode: string, memberIndex: number): string {
  if (memberIndex === 0) {
    // Primary member gets the main booking code
    return bookingCode;
  } else {
    // Other members get random codes
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
}

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

// Enhanced email template with invoice information
function generatePaymentConfirmationHTML(bookingData: any, paymentData: any) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>FusionX Payment Confirmation & Invoice</title>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f8f9fa; }
        .container { max-width: 650px; margin: 0 auto; background: white; }
        .header { background: linear-gradient(135deg, #00ff7a, #22c55e); color: white; padding: 40px 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 32px; font-weight: 700; }
        .header p { margin: 10px 0 0 0; font-size: 16px; opacity: 0.9; }
        .content { padding: 40px 30px; }
        .success-badge { background: #d4edda; border: 1px solid #c3e6cb; color: #155724; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: center; font-weight: 600; }
        .booking-code { font-size: 28px; font-weight: bold; color: #00ff7a; text-align: center; margin: 30px 0; padding: 20px; background: #000; border-radius: 12px; letter-spacing: 2px; }
        .section { background: #f8f9fa; padding: 25px; border-radius: 12px; margin: 25px 0; border-left: 4px solid #00ff7a; }
        .section h3 { margin: 0 0 20px 0; color: #1a1a1a; font-size: 18px; font-weight: 600; }
        .detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
        .detail-item { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #e9ecef; }
        .detail-item:last-child { border-bottom: none; }
        .detail-label { font-weight: 600; color: #495057; }
        .detail-value { color: #1a1a1a; font-weight: 500; }
        .members { margin-top: 20px; }
        .member { background: white; padding: 15px; margin: 10px 0; border-radius: 8px; border: 1px solid #e9ecef; }
        .member-name { font-weight: 600; color: #1a1a1a; margin-bottom: 5px; }
        .member-contact { font-size: 14px; color: #6c757d; }
        .payment-summary { background: linear-gradient(135deg, #1a1a1a, #2d2d2d); color: white; padding: 25px; border-radius: 12px; margin: 25px 0; }
        .payment-summary h3 { margin: 0 0 20px 0; color: #00ff7a; }
        .amount-row { display: flex; justify-content: space-between; padding: 8px 0; }
        .total-amount { font-size: 24px; font-weight: bold; color: #00ff7a; border-top: 2px solid #00ff7a; padding-top: 15px; margin-top: 15px; }
        .instructions { background: #fff3cd; border: 1px solid #ffeaa7; padding: 20px; border-radius: 8px; margin: 25px 0; }
        .instructions h4 { margin: 0 0 15px 0; color: #856404; }
        .instructions ul { margin: 0; padding-left: 20px; }
        .instructions li { margin: 8px 0; }
        .footer { background: #f8f9fa; padding: 30px; text-align: center; color: #6c757d; font-size: 14px; border-top: 1px solid #e9ecef; }
        .footer p { margin: 5px 0; }
        .invoice-info { background: #e7f3ff; border: 1px solid #b3d9ff; padding: 15px; border-radius: 8px; margin: 20px 0; }
        .invoice-info strong { color: #0056b3; }
        @media (max-width: 600px) {
          .detail-grid { grid-template-columns: 1fr; }
          .container { margin: 0; }
          .content { padding: 20px; }
          .header { padding: 30px 20px; }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 Payment Successful!</h1>
          <p>Your FusionX event booking has been confirmed</p>
        </div>
        
        <div class="content">
          <div class="success-badge">
            ✅ Payment processed successfully • Invoice generated • Tickets ready
          </div>
          
          <div class="booking-code">
            ${bookingData.bookingCode}
          </div>
          
          <div class="section">
            <h3>📅 Event Details</h3>
            <div class="detail-item">
              <span class="detail-label">Event:</span>
              <span class="detail-value">${bookingData.eventTitle}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Date:</span>
              <span class="detail-value">${bookingData.date}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Time:</span>
              <span class="detail-value">${bookingData.time}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Pricing Tier:</span>
              <span class="detail-value">${bookingData.pricing}</span>
            </div>
            ${bookingData.venue ? `
            <div class="detail-item">
              <span class="detail-label">Venue:</span>
              <span class="detail-value">${bookingData.venue}</span>
            </div>
            ` : ''}
          </div>

          <div class="payment-summary">
            <h3>💳 Payment Summary</h3>
            <div class="amount-row">
              <span>Event Booking (${bookingData.memberCount} ${bookingData.memberCount === 1 ? 'person' : 'people'})</span>
              <span>₹${bookingData.totalAmount.toLocaleString()}</span>
            </div>
            <div class="amount-row total-amount">
              <span>Total Paid</span>
              <span>₹${bookingData.totalAmount.toLocaleString()}</span>
            </div>
            <div style="margin-top: 15px; font-size: 14px; opacity: 0.8;">
              Payment ID: ${paymentData.paymentId}<br>
              Method: ${paymentData.paymentMethod}<br>
              Date: ${paymentData.paymentDate}
            </div>
          </div>

          <div class="invoice-info">
            <strong>📄 Invoice Details:</strong><br>
            Invoice Number: ${paymentData.invoiceNumber}<br>
            Your detailed invoice is attached as a PDF to this email.
          </div>

          <div class="section">
            <h3>👥 Registered Members</h3>
            <div class="members">
              ${bookingData.members.map((member: any, index: number) => `
                <div class="member">
                  <div class="member-name">
                    ${index === 0 ? '👤 Primary Contact: ' : `Member ${index + 1}: `}${member.name}
                  </div>
                  <div class="member-contact">
                    📧 ${member.email} • 📞 ${member.phone}
                  </div>
                </div>
              `).join('')}
            </div>
          </div>

          <div class="instructions">
            <h4>📋 Important Instructions:</h4>
            <ul>
              <li><strong>Save your booking code:</strong> ${bookingData.bookingCode}</li>
              <li><strong>Bring your ticket:</strong> Present the attached ticket at the event entrance</li>
              <li><strong>Valid ID required:</strong> All members must carry government-issued photo ID</li>
              <li><strong>Arrive early:</strong> Please arrive 30 minutes before the event start time</li>
              <li><strong>Invoice:</strong> Keep the attached invoice for your records</li>
            </ul>
          </div>
        </div>

        <div class="footer">
          <p><strong>FusionX Events</strong> by GlitzFusion Studios</p>
          <p>📧 events@glitzfusion.in • 📞 ${bookingData.eventContactPhone || '+91-XXXXXXXXXX'}</p>
          <p>Thank you for choosing FusionX Events! We look forward to seeing you at the event.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

// Original booking confirmation template (for non-payment scenarios)
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

// Welcome email template for validated attendees
function generateWelcomeHTML(welcomeData: {
  memberName: string;
  eventTitle: string;
  bookingCode: string;
  eventDate: string;
  eventTime: string;
}) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to ${welcomeData.eventTitle}</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #00ff7a, #22c55e); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .welcome-message { font-size: 24px; font-weight: bold; color: #00ff7a; text-align: center; margin: 20px 0; }
        .details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 Welcome to ${welcomeData.eventTitle}!</h1>
        </div>
        <div class="content">
          <div class="welcome-message">
            Hello ${welcomeData.memberName}!
          </div>
          
          <p>Your booking code has been successfully validated and you're now checked in for the event!</p>
          
          <div class="details">
            <h3>Event Details:</h3>
            <p><strong>Event:</strong> ${welcomeData.eventTitle}</p>
            <p><strong>Date:</strong> ${new Date(welcomeData.eventDate).toLocaleDateString('en-IN', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}</p>
            <p><strong>Time:</strong> ${welcomeData.eventTime}</p>
            <p><strong>Booking Code:</strong> ${welcomeData.bookingCode}</p>
          </div>
          
          <p>We're excited to have you join us! Please enjoy the event and don't hesitate to reach out to our staff if you need any assistance.</p>
          
          <div class="footer">
            <p>Thank you for choosing FusionX Events!</p>
            <p>For any queries, contact us at events@glitzfusion.in</p>
          </div>
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
        const memberIndex = bookingData.members.findIndex((m: any) => m === member);
        const memberCode = member.memberCode || generateFallbackMemberCode(bookingData.bookingCode, memberIndex);
        
        const ticketData: TicketData = {
          bookingCode: bookingData.bookingCode,
          memberCode: memberCode,
          memberName: member.name,
          eventTitle: bookingData.eventTitle,
          date: bookingData.date,
          time: bookingData.time,
          venue: bookingData.venue || 'Event Venue',
          memberIndex: memberIndex,
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
// Send welcome email to validated attendee
export async function sendWelcomeEmail(welcomeData: {
  memberName: string;
  memberEmail: string;
  eventTitle: string;
  bookingCode: string;
  eventDate: string;
  eventTime: string;
}) {
  try {
    const transporter = getTransporter();
    
    const mailOptions = {
      from: `"FusionX Events" <${process.env.SMTP_USER}>`,
      to: welcomeData.memberEmail,
      subject: `Welcome to ${welcomeData.eventTitle}! 🎉`,
      html: generateWelcomeHTML(welcomeData),
    };

    const result = await transporter.sendMail(mailOptions);
    console.log(`Welcome email sent to ${welcomeData.memberEmail}:`, result.messageId);
    return result;
  } catch (error) {
    console.error('Error sending welcome email:', error);
    throw error;
  }
}

// Send payment confirmation email with invoice and tickets
export async function sendPaymentConfirmationEmail(
  email: string, 
  bookingData: any, 
  paymentData: {
    paymentId: string;
    paymentMethod: string;
    paymentDate: string;
    amount: number;
  },
  ticketTemplateUrl?: string
) {
  try {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.warn('SMTP credentials not configured. Email not sent.');
      return { success: false, error: 'SMTP not configured' };
    }

    const transporter = getTransporter();
    const fromAddress = process.env.SMTP_FROM || process.env.SMTP_USER || '';

    // Generate invoice
    const invoiceNumber = generateInvoiceNumber(bookingData.bookingCode, paymentData.paymentId);
    const invoiceDate = formatInvoiceDate(new Date());
    
    const member = bookingData.members.find((m: any) => m.email === email) || bookingData.members[0];
    
    const invoiceData: InvoiceData = {
      invoiceNumber,
      invoiceDate,
      paymentId: paymentData.paymentId,
      paymentMethod: paymentData.paymentMethod,
      paymentDate: paymentData.paymentDate,
      bookingCode: bookingData.bookingCode,
      eventTitle: bookingData.eventTitle,
      eventDate: bookingData.date,
      eventTime: bookingData.time,
      venue: bookingData.venue,
      customerName: member.name,
      customerEmail: member.email,
      customerPhone: member.phone,
      subtotal: paymentData.amount,
      totalAmount: paymentData.amount,
      members: bookingData.members,
      notes: `Thank you for booking with FusionX Events! Present your booking code ${bookingData.bookingCode} at the event entrance.`
    };

    // Generate invoice PDF
    let invoicePDF: Buffer | null = null;
    try {
      invoicePDF = await generateInvoicePDF(invoiceData);
    } catch (invoiceError) {
      console.error('Error generating invoice PDF:', invoiceError);
    }

    // Generate ticket for this recipient
    let ticketBuffer: Buffer | null = null;
    let ticketMemberName = '';

    try {
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

    // Prepare attachments
    const attachments: any[] = [];
    
    // Add invoice PDF
    if (invoicePDF) {
      attachments.push({
        filename: `FusionX-Invoice-${invoiceNumber}.pdf`,
        content: invoicePDF,
        contentType: 'application/pdf',
      });
    }

    // Add ticket image (inline)
    if (ticketBuffer) {
      attachments.push({
        filename: `FusionX-Ticket-${bookingData.bookingCode}-${ticketMemberName.replace(/\s+/g, '_')}.png`,
        content: ticketBuffer,
        contentType: 'image/png',
        cid: 'ticket-inline',
      });
    }

    // Enhanced payment data for template
    const enhancedPaymentData = {
      ...paymentData,
      invoiceNumber,
      paymentDate: formatInvoiceDate(new Date(paymentData.paymentDate))
    };

    const baseHtml = generatePaymentConfirmationHTML(bookingData, enhancedPaymentData);
    const htmlWithTicket = ticketBuffer
      ? `${baseHtml}
        <div style="margin-top:30px; text-align:center; padding: 20px; background: #f8f9fa; border-radius: 12px;">
          <h3 style="color: #1a1a1a; margin-bottom: 15px;">🎫 Your Event Ticket</h3>
          <p style="font-size:14px;color:#6c757d;margin-bottom:15px;">
            Present this ticket at the event entrance for quick entry
          </p>
          <img src="cid:ticket-inline" alt="FusionX Event Ticket" style="max-width:100%;border-radius:12px;box-shadow: 0 4px 12px rgba(0,0,0,0.1);" />
        </div>
      `
      : baseHtml;

    const mailOptions = {
      from: {
        name: 'FusionX Events',
        address: fromAddress,
      },
      to: email,
      subject: `🎉 Payment Confirmed & Invoice - ${bookingData.bookingCode}`,
      html: htmlWithTicket,
      text: `
        FusionX Payment Confirmation & Invoice
        
        Payment Successful! ✅
        
        Booking Code: ${bookingData.bookingCode}
        Invoice Number: ${invoiceNumber}
        
        Event: ${bookingData.eventTitle}
        Date: ${bookingData.date}
        Time: ${bookingData.time}
        
        Payment Details:
        Payment ID: ${paymentData.paymentId}
        Method: ${paymentData.paymentMethod}
        Amount Paid: ₹${paymentData.amount.toLocaleString()}
        Date: ${paymentData.paymentDate}
        
        Your invoice and ticket are attached to this email.
        Please save your booking code and present it at the event for entry.
        
        Thank you for choosing FusionX Events!
        
        FusionX Events by GlitzFusion Studios
        events@glitzfusion.in
      `,
      attachments,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Payment confirmation email sent successfully:', result.messageId);
    
    return { 
      success: true, 
      messageId: result.messageId, 
      invoiceGenerated: !!invoicePDF,
      ticketGenerated: !!ticketBuffer,
      invoiceNumber 
    };
  } catch (error) {
    console.error('Error sending payment confirmation email:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// Send OTP verification email
export async function sendOTPEmail(email: string, otp: string) {
  try {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.warn('SMTP credentials not configured. Email not sent.');
      throw new Error('SMTP not configured');
    }

    const transporter = getTransporter();
    const fromAddress = process.env.SMTP_FROM || process.env.SMTP_USER || '';

    const otpHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>FusionX Email Verification</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f8f9fa; }
          .container { max-width: 500px; margin: 0 auto; background: white; }
          .header { background: linear-gradient(135deg, #00ff7a, #22c55e); color: white; padding: 30px; text-align: center; }
          .header h1 { margin: 0; font-size: 24px; font-weight: 700; }
          .content { padding: 30px; text-align: center; }
          .otp-code { font-size: 36px; font-weight: bold; color: #00ff7a; background: #000; padding: 20px; border-radius: 12px; letter-spacing: 8px; margin: 20px 0; font-family: 'Courier New', monospace; }
          .instructions { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: left; }
          .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #6c757d; font-size: 14px; border-top: 1px solid #e9ecef; }
          .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 8px; margin: 20px 0; color: #856404; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔐 Email Verification</h1>
            <p>Verify your email to continue with FusionX booking</p>
          </div>
          
          <div class="content">
            <p>Hello!</p>
            <p>Please use the following verification code to complete your FusionX event booking:</p>
            
            <div class="otp-code">
              ${otp}
            </div>
            
            <div class="instructions">
              <h4 style="margin: 0 0 10px 0; color: #1a1a1a;">Instructions:</h4>
              <ul style="margin: 0; padding-left: 20px; text-align: left;">
                <li>Enter this 6-digit code in the verification field</li>
                <li>This code is valid for 5 minutes only</li>
                <li>Do not share this code with anyone</li>
                <li>If you didn't request this code, please ignore this email</li>
              </ul>
            </div>
            
            <div class="warning">
              <strong>⚠️ Security Notice:</strong><br>
              This code will expire in 5 minutes. If you need a new code, please request it from the booking form.
            </div>
          </div>

          <div class="footer">
            <p><strong>FusionX Events</strong> by GlitzFusion Studios</p>
            <p>This is an automated security email. Please do not reply.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const mailOptions = {
      from: {
        name: 'FusionX Events',
        address: fromAddress,
      },
      to: email,
      subject: '🔐 FusionX Email Verification Code',
      html: otpHtml,
      text: `
        FusionX Email Verification
        
        Your verification code is: ${otp}
        
        This code is valid for 5 minutes only.
        Enter this code in the booking form to verify your email address.
        
        If you didn't request this code, please ignore this email.
        
        FusionX Events by GlitzFusion Studios
      `,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('OTP email sent successfully:', result.messageId);
    
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('Error sending OTP email:', error);
    throw error;
  }
}

// Send payment confirmation email with all member tickets to primary contact
export async function sendPaymentConfirmationEmailWithAllTickets(
  email: string, 
  bookingData: any, 
  paymentData: {
    paymentId: string;
    paymentMethod: string;
    paymentDate: string;
    amount: number;
  },
  ticketTemplateUrl?: string
) {
  try {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.warn('SMTP credentials not configured. Email not sent.');
      return { success: false, error: 'SMTP not configured' };
    }

    const transporter = getTransporter();
    const fromAddress = process.env.SMTP_FROM || process.env.SMTP_USER || '';

    // Generate invoice
    const invoiceNumber = generateInvoiceNumber(bookingData.bookingCode, paymentData.paymentId);
    const invoiceDate = formatInvoiceDate(new Date());
    
    const primaryContact = bookingData.members[0];
    
    const invoiceData: InvoiceData = {
      invoiceNumber,
      invoiceDate,
      paymentId: paymentData.paymentId,
      paymentMethod: paymentData.paymentMethod,
      paymentDate: paymentData.paymentDate,
      bookingCode: bookingData.bookingCode,
      eventTitle: bookingData.eventTitle,
      eventDate: bookingData.date,
      eventTime: bookingData.time,
      venue: bookingData.venue,
      customerName: primaryContact.name,
      customerEmail: primaryContact.email,
      customerPhone: primaryContact.phone,
      subtotal: paymentData.amount,
      totalAmount: paymentData.amount,
      members: bookingData.members,
      notes: `Thank you for booking with FusionX Events! Present your booking code ${bookingData.bookingCode} at the event entrance.`
    };

    // Generate invoice PDF
    let invoicePDF: Buffer | null = null;
    try {
      invoicePDF = await generateInvoicePDF(invoiceData);
    } catch (invoiceError) {
      console.error('Error generating invoice PDF:', invoiceError);
    }

    // Generate tickets for all members
    const ticketBuffers: { buffer: Buffer; memberName: string; memberIndex: number }[] = [];
    
    try {
      for (let i = 0; i < bookingData.members.length; i++) {
        const member = bookingData.members[i];
        const memberCode = member.memberCode || generateFallbackMemberCode(bookingData.bookingCode, i);
        
        const ticketData: TicketData = {
          bookingCode: bookingData.bookingCode,
          memberCode: memberCode,
          memberName: member.name,
          eventTitle: bookingData.eventTitle,
          date: bookingData.date,
          time: bookingData.time,
          venue: bookingData.venue || 'Event Venue',
          memberIndex: i,
          totalMembers: bookingData.members.length,
        };

        const ticketBuffer = ticketTemplateUrl
          ? await generateTicket(ticketTemplateUrl, ticketData)
          : await generateDefaultTicket(ticketData);
        
        ticketBuffers.push({
          buffer: ticketBuffer,
          memberName: member.name,
          memberIndex: i
        });
      }
    } catch (ticketError) {
      console.error('Error generating tickets:', ticketError);
    }

    // Prepare attachments
    const attachments: any[] = [];
    
    // Add invoice PDF
    if (invoicePDF) {
      attachments.push({
        filename: `FusionX-Invoice-${invoiceNumber}.pdf`,
        content: invoicePDF,
        contentType: 'application/pdf',
      });
    }

    // Add all tickets as attachments
    ticketBuffers.forEach(({ buffer, memberName, memberIndex }) => {
      attachments.push({
        filename: `FusionX-Ticket-${bookingData.bookingCode}-${memberName.replace(/\s+/g, '_')}.png`,
        content: buffer,
        contentType: 'image/png',
      });
    });

    // Enhanced payment data for template
    const enhancedPaymentData = {
      ...paymentData,
      invoiceNumber,
      paymentDate: formatInvoiceDate(new Date(paymentData.paymentDate))
    };

    // Generate HTML with all tickets inline
    let baseHtml = generatePaymentConfirmationHTML(bookingData, enhancedPaymentData);
    
    if (ticketBuffers.length > 0) {
      const ticketsHtml = ticketBuffers.map(({ memberName, memberIndex }) => {
        const member = bookingData.members[memberIndex];
        const memberCode = member?.memberCode || generateFallbackMemberCode(bookingData.bookingCode, memberIndex);
        return `
        <div style="margin: 20px 0; padding: 20px; background: #f8f9fa; border-radius: 12px; border-left: 4px solid #00ff7a;">
          <h4 style="color: #1a1a1a; margin: 0 0 10px 0;">
            🎫 Ticket ${memberIndex + 1}: ${memberName}
          </h4>
          <p style="font-size: 16px; color: #00ff7a; font-weight: bold; font-family: 'Courier New', monospace; margin: 5px 0;">
            Code: ${memberCode}
          </p>
          <p style="font-size: 14px; color: #6c757d; margin: 0;">
            Individual ticket attached as: FusionX-Ticket-${bookingData.bookingCode}-${memberName.replace(/\s+/g, '_')}.png
          </p>
        </div>
      `;}).join('');

      baseHtml = `${baseHtml}
        <div style="margin-top:30px; padding: 20px; background: #f8f9fa; border-radius: 12px;">
          <h3 style="color: #1a1a1a; margin-bottom: 20px;">🎫 Event Tickets for All Members</h3>
          <p style="font-size:14px;color:#6c757d;margin-bottom:20px;">
            All tickets are attached to this email. Each member should present their individual ticket at the event entrance.
          </p>
          ${ticketsHtml}
        </div>
      `;
    }

    const mailOptions = {
      from: {
        name: 'FusionX Events',
        address: fromAddress,
      },
      to: email,
      subject: `🎉 Payment Confirmed & All Tickets - ${bookingData.bookingCode}`,
      html: baseHtml,
      text: `
        FusionX Payment Confirmation & All Tickets
        
        Payment Successful! ✅
        
        Booking Code: ${bookingData.bookingCode}
        Invoice Number: ${invoiceNumber}
        
        Event: ${bookingData.eventTitle}
        Date: ${bookingData.date}
        Time: ${bookingData.time}
        
        Payment Details:
        Payment ID: ${paymentData.paymentId}
        Method: ${paymentData.paymentMethod}
        Amount Paid: ₹${paymentData.amount.toLocaleString()}
        Date: ${paymentData.paymentDate}
        
        Members (${bookingData.members.length}):
        ${bookingData.members.map((member: any, index: number) => 
          `${index + 1}. ${member.name}${member.email ? ` (${member.email})` : ''} - Code: ${member.memberCode || `${bookingData.bookingCode}-${index + 1}`}`
        ).join('\n')}
        
        Your invoice and all member tickets are attached to this email.
        Please save your booking code and ensure each member has their ticket for entry.
        
        Thank you for choosing FusionX Events!
        
        FusionX Events by GlitzFusion Studios
        events@glitzfusion.in
      `,
      attachments,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Payment confirmation email with all tickets sent successfully:', result.messageId);
    
    return { 
      success: true, 
      messageId: result.messageId, 
      invoiceGenerated: !!invoicePDF,
      ticketsGenerated: ticketBuffers.length,
      invoiceNumber 
    };
  } catch (error) {
    console.error('Error sending payment confirmation email with all tickets:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

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
