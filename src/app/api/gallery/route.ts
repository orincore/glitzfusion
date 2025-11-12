import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Gallery from '@/models/Gallery'
import { uploadToR2, generateUniqueKey, deleteFromR2 } from '@/lib/cloudflare-r2'
import sharp from 'sharp'

// GET - Fetch all gallery items with filtering
export async function GET(request: NextRequest) {
  try {
    await dbConnect()
    
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const featured = searchParams.get('featured')
    const limit = parseInt(searchParams.get('limit') || '50')
    const page = parseInt(searchParams.get('page') || '1')
    
    let query: any = { isActive: true }
    
    if (category && category !== 'all') {
      query.category = category
    }
    
    if (featured === 'true') {
      query.featured = true
    }
    
    const skip = (page - 1) * limit
    
    const items = await Gallery.find(query)
      .sort({ featured: -1, sortOrder: 1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
    
    const total = await Gallery.countDocuments(query)
    
    return NextResponse.json({
      items,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Gallery fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch gallery items' },
      { status: 500 }
    )
  }
}

// POST - Upload new gallery item
export async function POST(request: NextRequest) {
  try {
    await dbConnect()
    
    const formData = await request.formData()
    const file = formData.get('file') as File
    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const category = formData.get('category') as string
    const alt = formData.get('alt') as string
    const tags = formData.get('tags') as string
    const featured = formData.get('featured') === 'true'

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    if (!title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      )
    }

    // Validate file type
    if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
      return NextResponse.json(
        { error: 'Only image and video files are allowed' },
        { status: 400 }
      )
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    let buffer: Buffer = Buffer.from(new Uint8Array(bytes))
    let thumbnailBuffer: Buffer | null = null

    // Process images
    if (file.type.startsWith('image/')) {
      // Optimize main image
      const processedBuffer = await sharp(buffer)
        .resize(2048, 2048, { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 90 })
        .toBuffer()
      buffer = processedBuffer
      
      // Create thumbnail
      thumbnailBuffer = await sharp(buffer)
        .resize(400, 400, { fit: 'cover' })
        .jpeg({ quality: 80 })
        .toBuffer()
    } else if (file.type.startsWith('video/')) {
      // For videos, we'll generate a placeholder thumbnail
      // In a production app, you might want to use ffmpeg to extract a frame
      thumbnailBuffer = await sharp({
        create: {
          width: 400,
          height: 400,
          channels: 3,
          background: { r: 20, g: 15, b: 40 }
        }
      })
      .png()
      .toBuffer()
    }

    // Upload main file
    const mainKey = generateUniqueKey(file.name)
    const uploadBuffer = Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer)
    const mediaUrl = await uploadToR2(mainKey, uploadBuffer, file.type)

    // Upload thumbnail if exists
    let thumbnailUrl = ''
    if (thumbnailBuffer) {
      const thumbnailKey = generateUniqueKey(`thumb_${file.name}`)
      thumbnailUrl = await uploadToR2(thumbnailKey, thumbnailBuffer, 'image/jpeg')
    }

    // Get the highest sort order for the category
    const lastItem = await Gallery.findOne({ category }).sort({ sortOrder: -1 })
    const sortOrder = lastItem ? lastItem.sortOrder + 1 : 1

    // Create gallery item
    const galleryItem = new Gallery({
      title,
      description: description || '',
      category: category || 'photo',
      mediaUrl,
      thumbnailUrl,
      cloudflareKey: mainKey,
      mimeType: file.type,
      size: uploadBuffer.length,
      originalName: file.name,
      alt: alt || title,
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      featured,
      sortOrder
    })

    await galleryItem.save()

    return NextResponse.json(galleryItem, { status: 201 })
  } catch (error) {
    console.error('Gallery upload error:', error)
    return NextResponse.json(
      { error: 'Failed to upload gallery item' },
      { status: 500 }
    )
  }
}
