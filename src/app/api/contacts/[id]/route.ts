import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Contact from '@/models/Contact'
import { emailService, generateContactStatusUpdateEmail } from '@/lib/email'

// GET /api/contacts/[id] - Get specific contact
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB()

    const contact = await Contact.findById(params.id).lean()
    
    if (!contact) {
      return NextResponse.json(
        { error: 'Contact not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ contact })

  } catch (error) {
    console.error('Error fetching contact:', error)
    return NextResponse.json(
      { error: 'Failed to fetch contact' },
      { status: 500 }
    )
  }
}

// PUT /api/contacts/[id] - Update contact status and notes
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB()

    const data = await request.json()
    const { status, adminNotes, assignedTo } = data

    // Find the contact first to get current status
    const currentContact = await Contact.findById(params.id)
    if (!currentContact) {
      return NextResponse.json(
        { error: 'Contact not found' },
        { status: 404 }
      )
    }

    const previousStatus = currentContact.status
    const updateData: any = {}

    if (status) updateData.status = status
    if (adminNotes !== undefined) updateData.adminNotes = adminNotes
    if (assignedTo !== undefined) updateData.assignedTo = assignedTo

    // Set resolvedAt if status is being changed to resolved
    if (status === 'resolved' && previousStatus !== 'resolved') {
      updateData.resolvedAt = new Date()
    }

    const updatedContact = await Contact.findByIdAndUpdate(
      params.id,
      updateData,
      { new: true, runValidators: true }
    )

    if (!updatedContact) {
      return NextResponse.json(
        { error: 'Contact not found' },
        { status: 404 }
      )
    }

    // Send email if status changed OR if admin notes were added/updated
    const statusChanged = status && status !== previousStatus
    const notesChanged = adminNotes !== undefined && adminNotes !== currentContact.adminNotes
    const shouldSendEmail = statusChanged || notesChanged

    console.log('📧 Email sending logic:', {
      statusChanged,
      notesChanged,
      shouldSendEmail,
      previousStatus,
      newStatus: status,
      previousNotes: currentContact.adminNotes || 'none',
      newNotes: adminNotes || 'none'
    })

    if (shouldSendEmail) {
      try {
        const emailTemplate = generateContactStatusUpdateEmail({
          firstName: updatedContact.firstName,
          lastName: updatedContact.lastName,
          subject: updatedContact.subject,
          status: updatedContact.status,
          previousStatus,
          adminNotes: updatedContact.adminNotes,
          category: updatedContact.category,
          submissionDate: updatedContact.submittedAt.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })
        })

        await emailService.sendEmail({
          to: updatedContact.email,
          subject: emailTemplate.subject,
          html: emailTemplate.html,
          text: emailTemplate.text
        })

        console.log('✅ Contact update email sent to:', updatedContact.email)
        console.log('📧 Email reason:', status !== previousStatus ? 'Status changed' : 'Notes added/updated')
      } catch (emailError) {
        console.error('❌ Failed to send contact update email:', emailError)
        // Don't fail the update if email fails
      }
    }

    return NextResponse.json({
      message: 'Contact updated successfully',
      contact: updatedContact
    })

  } catch (error: any) {
    console.error('Error updating contact:', error)
    
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map((err: any) => err.message)
      return NextResponse.json(
        { error: 'Validation failed', details: validationErrors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to update contact' },
      { status: 500 }
    )
  }
}

// DELETE /api/contacts/[id] - Delete contact
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB()

    const deletedContact = await Contact.findByIdAndDelete(params.id)
    
    if (!deletedContact) {
      return NextResponse.json(
        { error: 'Contact not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      message: 'Contact deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting contact:', error)
    return NextResponse.json(
      { error: 'Failed to delete contact' },
      { status: 500 }
    )
  }
}
