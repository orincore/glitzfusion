import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Admission from '@/models/Admission'
import { emailService, generateAdmissionConfirmationEmail } from '@/lib/email'
import { requireAdminAuth } from '@/lib/adminAuth'

export async function GET(request: NextRequest) {
  // Protect admin routes
  const authResult = await requireAdminAuth(request)
  if ('error' in authResult) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status }
    )
  }
  try {
    await dbConnect()
    
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status')
    const course = searchParams.get('course')
    const sortBy = searchParams.get('sortBy') || 'submittedAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'
    
    // Build filter query
    const filter: any = {}
    if (status && status !== 'all') {
      filter.status = status
    }
    if (course && course !== 'all') {
      filter.course = course
    }
    
    // Calculate pagination
    const skip = (page - 1) * limit
    
    // Build sort object
    const sort: any = {}
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1
    
    // Get admissions with pagination
    const admissions = await Admission.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean()
    
    // Get total count for pagination
    const total = await Admission.countDocuments(filter)
    
    // Get status counts for dashboard
    const statusCounts = await Admission.aggregate([
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
    
    statusCounts.forEach(item => {
      statusStats[item._id as keyof typeof statusStats] = item.count
    })
    
    return NextResponse.json({
      admissions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      statusStats
    })
  } catch (error) {
    console.error('Error fetching admissions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch admissions' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect()
    
    const body = await request.json()
    
    // Validate required fields
    const requiredFields = [
      'firstName', 'lastName', 'email', 'phone', 'age', 
      'gender', 'location', 'course', 'experience', 
      'motivation', 'availability', 'emergencyContact'
    ]
    
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        )
      }
    }
    
    // Check if email already exists
    const existingAdmission = await Admission.findOne({ email: body.email })
    if (existingAdmission) {
      return NextResponse.json(
        { error: 'An admission request with this email already exists' },
        { status: 409 }
      )
    }
    
    // Create new admission
    const admission = new Admission(body)
    await admission.save()
    
    // Send confirmation email
    try {
      const emailTemplate = generateAdmissionConfirmationEmail({
        firstName: admission.firstName,
        lastName: admission.lastName,
        course: admission.course,
        submissionDate: new Date(admission.submittedAt).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      })
      
      await emailService.sendEmail({
        to: admission.email,
        subject: emailTemplate.subject,
        html: emailTemplate.html,
        text: emailTemplate.text
      })
      
      console.log(`Confirmation email sent to ${admission.email}`)
    } catch (emailError) {
      console.error('Failed to send confirmation email:', emailError)
      // Don't fail the admission submission if email fails
    }
    
    return NextResponse.json(
      { 
        message: 'Admission request submitted successfully. A confirmation email has been sent to your email address.',
        admission: admission.toObject()
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating admission:', error)
    return NextResponse.json(
      { error: 'Failed to submit admission request' },
      { status: 500 }
    )
  }
}
