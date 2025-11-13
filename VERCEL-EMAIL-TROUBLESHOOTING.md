# Vercel Email Troubleshooting Guide

## 🚨 Common Issues & Solutions

### 1. **Environment Variables Not Set Properly**

**Check Vercel Dashboard:**
1. Go to your Vercel project dashboard
2. Navigate to Settings → Environment Variables
3. Ensure ALL these variables are set:

```env
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-brevo-email@domain.com
SMTP_PASS=your-brevo-smtp-key
SMTP_FROM=contact@glitzfusion.in
```

**Important Notes:**
- Use your **SMTP key** (not your login password) for `SMTP_PASS`
- Set environment variables for **Production**, **Preview**, and **Development**
- Redeploy after adding/changing environment variables

### 2. **Brevo SMTP Configuration**

**Correct Brevo Settings:**
```env
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_SECURE=false
```

**Get Your SMTP Credentials:**
1. Login to Brevo dashboard
2. Go to SMTP & API → SMTP
3. Create new SMTP key if needed
4. Use the generated key as `SMTP_PASS`

### 3. **Domain Authentication**

**Verify Sender Domain:**
1. In Brevo, go to Senders & IP
2. Add and verify your domain `glitzfusion.in`
3. Set up SPF, DKIM records as instructed
4. Use verified sender email in `SMTP_FROM`

### 4. **Vercel Function Timeout**

**Check Function Limits:**
- Vercel Hobby: 10s timeout
- Vercel Pro: 60s timeout
- Email sending should complete within timeout

### 5. **Testing Steps**

**Step 1: Test Locally**
```bash
npm run dev
# Test email functionality locally first
```

**Step 2: Test on Vercel**
1. Deploy to Vercel
2. Go to `/admin/email` page
3. Use the email test panel
4. Check Vercel function logs

**Step 3: Use Production Test Endpoint**
```bash
curl -X POST https://your-app.vercel.app/api/test-email-production \
  -H "Content-Type: application/json" \
  -d '{"testEmail":"your-email@example.com"}'
```

### 6. **Debugging with Logs**

**View Vercel Logs:**
1. Go to Vercel Dashboard → Functions
2. Click on your deployment
3. Check function logs for email errors
4. Look for detailed error messages

**Enhanced Logging Added:**
- ✅ SMTP connection verification
- ✅ Environment variable checking
- ✅ Detailed error reporting
- ✅ Email sending confirmation

### 7. **Common Error Messages**

**"SMTP connection failed"**
- Check SMTP credentials
- Verify Brevo service status
- Ensure correct host/port

**"Authentication failed"**
- Wrong SMTP password (use SMTP key)
- Incorrect username
- Account suspended

**"Sender not verified"**
- Domain not verified in Brevo
- Using unverified sender email
- SPF/DKIM records missing

**"Function timeout"**
- SMTP server slow response
- Network connectivity issues
- Upgrade Vercel plan if needed

### 8. **Verification Checklist**

- [ ] All environment variables set in Vercel
- [ ] Brevo SMTP key generated and used
- [ ] Domain verified in Brevo
- [ ] SPF/DKIM records configured
- [ ] Sender email matches verified domain
- [ ] Test endpoint returns success
- [ ] Function logs show no errors
- [ ] Email appears in Brevo activity log

### 9. **Alternative Solutions**

**If Brevo doesn't work:**
1. **Resend.com** - Developer-friendly
2. **SendGrid** - Reliable service
3. **Amazon SES** - Cost-effective
4. **Mailgun** - Good for transactional emails

**Quick Resend.com Setup:**
```env
SMTP_HOST=smtp.resend.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=resend
SMTP_PASS=your-resend-api-key
SMTP_FROM=contact@glitzfusion.in
```

### 10. **Production Deployment Steps**

1. **Set Environment Variables**
2. **Deploy to Vercel**
3. **Test Email Endpoint**: `/api/test-email-production`
4. **Check Function Logs**
5. **Verify Email Delivery**
6. **Test Admission Flow**

## 🔧 Quick Fix Commands

**Redeploy with Environment Variables:**
```bash
vercel --prod
```

**Test Production Email:**
```bash
curl -X POST https://glitzfusion.vercel.app/api/test-email-production \
  -H "Content-Type: application/json" \
  -d '{"testEmail":"test@example.com"}'
```

**Check Logs:**
```bash
vercel logs --follow
```

## 📞 Support

If issues persist:
1. Check Brevo status page
2. Contact Brevo support
3. Try alternative email service
4. Check Vercel community forums

---

**Last Updated:** November 2024
**Status:** Production Ready ✅
