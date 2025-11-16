// Simple test script to verify invoice generation works
const { generateInvoicePDF, generateInvoiceNumber, formatInvoiceDate } = require('./src/lib/invoiceGenerator.ts');

async function testInvoiceGeneration() {
  try {
    console.log('Testing invoice generation...');
    
    const sampleInvoiceData = {
      invoiceNumber: generateInvoiceNumber('FX001', 'pay_test123456'),
      invoiceDate: formatInvoiceDate(new Date()),
      paymentId: 'pay_test123456',
      paymentMethod: 'UPI',
      paymentDate: formatInvoiceDate(new Date()),
      bookingCode: 'FX001',
      eventTitle: 'Test FusionX Event',
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
        }
      ],
      notes: 'Thank you for booking with FusionX Events!'
    };

    const pdfBuffer = await generateInvoicePDF(sampleInvoiceData);
    console.log('✅ Invoice PDF generated successfully!');
    console.log(`PDF size: ${pdfBuffer.length} bytes`);
    
    // Optionally save to file for manual inspection
    const fs = require('fs');
    fs.writeFileSync('./test-invoice.pdf', pdfBuffer);
    console.log('✅ Test invoice saved as test-invoice.pdf');
    
  } catch (error) {
    console.error('❌ Error generating invoice:', error);
    process.exit(1);
  }
}

testInvoiceGeneration();
