import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Contact, { IContact } from '@/models/Contact'
import { emailService, generateContactConfirmationEmail } from '@/lib/email'

// GET /api/contacts - List contacts with filtering and pagination
export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status')
    const category = searchParams.get('category')
    const priority = searchParams.get('priority')
    const search = searchParams.get('search')
    const sortBy = searchParams.get('sortBy') || 'submittedAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    // Build filter query
    const filter: any = {}
    if (status && status !== 'all') filter.status = status
    if (category && category !== 'all') filter.category = category
    if (priority && priority !== 'all') filter.priority = priority
    
    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } },
        { message: { $regex: search, $options: 'i' } }
      ]
    }

    // Calculate pagination
    const skip = (page - 1) * limit
    const sortOptions: any = {}
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1

    // Execute queries
    const [contacts, total] = await Promise.all([
      Contact.find(filter)
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .lean(),
      Contact.countDocuments(filter)
    ])

    // Calculate stats
    const stats = await Contact.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ])

    const statusStats = {
      pending: 0,
      in_progress: 0,
      resolved: 0,
      closed: 0,
      total: total
    }

    stats.forEach((stat: any) => {
      if (stat._id in statusStats) {
        statusStats[stat._id as keyof typeof statusStats] = stat.count
      }
    })

    return NextResponse.json({
      contacts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      stats: statusStats
    })

  } catch (error) {
    console.error('Error fetching contacts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch contacts' },
      { status: 500 }
    )
  }
}

// POST /api/contacts - Create new contact
export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const data = await request.json()

    // Validate required fields
    const requiredFields = ['firstName', 'lastName', 'email', 'subject', 'message']
    for (const field of requiredFields) {
      if (!data[field]) {
        return NextResponse.json(
          { error: `${field} is required` },
          { status: 400 }
        )
      }
    }

    // Create new contact
    const contact = new Contact({
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone,
      countryCode: data.countryCode,
      subject: data.subject,
      message: data.message,
      category: data.category || 'general',
      priority: data.priority || 'medium'
    })

    await contact.save()

    // Send confirmation email
    try {
      const emailTemplate = generateContactConfirmationEmail({
        firstName: contact.firstName,
        lastName: contact.lastName,
        subject: contact.subject,
        category: contact.category,
        submissionDate: contact.submittedAt.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      })

      await emailService.sendEmail({
        to: contact.email,
        subject: emailTemplate.subject,
        html: emailTemplate.html,
        text: emailTemplate.text
      })

      console.log('✅ Contact confirmation email sent to:', contact.email)
    } catch (emailError) {
      console.error('❌ Failed to send confirmation email:', emailError)
      // Don't fail the contact creation if email fails
    }

    return NextResponse.json({
      message: 'Contact request submitted successfully',
      contact: {
        _id: contact._id,
        firstName: contact.firstName,
        lastName: contact.lastName,
        email: contact.email,
        subject: contact.subject,
        status: contact.status,
        submittedAt: contact.submittedAt
      }
    }, { status: 201 })

  } catch (error: any) {
    console.error('Error creating contact:', error)
    
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map((err: any) => err.message)
      return NextResponse.json(
        { error: 'Validation failed', details: validationErrors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create contact request' },
      { status: 500 }
    )
  }
}
