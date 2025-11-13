import nodemailer from 'nodemailer'

// Create transporter with robust SSL/TLS configuration
const createEmailTransporter = () => {
  const config: any = {
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    tls: {
      rejectUnauthorized: false,
      minVersion: 'TLSv1.2'
    },
    connectionTimeout: 10000, // 10 seconds
    greetingTimeout: 5000,     // 5 seconds
    socketTimeout: 10000       // 10 seconds
  }

  // Additional configuration for Gmail
  if (process.env.SMTP_HOST?.includes('gmail')) {
    config.service = 'gmail'
    delete config.host // Gmail service handles the host
  }

  return nodemailer.createTransport(config)
}

const transporter = createEmailTransporter()

interface ApplicationConfirmationData {
  applicantName: string
  applicantEmail: string
  careerTitle: string
  submittedAt: string
}

interface ApplicationStatusUpdateData {
  applicantName: string
  applicantEmail: string
  careerTitle: string
  status: 'reviewing' | 'shortlisted' | 'interviewed' | 'selected' | 'rejected'
  adminNotes?: string
}

interface CompanyNotificationData {
  applicantName: string
  applicantEmail: string
  careerTitle: string
  resumeUrl: string
}

// Email templates using GLITZFUSION design system
const getApplicationConfirmationTemplate = (data: ApplicationConfirmationData) => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Application Confirmation - GLITZFUSION Academy</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
          line-height: 1.6; 
          color: #ffffff;
          background: #0a0a0a;
          margin: 0;
          padding: 20px;
        }
        .email-container {
          max-width: 600px;
          margin: 0 auto;
          background: #0a0a0a;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
          position: relative;
        }
        .spotlight {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: radial-gradient(ellipse 400px 300px at 50% 0%, rgba(212, 175, 55, 0.1) 0%, transparent 50%);
          pointer-events: none;
        }
        .header {
          background: linear-gradient(135deg, #d4af37 0%, #f4e4a6 50%, #d4af37 100%);
          padding: 40px 30px;
          text-align: center;
          position: relative;
          z-index: 1;
        }
        .logo {
          font-size: 32px;
          font-weight: 700;
          color: #0a0a0a;
          margin-bottom: 8px;
          letter-spacing: 1px;
        }
        .tagline {
          color: rgba(10, 10, 10, 0.8);
          font-size: 16px;
          font-weight: 500;
        }
        .main-content {
          padding: 40px 30px;
          background: #0a0a0a;
          position: relative;
          z-index: 1;
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
          margin-bottom: 16px;
          padding: 8px 0;
        }
        .step-number {
          background: #60a5fa;
          color: #0a0a0a;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          font-weight: 600;
          margin-right: 16px;
          flex-shrink: 0;
        }
        .step-text {
          color: #e5e5e5;
          line-height: 1.6;
        }
        .step-title {
          font-weight: 600;
          color: #ffffff;
          margin-bottom: 4px;
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
        }
        .social-link:hover {
          color: #f4e4a6;
        }
        .footer-info {
          color: #888;
          font-size: 14px;
          line-height: 1.6;
        }
        .footer-info strong {
          color: #d4af37;
        }
        .disclaimer {
          color: #666;
          font-size: 12px;
          margin-top: 20px;
          font-style: italic;
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="spotlight"></div>
        
        <div class="header">
          <div class="logo">GLITZFUSION</div>
          <div class="tagline">Academy</div>
        </div>
        
        <div class="main-content">
          <div class="glass-panel">
            <div class="greeting">Application Received! 🎉</div>
            
            <div class="intro-text">
              Dear <strong>${data.applicantName}</strong>,
            </div>
            
            <div class="intro-text">
              Thank you for your interest in joining GLITZFUSION Academy! We have successfully received your application and are excited to review your qualifications.
            </div>
            
            <div class="application-details">
              <div class="details-title">📋 Application Summary</div>
              <div class="detail-row">
                <span class="detail-label">Position Applied:</span>
                <span class="detail-value">${data.careerTitle}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Submitted On:</span>
                <span class="detail-value">${new Date(data.submittedAt).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Application Status:</span>
                <span class="detail-value" style="color: #f59e0b;">Under Review</span>
              </div>
            </div>
            
            <div class="next-steps">
              <div class="steps-title">🚀 What Happens Next?</div>
              <ul class="steps-list">
                <li class="step-item">
                  <div class="step-number">1</div>
                  <div class="step-text">
                    <div class="step-title">Application Review</div>
                    Our HR team will carefully review your application and resume within 5-7 business days.
                  </div>
                </li>
                <li class="step-item">
                  <div class="step-number">2</div>
                  <div class="step-text">
                    <div class="step-title">Initial Screening</div>
                    If your profile matches our requirements, we'll contact you for an initial screening call.
                  </div>
                </li>
                <li class="step-item">
                  <div class="step-number">3</div>
                  <div class="step-text">
                    <div class="step-title">Interview Process</div>
                    Shortlisted candidates will be invited for interviews with our team.
                  </div>
                </li>
                <li class="step-item">
                  <div class="step-number">4</div>
                  <div class="step-text">
                    <div class="step-title">Final Decision</div>
                    We'll notify you of our decision and next steps via email.
                  </div>
                </li>
              </ul>
            </div>
            
            <div class="intro-text">
              We appreciate your patience during this process. You'll receive email updates as your application progresses through our review stages.
            </div>
          </div>
          
          <div class="contact-section">
            <div class="contact-title">📞 Need Help?</div>
            <div class="contact-info">
              <strong>Questions about your application?</strong><br>
              Email us at <strong style="color: #4ade80;">${process.env.CAREERS_EMAIL || 'careers@glitzfusion.in'}</strong><br>
              Call us at <strong>+91 (555) 123-4567</strong><br><br>
              
              <strong>Office Hours:</strong><br>
              Monday - Friday: 9:00 AM - 6:00 PM IST<br>
              Saturday: 10:00 AM - 4:00 PM IST
            </div>
          </div>
        </div>
        
        <div class="footer">
          <div class="social-links">
            <a href="https://instagram.com/glitzfusion" class="social-link">Instagram</a>
            <a href="https://facebook.com/glitzfusion" class="social-link">Facebook</a>
            <a href="https://youtube.com/@glitzfusion" class="social-link">YouTube</a>
          </div>
          
          <div class="footer-info">
            <strong>GLITZFUSION Academy</strong><br>
            Shaping the Future of Creative Arts Education<br><br>
            
            📧 ${process.env.CAREERS_EMAIL || 'careers@glitzfusion.in'}<br>
            📞 +91 (555) 123-4567<br>
            🏢 123 Creative Arts Blvd, Badlapur, Maharashtra 421503
          </div>
          
          <div class="disclaimer">
            This is an automated message. Please do not reply to this email.<br>
            For inquiries, please use the contact information provided above.
          </div>
        </div>
      </div>
    </body>
    </html>
  `
}

const getStatusUpdateTemplate = (data: ApplicationStatusUpdateData) => {
  const statusMessages = {
    reviewing: {
      title: 'Application Under Review 📋',
      message: 'Great news! Your application has moved to the review stage. Our team is currently evaluating your qualifications.',
      color: '#3B82F6',
      emoji: '📋'
    },
    shortlisted: {
      title: 'You\'ve Been Shortlisted! 🎉',
      message: 'Congratulations! You have been shortlisted for the next round. We\'ll be in touch soon to schedule your interview.',
      color: '#8B5CF6',
      emoji: '🎉'
    },
    interviewed: {
      title: 'Interview Completed ✅',
      message: 'Thank you for taking the time to interview with us. We\'re currently reviewing all candidates and will update you soon.',
      color: '#6366F1',
      emoji: '✅'
    },
    selected: {
      title: 'Congratulations - You\'re Selected! 🌟',
      message: 'We\'re excited to offer you the position! Our HR team will contact you with the offer details and next steps.',
      color: '#10B981',
      emoji: '🌟'
    },
    rejected: {
      title: 'Application Update 📝',
      message: 'Thank you for your interest in GLITZFUSION Academy. While we were impressed with your background, we\'ve decided to move forward with other candidates.',
      color: '#EF4444',
      emoji: '📝'
    }
  }

  const statusInfo = statusMessages[data.status]

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Application Status Update - GLITZFUSION Academy</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
          line-height: 1.6; 
          color: #ffffff;
          background: #0a0a0a;
          margin: 0;
          padding: 20px;
        }
        .email-container {
          max-width: 600px;
          margin: 0 auto;
          background: #0a0a0a;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
          position: relative;
        }
        .spotlight {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: radial-gradient(ellipse 400px 300px at 50% 0%, rgba(212, 175, 55, 0.1) 0%, transparent 50%);
          pointer-events: none;
        }
        .header {
          background: linear-gradient(135deg, #d4af37 0%, #f4e4a6 50%, #d4af37 100%);
          padding: 40px 30px;
          text-align: center;
          position: relative;
          z-index: 1;
        }
        .logo {
          font-size: 32px;
          font-weight: 700;
          color: #0a0a0a;
          margin-bottom: 8px;
          letter-spacing: 1px;
        }
        .tagline {
          color: rgba(10, 10, 10, 0.8);
          font-size: 16px;
          font-weight: 500;
        }
        .main-content {
          padding: 40px 30px;
          background: #0a0a0a;
          position: relative;
          z-index: 1;
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
        .status-badge {
          display: inline-block;
          padding: 12px 20px;
          border-radius: 25px;
          font-size: 14px;
          font-weight: 600;
          margin-bottom: 24px;
          background: ${statusInfo.color}20;
          color: ${statusInfo.color};
          border: 1px solid ${statusInfo.color}40;
          box-shadow: 0 4px 12px ${statusInfo.color}20;
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
        .status-specific-section {
          background: ${statusInfo.color}15;
          border: 1px solid ${statusInfo.color}30;
          border-radius: 12px;
          padding: 24px;
          margin: 24px 0;
        }
        .status-section-title {
          color: ${statusInfo.color};
          font-size: 18px;
          font-weight: 600;
          margin-bottom: 16px;
        }
        .notes-section {
          background: rgba(139, 92, 246, 0.1);
          border: 1px solid rgba(139, 92, 246, 0.2);
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
        }
        .social-link:hover {
          color: #f4e4a6;
        }
        .footer-info {
          color: #888;
          font-size: 14px;
          line-height: 1.6;
        }
        .footer-info strong {
          color: #d4af37;
        }
        .disclaimer {
          color: #666;
          font-size: 12px;
          margin-top: 20px;
          font-style: italic;
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="spotlight"></div>
        
        <div class="header">
          <div class="logo">GLITZFUSION</div>
          <div class="tagline">Academy</div>
        </div>
        
        <div class="main-content">
          <div class="glass-panel">
            <div class="status-badge">${data.status.toUpperCase().replace('_', ' ')}</div>
            <div class="greeting">${statusInfo.title}</div>
            
            <div class="intro-text">
              Dear <strong>${data.applicantName}</strong>,
            </div>
            
            <div class="intro-text">
              ${statusInfo.message}
            </div>
            
            <div class="application-details">
              <div class="details-title">📋 Application Details</div>
              <div class="detail-row">
                <span class="detail-label">Position:</span>
                <span class="detail-value">${data.careerTitle}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Current Status:</span>
                <span class="detail-value" style="color: ${statusInfo.color};">${data.status.charAt(0).toUpperCase() + data.status.slice(1).replace('_', ' ')}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Updated:</span>
                <span class="detail-value">${new Date().toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}</span>
              </div>
            </div>
            
            ${data.adminNotes ? `
              <div class="notes-section">
                <div class="notes-title">💬 Additional Information</div>
                <div class="intro-text" style="margin-bottom: 0;">
                  ${data.adminNotes}
                </div>
              </div>
            ` : ''}
            
            <div class="status-specific-section">
              <div class="status-section-title">${statusInfo.emoji} Next Steps</div>
              <div class="intro-text" style="margin-bottom: 0;">
                ${data.status === 'selected' ? `
                  <strong>Congratulations on your selection!</strong><br><br>
                  • Our HR team will contact you within 2 business days<br>
                  • You'll receive your offer letter with compensation details<br>
                  • We'll guide you through the onboarding process<br>
                  • Welcome to the GLITZFUSION family! 🎉
                ` : data.status === 'shortlisted' ? `
                  <strong>You're moving to the next round!</strong><br><br>
                  • We'll contact you within 3-5 business days to schedule your interview<br>
                  • Please keep your calendar flexible for the coming week<br>
                  • Prepare to showcase your creative skills and passion<br>
                  • We're excited to meet you in person!
                ` : data.status === 'interviewed' ? `
                  <strong>Thank you for the great interview!</strong><br><br>
                  • We're currently reviewing all candidates<br>
                  • Final decisions will be made within 1 week<br>
                  • We'll notify you regardless of the outcome<br>
                  • Thank you for your time and interest
                ` : data.status === 'reviewing' ? `
                  <strong>Your application is being reviewed!</strong><br><br>
                  • Our team is carefully evaluating your qualifications<br>
                  • This process typically takes 5-7 business days<br>
                  • We'll update you as soon as we have news<br>
                  • Thank you for your patience
                ` : data.status === 'rejected' ? `
                  <strong>Thank you for your interest in GLITZFUSION Academy.</strong><br><br>
                  • While we were impressed with your background, we've decided to move forward with other candidates<br>
                  • We encourage you to apply for future opportunities that match your skills<br>
                  • Keep developing your creative talents<br>
                  • We wish you the best in your career journey
                ` : 'We\'ll keep you updated as your application progresses.'}
              </div>
            </div>
          </div>
          
          <div class="contact-section">
            <div class="contact-title">📞 Questions?</div>
            <div class="contact-info">
              <strong>Need clarification about your application status?</strong><br>
              Email us at <strong style="color: #4ade80;">${process.env.CAREERS_EMAIL || 'careers@glitzfusion.in'}</strong><br>
              Call us at <strong>+91 (555) 123-4567</strong><br><br>
              
              <strong>Office Hours:</strong><br>
              Monday - Friday: 9:00 AM - 6:00 PM IST<br>
              Saturday: 10:00 AM - 4:00 PM IST
            </div>
          </div>
        </div>
        
        <div class="footer">
          <div class="social-links">
            <a href="https://instagram.com/glitzfusion" class="social-link">Instagram</a>
            <a href="https://facebook.com/glitzfusion" class="social-link">Facebook</a>
            <a href="https://youtube.com/@glitzfusion" class="social-link">YouTube</a>
          </div>
          
          <div class="footer-info">
            <strong>GLITZFUSION Academy</strong><br>
            Shaping the Future of Creative Arts Education<br><br>
            
            📧 ${process.env.CAREERS_EMAIL || 'careers@glitzfusion.in'}<br>
            📞 +91 (555) 123-4567<br>
            🏢 123 Creative Arts Blvd, Badlapur, Maharashtra 421503
          </div>
          
          <div class="disclaimer">
            This is an automated message. Please do not reply to this email.<br>
            For inquiries, please use the contact information provided above.
          </div>
        </div>
      </div>
    </body>
    </html>
  `
}

const getCompanyNotificationTemplate = (data: CompanyNotificationData) => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Job Application - GLITZFUSION Academy</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #FFD700;">New Job Application Received</h2>
        
        <p>A new application has been submitted for the <strong>${data.careerTitle}</strong> position.</p>
        
        <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h3>Applicant Details:</h3>
          <p><strong>Name:</strong> ${data.applicantName}</p>
          <p><strong>Email:</strong> ${data.applicantEmail}</p>
          <p><strong>Position:</strong> ${data.careerTitle}</p>
        </div>
        
        <p>
          <a href="${data.resumeUrl}" style="background: #FFD700; color: #000; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
            Download Resume
          </a>
        </p>
        
        <p>Please review the application in the admin portal: <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/applications">Admin Portal</a></p>
        
        <hr style="margin: 30px 0;">
        <p style="font-size: 12px; color: #666;">
          This is an automated notification from GLITZFUSION Academy careers system.
        </p>
      </div>
    </body>
    </html>
  `
}

// Email sending functions
export async function sendApplicationConfirmation(data: ApplicationConfirmationData) {
  try {
    const fromEmail = process.env.SMTP_FROM || 'contact@glitzfusion.in'
    const replyToEmail = process.env.CAREERS_EMAIL || 'careers@glitzfusion.in'
    
    const mailOptions = {
      from: `"GLITZFUSION Academy" <${fromEmail}>`,
      to: data.applicantEmail,
      replyTo: replyToEmail,
      subject: `Application Received - ${data.careerTitle} Position`,
      html: getApplicationConfirmationTemplate(data)
    }

    const result = await transporter.sendMail(mailOptions)
    console.log('Application confirmation email sent:', result.messageId)
    return { success: true, messageId: result.messageId }
  } catch (error) {
    console.error('Error sending application confirmation email:', error)
    return { success: false, error }
  }
}

export async function sendStatusUpdateEmail(data: ApplicationStatusUpdateData) {
  const maxRetries = 3
  let lastError: any
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`📧 Attempting to send status update email (attempt ${attempt}/${maxRetries})`)
      
      const fromEmail = process.env.SMTP_FROM || 'contact@glitzfusion.in'
      const replyToEmail = process.env.CAREERS_EMAIL || 'careers@glitzfusion.in'
      
      const mailOptions = {
        from: `"GLITZFUSION Academy" <${fromEmail}>`,
        to: data.applicantEmail,
        replyTo: replyToEmail,
        subject: `Application Update - ${data.careerTitle} Position`,
        html: getStatusUpdateTemplate(data)
      }

      // Create a fresh transporter for each retry to avoid connection issues
      const freshTransporter = attempt > 1 ? createEmailTransporter() : transporter
      
      const result = await freshTransporter.sendMail(mailOptions)
      console.log('✅ Status update email sent successfully:', result.messageId)
      return { success: true, messageId: result.messageId }
      
    } catch (error: any) {
      lastError = error
      console.error(`❌ Attempt ${attempt} failed:`, error.message)
      
      // Wait before retry (exponential backoff)
      if (attempt < maxRetries) {
        const delay = Math.pow(2, attempt) * 1000 // 2s, 4s, 8s
        console.log(`⏳ Waiting ${delay}ms before retry...`)
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
  }
  
  console.error('💥 All email attempts failed. Last error:', lastError)
  return { success: false, error: lastError }
}

export async function sendCompanyNotification(data: CompanyNotificationData) {
  try {
    const fromEmail = process.env.SMTP_FROM || 'contact@glitzfusion.in'
    const companyEmail = process.env.COMPANY_NOTIFICATION_EMAIL || process.env.CAREERS_EMAIL || 'careers@glitzfusion.in'
    
    const mailOptions = {
      from: `"GLITZFUSION Academy" <${fromEmail}>`,
      to: companyEmail,
      replyTo: 'contact@glitzfusion.in',
      subject: `New Application: ${data.careerTitle} - ${data.applicantName}`,
      html: getCompanyNotificationTemplate(data)
    }

    const result = await transporter.sendMail(mailOptions)
    console.log('Company notification email sent:', result.messageId)
    return { success: true, messageId: result.messageId }
  } catch (error) {
    console.error('Error sending company notification email:', error)
    return { success: false, error }
  }
}
