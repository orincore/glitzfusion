import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

export interface InvoiceData {
  // Invoice Details
  invoiceNumber: string;
  invoiceDate: string;
  dueDate?: string;
  
  // Payment Details
  paymentId: string;
  paymentMethod: string;
  paymentDate: string;
  
  // Booking Details
  bookingCode: string;
  eventTitle: string;
  eventDate: string;
  eventTime: string;
  venue?: string;
  
  // Customer Details
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  
  // Billing Details
  subtotal: number;
  taxes?: number;
  discount?: number;
  totalAmount: number;
  
  // Members
  members: Array<{
    name: string;
    email: string;
    phone: string;
  }>;
  
  // Additional Info
  notes?: string;
}

export async function generateInvoicePDF(invoiceData: InvoiceData): Promise<Buffer> {
  try {
    // Create a new PDF document
    const pdfDoc = await PDFDocument.create();
    
    // Set document metadata
    pdfDoc.setTitle(`Invoice ${invoiceData.invoiceNumber}`);
    pdfDoc.setAuthor('GlitzFusion Studios');
    pdfDoc.setSubject(`FusionX Event Invoice - ${invoiceData.bookingCode}`);
    pdfDoc.setCreator('FusionX Events System');
    
    // Add a page
    const page = pdfDoc.addPage([595.28, 841.89]); // A4 size in points
    const { width, height } = page.getSize();
    
    // Embed fonts
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    
    // Colors (convert hex to rgb)
    const primaryColor = rgb(0, 1, 0.478); // #00ff7a
    const darkColor = rgb(0.102, 0.102, 0.102); // #1a1a1a
    const grayColor = rgb(0.4, 0.4, 0.4); // #666666
    const lightGray = rgb(0.961, 0.961, 0.961); // #f5f5f5
    const white = rgb(1, 1, 1);
    const black = rgb(0, 0, 0);
    
    // Type definitions for better type safety
    type RGBColor = ReturnType<typeof rgb>;
    
    interface TextOptions {
      size?: number;
      bold?: boolean;
      color?: RGBColor;
      maxWidth?: number;
      align?: 'left' | 'center' | 'right';
    }
    
    interface RectOptions {
      fill?: RGBColor;
      stroke?: RGBColor;
      strokeWidth?: number;
    }
    
    // Helper function to draw text with improved positioning
    const drawText = (text: string, x: number, y: number, options: TextOptions = {}): void => {
      const fontSize = options.size || 12;
      const color = options.color || black;
      const fontToUse = options.bold ? boldFont : font;
      const maxWidth = options.maxWidth;
      
      // Calculate text width for alignment
      let adjustedX = x;
      if (options.align === 'center' && maxWidth) {
        const textWidth = fontToUse.widthOfTextAtSize(text, fontSize);
        adjustedX = x + (maxWidth - textWidth) / 2;
      } else if (options.align === 'right' && maxWidth) {
        const textWidth = fontToUse.widthOfTextAtSize(text, fontSize);
        adjustedX = x + maxWidth - textWidth;
      }
      
      page.drawText(text, {
        x: adjustedX,
        y: height - y, // pdf-lib uses bottom-left origin, convert from top-left
        size: fontSize,
        font: fontToUse,
        color,
        maxWidth
      });
    };
    
    // Helper function to draw rectangle with better styling
    const drawRect = (x: number, y: number, w: number, h: number, options: RectOptions = {}): void => {
      page.drawRectangle({
        x,
        y: height - y - h, // Convert coordinate system
        width: w,
        height: h,
        color: options.fill,
        borderColor: options.stroke,
        borderWidth: options.strokeWidth || (options.stroke ? 1 : 0)
      });
    };
    
    // Helper function to draw a line
    const drawLine = (x1: number, y1: number, x2: number, y2: number, color: RGBColor = grayColor, thickness = 1): void => {
      page.drawLine({
        start: { x: x1, y: height - y1 },
        end: { x: x2, y: height - y2 },
        color,
        thickness
      });
    };
    
    // Header with better spacing
    drawText('FUSIONX', 50, 50, { size: 32, bold: true, color: darkColor });
    drawText('by GlitzFusion Studios', 50, 90, { size: 12, color: primaryColor });
    
    // Add a subtle line under header
    drawLine(50, 110, 550, 110, primaryColor, 2);
    
    // Invoice Title with better positioning
    drawText('INVOICE', 400, 50, { size: 28, bold: true, color: darkColor, align: 'right', maxWidth: 150 });
    
    // Invoice Details Box with improved design
    const invoiceBoxY = 130;
    drawRect(380, invoiceBoxY, 170, 90, { fill: lightGray, stroke: grayColor, strokeWidth: 1 });
    
    drawText('Invoice Number:', 390, invoiceBoxY + 15, { size: 11, bold: true, color: darkColor });
    drawText(invoiceData.invoiceNumber, 390, invoiceBoxY + 32, { size: 11, color: darkColor });
    drawText('Invoice Date:', 390, invoiceBoxY + 52, { size: 11, bold: true, color: darkColor });
    drawText(invoiceData.invoiceDate, 390, invoiceBoxY + 69, { size: 11, color: darkColor });
    
    // Customer Details with better spacing
    const customerY = 250;
    drawText('Bill To:', 50, customerY, { size: 16, bold: true, color: primaryColor });
    drawRect(50, customerY + 10, 240, 85, { fill: rgb(0.98, 0.98, 0.98), stroke: grayColor, strokeWidth: 0.5 });
    
    drawText(invoiceData.customerName, 60, customerY + 25, { size: 12, bold: true, color: darkColor });
    drawText(invoiceData.customerEmail, 60, customerY + 45, { size: 11, color: darkColor });
    drawText(invoiceData.customerPhone, 60, customerY + 65, { size: 11, color: darkColor });
    
    // Payment Details with better layout
    drawText('Payment Details:', 310, customerY, { size: 16, bold: true, color: primaryColor });
    drawRect(310, customerY + 10, 240, 85, { fill: rgb(0.98, 0.98, 0.98), stroke: grayColor, strokeWidth: 0.5 });
    
    drawText(`Payment ID: ${invoiceData.paymentId}`, 320, customerY + 25, { size: 10, color: darkColor, maxWidth: 220 });
    drawText(`Method: ${invoiceData.paymentMethod}`, 320, customerY + 45, { size: 11, bold: true, color: darkColor });
    drawText(`Date: ${invoiceData.paymentDate}`, 320, customerY + 65, { size: 11, color: darkColor });
    
    // Event Details Section with improved design
    const eventY = 360;
    drawText('Event Details', 50, eventY, { size: 18, bold: true, color: primaryColor });
    
    // Event Details Box with better spacing
    drawRect(50, eventY + 25, 500, 120, { fill: rgb(0.95, 0.98, 0.95), stroke: primaryColor, strokeWidth: 1.5 });
    
    // Left column with better spacing
    drawText('Event:', 65, eventY + 50, { size: 12, bold: true, color: darkColor });
    drawText(invoiceData.eventTitle, 65, eventY + 70, { size: 13, bold: true, color: darkColor, maxWidth: 220 });
    
    drawText('Date & Time:', 65, eventY + 95, { size: 12, bold: true, color: darkColor });
    drawText(`${invoiceData.eventDate}`, 65, eventY + 115, { size: 11, color: darkColor, maxWidth: 220 });
    drawText(`${invoiceData.eventTime}`, 65, eventY + 130, { size: 11, color: darkColor, maxWidth: 220 });
    
    // Right column with better spacing
    drawText('Booking Code:', 320, eventY + 50, { size: 12, bold: true, color: darkColor });
    drawText(invoiceData.bookingCode, 320, eventY + 70, { size: 14, bold: true, color: primaryColor });
    
    if (invoiceData.venue) {
      drawText('Venue:', 320, eventY + 95, { size: 12, bold: true, color: darkColor });
      drawText(invoiceData.venue, 320, eventY + 115, { size: 11, color: darkColor, maxWidth: 210 });
    }
    
    // Members Section with better formatting - moved down for better spacing
    const membersY = 520;
    drawText('Registered Members', 50, membersY, { size: 16, bold: true, color: primaryColor });
    
    // Members table with professional styling
    drawRect(50, membersY + 20, 500, 30, { fill: rgb(0.85, 0.85, 0.85), stroke: darkColor, strokeWidth: 1 });
    drawText('#', 60, membersY + 33, { size: 11, bold: true, color: darkColor });
    drawText('Name', 90, membersY + 33, { size: 11, bold: true, color: darkColor });
    drawText('Email', 250, membersY + 33, { size: 11, bold: true, color: darkColor });
    drawText('Phone', 420, membersY + 33, { size: 11, bold: true, color: darkColor });
    
    let memberY = membersY + 50;
    invoiceData.members.forEach((member, index) => {
      // Professional table rows
      const rowColor = index % 2 === 0 ? white : rgb(0.97, 0.97, 0.97);
      drawRect(50, memberY, 500, 32, { fill: rowColor, stroke: grayColor, strokeWidth: 0.5 });
      
      drawText(`${index + 1}`, 60, memberY + 12, { size: 10, color: darkColor });
      drawText(member.name, 90, memberY + 12, { size: 10, bold: true, color: darkColor, maxWidth: 145 });
      drawText(member.email, 250, memberY + 12, { size: 9, color: darkColor, maxWidth: 155 });
      drawText(member.phone, 420, memberY + 12, { size: 9, color: darkColor, maxWidth: 115 });
      memberY += 32;
    });
    
    // Billing Section with improved design
    const billingY = Math.max(memberY + 35, 630);
    
    drawText('Billing Summary', 50, billingY - 20, { size: 16, bold: true, color: primaryColor });
    
    // Billing Table Header with better styling
    drawRect(50, billingY, 500, 32, { fill: primaryColor, strokeWidth: 0 });
    drawText('Description', 65, billingY + 15, { size: 13, bold: true, color: white });
    drawText('Amount', 470, billingY + 15, { size: 13, bold: true, color: white });
    
    // Billing Rows with better spacing
    let currentY = billingY + 32;
    
    // Event Booking Row with improved layout
    drawRect(50, currentY, 500, 36, { fill: white, stroke: grayColor, strokeWidth: 0.5 });
    drawText(`FusionX Event Booking`, 65, currentY + 12, { size: 12, bold: true, color: darkColor });
    drawText(invoiceData.eventTitle, 65, currentY + 26, { size: 10, color: grayColor, maxWidth: 350 });
    drawText(`Rs. ${invoiceData.subtotal.toLocaleString()}`, 470, currentY + 16, { size: 12, color: darkColor });
    currentY += 36;
    
    // Taxes if applicable
    if (invoiceData.taxes && invoiceData.taxes > 0) {
      drawRect(50, currentY, 500, 28, { fill: rgb(0.98, 0.98, 0.98), stroke: grayColor, strokeWidth: 0.5 });
      drawText('Taxes & Fees', 65, currentY + 12, { size: 11, color: darkColor });
      drawText(`Rs. ${invoiceData.taxes.toLocaleString()}`, 470, currentY + 12, { size: 11, color: darkColor });
      currentY += 28;
    }
    
    // Discount if applicable
    if (invoiceData.discount && invoiceData.discount > 0) {
      drawRect(50, currentY, 500, 28, { fill: rgb(0.95, 1, 0.95), stroke: grayColor, strokeWidth: 0.5 });
      drawText('Discount Applied', 65, currentY + 12, { size: 11, color: rgb(0, 0.6, 0) });
      drawText(`-Rs. ${invoiceData.discount.toLocaleString()}`, 470, currentY + 12, { size: 11, color: rgb(0, 0.6, 0) });
      currentY += 28;
    }
    
    // Total Row with enhanced styling and proper alignment
    drawRect(50, currentY, 500, 42, { fill: darkColor, strokeWidth: 0 });
    drawText('TOTAL AMOUNT', 65, currentY + 18, { size: 16, bold: true, color: white });
    drawText(`Rs. ${invoiceData.totalAmount.toLocaleString()}`, 470, currentY + 18, { size: 16, bold: true, color: primaryColor });
    
    // Footer with better spacing and design - ensure it fits on page
    const footerY = currentY + 50;
    
    // Check if we need a new page or adjust spacing
    const remainingSpace = height - (height - footerY);
    const needsCompactFooter = remainingSpace < 150;
    
    
    // Separator line
    const companyFooterY = footerY + (invoiceData.notes ? (needsCompactFooter ? 45 : 55) : 15);
    drawLine(50, companyFooterY, 550, companyFooterY, grayColor, 1);
    
    // Company Footer with better formatting - ensure it stays on page
    const footerSpacing = needsCompactFooter ? 12 : 18;
    drawText('Thank you for choosing FusionX Events!', 50, companyFooterY + footerSpacing, { size: 11, bold: true, color: primaryColor });
    drawText('For queries, contact: events@glitzfusion.in | +91-XXXXXXXXXX', 50, companyFooterY + footerSpacing + 18, { size: 9, color: grayColor });
    drawText('This is a computer-generated invoice and does not require a signature.', 50, companyFooterY + footerSpacing + 32, { size: 8, color: grayColor });
    
    // Watermark - "PAID" with better positioning
    page.drawText('PAID', {
      x: 220,
      y: height - 400,
      size: 50,
      font: boldFont,
      color: rgb(0.92, 0.92, 0.92),
      opacity: 0.3
    });
    
    // Serialize the PDF
    const pdfBytes = await pdfDoc.save();
    return Buffer.from(pdfBytes);
    
  } catch (error) {
    throw new Error(`Failed to generate invoice PDF: ${error}`);
  }
}

export function generateInvoiceNumber(bookingCode: string, paymentId: string): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  // Format: FX-YYYY-MM-DD-BOOKINGCODE-LAST4DIGITS
  const last4Digits = paymentId.slice(-4).toUpperCase();
  return `FX-${year}-${month}-${day}-${bookingCode}-${last4Digits}`;
}

export function formatInvoiceDate(date: Date): string {
  return date.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}
