import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Application, { IApplication } from '@/models/Application'
import Career from '@/models/Career'
import { uploadToR2, generateUniqueKey } from '@/lib/cloudflare-r2'
import { sendApplicationConfirmation, sendCompanyNotification } from '@/lib/email-careers'

// GET /api/applications - List applications with filtering and pagination
export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const careerId = searchParams.get('careerId')
    const status = searchParams.get('status')
    const search = searchParams.get('search')
    const sortBy = searchParams.get('sortBy') || 'submittedAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    // Build filter query
    const filter: any = {}
    if (careerId && careerId !== 'all') filter.careerId = careerId
    if (status && status !== 'all') filter.status = status
    
    if (search) {
      filter.$or = [
        { 'applicantInfo.firstName': { $regex: search, $options: 'i' } },
        { 'applicantInfo.lastName': { $regex: search, $options: 'i' } },
        { 'applicantInfo.email': { $regex: search, $options: 'i' } },
        { careerTitle: { $regex: search, $options: 'i' } }
      ]
    }

    // Calculate pagination
    const skip = (page - 1) * limit
    const sortOptions: any = {}
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1

    // Execute queries
    const [applications, total] = await Promise.all([
      Application.find(filter)
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .lean(),
      Application.countDocuments(filter)
    ])

    // Calculate stats
    const stats = await Application.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ])

    const statusStats = {
      pending: 0,
      reviewing: 0,
      shortlisted: 0,
      interviewed: 0,
      selected: 0,
      rejected: 0,
      total: total
    }

    stats.forEach((stat: any) => {
      if (stat._id in statusStats) {
        statusStats[stat._id as keyof typeof statusStats] = stat.count
      }
    })

    return NextResponse.json({
      applications,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      stats: statusStats
    })

  } catch (error) {
    console.error('Error fetching applications:', error)
    return NextResponse.json(
      { error: 'Failed to fetch applications' },
      { status: 500 }
    )
  }
}

// POST /api/applications - Submit new application
export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const formData = await request.formData()
    
    // Extract form fields
    const careerId = formData.get('careerId') as string
    const firstName = formData.get('firstName') as string
    const lastName = formData.get('lastName') as string
    const email = formData.get('email') as string
    const phone = formData.get('phone') as string
    const countryCode = formData.get('countryCode') as string
    const location = formData.get('location') as string
    const experience = formData.get('experience') as string
    const coverLetter = formData.get('coverLetter') as string
    const portfolioUrl = formData.get('portfolioUrl') as string
    const linkedinUrl = formData.get('linkedinUrl') as string
    const additionalInfo = formData.get('additionalInfo') as string
    const availableFrom = formData.get('availableFrom') as string
    const expectedSalaryAmount = formData.get('expectedSalaryAmount') as string
    const expectedSalaryCurrency = formData.get('expectedSalaryCurrency') as string
    const expectedSalaryPeriod = formData.get('expectedSalaryPeriod') as string
    
    const resumeFile = formData.get('resume') as File

    // Validate required fields
    if (!careerId || !firstName || !lastName || !email || !phone || !countryCode || !location || !experience || !resumeFile) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Get career details
    const career = await Career.findById(careerId)
    if (!career) {
      return NextResponse.json(
        { error: 'Career not found' },
        { status: 404 }
      )
    }

    if (!career.isActive) {
      return NextResponse.json(
        { error: 'This position is no longer accepting applications' },
        { status: 400 }
      )
    }

    // Validate file type and size
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    if (!allowedTypes.includes(resumeFile.type)) {
      return NextResponse.json(
        { error: 'Only PDF and Word documents are allowed for resume' },
        { status: 400 }
      )
    }

    const maxSize = 5 * 1024 * 1024 // 5MB
    if (resumeFile.size > maxSize) {
      return NextResponse.json(
        { error: 'Resume file size must be less than 5MB' },
        { status: 400 }
      )
    }

    // Upload resume to R2
    const resumeBuffer = Buffer.from(await resumeFile.arrayBuffer())
    const filename = `resumes/${careerId}/${generateUniqueKey(resumeFile.name)}`
    
    const uploadUrl = await uploadToR2(filename, resumeBuffer, resumeFile.type)

    // Create application
    const application = new Application({
      careerId,
      careerTitle: career.title,
      applicantInfo: {
        firstName,
        lastName,
        email,
        phone,
        countryCode,
        location
      },
      resume: {
        filename,
        originalName: resumeFile.name,
        url: uploadUrl,
        size: resumeFile.size,
        uploadedAt: new Date()
      },
      coverLetter: coverLetter || undefined,
      experience,
      expectedSalary: expectedSalaryAmount ? {
        amount: parseFloat(expectedSalaryAmount),
        currency: expectedSalaryCurrency || 'INR',
        period: expectedSalaryPeriod as 'hourly' | 'monthly' | 'yearly' || 'monthly'
      } : undefined,
      availableFrom: availableFrom ? new Date(availableFrom) : undefined,
      portfolioUrl: portfolioUrl || undefined,
      linkedinUrl: linkedinUrl || undefined,
      additionalInfo: additionalInfo || undefined
    })

    await application.save()

    // Send confirmation email to applicant
    try {
      await sendApplicationConfirmation({
        applicantName: `${application.applicantInfo.firstName} ${application.applicantInfo.lastName}`,
        applicantEmail: application.applicantInfo.email,
        careerTitle: application.careerTitle,
        submittedAt: application.submittedAt.toISOString()
      })
    } catch (emailError) {
      console.error('Failed to send confirmation email:', emailError)
      // Don't fail the application submission if email fails
    }

    // Send notification email to company
    try {
      await sendCompanyNotification({
        applicantName: `${application.applicantInfo.firstName} ${application.applicantInfo.lastName}`,
        applicantEmail: application.applicantInfo.email,
        careerTitle: application.careerTitle,
        resumeUrl: application.resume.url
      })
    } catch (emailError) {
      console.error('Failed to send company notification email:', emailError)
      // Don't fail the application submission if email fails
    }

    return NextResponse.json({
      message: 'Application submitted successfully',
      application: {
        _id: application._id,
        careerTitle: application.careerTitle,
        applicantName: `${application.applicantInfo.firstName} ${application.applicantInfo.lastName}`,
        status: application.status,
        submittedAt: application.submittedAt
      }
    }, { status: 201 })

  } catch (error: any) {
    console.error('Error submitting application:', error)
    
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map((err: any) => err.message)
      return NextResponse.json(
        { error: 'Validation failed', details: validationErrors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to submit application' },
      { status: 500 }
    )
  }
}
