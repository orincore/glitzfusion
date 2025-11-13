import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Testimonial, { ITestimonial } from '@/models/Testimonial'

type TestimonialResponse = {
  _id: string
  firstName: string
  lastName: string
  email: string
  rating: number
  review: string
  status: 'pending' | 'approved' | 'rejected'
  isPublished: boolean
  isFeatured: boolean
  adminNotes?: string
  submittedAt: Date
  updatedAt: Date
  publishedAt?: Date
}

const toTestimonialResponse = (testimonial: ITestimonial | (ITestimonial & { _id: any }) | any): TestimonialResponse => {
  return {
    _id: testimonial._id.toString(),
    firstName: testimonial.firstName,
    lastName: testimonial.lastName,
    email: testimonial.email,
    rating: testimonial.rating,
    review: testimonial.review,
    status: testimonial.status,
    isPublished: testimonial.isPublished,
    isFeatured: testimonial.isFeatured,
    adminNotes: testimonial.adminNotes,
    submittedAt: testimonial.submittedAt,
    updatedAt: testimonial.updatedAt,
    publishedAt: testimonial.publishedAt
  }
}

// GET /api/testimonials - List testimonials with filtering and pagination
export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status')
    const isPublished = searchParams.get('isPublished')
    const isFeatured = searchParams.get('isFeatured')
    const search = searchParams.get('search')
    const sortBy = searchParams.get('sortBy') || 'submittedAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'
    const random = searchParams.get('random') === 'true'

    // Build filter query
    const filter: any = {}
    if (status && status !== 'all') filter.status = status
    if (isPublished !== null && isPublished !== undefined) {
      filter.isPublished = isPublished === 'true'
    }
    if (isFeatured !== null && isFeatured !== undefined) {
      filter.isFeatured = isFeatured === 'true'
    }
    
    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { review: { $regex: search, $options: 'i' } }
      ]
    }

    let testimonials: TestimonialResponse[]
    let total: number

    if (random) {
      // For random testimonials (homepage), get published ones randomly
      const publishedFilter = { ...filter, isPublished: true }
      const [randomTestimonials, publishedTotal] = await Promise.all([
        Testimonial.aggregate([
          { $match: publishedFilter },
          { $sample: { size: limit } }
        ]),
        Testimonial.countDocuments(publishedFilter)
      ])
      testimonials = randomTestimonials.map(toTestimonialResponse)
      total = publishedTotal
    } else {
      // Calculate pagination
      const skip = (page - 1) * limit
      const sortOptions: any = {}
      sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1

      // Execute queries
      const [testimonialsResult, totalResult] = await Promise.all([
        Testimonial.find(filter)
          .sort(sortOptions)
          .skip(skip)
          .limit(limit)
          .lean(),
        Testimonial.countDocuments(filter)
      ])
      testimonials = testimonialsResult.map(toTestimonialResponse)
      total = totalResult
    }

    // Calculate stats
    const stats = await Testimonial.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ])

    const statusStats = {
      pending: 0,
      approved: 0,
      rejected: 0,
      total: await Testimonial.countDocuments({})
    }

    stats.forEach((stat: any) => {
      if (stat._id in statusStats) {
        statusStats[stat._id as keyof typeof statusStats] = stat.count
      }
    })

    // Additional stats
    const publishedCount = await Testimonial.countDocuments({ isPublished: true })
    const featuredCount = await Testimonial.countDocuments({ isFeatured: true })

    return NextResponse.json({
      testimonials,
      pagination: random ? null : {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      stats: {
        ...statusStats,
        published: publishedCount,
        featured: featuredCount
      }
    })

  } catch (error) {
    console.error('Error fetching testimonials:', error)
    return NextResponse.json(
      { error: 'Failed to fetch testimonials' },
      { status: 500 }
    )
  }
}

// POST /api/testimonials - Create new testimonial
export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const data = await request.json()

    // Validate required fields
    const requiredFields = ['firstName', 'lastName', 'email', 'rating', 'review']
    for (const field of requiredFields) {
      if (!data[field]) {
        return NextResponse.json(
          { error: `${field} is required` },
          { status: 400 }
        )
      }
    }

    // Validate rating range
    if (data.rating < 1 || data.rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      )
    }

    // Create new testimonial
    const testimonial = new Testimonial({
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      rating: data.rating,
      review: data.review
    })

    await testimonial.save()

    return NextResponse.json({
      message: 'Testimonial submitted successfully',
      testimonial: {
        _id: testimonial._id,
        firstName: testimonial.firstName,
        lastName: testimonial.lastName,
        rating: testimonial.rating,
        status: testimonial.status,
        submittedAt: testimonial.submittedAt
      }
    }, { status: 201 })

  } catch (error: any) {
    console.error('Error creating testimonial:', error)
    
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map((err: any) => err.message)
      return NextResponse.json(
        { error: 'Validation failed', details: validationErrors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create testimonial' },
      { status: 500 }
    )
  }
}
