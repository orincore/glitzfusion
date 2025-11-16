import { NextRequest, NextResponse } from 'next/server';
import { generateInvoicePDF, generateInvoiceNumber, formatInvoiceDate, InvoiceData } from '@/lib/invoiceGenerator';

export async function GET(request: NextRequest) {
  try {
    // Sample invoice data for testing
    const sampleInvoiceData: InvoiceData = {
      invoiceNumber: generateInvoiceNumber('FX001', 'pay_test123456'),
      invoiceDate: formatInvoiceDate(new Date()),
      paymentId: 'pay_test123456',
      paymentMethod: 'UPI',
      paymentDate: formatInvoiceDate(new Date()),
      bookingCode: 'FX001',
      eventTitle: 'Sample FusionX Event',
      eventDate: '2024-01-15',
      eventTime: '7:00 PM - 11:00 PM',
      venue: 'GlitzFusion Studios, Mumbai',
      customerName: 'John Doe',
      customerEmail: 'john@example.com',
      customerPhone: '+91-9876543210',
      subtotal: 2500,
      totalAmount: 2500,
      members: [
        {
          name: 'John Doe',
          email: 'john@example.com',
          phone: '+91-9876543210'
        },
        {
          name: 'Jane Smith',
          email: 'jane@example.com',
          phone: '+91-9876543211'
        }
      ],
      notes: 'Thank you for booking with FusionX Events! Present your booking code FX001 at the event entrance.'
    };

    // Generate PDF
    const pdfBuffer = await generateInvoicePDF(sampleInvoiceData);

    // Return PDF as response
    return new NextResponse(pdfBuffer as any, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="FusionX-Invoice-${sampleInvoiceData.invoiceNumber}.pdf"`,
        'Content-Length': pdfBuffer.length.toString(),
      },
    });

  } catch (error) {
    console.error('Error generating test invoice:', error);
    return NextResponse.json(
      { error: 'Failed to generate invoice', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
