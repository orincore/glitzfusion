// Migration script to update admission status enum values
// Run this if you have existing data that needs to be migrated

const mongoose = require('mongoose')
require('dotenv').config({ path: '.env.local' })

async function migrateAdmissionStatus() {
  try {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('Connected to MongoDB')

    // Update any existing records that might have invalid status values
    const result = await mongoose.connection.db.collection('admissions').updateMany(
      { status: { $nin: ['pending', 'in_progress', 'resolved', 'closed', 'accepted', 'rejected'] } },
      { $set: { status: 'pending' } }
    )

    console.log(`Migration completed. Updated ${result.modifiedCount} records.`)
    
    // Verify the schema by creating a test document (won't save)
    const AdmissionSchema = new mongoose.Schema({
      status: { 
        type: String, 
        required: true, 
        enum: ['pending', 'in_progress', 'resolved', 'closed', 'accepted', 'rejected'],
        default: 'pending' 
      }
    })
    
    const TestAdmission = mongoose.model('TestAdmission', AdmissionSchema)
    const testDoc = new TestAdmission({ status: 'accepted' })
    await testDoc.validate()
    console.log('✅ Schema validation passed for "accepted" status')
    
    const testDoc2 = new TestAdmission({ status: 'rejected' })
    await testDoc2.validate()
    console.log('✅ Schema validation passed for "rejected" status')

  } catch (error) {
    console.error('Migration failed:', error)
  } finally {
    await mongoose.disconnect()
    console.log('Disconnected from MongoDB')
  }
}

if (require.main === module) {
  migrateAdmissionStatus()
}

module.exports = migrateAdmissionStatus
