import nodemailer from 'nodemailer'

interface EmailConfig {
  host: string
  port: number
  secure: boolean
  auth: {
    user: string
    pass: string
  }
}

interface EmailOptions {
  to: string
  subject: string
  html: string
  text?: string
}

class EmailService {
  private transporter: nodemailer.Transporter | null = null

  constructor() {
    this.initializeTransporter()
  }

  private initializeTransporter() {
    const config: EmailConfig = {
      host: process.env.SMTP_HOST || '',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASS || ''
      }
    }

    // Validate required environment variables
    if (!config.host || !config.auth.user || !config.auth.pass) {
      console.warn('SMTP configuration incomplete. Email service disabled.')
      return
    }

    try {
      this.transporter = nodemailer.createTransport(config)
    } catch (error) {
      console.error('Failed to initialize email transporter:', error)
    }
  }

  async sendEmail(options: EmailOptions): Promise<boolean> {
    if (!this.transporter) {
      console.error('Email transporter not initialized')
      return false
    }

    try {
      const mailOptions = {
        from: `"GLITZFUSION" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
        replyTo: 'contact@glitzfusion.in',
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text || this.stripHtml(options.html)
      }

      const result = await this.transporter.sendMail(mailOptions)
      console.log('Email sent successfully:', result.messageId)
      return true
    } catch (error) {
      console.error('Failed to send email:', error)
      return false
    }
  }

  private stripHtml(html: string): string {
    return html.replace(/<[^>]*>/g, '')
  }

  async verifyConnection(): Promise<boolean> {
    if (!this.transporter) {
      return false
    }

    try {
      await this.transporter.verify()
      console.log('SMTP connection verified successfully')
      return true
    } catch (error) {
      console.error('SMTP connection verification failed:', error)
      return false
    }
  }
}

// Create singleton instance
export const emailService = new EmailService()

// Email templates
export const generateAdmissionConfirmationEmail = (data: {
  firstName: string
  lastName: string
  course: string
  submissionDate: string
}) => {
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Application Received - GLITZFUSION</title>
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
          background: radial-gradient(ellipse 400px 300px at 50% 0%, rgba(212, 175, 55, 0.1) 0%, transparent 50%);
          pointer-events: none;
        }
        
        .logo {
          font-size: 32px;
          font-weight: 700;
          background: linear-gradient(135deg, #d4af37 0%, #f4e4a6 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 8px;
          position: relative;
          z-index: 1;
        }
        
        .tagline {
          color: #d4af37;
          font-size: 16px;
          font-weight: 500;
          opacity: 0.9;
          position: relative;
          z-index: 1;
        }
        
        .main-content {
          padding: 40px 30px;
          background: #0a0a0a;
        }
        
        .glass-panel {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          padding: 32px;
          margin-bottom: 24px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        }
        
        .greeting {
          font-size: 24px;
          font-weight: 600;
          color: #d4af37;
          margin-bottom: 20px;
        }
        
        .intro-text {
          font-size: 16px;
          color: #e5e5e5;
          margin-bottom: 24px;
          line-height: 1.7;
        }
        
        .application-details {
          background: rgba(212, 175, 55, 0.1);
          border: 1px solid rgba(212, 175, 55, 0.2);
          border-radius: 12px;
          padding: 24px;
          margin: 24px 0;
        }
        
        .details-title {
          color: #d4af37;
          font-size: 18px;
          font-weight: 600;
          margin-bottom: 16px;
        }
        
        .detail-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          min-height: 44px;
        }
        
        .detail-row:last-child {
          border-bottom: none;
        }
        
        .detail-label {
          color: #a0a0a0;
          font-weight: 500;
          flex: 1;
          margin-right: 16px;
        }
        
        .detail-value {
          color: #ffffff;
          font-weight: 600;
          text-align: right;
          flex-shrink: 0;
        }
        
        .status-badge {
          background: linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%);
          color: #0a0a0a;
          padding: 6px 14px;
          border-radius: 20px;
          font-size: 14px;
          font-weight: 600;
        }
        
        .next-steps {
          background: rgba(59, 130, 246, 0.1);
          border: 1px solid rgba(59, 130, 246, 0.2);
          border-radius: 12px;
          padding: 24px;
          margin: 24px 0;
        }
        
        .steps-title {
          color: #60a5fa;
          font-size: 18px;
          font-weight: 600;
          margin-bottom: 16px;
        }
        
        .steps-list {
          list-style: none;
          padding: 0;
        }
        
        .step-item {
          display: flex;
          align-items: flex-start;
          margin-bottom: 12px;
          padding: 8px 0;
        }
        
        .step-number {
          background: #60a5fa;
          color: #0a0a0a;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 600;
          margin-right: 12px;
          flex-shrink: 0;
        }
        
        .step-text {
          color: #e5e5e5;
          line-height: 1.5;
        }
        
        .step-title {
          font-weight: 600;
          color: #ffffff;
        }
        
        .contact-section {
          background: rgba(34, 197, 94, 0.1);
          border: 1px solid rgba(34, 197, 94, 0.2);
          border-radius: 12px;
          padding: 24px;
          margin: 24px 0;
        }
        
        .contact-title {
          color: #4ade80;
          font-size: 18px;
          font-weight: 600;
          margin-bottom: 16px;
        }
        
        .contact-info {
          color: #e5e5e5;
          line-height: 1.7;
        }
        
        .contact-info strong {
          color: #ffffff;
        }
        
        .footer {
          background: #1a1a1a;
          padding: 32px 30px;
          text-align: center;
          border-top: 1px solid rgba(212, 175, 55, 0.2);
        }
        
        .social-links {
          margin-bottom: 20px;
        }
        
        .social-link {
          color: #d4af37;
          text-decoration: none;
          margin: 0 12px;
          font-weight: 500;
          transition: color 0.3s ease;
        }
        
        .social-link:hover {
          color: #f4e4a6;
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
        
        /* Tablet styles */
        @media (max-width: 768px) {
          .email-container {
            margin: 0;
            max-width: 100%;
          }
          
          .header, .main-content, .footer {
            padding-left: 24px;
            padding-right: 24px;
          }
          
          .glass-panel {
            padding: 28px;
            margin-bottom: 20px;
          }
          
          .logo {
            font-size: 30px;
          }
          
          .tagline {
            font-size: 15px;
          }
          
          .greeting {
            font-size: 22px;
          }
          
          .intro-text {
            font-size: 15px;
            line-height: 1.6;
          }
          
          .details-title, .steps-title, .contact-title {
            font-size: 17px;
          }
          
          .step-item {
            margin-bottom: 16px;
          }
        }
        
        /* Mobile styles */
        @media (max-width: 640px) {
          .email-container {
            margin: 0;
            max-width: 100%;
            min-height: auto;
          }
          
          .header, .main-content, .footer {
            padding-left: 16px;
            padding-right: 16px;
          }
          
          .header {
            padding-top: 32px;
            padding-bottom: 32px;
          }
          
          .main-content {
            padding-top: 24px;
            padding-bottom: 24px;
          }
          
          .glass-panel {
            padding: 20px;
            margin-bottom: 16px;
            border-radius: 12px;
          }
          
          .logo {
            font-size: 26px;
            line-height: 1.2;
          }
          
          .tagline {
            font-size: 14px;
          }
          
          .greeting {
            font-size: 20px;
            margin-bottom: 16px;
          }
          
          .intro-text {
            font-size: 14px;
            line-height: 1.6;
            margin-bottom: 20px;
          }
          
          .application-details, .next-steps, .contact-section {
            padding: 20px;
            margin: 20px 0;
          }
          
          .details-title, .steps-title, .contact-title {
            font-size: 16px;
            margin-bottom: 12px;
          }
          
          .detail-row {
            flex-direction: column;
            align-items: flex-start;
            gap: 6px;
            padding: 12px 0;
            min-height: auto;
          }
          
          .detail-label {
            font-size: 13px;
            margin-right: 0;
          }
          
          .detail-value {
            font-size: 14px;
            text-align: left;
            font-weight: 700;
          }
          
          .status-badge {
            padding: 6px 12px;
            font-size: 13px;
            margin-top: 4px;
          }
          
          .step-item {
            margin-bottom: 16px;
            padding: 12px 0;
          }
          
          .step-number {
            width: 20px;
            height: 20px;
            font-size: 11px;
            margin-right: 10px;
          }
          
          .step-text {
            font-size: 14px;
            line-height: 1.5;
          }
          
          .step-title {
            font-size: 14px;
            font-weight: 600;
            margin-bottom: 4px;
          }
          
          .contact-info {
            font-size: 14px;
            line-height: 1.6;
          }
          
          .footer {
            padding: 24px 16px;
          }
          
          .social-links {
            margin-bottom: 16px;
          }
          
          .social-link {
            display: inline-block;
            margin: 0 8px 8px 8px;
            font-size: 14px;
          }
          
          .company-info {
            font-size: 13px;
            line-height: 1.5;
            margin-bottom: 12px;
          }
          
          .disclaimer {
            font-size: 11px;
            line-height: 1.4;
            padding-top: 12px;
          }
        }
        
        /* Small mobile styles */
        @media (max-width: 480px) {
          .header, .main-content, .footer {
            padding-left: 12px;
            padding-right: 12px;
          }
          
          .glass-panel {
            padding: 16px;
          }
          
          .logo {
            font-size: 24px;
          }
          
          .greeting {
            font-size: 18px;
          }
          
          .intro-text {
            font-size: 13px;
          }
          
          .application-details, .next-steps, .contact-section {
            padding: 16px;
          }
          
          .details-title, .steps-title, .contact-title {
            font-size: 15px;
          }
          
          .step-text, .contact-info {
            font-size: 13px;
          }
        }
        
        /* High DPI displays */
        @media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {
          .logo {
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
          }
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="header">
          <div class="logo">GLITZFUSION</div>
          <div class="tagline">Premier Creative Academy</div>
        </div>
        
        <div class="main-content">
          <div class="glass-panel">
            <div class="greeting">Hello ${data.firstName} ${data.lastName}!</div>
            
            <div class="intro-text">
              Thank you for your interest in GLITZFUSION! We're excited to confirm that we have successfully received your admission application and are thrilled about your interest in joining our creative community.
            </div>
            
            <div class="application-details">
              <div class="details-title">Application Summary</div>
              <div class="detail-row">
                <span class="detail-label">Course Applied</span>
                <span class="detail-value">${data.course}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Submission Date</span>
                <span class="detail-value">${data.submissionDate}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Application Status</span>
                <span class="status-badge">Under Review</span>
              </div>
            </div>
            
            <div class="next-steps">
              <div class="steps-title">What Happens Next?</div>
              <ul class="steps-list">
                <li class="step-item">
                  <div class="step-number">1</div>
                  <div class="step-text">
                    <div class="step-title">Application Review</div>
                    Our admissions team will carefully review your application within 2-3 business days.
                  </div>
                </li>
                <li class="step-item">
                  <div class="step-number">2</div>
                  <div class="step-text">
                    <div class="step-title">Interview Process</div>
                    If your application meets our criteria, we'll schedule a personal interview with you.
                  </div>
                </li>
                <li class="step-item">
                  <div class="step-number">3</div>
                  <div class="step-text">
                    <div class="step-title">Portfolio Assessment</div>
                    We'll evaluate any portfolio materials or work samples you've submitted.
                  </div>
                </li>
                <li class="step-item">
                  <div class="step-number">4</div>
                  <div class="step-text">
                    <div class="step-title">Final Decision</div>
                    You'll receive our admission decision via email within 5-7 business days.
                  </div>
                </li>
              </ul>
            </div>
            
            <div class="contact-section">
              <div class="contact-title">Need Assistance?</div>
              <div class="contact-info">
                If you have any questions about your application or our programs, we're here to help:
                <br><br>
                <strong>Email:</strong> contact@glitzfusion.in<br>
                <strong>Phone:</strong> +91 (555) 123-4567<br>
                <strong>Office Hours:</strong> Monday - Friday, 9:00 AM - 6:00 PM IST
              </div>
            </div>
            
            <div class="intro-text" style="margin-top: 32px; margin-bottom: 0;">
              We appreciate your patience during the review process and look forward to potentially welcoming you to the GLITZFUSION family. Your creative journey starts here!
            </div>
            
            <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid rgba(255, 255, 255, 0.1);">
              <div style="color: #a0a0a0; margin-bottom: 8px;">Best regards,</div>
              <div style="color: #d4af37; font-weight: 600; font-size: 16px;">The GLITZFUSION Admissions Team</div>
            </div>
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
            This is an automated message from GLITZFUSION. Please do not reply directly to this email.<br>
            For inquiries, please contact us at contact@glitzfusion.in<br><br>
            If you did not submit an admission application, please contact us immediately.
          </div>
        </div>
      </div>
    </body>
    </html>
  `

  return {
    subject: `Application Received - Welcome to GLITZFUSION!`,
    html,
    text: `
Dear ${data.firstName} ${data.lastName},

Thank you for your interest in GLITZFUSION! We have successfully received your admission application for the ${data.course} course.

Application Details:
- Course: ${data.course}
- Submitted: ${data.submissionDate}
- Status: Under Review

What Happens Next?
1. Review Process: Our admissions team will review your application within 2-3 business days.
2. Interview Scheduling: If your application meets our criteria, we'll contact you for a personal interview.
3. Portfolio Review: We'll assess any portfolio materials you've submitted.
4. Final Decision: You'll receive our decision via email within 5-7 business days.

Need Assistance?
Email: admissions@glitzfusion.in
Phone: +91 (555) 123-4567
Office Hours: Monday - Friday, 9:00 AM - 6:00 PM IST

We appreciate your patience and look forward to potentially welcoming you to the GLITZFUSION family!

Best regards,
The GLITZFUSION Admissions Team

GLITZFUSION
123 Creative Arts Blvd, Los Angeles, CA
www.glitzfusion.in
    `
  }
}

// Status update email template
export const generateStatusUpdateEmail = (data: {
  firstName: string
  lastName: string
  course: string
  status: 'accepted' | 'rejected' | 'pending'
  submissionDate: string
  adminNotes?: string
}) => {
  const statusConfig = {
    accepted: {
      title: 'Congratulations! Your Application Has Been Accepted',
      color: '#4ade80',
      bgColor: 'rgba(34, 197, 94, 0.1)',
      borderColor: 'rgba(34, 197, 94, 0.2)',
      message: 'We are delighted to inform you that your application has been accepted! Welcome to the GLITZFUSION family.',
      nextSteps: [
        'Complete your enrollment by paying the course fee within 7 days',
        'Attend the orientation session (details will be sent separately)',
        'Prepare for your creative journey with our welcome kit',
        'Join our student community group for updates and networking'
      ]
    },
    rejected: {
      title: 'Application Status Update',
      color: '#f87171',
      bgColor: 'rgba(239, 68, 68, 0.1)',
      borderColor: 'rgba(239, 68, 68, 0.2)',
      message: 'After careful consideration, we regret to inform you that we cannot offer you admission at this time.',
      nextSteps: [
        'Consider applying for our other courses that might be a better fit',
        'Reapply in the next admission cycle with enhanced portfolio',
        'Attend our free workshops to improve your skills',
        'Stay connected with us for future opportunities'
      ]
    },
    pending: {
      title: 'Application Status Update - Additional Information Required',
      color: '#fbbf24',
      bgColor: 'rgba(245, 158, 11, 0.1)',
      borderColor: 'rgba(245, 158, 11, 0.2)',
      message: 'Your application is currently under review. We may need additional information from you.',
      nextSteps: [
        'Check your email regularly for any requests for additional documents',
        'Be prepared for a potential interview call',
        'Keep your contact information updated',
        'Feel free to reach out if you have any questions'
      ]
    }
  }

  const config = statusConfig[data.status]
  
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${config.title} - GLITZFUSION</title>
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
          background: radial-gradient(ellipse 400px 300px at 50% 0%, rgba(212, 175, 55, 0.1) 0%, transparent 50%);
          pointer-events: none;
        }
        
        .logo {
          font-size: 32px;
          font-weight: 700;
          background: linear-gradient(135deg, #d4af37 0%, #f4e4a6 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 8px;
          position: relative;
          z-index: 1;
        }
        
        .tagline {
          color: #d4af37;
          font-size: 16px;
          font-weight: 500;
          opacity: 0.9;
          position: relative;
          z-index: 1;
        }
        
        .main-content {
          padding: 40px 30px;
          background: #0a0a0a;
        }
        
        .glass-panel {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          padding: 32px;
          margin-bottom: 24px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        }
        
        .status-header {
          text-align: center;
          margin-bottom: 32px;
        }
        
        .status-title {
          font-size: 24px;
          font-weight: 600;
          color: ${config.color};
          margin-bottom: 12px;
        }
        
        .greeting {
          font-size: 20px;
          font-weight: 600;
          color: #d4af37;
          margin-bottom: 20px;
        }
        
        .intro-text {
          font-size: 16px;
          color: #e5e5e5;
          margin-bottom: 24px;
          line-height: 1.7;
        }
        
        .status-message {
          background: ${config.bgColor};
          border: 1px solid ${config.borderColor};
          border-radius: 12px;
          padding: 24px;
          margin: 24px 0;
          text-align: center;
        }
        
        .status-message-text {
          color: #ffffff;
          font-size: 18px;
          font-weight: 500;
          line-height: 1.6;
        }
        
        .application-details {
          background: rgba(212, 175, 55, 0.1);
          border: 1px solid rgba(212, 175, 55, 0.2);
          border-radius: 12px;
          padding: 24px;
          margin: 24px 0;
        }
        
        .details-title {
          color: #d4af37;
          font-size: 18px;
          font-weight: 600;
          margin-bottom: 16px;
        }
        
        .detail-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .detail-row:last-child {
          border-bottom: none;
        }
        
        .detail-label {
          color: #a0a0a0;
          font-weight: 500;
        }
        
        .detail-value {
          color: #ffffff;
          font-weight: 600;
        }
        
        .status-badge {
          background: ${config.bgColor};
          color: ${config.color};
          border: 1px solid ${config.borderColor};
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 14px;
          font-weight: 600;
          text-transform: capitalize;
        }
        
        .next-steps {
          background: rgba(59, 130, 246, 0.1);
          border: 1px solid rgba(59, 130, 246, 0.2);
          border-radius: 12px;
          padding: 24px;
          margin: 24px 0;
        }
        
        .steps-title {
          color: #60a5fa;
          font-size: 18px;
          font-weight: 600;
          margin-bottom: 16px;
        }
        
        .steps-list {
          list-style: none;
          padding: 0;
        }
        
        .step-item {
          display: flex;
          align-items: flex-start;
          margin-bottom: 12px;
          padding: 8px 0;
        }
        
        .step-number {
          background: #60a5fa;
          color: #0a0a0a;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 600;
          margin-right: 12px;
          flex-shrink: 0;
        }
        
        .step-text {
          color: #e5e5e5;
          line-height: 1.5;
        }
        
        .admin-notes {
          background: rgba(168, 85, 247, 0.1);
          border: 1px solid rgba(168, 85, 247, 0.2);
          border-radius: 12px;
          padding: 24px;
          margin: 24px 0;
        }
        
        .notes-title {
          color: #a78bfa;
          font-size: 18px;
          font-weight: 600;
          margin-bottom: 16px;
        }
        
        .notes-text {
          color: #e5e5e5;
          line-height: 1.7;
        }
        
        .contact-section {
          background: rgba(34, 197, 94, 0.1);
          border: 1px solid rgba(34, 197, 94, 0.2);
          border-radius: 12px;
          padding: 24px;
          margin: 24px 0;
        }
        
        .contact-title {
          color: #4ade80;
          font-size: 18px;
          font-weight: 600;
          margin-bottom: 16px;
        }
        
        .contact-info {
          color: #e5e5e5;
          line-height: 1.7;
        }
        
        .contact-info strong {
          color: #ffffff;
        }
        
        .footer {
          background: #1a1a1a;
          padding: 32px 30px;
          text-align: center;
          border-top: 1px solid rgba(212, 175, 55, 0.2);
        }
        
        .social-links {
          margin-bottom: 20px;
        }
        
        .social-link {
          color: #d4af37;
          text-decoration: none;
          margin: 0 12px;
          font-weight: 500;
          transition: color 0.3s ease;
        }
        
        .social-link:hover {
          color: #f4e4a6;
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
        
        /* Tablet styles */
        @media (max-width: 768px) {
          .email-container {
            margin: 0;
            max-width: 100%;
          }
          
          .header, .main-content, .footer {
            padding-left: 24px;
            padding-right: 24px;
          }
          
          .glass-panel {
            padding: 28px;
            margin-bottom: 20px;
          }
          
          .logo {
            font-size: 30px;
          }
          
          .tagline {
            font-size: 15px;
          }
          
          .status-title {
            font-size: 22px;
          }
          
          .greeting {
            font-size: 19px;
          }
          
          .status-message-text {
            font-size: 17px;
          }
          
          .details-title, .steps-title, .contact-title, .notes-title {
            font-size: 17px;
          }
          
          .step-item {
            margin-bottom: 16px;
          }
        }
        
        /* Mobile styles */
        @media (max-width: 640px) {
          .email-container {
            margin: 0;
            max-width: 100%;
            min-height: auto;
          }
          
          .header, .main-content, .footer {
            padding-left: 16px;
            padding-right: 16px;
          }
          
          .header {
            padding-top: 32px;
            padding-bottom: 32px;
          }
          
          .main-content {
            padding-top: 24px;
            padding-bottom: 24px;
          }
          
          .glass-panel {
            padding: 20px;
            margin-bottom: 16px;
            border-radius: 12px;
          }
          
          .logo {
            font-size: 26px;
            line-height: 1.2;
          }
          
          .tagline {
            font-size: 14px;
          }
          
          .status-header {
            margin-bottom: 24px;
          }
          
          .status-title {
            font-size: 20px;
            margin-bottom: 8px;
          }
          
          .greeting {
            font-size: 18px;
            margin-bottom: 16px;
          }
          
          .status-message {
            padding: 20px;
            margin: 20px 0;
          }
          
          .status-message-text {
            font-size: 16px;
            line-height: 1.5;
          }
          
          .application-details, .next-steps, .contact-section, .admin-notes {
            padding: 20px;
            margin: 20px 0;
          }
          
          .details-title, .steps-title, .contact-title, .notes-title {
            font-size: 16px;
            margin-bottom: 12px;
          }
          
          .detail-row {
            flex-direction: column;
            align-items: flex-start;
            gap: 6px;
            padding: 12px 0;
            min-height: auto;
          }
          
          .detail-label {
            font-size: 13px;
            margin-right: 0;
          }
          
          .detail-value {
            font-size: 14px;
            text-align: left;
            font-weight: 700;
          }
          
          .status-badge {
            padding: 6px 12px;
            font-size: 13px;
            margin-top: 4px;
          }
          
          .step-item {
            margin-bottom: 16px;
            padding: 12px 0;
          }
          
          .step-number {
            width: 20px;
            height: 20px;
            font-size: 11px;
            margin-right: 10px;
          }
          
          .step-text {
            font-size: 14px;
            line-height: 1.5;
          }
          
          .notes-text, .contact-info {
            font-size: 14px;
            line-height: 1.6;
          }
          
          .footer {
            padding: 24px 16px;
          }
          
          .social-links {
            margin-bottom: 16px;
          }
          
          .social-link {
            display: inline-block;
            margin: 0 8px 8px 8px;
            font-size: 14px;
          }
          
          .company-info {
            font-size: 13px;
            line-height: 1.5;
            margin-bottom: 12px;
          }
          
          .disclaimer {
            font-size: 11px;
            line-height: 1.4;
            padding-top: 12px;
          }
        }
        
        /* Small mobile styles */
        @media (max-width: 480px) {
          .header, .main-content, .footer {
            padding-left: 12px;
            padding-right: 12px;
          }
          
          .glass-panel {
            padding: 16px;
          }
          
          .logo {
            font-size: 24px;
          }
          
          .status-title {
            font-size: 18px;
          }
          
          .greeting {
            font-size: 16px;
          }
          
          .status-message-text {
            font-size: 15px;
          }
          
          .application-details, .next-steps, .contact-section, .admin-notes {
            padding: 16px;
          }
          
          .details-title, .steps-title, .contact-title, .notes-title {
            font-size: 15px;
          }
          
          .step-text, .notes-text, .contact-info {
            font-size: 13px;
          }
        }
        
        /* High DPI displays */
        @media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {
          .logo {
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
          }
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="header">
          <div class="logo">GLITZFUSION</div>
          <div class="tagline">Premier Creative Academy</div>
        </div>
        
        <div class="main-content">
          <div class="glass-panel">
            <div class="status-header">
              <div class="status-title">${config.title}</div>
            </div>
            
            <div class="greeting">Dear ${data.firstName} ${data.lastName},</div>
            
            <div class="status-message">
              <div class="status-message-text">${config.message}</div>
            </div>
            
            <div class="application-details">
              <div class="details-title">Application Details</div>
              <div class="detail-row">
                <span class="detail-label">Course Applied</span>
                <span class="detail-value">${data.course}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Original Submission</span>
                <span class="detail-value">${data.submissionDate}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Current Status</span>
                <span class="status-badge">${data.status}</span>
              </div>
            </div>
            
            ${data.adminNotes ? `
            <div class="admin-notes">
              <div class="notes-title">Additional Information</div>
              <div class="notes-text">${data.adminNotes}</div>
            </div>
            ` : ''}
            
            <div class="next-steps">
              <div class="steps-title">Next Steps</div>
              <ul class="steps-list">
                ${config.nextSteps.map((step, index) => `
                <li class="step-item">
                  <div class="step-number">${index + 1}</div>
                  <div class="step-text">${step}</div>
                </li>
                `).join('')}
              </ul>
            </div>
            
            <div class="contact-section">
              <div class="contact-title">Questions or Concerns?</div>
              <div class="contact-info">
                Our admissions team is here to help you with any questions:
                <br><br>
                <strong>Email:</strong> contact@glitzfusion.in<br>
                <strong>Phone:</strong> +91 (555) 123-4567<br>
                <strong>Office Hours:</strong> Monday - Friday, 9:00 AM - 6:00 PM IST
              </div>
            </div>
            
            <div class="intro-text" style="margin-top: 32px; margin-bottom: 0;">
              ${data.status === 'accepted' 
                ? 'We are excited to have you join our creative community and look forward to seeing your artistic journey unfold!'
                : data.status === 'rejected'
                ? 'We encourage you to continue pursuing your creative passions and hope to see you apply again in the future.'
                : 'We appreciate your patience as we complete the review process.'
              }
            </div>
            
            <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid rgba(255, 255, 255, 0.1);">
              <div style="color: #a0a0a0; margin-bottom: 8px;">Best regards,</div>
              <div style="color: #d4af37; font-weight: 600; font-size: 16px;">The GLITZFUSION Admissions Team</div>
            </div>
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
            This is an automated message from GLITZFUSION. Please do not reply directly to this email.<br>
            For inquiries, please contact us at contact@glitzfusion.in<br><br>
            If you believe you received this email in error, please contact us immediately.
          </div>
        </div>
      </div>
    </body>
    </html>
  `

  return {
    subject: `${config.title} - GLITZFUSION`,
    html,
    text: `
Dear ${data.firstName} ${data.lastName},

${config.message}

Application Details:
- Course Applied: ${data.course}
- Original Submission: ${data.submissionDate}
- Current Status: ${data.status.toUpperCase()}

${data.adminNotes ? `Additional Information: ${data.adminNotes}` : ''}

Next Steps:
${config.nextSteps.map((step, index) => `${index + 1}. ${step}`).join('\n')}

Questions or Concerns?
Email: contact@glitzfusion.in
Phone: +91 (555) 123-4567
Office Hours: Monday - Friday, 9:00 AM - 6:00 PM IST

${data.status === 'accepted' 
  ? 'We are excited to have you join our creative community!'
  : data.status === 'rejected'
  ? 'We encourage you to continue pursuing your creative passions.'
  : 'We appreciate your patience as we complete the review process.'
}

Best regards,
The GLITZFUSION Admissions Team

GLITZFUSION
Premier Creative Arts Institute
www.glitzfusion.in
    `
  }
}
