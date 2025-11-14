import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Media from '@/models/Media'
import { deleteFromR2 } from '@/lib/cloudflare-r2'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect()
    const { id } = await params
    
    const media = await Media.findById(id)
    
    if (!media) {
      return NextResponse.json(
        { error: 'Media not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(media)
  } catch (error) {
    console.error('Get media error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // TODO: Add proper authentication here
    await dbConnect()
    const { id } = await params
    
    const media = await Media.findById(id)
    
    if (!media) {
      return NextResponse.json(
        { error: 'Media not found' },
        { status: 404 }
      )
    }

    // Delete from R2 storage
    if (media.cloudflareKey) {
      try {
        await deleteFromR2(media.cloudflareKey)
      } catch (r2Error) {
        console.error('Failed to delete from R2:', r2Error)
        // Continue with database deletion even if R2 deletion fails
      }
    }

    // Delete from database
    await Media.findByIdAndDelete(id)

    return NextResponse.json({ message: 'Media deleted successfully' })
  } catch (error) {
    console.error('Delete media error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
