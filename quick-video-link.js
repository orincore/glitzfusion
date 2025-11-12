// Quick solution: Upload media and set videoUrl directly
require('dotenv').config({ path: '.env.local' });
const { default: fetch } = require('node-fetch');
const FormData = require('form-data');
const fs = require('fs');

async function quickVideoLink(filePath, courseId) {
  try {
    console.log('🚀 Quick video link process...');
    
    // Login
    console.log('📝 Logging in...');
    const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@glitzfusion.com',
        password: 'admin123'
      })
    });

    const loginData = await loginResponse.json();
    if (!loginResponse.ok) throw new Error(`Login failed: ${loginData.error}`);
    const token = loginData.token;
    console.log('✅ Login successful');

    // Upload media
    console.log('📤 Uploading media...');
    const formData = new FormData();
    formData.append('file', fs.createReadStream(filePath));
    formData.append('alt', 'Course video');
    formData.append('description', 'Course hero video');
    formData.append('tags', 'course,video');

    const uploadResponse = await fetch('http://localhost:3000/api/media/upload', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData,
    });

    const uploadData = await uploadResponse.json();
    if (!uploadResponse.ok) throw new Error(`Upload failed: ${uploadData.error}`);

    console.log('✅ Media uploaded successfully');
    console.log(`📎 Media URL: ${uploadData.url}`);

    // Update course with videoUrl (this should work immediately)
    console.log('🔄 Setting videoUrl in course...');
    const updatePayload = {
      videoUrl: uploadData.url
    };

    const updateResponse = await fetch(`http://localhost:3000/api/courses/${courseId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(updatePayload)
    });

    const updateData = await updateResponse.json();
    if (!updateResponse.ok) throw new Error(`Course update failed: ${updateData.error}`);

    console.log('✅ Course updated with videoUrl!');
    
    // Verify
    const verifyResponse = await fetch(`http://localhost:3000/api/courses/${courseId}`);
    const verifyData = await verifyResponse.json();
    
    console.log('📋 Course videoUrl:', verifyData.videoUrl);

    if (verifyData.videoUrl === uploadData.url) {
      console.log('🎉 SUCCESS! Video URL is set in course');
      console.log(`🔗 Check course at: http://localhost:3000/courses/${verifyData.slug}`);
      return { success: true, videoUrl: uploadData.url };
    } else {
      console.log('⚠️ VideoUrl not properly saved');
      return { success: false, error: 'VideoUrl not saved' };
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    return { success: false, error: error.message };
  }
}

// Run it
quickVideoLink(
  '/Users/orincore/Desktop/glitzfusion/public/Video assets/dancing.mp4',
  '6914bdfbc9097145b4e2713c'
).then(result => {
  if (result.success) {
    console.log('\n🎊 Done! The video should now display on the course page.');
  } else {
    console.log('\n💥 Failed:', result.error);
  }
});
