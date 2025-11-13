import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Career, { ICareer } from '@/models/Career'

// GET /api/careers - List careers with filtering and pagination
export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const department = searchParams.get('department')
    const type = searchParams.get('type')
    const location = searchParams.get('location')
    const isActive = searchParams.get('isActive')
    const isFeatured = searchParams.get('isFeatured')
    const search = searchParams.get('search')
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    // Build filter query
    const filter: any = {}
    if (department && department !== 'all') filter.department = department
    if (type && type !== 'all') filter.type = type
    if (location && location !== 'all') filter.location = location
    if (isActive !== null && isActive !== undefined) {
      filter.isActive = isActive === 'true'
    }
    if (isFeatured !== null && isFeatured !== undefined) {
      filter.isFeatured = isFeatured === 'true'
    }
    
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { department: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } }
      ]
    }

    // Calculate pagination
    const skip = (page - 1) * limit
    const sortOptions: any = {}
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1

    // Execute queries
    const [careers, total] = await Promise.all([
      Career.find(filter)
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .lean(),
      Career.countDocuments(filter)
    ])

    // Calculate stats
    const stats = await Career.aggregate([
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 }
        }
      }
    ])

    const typeStats = {
      'full-time': 0,
      'part-time': 0,
      'contract': 0,
      'internship': 0,
      total: total
    }

    stats.forEach((stat: any) => {
      if (stat._id in typeStats) {
        typeStats[stat._id as keyof typeof typeStats] = stat.count
      }
    })

    // Additional stats
    const activeCount = await Career.countDocuments({ isActive: true })
    const featuredCount = await Career.countDocuments({ isFeatured: true })

    return NextResponse.json({
      careers,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      stats: {
        ...typeStats,
        active: activeCount,
        featured: featuredCount
      }
    })

  } catch (error) {
    console.error('Error fetching careers:', error)
    return NextResponse.json(
      { error: 'Failed to fetch careers' },
      { status: 500 }
    )
  }
}

// POST /api/careers - Create new career
export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const data = await request.json()

    // Validate required fields
    const requiredFields = ['title', 'department', 'location', 'type', 'experience', 'description', 'postedBy']
    for (const field of requiredFields) {
      if (!data[field]) {
        return NextResponse.json(
          { error: `${field} is required` },
          { status: 400 }
        )
      }
    }

    // Create new career
    const career = new Career({
      title: data.title,
      department: data.department,
      location: data.location,
      type: data.type,
      experience: data.experience,
      description: data.description,
      responsibilities: data.responsibilities || [],
      requirements: data.requirements || [],
      qualifications: data.qualifications || [],
      benefits: data.benefits || [],
      salary: data.salary || { currency: 'INR', period: 'monthly' },
      isActive: data.isActive !== undefined ? data.isActive : true,
      isFeatured: data.isFeatured || false,
      applicationDeadline: data.applicationDeadline,
      postedBy: data.postedBy
    })

    await career.save()

    return NextResponse.json({
      message: 'Career posted successfully',
      career: {
        _id: career._id,
        title: career.title,
        department: career.department,
        location: career.location,
        type: career.type,
        isActive: career.isActive,
        createdAt: career.createdAt
      }
    }, { status: 201 })

  } catch (error: any) {
    console.error('Error creating career:', error)
    
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map((err: any) => err.message)
      return NextResponse.json(
        { error: 'Validation failed', details: validationErrors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create career' },
      { status: 500 }
    )
  }
}
