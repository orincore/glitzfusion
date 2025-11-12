import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Course from '@/models/Course'
import Media from '@/models/Media'
import { getSignedDownloadUrl } from '@/lib/cloudflare-r2'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    await dbConnect()
    const { slug } = await params
    
    const course = await Course.findOne({ slug, isActive: true })
    
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
        console.warn('Failed to populate media:', mediaError)
        // Continue without media data
      }
    }

    return NextResponse.json(courseData)
  } catch (error) {
    console.error('Get course by slug error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
