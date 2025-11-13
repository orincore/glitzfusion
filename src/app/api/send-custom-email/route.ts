import { NextRequest, NextResponse } from 'next/server'
import { emailService } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const { to, subject, message } = await request.json()

    // Validate required fields
    if (!to || !subject || !message) {
      return NextResponse.json(
        { error: 'Missing required fields: to, subject, message' },
        { status: 400 }
      )
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(to)) {
      return NextResponse.json(
        { error: 'Invalid email address format' },
        { status: 400 }
      )
    }

    console.log('📧 Sending custom email to:', to)

    // Generate professional HTML email template
    const htmlTemplate = generateCustomEmailTemplate({
      subject,
      message,
      recipientEmail: to
    })

    // Send the email
    const emailSent = await emailService.sendEmail({
      to,
      subject: `${subject} - GLITZFUSION`,
      html: htmlTemplate,
      text: `
Dear Recipient,

${message}

Best regards,
The GLITZFUSION Team

---
GLITZFUSION
Premier Creative Arts Institute
Email: contact@glitzfusion.in
Website: www.glitzfusion.in

This is an official communication from GLITZFUSION. If you have any questions, please contact us at contact@glitzfusion.in
      `
    })

    if (emailSent) {
      console.log('✅ Custom email sent successfully to:', to)
      return NextResponse.json({
        success: true,
        message: 'Custom email sent successfully!',
        recipient: to
      })
    } else {
      console.log('❌ Failed to send custom email to:', to)
      return NextResponse.json({
        success: false,
        error: 'Failed to send email'
      }, { status: 500 })
    }

  } catch (error: any) {
    console.error('❌ Custom email API error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error?.message || 'Unknown error'
    }, { status: 500 })
  }
}

function generateCustomEmailTemplate(data: {
  subject: string
  message: string
  recipientEmail: string
}): string {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${data.subject} - GLITZFUSION</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          line-height: 1.6;
          color: #ffffff;
          background: #0a0a0a;
          margin: 0;
          padding: 0;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }
        
        .email-container {
          max-width: 600px;
          margin: 0 auto;
          background: #0a0a0a;
          min-height: 100vh;
        }
        
        .header {
          background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%);
          padding: 40px 30px;
          text-align: center;
          border-bottom: 1px solid rgba(212, 175, 55, 0.2);
          position: relative;
        }
        
        .header::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: radial-gradient(circle at 50% 50%, rgba(212, 175, 55, 0.1) 0%, transparent 70%);
          pointer-events: none;
        }
        
        .logo {
          font-size: 32px;
          font-weight: 800;
          background: linear-gradient(135deg, #d4af37 0%, #f4d03f 50%, #d4af37 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 8px;
          position: relative;
          z-index: 1;
        }
        
        .tagline {
          color: #a0a0a0;
          font-size: 16px;
          position: relative;
          z-index: 1;
        }
        
        .main-content {
          padding: 40px 30px;
        }
        
        .glass-panel {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          padding: 32px;
          margin-bottom: 24px;
        }
        
        .greeting {
          font-size: 24px;
          font-weight: 600;
          color: #ffffff;
          margin-bottom: 24px;
        }
        
        .message-content {
          font-size: 16px;
          color: #e5e5e5;
          line-height: 1.7;
          margin-bottom: 24px;
          white-space: pre-wrap;
        }
        
        .footer {
          background: rgba(255, 255, 255, 0.02);
          padding: 32px 30px;
          text-align: center;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .social-links {
          margin-bottom: 20px;
        }
        
        .social-link {
          display: inline-block;
          margin: 0 12px;
          color: #d4af37;
          text-decoration: none;
          font-size: 14px;
          transition: color 0.3s ease;
        }
        
        .social-link:hover {
          color: #f4d03f;
        }
        
        .company-info {
          color: #a0a0a0;
          font-size: 14px;
          line-height: 1.6;
          margin-bottom: 16px;
        }
        
        .disclaimer {
          color: #666666;
          font-size: 12px;
          line-height: 1.5;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          padding-top: 16px;
        }

        @media (max-width: 640px) {
          .email-container {
            margin: 0;
            max-width: 100%;
          }
          
          .header, .main-content, .footer {
            padding-left: 16px;
            padding-right: 16px;
          }
          
          .glass-panel {
            padding: 20px;
          }
          
          .logo {
            font-size: 26px;
          }
          
          .greeting {
            font-size: 20px;
          }
          
          .message-content {
            font-size: 14px;
          }
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="header">
          <div class="logo">GLITZFUSION</div>
          <div class="tagline">Premier Creative Arts Institute</div>
        </div>
        
        <div class="main-content">
          <div class="glass-panel">
            <div class="greeting">Hello!</div>
            
            <div class="message-content">${data.message}</div>
          </div>
        </div>
        
        <div class="footer">
          <div class="social-links">
            <a href="https://instagram.com/glitzfusion" class="social-link">Instagram</a>
            <a href="https://facebook.com/glitzfusion" class="social-link">Facebook</a>
            <a href="https://youtube.com/@glitzfusion" class="social-link">YouTube</a>
          </div>
          
          <div class="company-info">
            <strong style="color: #d4af37;">GLITZFUSION</strong><br>
            Premier Creative Arts Institute<br>
            <a href="https://glitzfusion.in" style="color: #d4af37; text-decoration: none;">www.glitzfusion.in</a>
          </div>
          
          <div class="disclaimer">
            This is an official communication from GLITZFUSION. Please do not reply directly to this email.<br>
            For inquiries, please contact us at contact@glitzfusion.in<br><br>
            You are receiving this email because it was sent to you by a GLITZFUSION administrator.
          </div>
        </div>
      </div>
    </body>
    </html>
  `
}

export async function GET() {
  return NextResponse.json({
    message: 'Custom Email Sender API',
    usage: 'POST with { "to": "email@example.com", "subject": "Subject", "message": "Message content" }',
    environment: process.env.NODE_ENV
  })
}
