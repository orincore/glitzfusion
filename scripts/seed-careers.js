// Script to seed career opportunities for GLITZFUSION Academy
// Run with: node scripts/seed-careers.js

const { MongoClient } = require('mongodb')

const careers = [
  {
    title: 'Professional Photographer',
    department: 'Creative Arts',
    location: 'Badlapur, Maharashtra, India',
    type: 'full-time',
    experience: '2-5 years',
    description: 'Join GLITZFUSION Academy as a Professional Photographer and help capture the creative journey of our students. You will be responsible for photography instruction, portfolio shoots, and documenting academy events.',
    responsibilities: [
      'Teach photography fundamentals and advanced techniques to students',
      'Conduct portrait, fashion, and commercial photography sessions',
      'Guide students in building professional photography portfolios',
      'Organize and lead photography workshops and masterclasses',
      'Maintain and manage photography equipment and studio setups',
      'Collaborate with other departments for cross-disciplinary projects',
      'Document academy events, performances, and student achievements'
    ],
    requirements: [
      'Bachelor\'s degree in Photography, Visual Arts, or related field',
      'Minimum 2 years of professional photography experience',
      'Proficiency in Adobe Creative Suite (Photoshop, Lightroom, Premiere Pro)',
      'Experience with various camera systems and lighting equipment',
      'Strong portfolio demonstrating versatility in different photography styles',
      'Excellent communication and teaching skills',
      'Knowledge of current photography trends and techniques'
    ],
    qualifications: [
      'Professional certification in photography',
      'Experience in fashion or entertainment photography',
      'Previous teaching or mentoring experience',
      'Knowledge of video production and editing',
      'Social media and digital marketing knowledge'
    ],
    benefits: [
      'Competitive salary with performance incentives',
      'Health insurance and medical benefits',
      'Professional development opportunities',
      'Access to latest photography equipment',
      'Creative freedom in curriculum development',
      'Networking opportunities in entertainment industry',
      'Annual bonus based on student success rates'
    ],
    salary: {
      min: 300000,
      max: 600000,
      currency: 'INR',
      period: 'yearly'
    },
    isActive: true,
    isFeatured: true,
    postedBy: 'HR Team'
  },
  {
    title: 'Acting Instructor',
    department: 'Performing Arts',
    location: 'Badlapur, Maharashtra, India',
    type: 'full-time',
    experience: '3-7 years',
    description: 'We are seeking an experienced Acting Instructor to join our performing arts faculty. You will train aspiring actors in various acting techniques, scene study, and performance skills while helping them develop their craft for film, television, and theater.',
    responsibilities: [
      'Teach acting fundamentals including method acting, improvisation, and scene study',
      'Conduct audition preparation and performance coaching sessions',
      'Develop and implement comprehensive acting curriculum',
      'Direct student performances and showcases',
      'Provide individual coaching and feedback to students',
      'Organize workshops with industry professionals',
      'Assess student progress and provide constructive feedback'
    ],
    requirements: [
      'Bachelor\'s or Master\'s degree in Theatre Arts, Drama, or Performing Arts',
      'Minimum 3 years of professional acting experience',
      'Previous teaching or coaching experience preferred',
      'Strong knowledge of various acting techniques (Stanislavski, Meisner, etc.)',
      'Experience in film, television, or theater productions',
      'Excellent verbal communication and interpersonal skills',
      'Ability to work with students of different skill levels'
    ],
    qualifications: [
      'Professional acting credits in films, TV shows, or theater',
      'Certification in acting coaching or drama education',
      'Experience with camera acting and on-set procedures',
      'Knowledge of script analysis and character development',
      'Industry connections and networking experience'
    ],
    benefits: [
      'Competitive salary package',
      'Health and wellness benefits',
      'Professional development support',
      'Opportunity to work with talented students',
      'Industry networking opportunities',
      'Performance-based incentives',
      'Creative project collaboration opportunities'
    ],
    salary: {
      min: 350000,
      max: 700000,
      currency: 'INR',
      period: 'yearly'
    },
    isActive: true,
    isFeatured: true,
    postedBy: 'HR Team'
  },
  {
    title: 'Music Instructor & Composer',
    department: 'Music & Audio',
    location: 'Badlapur, Maharashtra, India',
    type: 'full-time',
    experience: '2-6 years',
    description: 'Join our music department as a Music Instructor & Composer. You will teach various musical instruments, music theory, and composition while helping students develop their musical talents for the entertainment industry.',
    responsibilities: [
      'Teach music theory, composition, and instrument techniques',
      'Conduct individual and group music lessons',
      'Compose original music for student projects and performances',
      'Organize music workshops and masterclasses',
      'Prepare students for music examinations and competitions',
      'Collaborate on multimedia projects requiring original scores',
      'Maintain and care for musical instruments and equipment'
    ],
    requirements: [
      'Bachelor\'s degree in Music, Music Education, or related field',
      'Proficiency in multiple musical instruments',
      'Strong knowledge of music theory and composition',
      'Experience with music production software (Logic Pro, Pro Tools, etc.)',
      'Minimum 2 years of teaching or performance experience',
      'Ability to read and write musical notation',
      'Excellent patience and communication skills'
    ],
    qualifications: [
      'Master\'s degree in Music or Music Education',
      'Professional performance or recording experience',
      'Knowledge of various musical genres and styles',
      'Experience with audio recording and mixing',
      'Previous work in entertainment or media industry'
    ],
    benefits: [
      'Competitive compensation package',
      'Access to professional music equipment and studios',
      'Health insurance and benefits',
      'Opportunities for professional performances',
      'Continuing education support',
      'Collaborative creative environment',
      'Performance royalties for original compositions'
    ],
    salary: {
      min: 280000,
      max: 550000,
      currency: 'INR',
      period: 'yearly'
    },
    isActive: true,
    isFeatured: false,
    postedBy: 'HR Team'
  },
  {
    title: 'Modeling Instructor & Image Consultant',
    department: 'Fashion & Modeling',
    location: 'Badlapur, Maharashtra, India',
    type: 'full-time',
    experience: '3-8 years',
    description: 'We are looking for an experienced Modeling Instructor to train aspiring models in runway techniques, posing, grooming, and professional presentation. You will help students develop confidence and skills needed for successful modeling careers.',
    responsibilities: [
      'Teach runway walking techniques and posing for different types of shoots',
      'Conduct grooming and personal styling workshops',
      'Provide guidance on portfolio development and professional photography',
      'Organize fashion shows and modeling showcases',
      'Mentor students on industry standards and professional behavior',
      'Coordinate with photographers for student portfolio shoots',
      'Assess student progress and provide constructive feedback'
    ],
    requirements: [
      'Professional modeling experience with reputable agencies or brands',
      'Minimum 3 years in the fashion or modeling industry',
      'Strong knowledge of fashion trends and industry standards',
      'Excellent communication and presentation skills',
      'Experience in training or mentoring others',
      'Understanding of different modeling categories (fashion, commercial, etc.)',
      'Professional network in fashion and modeling industry'
    ],
    qualifications: [
      'Formal education in Fashion Design, Image Consulting, or related field',
      'International modeling experience',
      'Certification in image consulting or personal styling',
      'Experience with fashion photography and styling',
      'Knowledge of makeup and hair styling basics'
    ],
    benefits: [
      'Attractive salary with industry connections',
      'Health insurance and wellness programs',
      'Access to fashion industry events and shows',
      'Professional development opportunities',
      'Networking with fashion industry professionals',
      'Creative collaboration opportunities',
      'Performance-based incentives'
    ],
    salary: {
      min: 320000,
      max: 650000,
      currency: 'INR',
      period: 'yearly'
    },
    isActive: true,
    isFeatured: true,
    postedBy: 'HR Team'
  },
  {
    title: 'Content Strategist & Digital Marketing Specialist',
    department: 'Marketing & Digital Media',
    location: 'Badlapur, Maharashtra, India',
    type: 'full-time',
    experience: '2-5 years',
    description: 'Join our marketing team as a Content Strategist to develop and execute comprehensive content strategies for GLITZFUSION Academy. You will create engaging content across multiple platforms and help build our brand presence in the creative arts education sector.',
    responsibilities: [
      'Develop comprehensive content strategies for social media and digital platforms',
      'Create engaging written and visual content for various marketing channels',
      'Manage social media accounts and online community engagement',
      'Collaborate with creative teams to produce promotional materials',
      'Analyze content performance and optimize strategies based on data',
      'Coordinate influencer partnerships and brand collaborations',
      'Develop email marketing campaigns and newsletters'
    ],
    requirements: [
      'Bachelor\'s degree in Marketing, Communications, or related field',
      'Minimum 2 years of content marketing or digital marketing experience',
      'Proficiency in social media platforms and content management systems',
      'Strong writing and communication skills',
      'Experience with analytics tools (Google Analytics, social media insights)',
      'Knowledge of SEO and content optimization techniques',
      'Creative thinking and ability to work in fast-paced environment'
    ],
    qualifications: [
      'Experience in education or entertainment industry marketing',
      'Knowledge of graphic design tools (Canva, Adobe Creative Suite)',
      'Video editing and content creation skills',
      'Understanding of paid advertising platforms (Facebook Ads, Google Ads)',
      'Experience with influencer marketing and partnerships'
    ],
    benefits: [
      'Competitive salary with performance bonuses',
      'Health insurance and employee benefits',
      'Professional development and training opportunities',
      'Creative freedom in content development',
      'Access to latest marketing tools and software',
      'Networking opportunities in creative industries',
      'Flexible work arrangements'
    ],
    salary: {
      min: 250000,
      max: 500000,
      currency: 'INR',
      period: 'yearly'
    },
    isActive: true,
    isFeatured: false,
    postedBy: 'HR Team'
  },
  {
    title: 'YouTube Content Creator & Video Producer',
    department: 'Digital Media Production',
    location: 'Badlapur, Maharashtra, India',
    type: 'full-time',
    experience: '2-4 years',
    description: 'We are seeking a creative YouTube Content Creator to produce engaging video content for GLITZFUSION Academy\'s digital presence. You will create educational content, behind-the-scenes videos, and promotional materials while building our YouTube community.',
    responsibilities: [
      'Create and produce engaging YouTube content for academy promotion',
      'Develop video concepts and scripts for educational and promotional content',
      'Film, edit, and post-produce high-quality videos',
      'Manage YouTube channel optimization and audience engagement',
      'Collaborate with students and faculty for content creation',
      'Analyze video performance metrics and optimize content strategy',
      'Stay updated with YouTube trends and algorithm changes'
    ],
    requirements: [
      'Proven experience in YouTube content creation with substantial following',
      'Proficiency in video editing software (Final Cut Pro, Adobe Premiere Pro)',
      'Strong understanding of YouTube SEO and optimization techniques',
      'Creative storytelling and scriptwriting abilities',
      'Knowledge of camera operation and video production techniques',
      'Understanding of social media trends and viral content',
      'Excellent communication skills and on-camera presence'
    ],
    qualifications: [
      'Bachelor\'s degree in Film Production, Media Studies, or related field',
      'Experience with live streaming and real-time content creation',
      'Knowledge of thumbnail design and channel branding',
      'Understanding of YouTube monetization and analytics',
      'Experience in educational or entertainment content creation'
    ],
    benefits: [
      'Competitive salary plus revenue sharing opportunities',
      'Access to professional video production equipment',
      'Health insurance and employee benefits',
      'Creative freedom in content development',
      'Opportunities for personal brand building',
      'Professional development in digital media',
      'Collaboration with talented creative individuals'
    ],
    salary: {
      min: 200000,
      max: 450000,
      currency: 'INR',
      period: 'yearly'
    },
    isActive: true,
    isFeatured: false,
    postedBy: 'HR Team'
  },
  {
    title: 'Voice Over Artist & Audio Production Specialist',
    department: 'Audio Production',
    location: 'Badlapur, Maharashtra, India',
    type: 'part-time',
    experience: '1-4 years',
    description: 'Join our audio production team as a Voice Over Artist to provide professional voice services for educational content, promotional materials, and student projects. You will also train students in voice modulation and audio production techniques.',
    responsibilities: [
      'Provide professional voice over services for academy content',
      'Teach voice modulation and speech techniques to students',
      'Record and produce high-quality audio content',
      'Conduct workshops on voice acting and audio production',
      'Assist in dubbing and audio post-production projects',
      'Maintain audio equipment and recording studios',
      'Collaborate on multimedia projects requiring voice work'
    ],
    requirements: [
      'Professional voice over experience with portfolio of work',
      'Excellent voice quality and modulation skills',
      'Proficiency in audio recording and editing software',
      'Understanding of different voice over styles and techniques',
      'Ability to work with various accents and character voices',
      'Strong communication and teaching abilities',
      'Reliable and professional work ethic'
    ],
    qualifications: [
      'Formal training in voice acting or speech therapy',
      'Experience in radio, television, or film voice work',
      'Knowledge of multiple languages and dialects',
      'Understanding of audio engineering principles',
      'Previous teaching or coaching experience'
    ],
    benefits: [
      'Flexible part-time schedule',
      'Competitive hourly rates',
      'Access to professional recording facilities',
      'Opportunities for additional freelance work',
      'Professional development support',
      'Creative collaboration opportunities',
      'Performance-based bonuses'
    ],
    salary: {
      min: 800,
      max: 1500,
      currency: 'INR',
      period: 'hourly'
    },
    isActive: true,
    isFeatured: false,
    postedBy: 'HR Team'
  },
  {
    title: 'Film Maker & Cinematography Instructor',
    department: 'Film Production',
    location: 'Badlapur, Maharashtra, India',
    type: 'full-time',
    experience: '3-8 years',
    description: 'We are looking for an experienced Film Maker to lead our cinematography and film production programs. You will teach students the art of filmmaking while working on academy projects and student films.',
    responsibilities: [
      'Teach cinematography, directing, and film production techniques',
      'Guide students through complete film production processes',
      'Direct and produce promotional videos and documentaries for the academy',
      'Organize film festivals and screening events',
      'Mentor students in developing their filmmaking portfolios',
      'Manage film production equipment and facilities',
      'Collaborate with other departments on multimedia projects'
    ],
    requirements: [
      'Bachelor\'s degree in Film Production, Cinematography, or related field',
      'Minimum 3 years of professional filmmaking experience',
      'Proficiency in film production equipment and software',
      'Strong portfolio of completed film projects',
      'Understanding of various film genres and techniques',
      'Excellent project management and leadership skills',
      'Ability to work under pressure and meet deadlines'
    ],
    qualifications: [
      'Master\'s degree in Film Studies or Cinematography',
      'Award-winning films or recognition in film festivals',
      'Experience with commercial or feature film production',
      'Knowledge of latest filming technology and techniques',
      'Previous teaching or mentoring experience in filmmaking'
    ],
    benefits: [
      'Competitive salary with project bonuses',
      'Access to professional film production equipment',
      'Health insurance and comprehensive benefits',
      'Opportunities to work on commercial projects',
      'Professional development and festival participation',
      'Creative freedom in curriculum development',
      'Industry networking opportunities'
    ],
    salary: {
      min: 400000,
      max: 800000,
      currency: 'INR',
      period: 'yearly'
    },
    isActive: true,
    isFeatured: true,
    postedBy: 'HR Team'
  },
  {
    title: 'Script Writer & Creative Writing Instructor',
    department: 'Creative Writing',
    location: 'Badlapur, Maharashtra, India',
    type: 'full-time',
    experience: '2-6 years',
    description: 'Join our creative writing department as a Script Writer and instructor. You will teach screenplay writing, develop original content for academy projects, and help students craft compelling stories for various media formats.',
    responsibilities: [
      'Teach screenplay writing, story development, and creative writing techniques',
      'Write scripts for academy promotional content and student projects',
      'Conduct workshops on character development and plot structure',
      'Review and provide feedback on student scripts and stories',
      'Collaborate with film and theater departments on script development',
      'Organize writing competitions and literary events',
      'Stay updated with current trends in entertainment writing'
    ],
    requirements: [
      'Bachelor\'s degree in Creative Writing, Literature, or related field',
      'Minimum 2 years of professional writing experience',
      'Strong portfolio of written work (scripts, stories, articles)',
      'Understanding of various writing formats (screenplays, stage plays, etc.)',
      'Excellent command of language and grammar',
      'Ability to provide constructive feedback and guidance',
      'Creative thinking and storytelling abilities'
    ],
    qualifications: [
      'Published works or produced scripts',
      'Experience in film, television, or theater writing',
      'Knowledge of script formatting software (Final Draft, WriterDuet)',
      'Understanding of story structure and narrative techniques',
      'Previous teaching or workshop facilitation experience'
    ],
    benefits: [
      'Competitive salary with royalty opportunities',
      'Health insurance and employee benefits',
      'Creative freedom in curriculum development',
      'Opportunities to work on commercial writing projects',
      'Professional development and writing conferences',
      'Collaboration with talented creative professionals',
      'Flexible creative work environment'
    ],
    salary: {
      min: 250000,
      max: 500000,
      currency: 'INR',
      period: 'yearly'
    },
    isActive: true,
    isFeatured: false,
    postedBy: 'HR Team'
  },
  {
    title: 'Choreography Instructor & Dance Director',
    department: 'Dance & Movement',
    location: 'Badlapur, Maharashtra, India',
    type: 'full-time',
    experience: '3-7 years',
    description: 'We are seeking a talented Choreography Instructor to lead our dance programs and create original choreography for performances and productions. You will train students in various dance styles while developing their performance skills.',
    responsibilities: [
      'Teach various dance styles including contemporary, classical, and commercial',
      'Create original choreography for student performances and showcases',
      'Conduct dance workshops and masterclasses',
      'Prepare students for dance competitions and auditions',
      'Collaborate with music and theater departments on productions',
      'Organize dance recitals and performance events',
      'Assess student progress and provide individualized training'
    ],
    requirements: [
      'Professional dance training and performance experience',
      'Minimum 3 years of choreography and teaching experience',
      'Proficiency in multiple dance styles and techniques',
      'Strong understanding of music and rhythm',
      'Excellent physical fitness and demonstration abilities',
      'Patience and ability to work with students of all skill levels',
      'Creative vision and artistic sensibility'
    ],
    qualifications: [
      'Formal dance education or certification',
      'Professional performance credits in dance productions',
      'Experience in film, television, or stage choreography',
      'Knowledge of dance history and various cultural dance forms',
      'Previous experience in dance education or academy settings'
    ],
    benefits: [
      'Competitive salary with performance incentives',
      'Access to professional dance studios and equipment',
      'Health insurance and wellness benefits',
      'Opportunities for professional performances',
      'Professional development and dance workshops',
      'Creative collaboration with other art forms',
      'Performance-based bonuses and recognition'
    ],
    salary: {
      min: 300000,
      max: 600000,
      currency: 'INR',
      period: 'yearly'
    },
    isActive: true,
    isFeatured: true,
    postedBy: 'HR Team'
  }
]

async function seedCareers() {
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
    const collection = db.collection('careers')

    console.log('🗑️  Clearing existing careers...')
    await collection.deleteMany({})

    console.log('📝 Inserting new career opportunities...')
    const result = await collection.insertMany(careers)

    console.log(`✅ Successfully inserted ${result.insertedCount} career opportunities`)
    
    // Display summary
    console.log('\n📊 Career Opportunities Summary:')
    careers.forEach((career, index) => {
      console.log(`${index + 1}. ${career.title} - ${career.department} (${career.type})`)
    })

    console.log('\n🎯 SEO Optimized for Badlapur location searches')
    console.log('🔍 Keywords: jobs in Badlapur, careers Badlapur Maharashtra, creative arts jobs')

  } catch (error) {
    console.error('❌ Error seeding careers:', error)
    process.exit(1)
  } finally {
    await client.close()
    console.log('🔌 Database connection closed')
  }
}

// Run the script
if (require.main === module) {
  seedCareers()
    .then(() => {
      console.log('✨ Career seeding completed successfully!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('💥 Script failed:', error)
      process.exit(1)
    })
}

module.exports = { seedCareers, careers }
