import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Media from '@/models/Media'
import { uploadToR2, generateUniqueKey } from '@/lib/cloudflare-r2'
import sharp from 'sharp'

export async function GET() {
  return NextResponse.json({ status: 'Upload API is working' });
}

export async function POST(request: NextRequest) {
  console.log('Upload route called');
  // TODO: Add proper authentication here
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

    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    let buffer: Uint8Array | Buffer = new Uint8Array(bytes)

    // Optimize images
    if (file.type.startsWith('image/')) {
      buffer = await sharp(buffer)
        .resize(2000, 2000, { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 85 })
        .toBuffer()
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
      tags: tags ? tags.split(',').map(tag => tag.trim()) : []
    })

    await media.save()

    return NextResponse.json(media, { status: 201 })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
