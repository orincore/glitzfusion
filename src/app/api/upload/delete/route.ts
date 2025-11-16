import { NextRequest, NextResponse } from 'next/server'
import { deleteFromR2, extractR2KeyFromUrl } from '@/lib/r2'
import { getTokenFromRequest, verifyToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const token = getTokenFromRequest(request)
    if (!token) {
      return NextResponse.json(
        { error: 'No token provided' },
        { status: 401 }
      )
    }

    const user = verifyToken(token)
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { url, key } = body as { url?: string; key?: string }

    if (!url && !key) {
      return NextResponse.json(
        { error: 'Missing url or key' },
        { status: 400 }
      )
    }

    const r2Key = key || (url ? extractR2KeyFromUrl(url) : null)

    if (!r2Key) {
      return NextResponse.json(
        { error: 'Invalid R2 URL/key' },
        { status: 400 }
      )
    }

    await deleteFromR2(r2Key)

    return NextResponse.json({ success: true, key: r2Key })
  } catch (error) {
    console.error('Upload delete error:', error)
    return NextResponse.json(
      { error: 'Failed to delete file' },
      { status: 500 }
    )
  }
}
