import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Gallery from '@/models/Gallery'
import { deleteFromR2 } from '@/lib/cloudflare-r2'
import { processGalleryItemUrls } from '@/lib/media-proxy'

// GET - Fetch single gallery item
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect()
    
    const item = await Gallery.findById(params.id)
    
    if (!item) {
      return NextResponse.json(
        { error: 'Gallery item not found' },
        { status: 404 }
      )
    }
    
    // Process item to use proxy URLs for CORS compatibility
    const baseUrl = request.headers.get('host') 
      ? `${request.headers.get('x-forwarded-proto') || 'http'}://${request.headers.get('host')}`
      : undefined
    
    const processedItem = processGalleryItemUrls(item.toObject(), baseUrl)
    
    return NextResponse.json(processedItem)
  } catch (error) {
    console.error('Gallery item fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch gallery item' },
      { status: 500 }
    )
  }
}

// PUT - Update gallery item
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect()
    
    const body = await request.json()
    const { title, description, category, alt, tags, featured, sortOrder } = body
    
    const item = await Gallery.findById(params.id)
    
    if (!item) {
      return NextResponse.json(
        { error: 'Gallery item not found' },
        { status: 404 }
      )
    }
    
    // Update fields
    if (title !== undefined) item.title = title
    if (description !== undefined) item.description = description
    if (category !== undefined) item.category = category
    if (alt !== undefined) item.alt = alt
    if (tags !== undefined) item.tags = Array.isArray(tags) ? tags : tags.split(',').map((tag: string) => tag.trim())
    if (featured !== undefined) item.featured = featured
    if (sortOrder !== undefined) item.sortOrder = sortOrder
    
    await item.save()
    
    return NextResponse.json(item)
  } catch (error) {
    console.error('Gallery item update error:', error)
    return NextResponse.json(
      { error: 'Failed to update gallery item' },
      { status: 500 }
    )
  }
}

// DELETE - Delete gallery item
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect()
    
    const item = await Gallery.findById(params.id)
    
    if (!item) {
      return NextResponse.json(
        { error: 'Gallery item not found' },
        { status: 404 }
      )
    }
    
    // Delete from R2 storage
    try {
      await deleteFromR2(item.cloudflareKey)
      
      // Also delete thumbnail if it exists
      if (item.thumbnailUrl) {
        const thumbnailKey = item.cloudflareKey.replace(/^/, 'thumb_')
        await deleteFromR2(thumbnailKey)
      }
    } catch (r2Error) {
      console.warn('Failed to delete from R2:', r2Error)
      // Continue with database deletion even if R2 deletion fails
    }
    
    // Delete from database
    await Gallery.findByIdAndDelete(params.id)
    
    return NextResponse.json({ message: 'Gallery item deleted successfully' })
  } catch (error) {
    console.error('Gallery item delete error:', error)
    return NextResponse.json(
      { error: 'Failed to delete gallery item' },
      { status: 500 }
    )
  }
}
