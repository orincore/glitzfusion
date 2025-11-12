import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Content from '@/models/Content'
import { requireAuth } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    await dbConnect()
    
    const { searchParams } = new URL(request.url)
    const section = searchParams.get('section')
    
    const query: any = { isActive: true }
    if (section) {
      query.section = section
    }

    const content = await Content.find(query).sort({ section: 1, key: 1 })
    return NextResponse.json(content)
  } catch (error) {
    console.error('Get content error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export const POST = requireAuth(async (request: NextRequest) => {
  try {
    await dbConnect()
    
    const contentData = await request.json()
    
    // Check if content with same key exists
    const existingContent = await Content.findOne({ key: contentData.key })
    if (existingContent) {
      return NextResponse.json(
        { error: 'Content with this key already exists' },
        { status: 400 }
      )
    }

    const content = new Content(contentData)
    await content.save()

    return NextResponse.json(content, { status: 201 })
  } catch (error) {
    console.error('Create content error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
})
