import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Career from '@/models/Career'
import mongoose from 'mongoose'

// GET /api/careers/[id] - Get specific career
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB()

    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { error: 'Invalid career ID' },
        { status: 400 }
      )
    }

    const career = await Career.findById(params.id).lean()

    if (!career) {
      return NextResponse.json(
        { error: 'Career not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ career })

  } catch (error) {
    console.error('Error fetching career:', error)
    return NextResponse.json(
      { error: 'Failed to fetch career' },
      { status: 500 }
    )
  }
}

// PUT /api/careers/[id] - Update career
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB()

    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { error: 'Invalid career ID' },
        { status: 400 }
      )
    }

    const data = await request.json()

    const career = await Career.findByIdAndUpdate(
      params.id,
      data,
      { new: true, runValidators: true }
    ).lean()

    if (!career) {
      return NextResponse.json(
        { error: 'Career not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      message: 'Career updated successfully',
      career
    })

  } catch (error: any) {
    console.error('Error updating career:', error)
    
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map((err: any) => err.message)
      return NextResponse.json(
        { error: 'Validation failed', details: validationErrors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to update career' },
      { status: 500 }
    )
  }
}

// DELETE /api/careers/[id] - Delete career
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB()

    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { error: 'Invalid career ID' },
        { status: 400 }
      )
    }

    const career = await Career.findByIdAndDelete(params.id)

    if (!career) {
      return NextResponse.json(
        { error: 'Career not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      message: 'Career deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting career:', error)
    return NextResponse.json(
      { error: 'Failed to delete career' },
      { status: 500 }
    )
  }
}
