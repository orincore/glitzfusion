import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Blog from '@/models/Blog'
import Media from '@/models/Media'
import { requireAuth } from '@/lib/auth'
import { getPublicMediaUrl } from '@/lib/media-proxy'

export async function GET(request: NextRequest) {
  try {
    await dbConnect()
    
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const category = searchParams.get('category')
    const tag = searchParams.get('tag')
    const status = searchParams.get('status')
    const featured = searchParams.get('featured')
    const search = searchParams.get('search')
    const sort = searchParams.get('sort') || 'publishedAt'
    const order = searchParams.get('order') || 'desc'

    // Build query
    const query: any = {}
    
    if (status && status !== 'all') {
      query.status = status
    }
    
    if (category) {
      query.category = category
    }
    
    if (tag) {
      query.tags = { $in: [tag] }
    }
    
    if (featured === 'true') {
      query.isFeatured = true
    }
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { excerpt: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ]
    }

    // Calculate pagination
    const skip = (page - 1) * limit
    
    // Get total count for pagination
    const total = await Blog.countDocuments(query)
    
    // Build sort object
    const sortObj: any = {}
    sortObj[sort] = order === 'desc' ? -1 : 1
    
    // Get blogs with pagination
    const blogs = await Blog.find(query)
      .sort(sortObj)
      .skip(skip)
      .limit(limit)
      .lean()

    // Populate featured images
    const blogsWithMedia = await Promise.all(
      blogs.map(async (blog) => {
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
        return blog
      })
    )

    // Get categories and tags for filtering
    // For admin and general listing, return distinct categories and tags across all posts
    const categories = await Blog.distinct('category')
    const tags = await Blog.distinct('tags')

    return NextResponse.json({
      blogs: blogsWithMedia,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      filters: {
        categories,
        tags
      }
    })
  } catch (error) {
    console.error('Get blogs error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export const POST = requireAuth(async (request: NextRequest) => {
  try {
    await dbConnect()
    
    const blogData = await request.json()
    
    // Generate slug if not provided
    if (!blogData.slug) {
      blogData.slug = blogData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
    }
    
    // Check if blog with same slug exists
    const existingBlog = await Blog.findOne({ slug: blogData.slug })
    if (existingBlog) {
      return NextResponse.json(
        { error: 'Blog with this slug already exists' },
        { status: 400 }
      )
    }

    // Generate unique ID
    blogData.id = `blog_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // Calculate read time (average 200 words per minute)
    const wordCount = blogData.content.split(/\s+/).length
    blogData.readTime = Math.max(1, Math.ceil(wordCount / 200))

    // Set default SEO fields if not provided
    if (!blogData.seo) {
      blogData.seo = {}
    }
    
    if (!blogData.seo.metaTitle) {
      blogData.seo.metaTitle = blogData.title
    }
    
    if (!blogData.seo.metaDescription) {
      blogData.seo.metaDescription = blogData.excerpt
    }

    const blog = new Blog(blogData)
    await blog.save()

    return NextResponse.json(blog, { status: 201 })
  } catch (error) {
    console.error('Create blog error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
})
