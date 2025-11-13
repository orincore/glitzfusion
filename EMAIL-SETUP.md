# Email Configuration for GLITZFUSION Admissions

This document explains how to set up email functionality for sending admission confirmation emails.

## Overview

When a user submits an admission application, the system automatically sends a confirmation email with:
- Application details
- Next steps in the admission process
- Contact information
- Professional HTML template with GLITZFUSION branding

## SMTP Configuration

### Environment Variables

Add these variables to your `.env.local` file:

```env
# SMTP Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=contact@glitzfusion.in
```

### Gmail Setup (Recommended)

1. **Enable 2-Factor Authentication**
   - Go to your Google Account settings
   - Enable 2-factor authentication

2. **Generate App Password**
   - Go to Google Account > Security > App passwords
   - Generate a new app password for "Mail"
   - Use this password in `SMTP_PASS` (not your regular Gmail password)

3. **Configuration Values**
   ```env
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=your-gmail@gmail.com
   SMTP_PASS=your-16-character-app-password
   SMTP_FROM=contact@glitzfusion.in
   ```

### Other Email Providers

#### Outlook/Hotmail
```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_SECURE=false
```

#### Yahoo Mail
```env
SMTP_HOST=smtp.mail.yahoo.com
SMTP_PORT=587
SMTP_SECURE=false
```

#### Custom SMTP Server
```env
SMTP_HOST=mail.yourdomain.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=noreply@yourdomain.com
SMTP_PASS=your-email-password
```

## Testing Email Configuration

### Admin Panel Testing

1. Navigate to `/admin/email` in your admin dashboard
2. Check SMTP configuration status
3. Send test emails to verify functionality

### API Testing

You can also test via API endpoints:

```bash
# Check SMTP configuration
curl http://localhost:3000/api/test-email

# Send test email
curl -X POST http://localhost:3000/api/test-email \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

## Email Template

The system uses a professional HTML email template that includes:

- **GLITZFUSION branding** with gold gradient styling
- **Application details** (name, course, submission date)
- **Next steps** in the admission process
- **Contact information** for support
- **Social media links**
- **Mobile-responsive design**

## Troubleshooting

### Common Issues

1. **"Authentication failed"**
   - Verify SMTP credentials
   - For Gmail, ensure you're using App Password, not regular password
   - Check if 2FA is enabled

2. **"Connection timeout"**
   - Verify SMTP host and port
   - Check firewall settings
   - Try different ports (25, 465, 587)

3. **"Email not received"**
   - Check spam/junk folders
   - Verify recipient email address
   - Check email provider's delivery logs

### Debug Mode

Enable debug logging by adding to your environment:

```env
DEBUG_EMAIL=true
```

This will log detailed SMTP connection and sending information to the console.

## Security Considerations

1. **Never commit credentials** to version control
2. **Use App Passwords** instead of regular passwords
3. **Limit SMTP user permissions** to sending only
4. **Monitor email sending** for abuse
5. **Use environment variables** for all sensitive data

## Email Flow

1. User submits admission form
2. Application is saved to database
3. Confirmation email is generated with application details
4. Email is sent via SMTP
5. Success/failure is logged
6. User sees confirmation message

Note: If email sending fails, the admission is still saved successfully. Email failure doesn't prevent application submission.

## Customization

### Email Template

To customize the email template, edit:
- `/src/lib/email.ts` - `generateAdmissionConfirmationEmail` function

### SMTP Settings

All SMTP settings are configurable via environment variables. No code changes needed for different providers.

### From Address

Set `SMTP_FROM` to customize the sender address. This should be a valid email address from your domain.

## Production Deployment

For production, consider:

1. **Professional email service** (SendGrid, Mailgun, AWS SES)
2. **Domain-based sender address** (noreply@yourdomain.com)
3. **Email delivery monitoring**
4. **Bounce and complaint handling**
5. **Rate limiting** for email sending

## Support

If you encounter issues with email setup:

1. Check the admin panel at `/admin/email`
2. Review server logs for SMTP errors
3. Test with the API endpoints
4. Verify environment variables are loaded correctly
