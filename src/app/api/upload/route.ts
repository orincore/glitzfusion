import { NextRequest, NextResponse } from 'next/server';

// This endpoint is deprecated in favor of direct R2 uploads via signed URLs
// Use /api/upload/sign for new implementations to avoid 413 errors
// This endpoint is kept for backward compatibility only

export async function POST(request: NextRequest) {
  return NextResponse.json(
    { 
      error: 'This endpoint is deprecated. Use /api/upload/sign for direct R2 uploads to avoid file size limitations.',
      migration: {
        newEndpoint: '/api/upload/sign',
        method: 'POST',
        body: {
          fileName: 'string',
          fileType: 'string', 
          uploadType: 'poster|gallery|video|hero|highlights|ticket-template',
          eventId: 'string (optional)'
        },
        response: {
          uploadUrl: 'string - Use this URL to PUT the file directly to R2',
          publicUrl: 'string - The final public URL of the uploaded file',
          key: 'string - The R2 key for the file'
        }
      }
    },
    { status: 410 } // Gone - indicates the endpoint is deprecated
  );
}

// Handle preflight requests
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
