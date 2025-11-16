import Razorpay from 'razorpay';

// Lazy initialization of Razorpay instance
let razorpay: Razorpay | null = null;

function getRazorpayInstance(): Razorpay {
  if (!razorpay) {
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      throw new Error('Razorpay credentials not configured');
    }
    
    razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }
  return razorpay;
}

export interface PaymentOrderData {
  amount: number; // in paise (multiply by 100)
  currency: string;
  receipt: string;
  notes?: Record<string, string>;
}

export interface PaymentVerificationData {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

// Create payment order
export async function createPaymentOrder(orderData: PaymentOrderData) {
  try {
    const razorpayInstance = getRazorpayInstance();
    const order = await razorpayInstance.orders.create({
      amount: orderData.amount,
      currency: orderData.currency,
      receipt: orderData.receipt,
      notes: orderData.notes,
    });
    
    return {
      success: true,
      order,
    };
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create payment order',
    };
  }
}

// Verify payment signature
export function verifyPaymentSignature(data: PaymentVerificationData): boolean {
  try {
    const crypto = require('crypto');
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(`${data.razorpay_order_id}|${data.razorpay_payment_id}`)
      .digest('hex');
    
    return expectedSignature === data.razorpay_signature;
  } catch (error) {
    console.error('Error verifying payment signature:', error);
    return false;
  }
}

// Fetch payment details
export async function getPaymentDetails(paymentId: string) {
  try {
    const razorpayInstance = getRazorpayInstance();
    const payment = await razorpayInstance.payments.fetch(paymentId);
    return {
      success: true,
      payment,
    };
  } catch (error) {
    console.error('Error fetching payment details:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch payment details',
    };
  }
}

export default getRazorpayInstance;
