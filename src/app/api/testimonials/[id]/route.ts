import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Testimonial from '@/models/Testimonial'
import mongoose from 'mongoose'

// GET /api/testimonials/[id] - Get specific testimonial
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB()

    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { error: 'Invalid testimonial ID' },
        { status: 400 }
      )
    }

    const testimonial = await Testimonial.findById(params.id).lean()

    if (!testimonial) {
      return NextResponse.json(
        { error: 'Testimonial not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ testimonial })

  } catch (error) {
    console.error('Error fetching testimonial:', error)
    return NextResponse.json(
      { error: 'Failed to fetch testimonial' },
      { status: 500 }
    )
  }
}

// PUT /api/testimonials/[id] - Update testimonial
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB()

    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { error: 'Invalid testimonial ID' },
        { status: 400 }
      )
    }

    const data = await request.json()
    const updateData: any = {}

    // Only allow certain fields to be updated
    const allowedFields = ['status', 'isPublished', 'isFeatured', 'adminNotes']
    allowedFields.forEach(field => {
      if (data[field] !== undefined) {
        updateData[field] = data[field]
      }
    })

    // Set publishedAt when publishing
    if (data.isPublished === true && data.status === 'approved') {
      updateData.publishedAt = new Date()
    } else if (data.isPublished === false) {
      updateData.publishedAt = undefined
    }

    const testimonial = await Testimonial.findByIdAndUpdate(
      params.id,
      updateData,
      { new: true, runValidators: true }
    ).lean()

    if (!testimonial) {
      return NextResponse.json(
        { error: 'Testimonial not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      message: 'Testimonial updated successfully',
      testimonial
    })

  } catch (error: any) {
    console.error('Error updating testimonial:', error)
    
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map((err: any) => err.message)
      return NextResponse.json(
        { error: 'Validation failed', details: validationErrors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to update testimonial' },
      { status: 500 }
    )
  }
}

// DELETE /api/testimonials/[id] - Delete testimonial
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB()

    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { error: 'Invalid testimonial ID' },
        { status: 400 }
      )
    }

    const testimonial = await Testimonial.findByIdAndDelete(params.id)

    if (!testimonial) {
      return NextResponse.json(
        { error: 'Testimonial not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      message: 'Testimonial deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting testimonial:', error)
    return NextResponse.json(
      { error: 'Failed to delete testimonial' },
      { status: 500 }
    )
  }
}
