import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Blog from '@/models/Blog'
import Media from '@/models/Media'
import { getPublicMediaUrl } from '@/lib/media-proxy'

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    await dbConnect()
    
    const { slug } = params
    
    const blog = await Blog.findOne({ 
      slug,
      status: 'published' 
    }).lean()

    if (!blog) {
      return NextResponse.json(
        { error: 'Blog not found' },
        { status: 404 }
      )
    }

    // Populate featured image
    if (blog.featuredImage?.mediaId) {
      try {
        const media = await Media.findById(blog.featuredImage.mediaId)
        if (media) {
          const imageUrl = media.url || (process.env.NEXT_PUBLIC_R2_PUBLIC_BASE_URL ? getPublicMediaUrl(media.cloudflareKey) : undefined)
          blog.featuredImage = {
            mediaId: media._id.toString(),
            url: imageUrl || '',
            alt: media.alt || blog.featuredImage.alt || blog.title
          }
        }
      } catch (mediaError) {
        console.warn('Failed to populate media for blog:', blog._id, mediaError)
      }
    }

    // Increment view count
    await Blog.findByIdAndUpdate(blog._id, { $inc: { views: 1 } })
    blog.views = (blog.views || 0) + 1

    // Get related posts (same category, excluding current post)
    const relatedPosts = await Blog.find({
      category: blog.category,
      status: 'published',
      _id: { $ne: blog._id }
    })
    .select('title slug excerpt featuredImage publishedAt readTime')
    .limit(3)
    .lean()

    // Populate related posts images
    const relatedWithMedia = await Promise.all(
      relatedPosts.map(async (post) => {
        if (post.featuredImage?.mediaId) {
          try {
            const media = await Media.findById(post.featuredImage.mediaId)
            if (media) {
              const imageUrl = media.url || (process.env.NEXT_PUBLIC_R2_PUBLIC_BASE_URL ? getPublicMediaUrl(media.cloudflareKey) : undefined)
              post.featuredImage = {
                mediaId: media._id.toString(),
                url: imageUrl || '',
                alt: media.alt || post.featuredImage.alt || post.title
              }
            }
          } catch (mediaError) {
            console.warn('Failed to populate media for related post:', post._id, mediaError)
          }
        }
        return post
      })
    )

    return NextResponse.json({
      blog,
      relatedPosts: relatedWithMedia
    })
  } catch (error) {
    console.error('Get blog by slug error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
