import { NextRequest, NextResponse } from 'next/server'
import { getSignedDownloadUrl } from '@/lib/cloudflare-r2'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  try {
    const { key } = await params
    
    if (!key) {
      return NextResponse.json(
        { error: 'Media key is required' },
        { status: 400 }
      )
    }

    // Get the signed URL from R2
    const signedUrl = await getSignedDownloadUrl(key)
    
    // Fetch the media from R2
    const response = await fetch(signedUrl)
    
    if (!response.ok) {
      return NextResponse.json(
        { error: 'Media not found' },
        { status: 404 }
      )
    }

    // Get the content type from R2 response
    const contentType = response.headers.get('content-type') || 'application/octet-stream'
    const contentLength = response.headers.get('content-length')
    
    // Create response with proper CORS headers
    const mediaResponse = new NextResponse(response.body, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
        'Access-Control-Allow-Headers': 'Range, Content-Type',
        'Accept-Ranges': 'bytes',
        'Cache-Control': 'public, max-age=31536000, immutable',
        ...(contentLength && { 'Content-Length': contentLength })
      }
    })

    return mediaResponse
  } catch (error) {
    console.error('Media proxy error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch media' },
      { status: 500 }
    )
  }
}

// Handle preflight requests
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
      'Access-Control-Allow-Headers': 'Range, Content-Type',
    }
  })
}
