import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Content from '@/models/Content'
import { uploadToR2, generateUniqueKey, deleteFromR2 } from '@/lib/cloudflare-r2'
import { getPublicMediaUrl } from '@/lib/media-proxy'
import sharp from 'sharp'

// GET - Fetch all founders
export async function GET() {
  try {
    await dbConnect()
    
    const foundersContent = await Content.findOne({ 
      key: 'founders',
      section: 'about',
      isActive: true 
    })
    
    const founders = foundersContent?.value || []
    
    // Process image URLs to use public R2 URLs
    const processedFounders = founders.map((founder: any) => ({
      ...founder,
      image: founder.cloudflareKey ? getPublicMediaUrl(founder.cloudflareKey) : founder.image
    }))
    
    return NextResponse.json(processedFounders)
  } catch (error) {
    console.error('Error fetching founders:', error)
    return NextResponse.json(
      { error: 'Failed to fetch founders' },
      { status: 500 }
    )
  }
}

// POST - Add or update founder
export async function POST(request: NextRequest) {
  try {
    await dbConnect()
    
    const formData = await request.formData()
    const founderData = JSON.parse(formData.get('founderData') as string)
    const imageFile = formData.get('image') as File | null
    
    let cloudflareKey = founderData.cloudflareKey
    
    // Handle image upload if provided
    if (imageFile) {
      const bytes = await imageFile.arrayBuffer()
      const buffer = Buffer.from(new Uint8Array(bytes))
      
      // Optimize image
      const optimizedBuffer = await sharp(buffer)
        .resize(1000, 1000, { 
          fit: 'cover',
          position: 'center'
        })
        .jpeg({ quality: 95 })
        .toBuffer()
      
      // Generate unique key and upload to R2
      cloudflareKey = generateUniqueKey(imageFile.name)
      await uploadToR2(cloudflareKey, optimizedBuffer, imageFile.type)
      
      // Delete old image if updating
      if (founderData.cloudflareKey && founderData.cloudflareKey !== cloudflareKey) {
        try {
          await deleteFromR2(founderData.cloudflareKey)
        } catch (deleteError) {
          console.warn('Failed to delete old image:', deleteError)
        }
      }
    }
    
    // Get existing founders
    const foundersContent = await Content.findOne({ 
      key: 'founders',
      section: 'about' 
    })
    
    const founders = foundersContent?.value || []
    
    // Create or update founder
    const founderToSave = {
      ...founderData,
      cloudflareKey,
      image: cloudflareKey ? getPublicMediaUrl(cloudflareKey) : founderData.image,
      id: founderData.id || `founder_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    }
    
    let updatedFounders
    if (founderData.id) {
      // Update existing founder
      updatedFounders = founders.map((founder: any) => 
        founder.id === founderData.id ? founderToSave : founder
      )
    } else {
      // Add new founder
      updatedFounders = [...founders, founderToSave]
    }
    
    // Save to database
    if (foundersContent) {
      foundersContent.value = updatedFounders
      foundersContent.updatedAt = new Date()
      await foundersContent.save()
    } else {
      await Content.create({
        key: 'founders',
        type: 'json',
        value: updatedFounders,
        section: 'about',
        description: 'Founders data',
        isActive: true
      })
    }
    
    return NextResponse.json(founderToSave)
  } catch (error) {
    console.error('Error saving founder:', error)
    return NextResponse.json(
      { error: 'Failed to save founder' },
      { status: 500 }
    )
  }
}

// DELETE - Remove founder
export async function DELETE(request: NextRequest) {
  try {
    await dbConnect()
    
    const { searchParams } = new URL(request.url)
    const founderId = searchParams.get('id')
    
    if (!founderId) {
      return NextResponse.json(
        { error: 'Founder ID is required' },
        { status: 400 }
      )
    }
    
    const foundersContent = await Content.findOne({ 
      key: 'founders',
      section: 'about' 
    })
    
    if (!foundersContent) {
      return NextResponse.json(
        { error: 'Founders not found' },
        { status: 404 }
      )
    }
    
    const founders = foundersContent.value || []
    const founderToDelete = founders.find((founder: any) => founder.id === founderId)
    
    if (!founderToDelete) {
      return NextResponse.json(
        { error: 'Founder not found' },
        { status: 404 }
      )
    }
    
    // Delete image from R2 if exists
    if (founderToDelete.cloudflareKey) {
      try {
        await deleteFromR2(founderToDelete.cloudflareKey)
      } catch (deleteError) {
        console.warn('Failed to delete image from R2:', deleteError)
      }
    }
    
    // Remove founder from array
    const updatedFounders = founders.filter((founder: any) => founder.id !== founderId)
    
    foundersContent.value = updatedFounders
    foundersContent.updatedAt = new Date()
    await foundersContent.save()
    
    return NextResponse.json({ message: 'Founder deleted successfully' })
  } catch (error) {
    console.error('Error deleting founder:', error)
    return NextResponse.json(
      { error: 'Failed to delete founder' },
      { status: 500 }
    )
  }
}
