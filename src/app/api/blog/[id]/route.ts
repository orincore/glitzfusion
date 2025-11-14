import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Blog from '@/models/Blog'
import Media from '@/models/Media'
import { getPublicMediaUrl } from '@/lib/media-proxy'
import { requireAuth } from '@/lib/auth'
import mongoose from 'mongoose'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect()
    
    const { id } = params
    
    // Build query - only use _id if it's a valid ObjectId
    const query: any = {
      $or: [
        { id: id },
        { slug: id }
      ]
    }
    
    // Only add _id query if the id is a valid ObjectId
    if (mongoose.Types.ObjectId.isValid(id)) {
      query.$or.unshift({ _id: id })
    }
    
    const blog = await Blog.findOne(query).lean()

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

    // Increment view count for published blogs (not for admin preview)
    const isPreview = request.nextUrl.searchParams.get('preview') === 'true'
    if (blog.status === 'published' && !isPreview) {
      await Blog.findByIdAndUpdate(blog._id, { $inc: { views: 1 } })
      blog.views = (blog.views || 0) + 1
    }

    return NextResponse.json(blog)
  } catch (error) {
    console.error('Get blog error:', error)
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
    
    const { id } = params
    const updateData = await request.json()
    
    // Build query - only use _id if it's a valid ObjectId
    const query: any = {
      $or: [
        { id: id },
        { slug: id }
      ]
    }
    
    // Only add _id query if the id is a valid ObjectId
    if (mongoose.Types.ObjectId.isValid(id)) {
      query.$or.unshift({ _id: id })
    }
    
    const existingBlog = await Blog.findOne(query)

    if (!existingBlog) {
      return NextResponse.json(
        { error: 'Blog not found' },
        { status: 404 }
      )
    }

    // Check if slug is being changed and if it conflicts
    if (updateData.slug && updateData.slug !== existingBlog.slug) {
      const slugExists = await Blog.findOne({ 
        slug: updateData.slug,
        _id: { $ne: existingBlog._id }
      })
      
      if (slugExists) {
        return NextResponse.json(
          { error: 'Blog with this slug already exists' },
          { status: 400 }
        )
      }
    }

    // Recalculate read time if content changed
    if (updateData.content) {
      const wordCount = updateData.content.split(/\s+/).length
      updateData.readTime = Math.max(1, Math.ceil(wordCount / 200))
    }

    // Update SEO fields if not provided
    if (updateData.title && !updateData.seo?.metaTitle) {
      if (!updateData.seo) updateData.seo = {}
      updateData.seo.metaTitle = updateData.title
    }
    
    if (updateData.excerpt && !updateData.seo?.metaDescription) {
      if (!updateData.seo) updateData.seo = {}
      updateData.seo.metaDescription = updateData.excerpt
    }

    const updatedBlog = await Blog.findByIdAndUpdate(
      existingBlog._id,
      updateData,
      { new: true, runValidators: true }
    )

    return NextResponse.json(updatedBlog)
  } catch (error) {
    console.error('Update blog error:', error)
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
    
    const { id } = params
    
    // Build query - only use _id if it's a valid ObjectId
    const query: any = {
      $or: [
        { id: id },
        { slug: id }
      ]
    }
    
    // Only add _id query if the id is a valid ObjectId
    if (mongoose.Types.ObjectId.isValid(id)) {
      query.$or.unshift({ _id: id })
    }
    
    const blog = await Blog.findOneAndDelete(query)

    if (!blog) {
      return NextResponse.json(
        { error: 'Blog not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ message: 'Blog deleted successfully' })
  } catch (error) {
    console.error('Delete blog error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
})
