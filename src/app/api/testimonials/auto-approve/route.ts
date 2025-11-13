import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Testimonial from '@/models/Testimonial'

// POST /api/testimonials/auto-approve - Auto-approve all pending testimonials
export async function POST(request: NextRequest) {
  try {
    await connectDB()

    // Find all pending testimonials
    const pendingCount = await Testimonial.countDocuments({ status: 'pending' })
    
    if (pendingCount === 0) {
      return NextResponse.json({
        message: 'No pending testimonials to approve',
        result: {
          modifiedCount: 0,
          pendingCount: 0
        }
      })
    }

    // Approve all pending testimonials
    const result = await Testimonial.updateMany(
      { status: 'pending' },
      { 
        status: 'approved',
        isPublished: true,
        publishedAt: new Date()
      }
    )

    return NextResponse.json({
      message: `Successfully auto-approved ${result.modifiedCount} testimonials`,
      result: {
        modifiedCount: result.modifiedCount,
        pendingCount: pendingCount,
        approvedCount: result.modifiedCount
      }
    })

  } catch (error: any) {
    console.error('Auto-approve testimonials error:', error)
    return NextResponse.json(
      { error: 'Failed to auto-approve testimonials' },
      { status: 500 }
    )
  }
}

// GET /api/testimonials/auto-approve - Get info about pending testimonials
export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const pendingCount = await Testimonial.countDocuments({ status: 'pending' })
    const approvedCount = await Testimonial.countDocuments({ status: 'approved' })
    const publishedCount = await Testimonial.countDocuments({ isPublished: true })

    return NextResponse.json({
      pending: pendingCount,
      approved: approvedCount,
      published: publishedCount,
      message: pendingCount > 0 
        ? `${pendingCount} testimonials are pending approval`
        : 'No testimonials are pending approval'
    })

  } catch (error: any) {
    console.error('Get testimonial stats error:', error)
    return NextResponse.json(
      { error: 'Failed to get testimonial statistics' },
      { status: 500 }
    )
  }
}
