import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Application from '@/models/Application'
import mongoose from 'mongoose'
import { sendStatusUpdateEmail } from '@/lib/email-careers'

// GET /api/applications/[id] - Get specific application
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB()

    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { error: 'Invalid application ID' },
        { status: 400 }
      )
    }

    const application = await Application.findById(params.id).lean()

    if (!application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ application })

  } catch (error) {
    console.error('Error fetching application:', error)
    return NextResponse.json(
      { error: 'Failed to fetch application' },
      { status: 500 }
    )
  }
}

// PUT /api/applications/[id] - Update application status
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB()

    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { error: 'Invalid application ID' },
        { status: 400 }
      )
    }

    const data = await request.json()
    const updateData: any = {}

    // Only allow certain fields to be updated
    const allowedFields = ['status', 'adminNotes', 'reviewedBy']
    allowedFields.forEach(field => {
      if (data[field] !== undefined) {
        updateData[field] = data[field]
      }
    })

    // Set reviewedAt when status changes
    if (data.status && data.status !== 'pending') {
      updateData.reviewedAt = new Date()
    }

    const application = await Application.findByIdAndUpdate(
      params.id,
      updateData,
      { new: true, runValidators: true }
    ).lean()

    if (!application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      )
    }

    // Send status update email to applicant if status changed
    if (data.status && data.status !== 'pending') {
      try {
        await sendStatusUpdateEmail({
          applicantName: `${application.applicantInfo.firstName} ${application.applicantInfo.lastName}`,
          applicantEmail: application.applicantInfo.email,
          careerTitle: application.careerTitle,
          status: data.status as any,
          adminNotes: data.adminNotes
        })
      } catch (emailError) {
        console.error('Failed to send status update email:', emailError)
        // Don't fail the update if email fails
      }
    }

    return NextResponse.json({
      message: 'Application updated successfully',
      application
    })

  } catch (error: any) {
    console.error('Error updating application:', error)
    
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map((err: any) => err.message)
      return NextResponse.json(
        { error: 'Validation failed', details: validationErrors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to update application' },
      { status: 500 }
    )
  }
}

// DELETE /api/applications/[id] - Delete application
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB()

    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { error: 'Invalid application ID' },
        { status: 400 }
      )
    }

    const application = await Application.findByIdAndDelete(params.id)

    if (!application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      )
    }

    // TODO: Delete resume file from R2

    return NextResponse.json({
      message: 'Application deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting application:', error)
    return NextResponse.json(
      { error: 'Failed to delete application' },
      { status: 500 }
    )
  }
}
