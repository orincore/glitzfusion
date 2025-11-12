import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Course from '@/models/Course'
import Media from '@/models/Media'
import { requireAuth } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect()
    const course = await Course.findById(params.id)
    
    if (!course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      )
    }

    // Populate media data if heroMedia exists
    let courseData = course.toObject()
    if (courseData.heroMedia?.mediaId) {
      try {
        const media = await Media.findById(courseData.heroMedia.mediaId)
        if (media) {
          courseData.heroMedia = {
            mediaId: media._id.toString(),
            url: media.url,
            mediaType: media.mimeType.startsWith('video/') ? 'video' : 'image',
            alt: media.alt || courseData.heroMedia.alt || ''
          }
        }
      } catch (mediaError) {
        console.warn('Failed to populate media:', mediaError)
        // Continue without media data
      }
    }

    return NextResponse.json(courseData)
  } catch (error) {
    console.error('Get course error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export const PUT = requireAuth(async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
  try {
    await dbConnect()
    
    const courseData = await request.json()
    
    // Find the course first
    const course = await Course.findById(params.id)
    
    if (!course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      )
    }

    // Update fields manually
    Object.keys(courseData).forEach(key => {
      (course as any)[key] = courseData[key]
    })

    // Save the course
    await course.save()

    return NextResponse.json(course)
  } catch (error) {
    console.error('Update course error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
})

export const DELETE = requireAuth(async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
  try {
    await dbConnect()
    
    const course = await Course.findByIdAndUpdate(
      params.id,
      { isActive: false },
      { new: true }
    )

    if (!course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ message: 'Course deleted successfully' })
  } catch (error) {
    console.error('Delete course error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
})
