import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';

// This should match the otpStore from send-otp route
// In production, use Redis or database for shared storage
declare global {
  var otpStore: Map<string, { otp: string; expiresAt: number; attempts: number }> | undefined;
}

// Use global variable to persist across hot reloads in development
const otpStore = globalThis.otpStore || new Map<string, { otp: string; expiresAt: number; attempts: number }>();
if (process.env.NODE_ENV === 'development') {
  globalThis.otpStore = otpStore;
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
    const { email, otp } = body;

    if (!email || !otp) {
      return withCors(NextResponse.json(
        { error: 'Email and OTP are required' },
        { status: 400 }
      ), request);
    }

    const normalizedEmail = email.toLowerCase().trim();
    const normalizedOTP = otp.toString().trim();

    // Get stored OTP data
    const storedData = otpStore.get(normalizedEmail);

    if (!storedData) {
      return withCors(NextResponse.json(
        { error: 'No OTP found for this email. Please request a new one.' },
        { status: 404 }
      ), request);
    }

    // Check if OTP has expired
    if (storedData.expiresAt < Date.now()) {
      otpStore.delete(normalizedEmail);
      return withCors(NextResponse.json(
        { error: 'OTP has expired. Please request a new one.' },
        { status: 410 }
      ), request);
    }

    // Check attempt limit (max 3 attempts)
    if (storedData.attempts >= 3) {
      otpStore.delete(normalizedEmail);
      return withCors(NextResponse.json(
        { error: 'Too many failed attempts. Please request a new OTP.' },
        { status: 429 }
      ), request);
    }

    // Verify OTP
    if (storedData.otp !== normalizedOTP) {
      // Increment attempts
      storedData.attempts += 1;
      otpStore.set(normalizedEmail, storedData);

      const attemptsLeft = 3 - storedData.attempts;
      return withCors(NextResponse.json(
        { error: `Invalid OTP. ${attemptsLeft} attempts remaining.` },
        { status: 400 }
      ), request);
    }

    // OTP is valid - remove from store
    otpStore.delete(normalizedEmail);

    return withCors(NextResponse.json({
      success: true,
      message: 'Email verified successfully',
      email: normalizedEmail
    }), request);

  } catch (error) {
    console.error('Verify OTP error:', error);
    return withCors(NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    ), request);
  }
}
