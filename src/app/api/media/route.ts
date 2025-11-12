import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Media from '@/models/Media'
import { requireAuth } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    await dbConnect()
    
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search') || ''
    const type = searchParams.get('type') || ''

    const query: any = { isActive: true }
    
    if (search) {
      query.$or = [
        { originalName: { $regex: search, $options: 'i' } },
        { alt: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ]
    }

    if (type) {
      query.mimeType = { $regex: `^${type}/`, $options: 'i' }
    }

    const skip = (page - 1) * limit
    
    const [media, total] = await Promise.all([
      Media.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Media.countDocuments(query)
    ])

    return NextResponse.json({
      media,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Get media error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
