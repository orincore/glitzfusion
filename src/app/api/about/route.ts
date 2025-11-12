import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Content from '@/models/Content'

export async function GET() {
  try {
    await dbConnect()
    
    const aboutContent = await Content.find({ 
      section: 'about',
      isActive: true 
    }).sort({ key: 1 })
    
    // Transform the data into a more usable format
    const contentMap = aboutContent.reduce((acc, item) => {
      acc[item.key] = item.value
      return acc
    }, {} as Record<string, any>)
    
    return NextResponse.json(contentMap)
  } catch (error) {
    console.error('Error fetching about content:', error)
    return NextResponse.json(
      { error: 'Failed to fetch about content' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect()
    
    const body = await request.json()
    const { key, type, value, description } = body
    
    if (!key || !type || value === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: key, type, value' },
        { status: 400 }
      )
    }
    
    // Check if content already exists
    const existingContent = await Content.findOne({ key, section: 'about' })
    
    if (existingContent) {
      // Update existing content
      existingContent.type = type
      existingContent.value = value
      existingContent.description = description
      existingContent.updatedAt = new Date()
      
      await existingContent.save()
      return NextResponse.json(existingContent)
    } else {
      // Create new content
      const newContent = new Content({
        key,
        type,
        value,
        section: 'about',
        description,
        isActive: true
      })
      
      await newContent.save()
      return NextResponse.json(newContent, { status: 201 })
    }
  } catch (error) {
    console.error('Error saving about content:', error)
    return NextResponse.json(
      { error: 'Failed to save about content' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    await dbConnect()
    
    const body = await request.json()
    const { updates } = body
    
    if (!updates || !Array.isArray(updates)) {
      return NextResponse.json(
        { error: 'Updates array is required' },
        { status: 400 }
      )
    }
    
    const results = []
    
    for (const update of updates) {
      const { key, type, value, description } = update
      
      if (!key || !type || value === undefined) {
        continue
      }
      
      const existingContent = await Content.findOne({ key, section: 'about' })
      
      if (existingContent) {
        existingContent.type = type
        existingContent.value = value
        existingContent.description = description
        existingContent.updatedAt = new Date()
        
        await existingContent.save()
        results.push(existingContent)
      } else {
        const newContent = new Content({
          key,
          type,
          value,
          section: 'about',
          description,
          isActive: true
        })
        
        await newContent.save()
        results.push(newContent)
      }
    }
    
    return NextResponse.json({ 
      message: `Updated ${results.length} content items`,
      results 
    })
  } catch (error) {
    console.error('Error bulk updating about content:', error)
    return NextResponse.json(
      { error: 'Failed to update about content' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await dbConnect()
    
    const { searchParams } = new URL(request.url)
    const key = searchParams.get('key')
    
    if (!key) {
      return NextResponse.json(
        { error: 'Key parameter is required' },
        { status: 400 }
      )
    }
    
    const deletedContent = await Content.findOneAndDelete({ 
      key, 
      section: 'about' 
    })
    
    if (!deletedContent) {
      return NextResponse.json(
        { error: 'Content not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({ 
      message: 'Content deleted successfully',
      deletedContent 
    })
  } catch (error) {
    console.error('Error deleting about content:', error)
    return NextResponse.json(
      { error: 'Failed to delete about content' },
      { status: 500 }
    )
  }
}
