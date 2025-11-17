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
    memberCode?: string;
  }>;
  
  // Additional Info
  notes?: string;
}

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
    
    // Colors - Professional color scheme
    const primaryColor = rgb(0, 0.8, 0.4); // Softer green #00cc66
    const accentColor = rgb(0, 0.6, 0.3); // Darker green #009950
    const darkColor = rgb(0.15, 0.15, 0.15); // #262626
    const grayColor = rgb(0.45, 0.45, 0.45); // #737373
    const lightGray = rgb(0.96, 0.96, 0.96); // #f5f5f5
    const borderGray = rgb(0.85, 0.85, 0.85); // #d9d9d9
    const white = rgb(1, 1, 1);
    const black = rgb(0, 0, 0);
    const successGreen = rgb(0, 0.6, 0); // #009900
    const warningOrange = rgb(0.9, 0.5, 0); // #e68a00
    
    // Type definitions
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
    
    // Helper function to draw text
    const drawText = (text: string, x: number, y: number, options: TextOptions = {}): void => {
      const fontSize = options.size || 12;
      const color = options.color || black;
      const fontToUse = options.bold ? boldFont : font;
      const maxWidth = options.maxWidth;
      
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
        y: height - y,
        size: fontSize,
        font: fontToUse,
        color,
        maxWidth
      });
    };
    
    // Helper function to draw rectangle
    const drawRect = (x: number, y: number, w: number, h: number, options: RectOptions = {}): void => {
      page.drawRectangle({
        x,
        y: height - y - h,
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
    
    // HEADER SECTION - Clean and Professional
    const headerY = 40;
    
    // Company branding
    drawText('FUSIONX', 50, headerY, { size: 28, bold: true, color: primaryColor });
    drawText('EVENT MANAGEMENT', 50, headerY + 22, { size: 9, bold: true, color: darkColor });
    drawText('by GlitzFusion Studios', 50, headerY + 34, { size: 8, color: grayColor });
    
    // Invoice badge - shifted further left
    drawRect(395, headerY - 5, 110, 40, { fill: primaryColor });
    drawText('INVOICE', 390, headerY + 15, { 
      size: 16, 
      bold: true, 
      color: white, 
      align: 'center', 
      maxWidth: 110 
    });
    
    // Header divider
    drawLine(50, headerY + 50, 545, headerY + 50, primaryColor, 2);
    
    // INVOICE & BOOKING INFO SECTION
    const infoY = headerY + 70;
    
    // Left box - Invoice Details
    drawRect(50, infoY, 245, 85, { fill: lightGray, stroke: borderGray, strokeWidth: 1 });
    drawText('Invoice Details', 60, infoY + 15, { size: 11, bold: true, color: darkColor });
    drawLine(60, infoY + 25, 285, infoY + 25, borderGray, 0.5);
    
    drawText('Invoice Number:', 60, infoY + 38, { size: 9, bold: true, color: grayColor });
    drawText(invoiceData.invoiceNumber, 60, infoY + 50, { size: 9, color: darkColor });
    
    drawText('Invoice Date:', 60, infoY + 63, { size: 9, bold: true, color: grayColor });
    drawText(invoiceData.invoiceDate, 60, infoY + 75, { size: 9, color: darkColor });
    
    // Right box - Booking Summary
    drawRect(305, infoY, 245, 85, { fill: lightGray, stroke: borderGray, strokeWidth: 1 });
    drawText('Booking Summary', 315, infoY + 15, { size: 11, bold: true, color: darkColor });
    drawLine(315, infoY + 25, 540, infoY + 25, borderGray, 0.5);
    
    drawText(`Event: ${invoiceData.eventTitle}`, 315, infoY + 38, { size: 9, color: darkColor, maxWidth: 220 });
    drawText(`Members: ${invoiceData.members.length}`, 315, infoY + 50, { size: 9, color: darkColor });
    drawText(`Total: Rs. ${invoiceData.totalAmount.toLocaleString()}`, 315, infoY + 63, { 
      size: 10, 
      bold: true, 
      color: accentColor 
    });
    drawText('Status: PAID', 420, infoY + 63, { size: 9, bold: true, color: successGreen });
    
    // CUSTOMER & PAYMENT SECTION
    const customerY = infoY + 105;
    
    // Bill To section
    drawText('Bill To:', 50, customerY, { size: 12, bold: true, color: darkColor });
    drawRect(50, customerY + 18, 245, 75, { fill: white, stroke: borderGray, strokeWidth: 1 });
    
    drawText(invoiceData.customerName, 60, customerY + 32, { size: 11, bold: true, color: darkColor });
    drawText(invoiceData.customerEmail, 60, customerY + 47, { size: 9, color: grayColor, maxWidth: 225 });
    drawText(invoiceData.customerPhone, 60, customerY + 60, { size: 9, color: grayColor });
    drawText('Primary Contact', 60, customerY + 75, { size: 8, color: grayColor });
    
    // Payment Details section
    drawText('Payment Details:', 305, customerY, { size: 12, bold: true, color: darkColor });
    drawRect(305, customerY + 18, 245, 75, { fill: white, stroke: borderGray, strokeWidth: 1 });
    
    drawText('Payment ID:', 315, customerY + 32, { size: 9, bold: true, color: grayColor });
    drawText(invoiceData.paymentId, 315, customerY + 44, { size: 8, color: darkColor, maxWidth: 220 });
    
    drawText(`Method: ${invoiceData.paymentMethod}`, 315, customerY + 60, { 
      size: 10, 
      bold: true, 
      color: accentColor 
    });
    drawText(`Date: ${invoiceData.paymentDate}`, 315, customerY + 75, { size: 9, color: grayColor });
    
    // EVENT DETAILS SECTION
    const eventY = customerY + 110;
    
    drawText('Event Details', 50, eventY, { size: 13, bold: true, color: darkColor });
    drawRect(50, eventY + 18, 500, 100, { fill: lightGray, stroke: borderGray, strokeWidth: 1 });
    
    // Event info - left column
    drawText('Event:', 60, eventY + 33, { size: 9, bold: true, color: grayColor });
    drawText(invoiceData.eventTitle, 60, eventY + 46, { size: 11, bold: true, color: primaryColor, maxWidth: 220 });
    
    drawText('Date & Time:', 60, eventY + 65, { size: 9, bold: true, color: grayColor });
    drawText(`${invoiceData.eventDate}`, 60, eventY + 77, { size: 9, color: darkColor });
    drawText(`${invoiceData.eventTime}`, 60, eventY + 89, { size: 9, color: darkColor });
    
    // Event info - right column
    drawText('Booking Code:', 310, eventY + 33, { size: 9, bold: true, color: grayColor });
    drawText(invoiceData.bookingCode, 310, eventY + 46, { size: 13, bold: true, color: warningOrange });
    
    if (invoiceData.venue) {
      drawText('Venue:', 310, eventY + 65, { size: 9, bold: true, color: grayColor });
      drawText(invoiceData.venue, 310, eventY + 77, { size: 9, color: darkColor, maxWidth: 230 });
    }
    
    drawText(`Total Members: ${invoiceData.members.length}`, 310, eventY + 95, { 
      size: 9, 
      bold: true, 
      color: accentColor 
    });
    
    // PRIMARY CONTACT SECTION
    const primaryY = eventY + 135;
    
    drawText('Primary Contact Details:', 50, primaryY, { size: 12, bold: true, color: darkColor });
    drawRect(50, primaryY + 18, 500, 40, { fill: rgb(0.95, 1, 0.95), stroke: primaryColor, strokeWidth: 1 });
    
    const primaryMember = invoiceData.members[0];
    drawText(`Name: ${primaryMember.name}`, 60, primaryY + 30, { size: 9, bold: true, color: darkColor });
    drawText(`Email: ${primaryMember.email}`, 60, primaryY + 43, { size: 8, color: grayColor });
    drawText(`Phone: ${primaryMember.phone}`, 300, primaryY + 30, { size: 8, color: grayColor });
    
    const primaryCode = primaryMember.memberCode || generateFallbackMemberCode(invoiceData.bookingCode, 0);
    drawText(`Member Code: ${primaryCode}`, 300, primaryY + 43, { 
      size: 9, 
      bold: true, 
      color: primaryColor 
    });
    
    // MEMBERS TABLE SECTION
    const tableY = primaryY + 75;
    
    drawText('All Member Codes:', 50, tableY, { size: 12, bold: true, color: darkColor });
    
    // Table header
    drawRect(50, tableY + 18, 500, 22, { fill: darkColor });
    drawText('#', 60, tableY + 30, { size: 9, bold: true, color: white });
    drawText('Member Code', 95, tableY + 30, { size: 9, bold: true, color: white });
    drawText('Member Name', 240, tableY + 30, { size: 9, bold: true, color: white });
    
    // Table rows
    let memberRowY = tableY + 40;
    invoiceData.members.forEach((member, index) => {
      const rowColor = index % 2 === 0 ? white : rgb(0.98, 0.98, 0.98);
      drawRect(50, memberRowY, 500, 22, { fill: rowColor, stroke: borderGray, strokeWidth: 0.5 });
      
      drawText(`${index + 1}`, 60, memberRowY + 12, { size: 8, color: grayColor });
      
      const memberCode = member.memberCode || generateFallbackMemberCode(invoiceData.bookingCode, index);
      drawText(memberCode, 95, memberRowY + 12, { size: 8, bold: true, color: accentColor });
      
      drawText(member.name, 240, memberRowY + 12, { size: 8, color: darkColor, maxWidth: 300 });
      
      memberRowY += 22;
    });
    
    // BILLING SECTION
    const billingY = memberRowY + 25;
    
    drawText('Billing Summary', 50, billingY, { size: 13, bold: true, color: darkColor });
    
    // Billing header
    drawRect(50, billingY + 18, 500, 22, { fill: darkColor });
    drawText('Description', 60, billingY + 30, { size: 9, bold: true, color: white });
    drawText('Amount', 455, billingY + 30, { size: 9, bold: true, color: white, align: 'right', maxWidth: 85 });
    
    let billY = billingY + 40;
    
    // Event booking line
    drawRect(50, billY, 500, 28, { fill: white, stroke: borderGray, strokeWidth: 0.5 });
    drawText('FusionX Event Booking', 60, billY + 10, { size: 9, bold: true, color: darkColor });
    drawText(invoiceData.eventTitle, 60, billY + 21, { size: 8, color: grayColor, maxWidth: 350 });
    drawText(`Rs. ${invoiceData.subtotal.toLocaleString()}`, 455, billY + 15, { 
      size: 9, 
      color: darkColor, 
      align: 'right', 
      maxWidth: 85 
    });
    billY += 28;
    
    // Discount row if applicable
    if (invoiceData.discount && invoiceData.discount > 0) {
      drawRect(50, billY, 500, 22, { fill: rgb(0.95, 1, 0.95), stroke: successGreen, strokeWidth: 0.5 });
      const discountText = invoiceData.members.length === 5 
        ? 'Group Discount (5 Members - 10% Off)' 
        : 'Discount Applied';
      drawText(discountText, 60, billY + 12, { size: 9, bold: true, color: successGreen });
      drawText(`-Rs. ${invoiceData.discount.toLocaleString()}`, 455, billY + 12, { 
        size: 9, 
        bold: true, 
        color: successGreen, 
        align: 'right', 
        maxWidth: 85 
      });
      billY += 22;
    }
    
    // Total row
    drawRect(50, billY, 500, 32, { fill: darkColor });
    drawText('TOTAL AMOUNT', 60, billY + 17, { size: 12, bold: true, color: white });
    drawText(`Rs. ${invoiceData.totalAmount.toLocaleString()}`, 455, billY + 17, { 
      size: 12, 
      bold: true, 
      color: primaryColor, 
      align: 'right', 
      maxWidth: 85 
    });
    
    // FOOTER SECTION
    const footerY = billY + 50;
    
    // Notes section if available
    if (invoiceData.notes) {
      drawText('Additional Notes:', 50, footerY, { size: 11, bold: true, color: darkColor });
      drawRect(50, footerY + 15, 500, 35, { fill: rgb(0.99, 0.99, 1), stroke: borderGray, strokeWidth: 0.5 });
      drawText(invoiceData.notes, 60, footerY + 30, { size: 9, color: darkColor, maxWidth: 480 });
    }
    
    // Company footer
    const companyFooterY = invoiceData.notes ? footerY + 70 : footerY + 20;
    
    drawLine(50, companyFooterY, 545, companyFooterY, primaryColor, 1.5);
    
    drawText('Thank you for choosing FusionX Events!', 50, companyFooterY + 15, { 
      size: 11, 
      bold: true, 
      color: primaryColor 
    });
    
    drawText('Email: events@glitzfusion.in  |  Phone: +91-XXXXXXXXXX  |  Web: www.glitzfusion.in', 
      50, companyFooterY + 30, { size: 8, color: grayColor });
    
    drawText('This is a computer-generated invoice. No signature required.', 
      50, companyFooterY + 43, { size: 7, color: grayColor });
    
    drawText('Present individual member codes at event entrance for entry.', 
      50, companyFooterY + 56, { size: 8, bold: true, color: warningOrange });
    
    // PAID Watermark
    page.drawText('PAID', {
      x: 210,
      y: height / 2 - 20,
      size: 80,
      font: boldFont,
      color: rgb(0, 0.7, 0.3),
      opacity: 0.08
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