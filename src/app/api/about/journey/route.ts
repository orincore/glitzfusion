import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Content from '@/models/Content'
import { uploadToR2, generateUniqueKey, deleteFromR2 } from '@/lib/cloudflare-r2'
import { getPublicMediaUrl } from '@/lib/media-proxy'
import sharp from 'sharp'

// GET - Fetch journey content
export async function GET() {
  try {
    await dbConnect()
    
    const journeyContent = await Content.findOne({ 
      key: 'journey',
      section: 'about',
      isActive: true 
    })
    
    const content = journeyContent?.value || {}
    
    // Process image URLs to use public R2 URLs
    const processedContent = {
      ...content,
      founderImage: content.founderImageKey ? getPublicMediaUrl(content.founderImageKey) : content.founderImage,
      milestones: content.milestones?.map((milestone: any) => ({
        ...milestone,
        image: milestone.imageKey ? getPublicMediaUrl(milestone.imageKey) : milestone.image
      })) || []
    }
    
    return NextResponse.json(processedContent)
  } catch (error) {
    console.error('Error fetching journey content:', error)
    return NextResponse.json(
      { error: 'Failed to fetch journey content' },
      { status: 500 }
    )
  }
}

// POST - Update journey content
export async function POST(request: NextRequest) {
  try {
    await dbConnect()
    
    const formData = await request.formData()
    const contentData = JSON.parse(formData.get('contentData') as string)
    const founderImageFile = formData.get('founderImage') as File | null
    
    let founderImageKey = contentData.founderImageKey
    
    // Handle founder image upload if provided
    if (founderImageFile) {
      const bytes = await founderImageFile.arrayBuffer()
      const buffer = Buffer.from(new Uint8Array(bytes))
      
      // Optimize image
      const optimizedBuffer = await sharp(buffer)
        .resize(400, 400, { 
          fit: 'cover',
          position: 'center'
        })
        .jpeg({ quality: 90 })
        .toBuffer()
      
      // Generate unique key and upload to R2
      founderImageKey = generateUniqueKey(founderImageFile.name)
      await uploadToR2(founderImageKey, optimizedBuffer, founderImageFile.type)
      
      // Delete old image if updating
      if (contentData.founderImageKey && contentData.founderImageKey !== founderImageKey) {
        try {
          await deleteFromR2(contentData.founderImageKey)
        } catch (deleteError) {
          console.warn('Failed to delete old founder image:', deleteError)
        }
      }
    }
    
    // Process milestone images
    const processedMilestones = await Promise.all(
      (contentData.milestones || []).map(async (milestone: any, index: number) => {
        const milestoneImageFile = formData.get(`milestoneImage_${index}`) as File | null
        let milestoneImageKey = milestone.imageKey
        
        if (milestoneImageFile) {
          const bytes = await milestoneImageFile.arrayBuffer()
          const buffer = Buffer.from(new Uint8Array(bytes))
          
          // Optimize image
          const optimizedBuffer = await sharp(buffer)
            .resize(800, 600, { 
              fit: 'cover',
              position: 'center'
            })
            .jpeg({ quality: 85 })
            .toBuffer()
          
          // Generate unique key and upload to R2
          milestoneImageKey = generateUniqueKey(milestoneImageFile.name)
          await uploadToR2(milestoneImageKey, optimizedBuffer, milestoneImageFile.type)
          
          // Delete old image if updating
          if (milestone.imageKey && milestone.imageKey !== milestoneImageKey) {
            try {
              await deleteFromR2(milestone.imageKey)
            } catch (deleteError) {
              console.warn('Failed to delete old milestone image:', deleteError)
            }
          }
        }
        
        return {
          ...milestone,
          imageKey: milestoneImageKey,
          image: milestoneImageKey ? getPublicMediaUrl(milestoneImageKey) : milestone.image
        }
      })
    )
    
    // Prepare content to save
    const contentToSave = {
      ...contentData,
      founderImageKey,
      founderImage: founderImageKey ? getPublicMediaUrl(founderImageKey) : contentData.founderImage,
      milestones: processedMilestones
    }
    
    // Save to database
    const existingContent = await Content.findOne({ 
      key: 'journey',
      section: 'about' 
    })
    
    if (existingContent) {
      existingContent.value = contentToSave
      existingContent.updatedAt = new Date()
      await existingContent.save()
    } else {
      await Content.create({
        key: 'journey',
        type: 'json',
        value: contentToSave,
        section: 'about',
        description: 'Journey section content',
        isActive: true
      })
    }
    
    return NextResponse.json(contentToSave)
  } catch (error) {
    console.error('Error saving journey content:', error)
    return NextResponse.json(
      { error: 'Failed to save journey content' },
      { status: 500 }
    )
  }
}

// DELETE - Delete milestone image
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
