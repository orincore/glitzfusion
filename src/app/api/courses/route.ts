import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Course from '@/models/Course'
import Media from '@/models/Media'
import { getSignedDownloadUrl } from '@/lib/cloudflare-r2'
import { requireAuth } from '@/lib/auth'

export async function GET() {
  try {
    await dbConnect()
    const courses = await Course.find({ isActive: true }).sort({ createdAt: -1 })
    
    // Populate media data for courses that have heroMedia
    const coursesWithMedia = await Promise.all(
      courses.map(async (course) => {
        const courseData = course.toObject()
        if (courseData.heroMedia?.mediaId) {
          try {
            const media = await Media.findById(courseData.heroMedia.mediaId)
            if (media) {
              let mediaUrl = media.url

              if (!mediaUrl || mediaUrl.includes('r2.cloudflarestorage.com')) {
                try {
                  mediaUrl = await getSignedDownloadUrl(media.cloudflareKey)
                } catch (signedUrlError) {
                  console.warn('Failed to generate signed URL for media:', media._id, signedUrlError)
                }
              }

              courseData.heroMedia = {
                mediaId: media._id.toString(),
                url: mediaUrl || media.url,
                mediaType: media.mimeType.startsWith('video/') ? 'video' : 'image',
                alt: media.alt || courseData.heroMedia.alt || ''
              }
            }
          } catch (mediaError) {
            console.warn('Failed to populate media for course:', course._id, mediaError)
            // Continue without media data
          }
        }
        return courseData
      })
    )
    
    return NextResponse.json(coursesWithMedia)
  } catch (error) {
    console.error('Get courses error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export const POST = requireAuth(async (request: NextRequest) => {
  try {
    await dbConnect()
    
    const courseData = await request.json()
    
    // Check if course with same slug exists
    const existingCourse = await Course.findOne({ slug: courseData.slug })
    if (existingCourse) {
      return NextResponse.json(
        { error: 'Course with this slug already exists' },
        { status: 400 }
      )
    }

    const course = new Course(courseData)
    await course.save()

    return NextResponse.json(course, { status: 201 })
  } catch (error) {
    console.error('Create course error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
})
