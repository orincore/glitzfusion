import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Content from '@/models/Content'
import { uploadToR2, generateUniqueKey, deleteFromR2 } from '@/lib/cloudflare-r2'
import { getPublicMediaUrl } from '@/lib/media-proxy'
import sharp from 'sharp'

// GET - Fetch story content
export async function GET() {
  try {
    await dbConnect()
    
    const storyContent = await Content.findOne({ 
      key: 'ourStory',
      section: 'about',
      isActive: true 
    })
    
    const content = storyContent?.value || {}
    
    // Process image URLs to use public R2 URLs
    const processedContent = {
      ...content,
      mainImage: content.mainImageKey ? getPublicMediaUrl(content.mainImageKey) : content.mainImage,
      secondaryImage: content.secondaryImageKey ? getPublicMediaUrl(content.secondaryImageKey) : content.secondaryImage,
      milestones: content.milestones?.map((milestone: any) => ({
        ...milestone,
        image: milestone.imageKey ? getPublicMediaUrl(milestone.imageKey) : milestone.image
      })) || []
    }
    
    return NextResponse.json(processedContent)
  } catch (error) {
    console.error('Error fetching story content:', error)
    return NextResponse.json(
      { error: 'Failed to fetch story content' },
      { status: 500 }
    )
  }
}

// POST - Update story content
export async function POST(request: NextRequest) {
  try {
    await dbConnect()
    
    const formData = await request.formData()
    const contentData = JSON.parse(formData.get('contentData') as string)
    const mainImageFile = formData.get('mainImage') as File | null
    const secondaryImageFile = formData.get('secondaryImage') as File | null
    
    let mainImageKey = contentData.mainImageKey
    let secondaryImageKey = contentData.secondaryImageKey
    
    // Handle main image upload if provided
    if (mainImageFile) {
      const bytes = await mainImageFile.arrayBuffer()
      const buffer = Buffer.from(new Uint8Array(bytes))
      
      // Optimize image
      const optimizedBuffer = await sharp(buffer)
        .resize(1200, 800, { 
          fit: 'cover',
          position: 'center'
        })
        .jpeg({ quality: 85 })
        .toBuffer()
      
      // Generate unique key and upload to R2
      mainImageKey = generateUniqueKey(mainImageFile.name)
      await uploadToR2(mainImageKey, optimizedBuffer, mainImageFile.type)
      
      // Delete old image if updating
      if (contentData.mainImageKey && contentData.mainImageKey !== mainImageKey) {
        try {
          await deleteFromR2(contentData.mainImageKey)
        } catch (deleteError) {
          console.warn('Failed to delete old main image:', deleteError)
        }
      }
    }
    
    // Handle secondary image upload if provided
    if (secondaryImageFile) {
      const bytes = await secondaryImageFile.arrayBuffer()
      const buffer = Buffer.from(new Uint8Array(bytes))
      
      // Optimize image
      const optimizedBuffer = await sharp(buffer)
        .resize(600, 600, { 
          fit: 'cover',
          position: 'center'
        })
        .jpeg({ quality: 85 })
        .toBuffer()
      
      // Generate unique key and upload to R2
      secondaryImageKey = generateUniqueKey(secondaryImageFile.name)
      await uploadToR2(secondaryImageKey, optimizedBuffer, secondaryImageFile.type)
      
      // Delete old image if updating
      if (contentData.secondaryImageKey && contentData.secondaryImageKey !== secondaryImageKey) {
        try {
          await deleteFromR2(contentData.secondaryImageKey)
        } catch (deleteError) {
          console.warn('Failed to delete old secondary image:', deleteError)
        }
      }
    }
    
    // Prepare content to save
    const contentToSave = {
      ...contentData,
      mainImageKey,
      secondaryImageKey,
      mainImage: mainImageKey ? getPublicMediaUrl(mainImageKey) : contentData.mainImage,
      secondaryImage: secondaryImageKey ? getPublicMediaUrl(secondaryImageKey) : contentData.secondaryImage
    }
    
    // Save to database
    const existingContent = await Content.findOne({ 
      key: 'ourStory',
      section: 'about' 
    })
    
    if (existingContent) {
      existingContent.value = contentToSave
      existingContent.updatedAt = new Date()
      await existingContent.save()
    } else {
      await Content.create({
        key: 'ourStory',
        type: 'json',
        value: contentToSave,
        section: 'about',
        description: 'Our Story section content',
        isActive: true
      })
    }
    
    return NextResponse.json(contentToSave)
  } catch (error) {
    console.error('Error saving story content:', error)
    return NextResponse.json(
      { error: 'Failed to save story content' },
      { status: 500 }
    )
  }
}

// DELETE - Delete image
export async function DELETE(request: NextRequest) {
  try {
    await dbConnect()
    
    const { searchParams } = new URL(request.url)
    const imageKey = searchParams.get('imageKey')
    
    if (!imageKey) {
      return NextResponse.json(
        { error: 'Image key is required' },
        { status: 400 }
      )
    }
    
    // Delete image from R2
    try {
      await deleteFromR2(imageKey)
    } catch (deleteError) {
      console.warn('Failed to delete image from R2:', deleteError)
    }
    
    return NextResponse.json({ message: 'Image deleted successfully' })
  } catch (error) {
    console.error('Error deleting image:', error)
    return NextResponse.json(
      { error: 'Failed to delete image' },
      { status: 500 }
    )
  }
}
