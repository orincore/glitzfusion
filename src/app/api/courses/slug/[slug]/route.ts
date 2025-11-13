import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Course from '@/models/Course'
import Media from '@/models/Media'
import { getSignedDownloadUrl } from '@/lib/cloudflare-r2'
import { processCourseMediaUrls } from '@/lib/media-proxy'

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

    // Get base URL for proxy
    const baseUrl = request.headers.get('host') 
      ? `${request.headers.get('x-forwarded-proto') || 'http'}://${request.headers.get('host')}`
      : undefined

    // Populate media data if heroMedia exists
    let courseData = course.toObject()
    if (courseData.heroMedia?.mediaId) {
      try {
        const media = await Media.findById(courseData.heroMedia.mediaId)
        if (media) {
          // Use proxy URL instead of direct R2 URL
          const heroMedia = {
            mediaId: media._id.toString(),
            url: media.cloudflareKey,
            mediaType: media.mimeType.startsWith('video/') ? 'video' : 'image',
            alt: media.alt || courseData.heroMedia.alt || '',
            cloudflareKey: media.cloudflareKey
          }
          
          courseData.heroMedia = processCourseMediaUrls(heroMedia, baseUrl)
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
