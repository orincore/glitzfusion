const mongoose = require('mongoose')

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI 

// Gallery schema (matching the model)
const GallerySchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  category: { 
    type: String, 
    required: true,
    enum: ['photo', 'video', 'artwork', 'behind-scenes', 'events'],
    default: 'photo'
  },
  mediaUrl: { type: String, required: true },
  thumbnailUrl: { type: String },
  cloudflareKey: { type: String, required: true },
  mimeType: { type: String, required: true },
  size: { type: Number, required: true },
  originalName: { type: String, required: true },
  alt: { type: String },
  tags: [{ type: String }],
  featured: { type: Boolean, default: false },
  sortOrder: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true
})

const Gallery = mongoose.models.Gallery || mongoose.model('Gallery', GallerySchema)

// Sample gallery data
const sampleGalleryItems = [
  {
    title: "Dance Performance - Contemporary Fusion",
    description: "A mesmerizing contemporary dance performance showcasing fluid movements and emotional expression.",
    category: "photo",
    mediaUrl: "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&q=80",
    thumbnailUrl: "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400&q=80",
    cloudflareKey: "sample-dance-1.jpg",
    mimeType: "image/jpeg",
    size: 245760,
    originalName: "dance-performance-1.jpg",
    alt: "Contemporary dance performance with graceful movements",
    tags: ["dance", "contemporary", "performance", "art"],
    featured: true,
    sortOrder: 1,
    isActive: true
  },
  {
    title: "Behind the Scenes - Choreography Session",
    description: "Capturing the creative process during an intensive choreography development session.",
    category: "behind-scenes",
    mediaUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80",
    thumbnailUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&q=80",
    cloudflareKey: "sample-bts-1.jpg",
    mimeType: "image/jpeg",
    size: 198432,
    originalName: "choreography-session.jpg",
    alt: "Dancers practicing choreography in studio",
    tags: ["behind-scenes", "choreography", "practice", "studio"],
    featured: true,
    sortOrder: 2,
    isActive: true
  },
  {
    title: "Annual Showcase Event",
    description: "Highlights from our spectacular annual showcase featuring students from all levels.",
    category: "events",
    mediaUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&q=80",
    thumbnailUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&q=80",
    cloudflareKey: "sample-event-1.jpg",
    mimeType: "image/jpeg",
    size: 312456,
    originalName: "annual-showcase.jpg",
    alt: "Students performing at annual showcase event",
    tags: ["event", "showcase", "performance", "students"],
    featured: true,
    sortOrder: 3,
    isActive: true
  },
  {
    title: "Digital Art Creation Process",
    description: "Time-lapse of creating digital artwork inspired by dance movements.",
    category: "artwork",
    mediaUrl: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&q=80",
    thumbnailUrl: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&q=80",
    cloudflareKey: "sample-artwork-1.jpg",
    mimeType: "image/jpeg",
    size: 267890,
    originalName: "digital-art-process.jpg",
    alt: "Digital artwork creation inspired by dance",
    tags: ["artwork", "digital", "creative", "inspiration"],
    featured: false,
    sortOrder: 4,
    isActive: true
  },
  {
    title: "Ballet Technique Masterclass",
    description: "Professional ballet instruction focusing on advanced technique and artistry.",
    category: "photo",
    mediaUrl: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&q=80",
    thumbnailUrl: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&q=80",
    cloudflareKey: "sample-ballet-1.jpg",
    mimeType: "image/jpeg",
    size: 289123,
    originalName: "ballet-masterclass.jpg",
    alt: "Ballet dancers in elegant poses during masterclass",
    tags: ["ballet", "technique", "masterclass", "elegance"],
    featured: false,
    sortOrder: 5,
    isActive: true
  },
  {
    title: "Hip-Hop Workshop Energy",
    description: "High-energy hip-hop workshop showcasing urban dance styles and creativity.",
    category: "photo",
    mediaUrl: "https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=800&q=80",
    thumbnailUrl: "https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=400&q=80",
    cloudflareKey: "sample-hiphop-1.jpg",
    mimeType: "image/jpeg",
    size: 234567,
    originalName: "hiphop-workshop.jpg",
    alt: "Dynamic hip-hop dancers in action",
    tags: ["hip-hop", "urban", "workshop", "energy"],
    featured: false,
    sortOrder: 6,
    isActive: true
  },
  {
    title: "Student Graduation Ceremony",
    description: "Celebrating our graduates as they complete their dance education journey.",
    category: "events",
    mediaUrl: "https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=800&q=80",
    thumbnailUrl: "https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=400&q=80",
    cloudflareKey: "sample-graduation-1.jpg",
    mimeType: "image/jpeg",
    size: 345678,
    originalName: "graduation-ceremony.jpg",
    alt: "Students celebrating graduation from dance program",
    tags: ["graduation", "ceremony", "achievement", "celebration"],
    featured: false,
    sortOrder: 7,
    isActive: true
  },
  {
    title: "Studio Preparation - Morning Setup",
    description: "Early morning preparation of our state-of-the-art dance studios.",
    category: "behind-scenes",
    mediaUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80",
    thumbnailUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&q=80",
    cloudflareKey: "sample-studio-1.jpg",
    mimeType: "image/jpeg",
    size: 187654,
    originalName: "studio-preparation.jpg",
    alt: "Dance studio being prepared for classes",
    tags: ["studio", "preparation", "morning", "setup"],
    featured: false,
    sortOrder: 8,
    isActive: true
  },
  {
    title: "Abstract Movement Study",
    description: "Artistic interpretation of dance movements through abstract visual art.",
    category: "artwork",
    mediaUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&q=80",
    thumbnailUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&q=80",
    cloudflareKey: "sample-abstract-1.jpg",
    mimeType: "image/jpeg",
    size: 298765,
    originalName: "abstract-movement.jpg",
    alt: "Abstract artwork inspired by dance movements",
    tags: ["abstract", "movement", "art", "interpretation"],
    featured: true,
    sortOrder: 9,
    isActive: true
  },
  {
    title: "Jazz Dance Ensemble",
    description: "Energetic jazz dance performance showcasing synchronization and style.",
    category: "photo",
    mediaUrl: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=800&q=80",
    thumbnailUrl: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=400&q=80",
    cloudflareKey: "sample-jazz-1.jpg",
    mimeType: "image/jpeg",
    size: 276543,
    originalName: "jazz-ensemble.jpg",
    alt: "Jazz dancers performing in perfect synchronization",
    tags: ["jazz", "ensemble", "synchronization", "style"],
    featured: false,
    sortOrder: 10,
    isActive: true
  }
]

async function seedGallery() {
  try {
    console.log('🌱 Starting gallery seeding...')
    
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI)
    console.log('✅ Connected to MongoDB')
    
    // Clear existing gallery data
    await Gallery.deleteMany({})
    console.log('🗑️  Cleared existing gallery data')
    
    // Insert sample data
    const insertedItems = await Gallery.insertMany(sampleGalleryItems)
    console.log(`✅ Inserted ${insertedItems.length} gallery items`)
    
    // Display summary
    const categories = await Gallery.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ])
    
    console.log('\n📊 Gallery Summary:')
    categories.forEach(cat => {
      console.log(`   ${cat._id}: ${cat.count} items`)
    })
    
    const featuredCount = await Gallery.countDocuments({ featured: true })
    console.log(`   Featured: ${featuredCount} items`)
    
    console.log('\n🎉 Gallery seeding completed successfully!')
    
  } catch (error) {
    console.error('❌ Error seeding gallery:', error)
  } finally {
    await mongoose.disconnect()
    console.log('👋 Disconnected from MongoDB')
  }
}

// Run the seeding function
if (require.main === module) {
  seedGallery()
}

module.exports = { seedGallery }
