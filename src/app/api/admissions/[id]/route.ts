import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Admission from '@/models/Admission'
import { emailService, generateStatusUpdateEmail } from '@/lib/email'
import mongoose from 'mongoose'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect()
    
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { error: 'Invalid admission ID' },
        { status: 400 }
      )
    }
    
    const admission = await Admission.findById(params.id).lean()
    
    if (!admission) {
      return NextResponse.json(
        { error: 'Admission not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({ admission })
  } catch (error) {
    console.error('Error fetching admission:', error)
    return NextResponse.json(
      { error: 'Failed to fetch admission' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect()
    
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { error: 'Invalid admission ID' },
        { status: 400 }
      )
    }
    
    const body = await request.json()
    const updateData = { ...body, updatedAt: new Date() }
    
    // Get the original admission to check for status changes
    const originalAdmission = await Admission.findById(params.id)
    if (!originalAdmission) {
      return NextResponse.json(
        { error: 'Admission not found' },
        { status: 404 }
      )
    }

    const updatedAdmission = await Admission.findByIdAndUpdate(
      params.id,
      updateData,
      { new: true, runValidators: true }
    )

    if (!updatedAdmission) {
      return NextResponse.json(
        { error: 'Failed to update admission' },
        { status: 500 }
      )
    }

    // Send status update email if status changed
    if (updateData.status && updateData.status !== originalAdmission.status) {
      try {
        const emailTemplate = generateStatusUpdateEmail({
          firstName: updatedAdmission.firstName,
          lastName: updatedAdmission.lastName,
          course: updatedAdmission.course,
          status: updateData.status as 'accepted' | 'rejected' | 'pending',
          submissionDate: new Date(updatedAdmission.submittedAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          }),
          adminNotes: updateData.adminNotes || updatedAdmission.adminNotes
        })
        
        await emailService.sendEmail({
          to: updatedAdmission.email,
          subject: emailTemplate.subject,
          html: emailTemplate.html,
          text: emailTemplate.text
        })
        
        console.log(`Status update email sent to ${updatedAdmission.email} for status: ${updateData.status}`)
      } catch (emailError) {
        console.error('Failed to send status update email:', emailError)
        // Don't fail the update if email fails
      }
    }

    return NextResponse.json({ 
      message: 'Admission updated successfully',
      admission: updatedAdmission 
    })
  } catch (error) {
    console.error('Error updating admission:', error)
    return NextResponse.json(
      { error: 'Failed to update admission' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect()
    
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { error: 'Invalid admission ID' },
        { status: 400 }
      )
    }
    
    const admission = await Admission.findByIdAndDelete(params.id)
    
    if (!admission) {
      return NextResponse.json(
        { error: 'Admission not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({ 
      message: 'Admission deleted successfully' 
    })
  } catch (error) {
    console.error('Error deleting admission:', error)
    return NextResponse.json(
      { error: 'Failed to delete admission' },
      { status: 500 }
    )
  }
}
