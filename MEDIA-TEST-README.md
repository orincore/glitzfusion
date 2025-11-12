# Media Upload Testing Guide

This guide provides multiple ways to test the complete media upload and course creation flow.

## 🚀 Quick Start

### Option 1: Browser Console Test (Recommended)
1. Start your development server: `npm run dev`
2. Go to `http://localhost:3000/admin/login`
3. Log in with admin credentials
4. Open browser developer tools (F12)
5. Copy and paste the contents of `test-browser-media.js` into the console
6. Run `testMediaFlowInBrowser()`

### Option 2: Node.js Test Script
1. Start your development server: `npm run dev`
2. Run the test: `node test-media-simple.mjs`

### Option 3: Manual Testing
1. Go to the admin courses page
2. Click "Add Course"
3. Fill in the course details
4. Upload an image in the "Hero Media" section
5. Save the course
6. Verify the media appears correctly

## 🧪 What the Tests Verify

### Complete Flow Testing:
- ✅ Admin authentication
- ✅ Media upload to Cloudflare R2
- ✅ Media record creation in database
- ✅ Course creation with heroMedia
- ✅ HeroMedia storage in courses collection
- ✅ Media data population in API responses
- ✅ Course retrieval with media

### Key Verification Points:
1. **Media Upload**: File is uploaded to R2 and URL is returned
2. **Database Storage**: Media reference is stored in courses collection
3. **API Population**: Media data is populated when retrieving courses
4. **Frontend Display**: Media appears correctly in admin interface

## 🔍 Debugging

### Check Server Logs
The APIs now include debugging logs. Look for:
```
Creating course with data: {...}
Course saved successfully: {...}
```

### Verify Database
Check your MongoDB courses collection for the heroMedia field:
```javascript
// In MongoDB shell or Compass
db.courses.find({}, { title: 1, heroMedia: 1 })
```

### Check R2 Storage
Verify files are uploaded to your Cloudflare R2 bucket.

## 📊 Expected Results

### Successful Media Upload Response:
```json
{
  "_id": "...",
  "mediaId": "...",
  "url": "https://your-r2-domain.com/...",
  "type": "image",
  "mediaType": "image",
  "alt": "...",
  "filename": "...",
  "originalName": "...",
  "mimeType": "image/png",
  "size": 1234
}
```

### Successful Course Creation with HeroMedia:
```json
{
  "_id": "...",
  "title": "Test Course",
  "heroMedia": {
    "mediaId": "...",
    "url": "https://your-r2-domain.com/...",
    "mediaType": "image",
    "alt": "..."
  },
  // ... other course fields
}
```

## 🐛 Common Issues

### 1. "No admin token found"
- Make sure you're logged in to the admin panel
- Check localStorage for 'admin_token'

### 2. "Media upload failed"
- Verify R2 credentials in .env.local
- Check R2 bucket permissions
- Ensure bucket name is correct

### 3. "Course creation failed"
- Check server logs for validation errors
- Verify all required fields are provided
- Check heroMedia object structure

### 4. "Media not visible in database"
- This was the main issue we fixed
- Verify the Course schema includes heroMedia field
- Check that mediaType (not type) is used

## 🔧 Environment Setup

Make sure your `.env.local` includes:
```
CLOUDFLARE_R2_ACCOUNT_ID=your_account_id
CLOUDFLARE_R2_ACCESS_KEY_ID=your_access_key
CLOUDFLARE_R2_SECRET_ACCESS_KEY=your_secret_key
CLOUDFLARE_R2_BUCKET_NAME=your_bucket_name
CLOUDFLARE_R2_PUBLIC_URL=https://your-domain.com
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

## 📝 Test Files

- `test-browser-media.js` - Browser console test
- `test-media-simple.mjs` - Node.js test script
- `test-full-media-flow.js` - Comprehensive Node.js test
- `MEDIA-TEST-README.md` - This guide

## 🎯 Success Criteria

The test is successful when:
1. Media uploads without errors
2. Course is created with heroMedia object
3. Course retrieval includes populated media data
4. Media URL is accessible
5. Database contains heroMedia in courses collection

If any step fails, check the server logs and verify your environment configuration.
