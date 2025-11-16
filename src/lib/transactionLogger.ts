import TransactionLog, { ITransactionLog } from '@/models/TransactionLog';
import { NextRequest } from 'next/server';

export interface LogTransactionParams {
  bookingId: string;
  transactionType: 'payment_order_created' | 'payment_attempted' | 'payment_success' | 'payment_failed' | 'payment_refunded';
  status: 'pending' | 'success' | 'failed' | 'cancelled' | 'refunded';
  amount: number;
  currency?: string;
  
  // Event and booking details
  eventId: string;
  eventTitle: string;
  bookingCode: string;
  customerEmail: string;
  customerPhone: string;
  
  // Optional Razorpay details
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  paymentMethod?: string;
  
  // Error details
  errorCode?: string;
  errorMessage?: string;
  failureReason?: string;
  
  // Raw response data
  razorpayResponse?: any;
  
  // Request details
  request?: NextRequest;
  
  // Additional metadata
  metadata?: any;
}

export class TransactionLogger {
  /**
   * Log a transaction with comprehensive details
   */
  static async logTransaction(params: LogTransactionParams): Promise<ITransactionLog> {
    try {
      // Extract request details if available
      let userAgent: string | undefined;
      let ipAddress: string | undefined;
      
      if (params.request) {
        userAgent = params.request.headers.get('user-agent') || undefined;
        ipAddress = this.getClientIP(params.request);
      }
      
      // Generate a unique transactionId if not provided
      const transactionId = `TXN_${Date.now()}_${Math.random().toString(36).slice(2, 11).toUpperCase()}`;

      // All callers currently pass amount in paise; store in rupees for readability/consistency
      const amountInRupees = params.amount / 100;
      
      const transactionLog = new TransactionLog({
        transactionId,
        bookingId: params.bookingId,
        transactionType: params.transactionType,
        status: params.status,
        amount: amountInRupees,
        currency: params.currency || 'INR',
        
        // Event and booking details
        eventId: params.eventId,
        eventTitle: params.eventTitle,
        bookingCode: params.bookingCode,
        customerEmail: params.customerEmail,
        customerPhone: params.customerPhone,
        
        // Razorpay details
        razorpayOrderId: params.razorpayOrderId,
        razorpayPaymentId: params.razorpayPaymentId,
        razorpaySignature: params.razorpaySignature,
        paymentMethod: params.paymentMethod,
        
        // Error details
        errorCode: params.errorCode,
        errorMessage: params.errorMessage,
        failureReason: params.failureReason,
        
        // Raw response
        razorpayResponse: params.razorpayResponse,
        
        // Request tracking
        userAgent,
        ipAddress,
        timestamp: new Date(),
        
        // Additional metadata
        metadata: params.metadata || {}
      });
      
      const savedLog = await transactionLog.save();
      
      // Log to console for immediate visibility (amount already in rupees)
      console.log(`[TRANSACTION LOG] ${params.transactionType.toUpperCase()}:`, {
        transactionId: savedLog.transactionId,
        bookingCode: params.bookingCode,
        status: params.status,
        amount: amountInRupees,
        razorpayOrderId: params.razorpayOrderId,
        razorpayPaymentId: params.razorpayPaymentId,
        timestamp: savedLog.timestamp
      });
      
      return savedLog;
    } catch (error) {
      console.error('Error logging transaction:', error);
      // Don't throw error to avoid breaking the main flow
      throw error;
    }
  }
  
  /**
   * Log payment order creation
   */
  static async logPaymentOrderCreated(params: {
    bookingId: string;
    eventId: string;
    eventTitle: string;
    bookingCode: string;
    customerEmail: string;
    customerPhone: string;
    amount: number;
    razorpayOrderId: string;
    request?: NextRequest;
    metadata?: any;
  }): Promise<ITransactionLog> {
    return this.logTransaction({
      ...params,
      transactionType: 'payment_order_created',
      status: 'pending'
    });
  }
  
  /**
   * Log payment attempt
   */
  static async logPaymentAttempted(params: {
    bookingId: string;
    eventId: string;
    eventTitle: string;
    bookingCode: string;
    customerEmail: string;
    customerPhone: string;
    amount: number;
    razorpayOrderId: string;
    razorpayPaymentId: string;
    request?: NextRequest;
    metadata?: any;
  }): Promise<ITransactionLog> {
    return this.logTransaction({
      ...params,
      transactionType: 'payment_attempted',
      status: 'pending'
    });
  }
  
  /**
   * Log successful payment
   */
  static async logPaymentSuccess(params: {
    bookingId: string;
    eventId: string;
    eventTitle: string;
    bookingCode: string;
    customerEmail: string;
    customerPhone: string;
    amount: number;
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
    paymentMethod?: string;
    razorpayResponse?: any;
    request?: NextRequest;
    metadata?: any;
  }): Promise<ITransactionLog> {
    return this.logTransaction({
      ...params,
      transactionType: 'payment_success',
      status: 'success'
    });
  }
  
  /**
   * Log failed payment
   */
  static async logPaymentFailed(params: {
    bookingId: string;
    eventId: string;
    eventTitle: string;
    bookingCode: string;
    customerEmail: string;
    customerPhone: string;
    amount: number;
    razorpayOrderId?: string;
    razorpayPaymentId?: string;
    errorCode?: string;
    errorMessage?: string;
    failureReason: string;
    razorpayResponse?: any;
    request?: NextRequest;
    metadata?: any;
  }): Promise<ITransactionLog> {
    return this.logTransaction({
      ...params,
      transactionType: 'payment_failed',
      status: 'failed'
    });
  }
  
  /**
   * Get client IP address from request
   */
  private static getClientIP(request: NextRequest): string {
    const forwarded = request.headers.get('x-forwarded-for');
    const realIP = request.headers.get('x-real-ip');
    const clientIP = request.headers.get('x-client-ip');
    
    if (forwarded) {
      return forwarded.split(',')[0].trim();
    }
    
    if (realIP) {
      return realIP;
    }
    
    if (clientIP) {
      return clientIP;
    }
    
    // Fallback to connection remote address
    return 'unknown';
  }
  
  /**
   * Get transaction logs for a booking
   */
  static async getTransactionLogs(bookingId: string): Promise<ITransactionLog[]> {
    try {
      return await TransactionLog.find({ bookingId })
        .sort({ timestamp: -1 })
        .exec();
    } catch (error) {
      console.error('Error fetching transaction logs:', error);
      return [];
    }
  }
  
  /**
   * Get transaction statistics
   */
  static async getTransactionStats(dateFrom?: Date, dateTo?: Date) {
    try {
      const matchCondition: any = {};
      
      if (dateFrom || dateTo) {
        matchCondition.timestamp = {};
        if (dateFrom) matchCondition.timestamp.$gte = dateFrom;
        if (dateTo) matchCondition.timestamp.$lte = dateTo;
      }
      
      const stats = await TransactionLog.aggregate([
        { $match: matchCondition },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            totalAmount: { $sum: '$amount' }
          }
        }
      ]);
      
      return stats;
    } catch (error) {
      console.error('Error fetching transaction stats:', error);
      return [];
    }
  }
}

export default TransactionLogger;
