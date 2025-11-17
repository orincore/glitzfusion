import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { sendOTPEmail } from '@/lib/emailService';

// In-memory OTP storage (in production, use Redis or database)
// Use global variable to persist across hot reloads in development
declare global {
  var otpStore: Map<string, { otp: string; expiresAt: number; attempts: number }> | undefined;
}

const otpStore = globalThis.otpStore || new Map<string, { otp: string; expiresAt: number; attempts: number }>();
if (process.env.NODE_ENV === 'development') {
  globalThis.otpStore = otpStore;
}

// Clean expired OTPs every 5 minutes (only set up once)
if (!globalThis.otpStore) {
  setInterval(() => {
    const now = Date.now();
    for (const [email, data] of otpStore.entries()) {
      if (data.expiresAt < now) {
        otpStore.delete(email);
      }
    }
  }, 5 * 60 * 1000);
}

function withCors(response: NextResponse, request?: NextRequest) {
  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [
    'http://localhost:3000',
    'http://localhost:3001',
    'https://www.glitzfusion.in',
    'https://glitzfusion.in',
    'https://fusionx.glitzfusion.in'
  ];
  
  const requestOrigin = request?.headers.get('origin');
  let allowedOrigin = '*';
  
  if (process.env.NODE_ENV === 'production') {
    if (requestOrigin && allowedOrigins.includes(requestOrigin)) {
      allowedOrigin = requestOrigin;
    } else {
      allowedOrigin = 'https://fusionx.glitzfusion.in';
    }
  } else {
    allowedOrigin = '*';
  }
    
  response.headers.set('Access-Control-Allow-Origin', allowedOrigin);
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  response.headers.set('Access-Control-Allow-Credentials', 'true');
  response.headers.set('Access-Control-Max-Age', '86400');
  return response;
}

export async function OPTIONS(request: NextRequest) {
  return withCors(new NextResponse(null, { status: 204 }), request);
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const { email } = body;

    if (!email || !email.trim()) {
      return withCors(NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      ), request);
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return withCors(NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      ), request);
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if OTP was recently sent (rate limiting)
    const existingOTP = otpStore.get(normalizedEmail);
    if (existingOTP && existingOTP.expiresAt > Date.now()) {
      const timeLeft = Math.ceil((existingOTP.expiresAt - Date.now()) / 1000);
      if (timeLeft > 240) { // If more than 4 minutes left, don't send new OTP
        return withCors(NextResponse.json(
          { error: `Please wait ${timeLeft} seconds before requesting a new OTP` },
          { status: 429 }
        ), request);
      }
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + (5 * 60 * 1000); // 5 minutes

    // Store OTP
    otpStore.set(normalizedEmail, {
      otp,
      expiresAt,
      attempts: 0
    });

    // Send OTP email
    try {
      await sendOTPEmail(normalizedEmail, otp);
    } catch (emailError) {
      console.error('Failed to send OTP email:', emailError);
      return withCors(NextResponse.json(
        { error: 'Failed to send OTP email. Please try again.' },
        { status: 500 }
      ), request);
    }

    return withCors(NextResponse.json({
      success: true,
      message: 'OTP sent successfully',
      expiresIn: 300 // 5 minutes in seconds
    }), request);

  } catch (error) {
    console.error('Send OTP error:', error);
    return withCors(NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    ), request);
  }
}
