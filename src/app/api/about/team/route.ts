import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Content from '@/models/Content'
import { uploadToR2, generateUniqueKey, deleteFromR2 } from '@/lib/cloudflare-r2'
import { getPublicMediaUrl } from '@/lib/media-proxy'
import sharp from 'sharp'

// GET - Fetch all team members
export async function GET() {
  try {
    await dbConnect()
    
    const teamContent = await Content.findOne({ 
      key: 'teamMembers',
      section: 'about',
      isActive: true 
    })
    
    const teamMembers = teamContent?.value || []
    
    // Process image URLs to use public R2 URLs
    const processedMembers = teamMembers.map((member: any) => ({
      ...member,
      image: member.cloudflareKey ? getPublicMediaUrl(member.cloudflareKey) : member.image
    }))
    
    return NextResponse.json(processedMembers)
  } catch (error) {
    console.error('Error fetching team members:', error)
    return NextResponse.json(
      { error: 'Failed to fetch team members' },
      { status: 500 }
    )
  }
}

// POST - Add or update team member
export async function POST(request: NextRequest) {
  try {
    await dbConnect()
    
    const formData = await request.formData()
    const memberData = JSON.parse(formData.get('memberData') as string)
    const imageFile = formData.get('image') as File | null
    
    let cloudflareKey = memberData.cloudflareKey
    
    // Handle image upload if provided
    if (imageFile) {
      const bytes = await imageFile.arrayBuffer()
      const buffer = Buffer.from(new Uint8Array(bytes))
      
      // Optimize image
      const optimizedBuffer = await sharp(buffer)
        .resize(800, 800, { 
          fit: 'cover',
          position: 'center'
        })
        .jpeg({ quality: 90 })
        .toBuffer()
      
      // Generate unique key and upload to R2
      cloudflareKey = generateUniqueKey(imageFile.name)
      await uploadToR2(cloudflareKey, optimizedBuffer, imageFile.type)
      
      // Delete old image if updating
      if (memberData.cloudflareKey && memberData.cloudflareKey !== cloudflareKey) {
        try {
          await deleteFromR2(memberData.cloudflareKey)
        } catch (deleteError) {
          console.warn('Failed to delete old image:', deleteError)
        }
      }
    }
    
    // Get existing team members
    const teamContent = await Content.findOne({ 
      key: 'teamMembers',
      section: 'about' 
    })
    
    const teamMembers = teamContent?.value || []
    
    // Create or update member
    const memberToSave = {
      ...memberData,
      cloudflareKey,
      image: cloudflareKey ? getPublicMediaUrl(cloudflareKey) : memberData.image,
      id: memberData.id || `team_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    }
    
    let updatedMembers
    if (memberData.id) {
      // Update existing member
      updatedMembers = teamMembers.map((member: any) => 
        member.id === memberData.id ? memberToSave : member
      )
    } else {
      // Add new member
      updatedMembers = [...teamMembers, memberToSave]
    }
    
    // Save to database
    if (teamContent) {
      teamContent.value = updatedMembers
      teamContent.updatedAt = new Date()
      await teamContent.save()
    } else {
      await Content.create({
        key: 'teamMembers',
        type: 'json',
        value: updatedMembers,
        section: 'about',
        description: 'Team members data',
        isActive: true
      })
    }
    
    return NextResponse.json(memberToSave)
  } catch (error) {
    console.error('Error saving team member:', error)
    return NextResponse.json(
      { error: 'Failed to save team member' },
      { status: 500 }
    )
  }
}

// DELETE - Remove team member
export async function DELETE(request: NextRequest) {
  try {
    await dbConnect()
    
    const { searchParams } = new URL(request.url)
    const memberId = searchParams.get('id')
    
    if (!memberId) {
      return NextResponse.json(
        { error: 'Member ID is required' },
        { status: 400 }
      )
    }
    
    const teamContent = await Content.findOne({ 
      key: 'teamMembers',
      section: 'about' 
    })
    
    if (!teamContent) {
      return NextResponse.json(
        { error: 'Team members not found' },
        { status: 404 }
      )
    }
    
    const teamMembers = teamContent.value || []
    const memberToDelete = teamMembers.find((member: any) => member.id === memberId)
    
    if (!memberToDelete) {
      return NextResponse.json(
        { error: 'Team member not found' },
        { status: 404 }
      )
    }
    
    // Delete image from R2 if exists
    if (memberToDelete.cloudflareKey) {
      try {
        await deleteFromR2(memberToDelete.cloudflareKey)
      } catch (deleteError) {
        console.warn('Failed to delete image from R2:', deleteError)
      }
    }
    
    // Remove member from array
    const updatedMembers = teamMembers.filter((member: any) => member.id !== memberId)
    
    teamContent.value = updatedMembers
    teamContent.updatedAt = new Date()
    await teamContent.save()
    
    return NextResponse.json({ message: 'Team member deleted successfully' })
  } catch (error) {
    console.error('Error deleting team member:', error)
    return NextResponse.json(
      { error: 'Failed to delete team member' },
      { status: 500 }
    )
  }
}
