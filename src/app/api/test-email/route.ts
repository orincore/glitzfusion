import { NextRequest, NextResponse } from 'next/server'
import { emailService, generateAdmissionConfirmationEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()
    
    if (!email) {
      return NextResponse.json(
        { error: 'Email address is required' },
        { status: 400 }
      )
    }
    
    // Verify SMTP connection first
    const isConnected = await emailService.verifyConnection()
    if (!isConnected) {
      return NextResponse.json(
        { error: 'SMTP configuration is invalid or connection failed' },
        { status: 500 }
      )
    }
    
    // Generate test email
    const emailTemplate = generateAdmissionConfirmationEmail({
      firstName: 'Test',
      lastName: 'User',
      course: 'Acting',
      submissionDate: new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    })
    
    // Send test email
    const emailSent = await emailService.sendEmail({
      to: email,
      subject: '[TEST] ' + emailTemplate.subject,
      html: emailTemplate.html,
      text: emailTemplate.text
    })
    
    if (emailSent) {
      return NextResponse.json({
        message: 'Test email sent successfully',
        recipient: email
      })
    } else {
      return NextResponse.json(
        { error: 'Failed to send test email' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Test email error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    // Check SMTP configuration
    const isConnected = await emailService.verifyConnection()
    
    return NextResponse.json({
      smtpConfigured: !!process.env.SMTP_HOST && !!process.env.SMTP_USER && !!process.env.SMTP_PASS,
      smtpConnected: isConnected,
      config: {
        host: process.env.SMTP_HOST || 'Not configured',
        port: process.env.SMTP_PORT || 'Not configured',
        user: process.env.SMTP_USER || 'Not configured',
        from: process.env.SMTP_FROM || process.env.SMTP_USER || 'Not configured'
      }
    })
  } catch (error) {
    console.error('SMTP check error:', error)
    return NextResponse.json(
      { error: 'Failed to check SMTP configuration' },
      { status: 500 }
    )
  }
}
