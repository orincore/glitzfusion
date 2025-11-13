// Auto-approve all pending testimonials script
// Run this script with: node scripts/auto-approve-testimonials.js

const { MongoClient } = require('mongodb')

async function autoApproveTestimonials() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/glitzfusion'
  
  if (!uri) {
    console.error('❌ MONGODB_URI environment variable is required')
    process.exit(1)
  }

  const client = new MongoClient(uri)

  try {
    console.log('🔄 Connecting to MongoDB...')
    await client.connect()
    
    const db = client.db()
    const collection = db.collection('testimonials')

    console.log('🔍 Finding pending testimonials...')
    const pendingCount = await collection.countDocuments({ status: 'pending' })
    console.log(`📊 Found ${pendingCount} pending testimonials`)

    if (pendingCount === 0) {
      console.log('✅ No pending testimonials to approve')
      return
    }

    console.log('✅ Approving all pending testimonials...')
    const result = await collection.updateMany(
      { status: 'pending' },
      {
        $set: {
          status: 'approved',
          isPublished: true,
          publishedAt: new Date()
        }
      }
    )

    console.log(`🎉 Successfully approved ${result.modifiedCount} testimonials`)
    console.log(`📈 ${result.modifiedCount} testimonials are now published and visible on the website`)

  } catch (error) {
    console.error('❌ Error auto-approving testimonials:', error)
    process.exit(1)
  } finally {
    await client.close()
    console.log('🔌 Database connection closed')
  }
}

// Run the script
if (require.main === module) {
  autoApproveTestimonials()
    .then(() => {
      console.log('✨ Auto-approval completed successfully!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('💥 Script failed:', error)
      process.exit(1)
    })
}

module.exports = { autoApproveTestimonials }
