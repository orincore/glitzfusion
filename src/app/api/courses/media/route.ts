import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Media from '@/models/Media'
import { uploadToR2, generateUniqueKey } from '@/lib/cloudflare-r2'
import { requireAuth } from '@/lib/auth'
import sharp from 'sharp'

export const POST = requireAuth(async (request: NextRequest) => {
  try {
    await dbConnect()
    
    const formData = await request.formData()
    const file = formData.get('file') as File
    const alt = formData.get('alt') as string
    const description = formData.get('description') as string
    const tags = formData.get('tags') as string

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
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
    let buffer: Uint8Array | Buffer = new Uint8Array(bytes)

    // Optimize images only
    if (file.type.startsWith('image/')) {
      try {
        buffer = await sharp(buffer)
          .resize(1920, 1080, { fit: 'inside', withoutEnlargement: true })
          .jpeg({ quality: 90 })
          .toBuffer()
      } catch (sharpError) {
        console.warn('Image optimization failed, using original:', sharpError)
      }
    }

    // Generate unique key and upload to R2
    const key = generateUniqueKey(file.name)
    const uploadBuffer = Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer)
    const url = await uploadToR2(key, uploadBuffer, file.type)

    // Save media record to database
    const media = new Media({
      filename: key,
      originalName: file.name,
      mimeType: file.type,
      size: uploadBuffer.length,
      url,
      cloudflareKey: key,
      alt: alt || '',
      description: description || '',
      tags: tags ? tags.split(',').map(tag => tag.trim()) : ['course', 'hero']
    })

    await media.save()

    // Return media data in the format expected by the frontend
    const responseData = {
      _id: media._id.toString(),
      mediaId: media._id.toString(),
      url: media.url,
      type: media.mimeType.startsWith('video/') ? 'video' : 'image',
      mediaType: media.mimeType.startsWith('video/') ? 'video' : 'image',
      alt: media.alt,
      filename: media.filename,
      originalName: media.originalName,
      mimeType: media.mimeType,
      size: media.size
    }

    return NextResponse.json(responseData, { status: 201 })
  } catch (error) {
    console.error('Course media upload error:', error)
    return NextResponse.json(
      { error: 'Failed to upload media. Please try again.' },
      { status: 500 }
    )
  }
})
