import { NextRequest, NextResponse } from 'next/server'
import { emailService, generateAdmissionConfirmationEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    console.log('🧪 Production Email Test Started')
    
    // Get test email from request body
    const { testEmail } = await request.json()
    
    if (!testEmail) {
      return NextResponse.json(
        { error: 'Test email address is required' },
        { status: 400 }
      )
    }

    console.log('📧 Testing email to:', testEmail)

    // Check environment variables
    const envCheck = {
      SMTP_HOST: process.env.SMTP_HOST,
      SMTP_PORT: process.env.SMTP_PORT,
      SMTP_SECURE: process.env.SMTP_SECURE,
      SMTP_USER: process.env.SMTP_USER ? 'SET' : 'MISSING',
      SMTP_PASS: process.env.SMTP_PASS ? 'SET' : 'MISSING',
      SMTP_FROM: process.env.SMTP_FROM
    }
    
    console.log('🔧 Environment check:', envCheck)

    // Test connection first
    console.log('🔍 Testing SMTP connection...')
    const connectionTest = await emailService.verifyConnection()
    console.log('Connection test result:', connectionTest)

    if (!connectionTest) {
      return NextResponse.json({
        success: false,
        error: 'SMTP connection failed',
        envCheck,
        logs: 'Check server logs for detailed error information'
      }, { status: 500 })
    }

    // Generate test email
    const emailTemplate = generateAdmissionConfirmationEmail({
      firstName: 'Test',
      lastName: 'User',
      course: 'Filmmaking Masterclass',
      submissionDate: new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    })

    // Send test email
    console.log('📤 Sending test email...')
    const emailSent = await emailService.sendEmail({
      to: testEmail,
      subject: `[TEST] ${emailTemplate.subject}`,
      html: emailTemplate.html,
      text: emailTemplate.text
    })

    if (emailSent) {
      console.log('✅ Test email sent successfully!')
      return NextResponse.json({
        success: true,
        message: 'Test email sent successfully!',
        testEmail,
        envCheck: {
          ...envCheck,
          SMTP_USER: envCheck.SMTP_USER,
          SMTP_PASS: envCheck.SMTP_PASS
        }
      })
    } else {
      console.log('❌ Test email failed to send')
      return NextResponse.json({
        success: false,
        error: 'Failed to send test email',
        testEmail,
        envCheck,
        logs: 'Check server logs for detailed error information'
      }, { status: 500 })
    }

  } catch (error: any) {
    console.error('❌ Production email test error:', error)
    return NextResponse.json({
      success: false,
      error: 'Email test failed',
      details: error?.message || 'Unknown error',
      logs: 'Check server logs for detailed error information'
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Production Email Test Endpoint',
    usage: 'POST with { "testEmail": "your-email@example.com" }',
    environment: process.env.NODE_ENV
  })
}
