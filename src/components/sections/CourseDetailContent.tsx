'use client'

import React from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { Calendar, Clock, Users as UsersIcon, Award, CheckCircle } from 'lucide-react'
import { VideoPlayer } from '@/components/ui/VideoPlayer'

import { GlassPanel } from '@/components/ui/GlassPanel'
import { cn, fadeInUp, fadeIn, scaleIn, staggerContainer } from '@/lib/utils'
import type { CourseInfo } from '@/data/courses'

interface CourseDetailContentProps {
  course: Omit<CourseInfo, 'icon'> & {
    heroMedia?: {
      mediaId: string
      url: string
      mediaType: 'image' | 'video'
      alt?: string
    }
    videoUrl?: string
  }
}

export function CourseDetailContent({ course }: CourseDetailContentProps) {
  // Fallback video sources for courses without media
  const fallbackVideo = {
    acting: '/Video%20assets/Video1.mp4',
    dance: '/Video%20assets/dancing.mp4',
    photography: '/Video%20assets/dancing.mp4',
    filmmaking: '/Video%20assets/Video1.mp4',
    modeling: '/Video%20assets/dancing.mp4'
  }[course.slug] || '/Video%20assets/Video1.mp4'
  
  // Priority: heroMedia from database > videoUrl > fallback video
  const courseVideo = course.heroMedia?.url && course.heroMedia.mediaType === 'video'
    ? course.heroMedia.url 
    : course.videoUrl || fallbackVideo
    
  const courseImage = course.heroMedia?.url && course.heroMedia.mediaType === 'image'
    ? course.heroMedia.url 
    : `/${course.slug}.jpg`
  
  return (
    <section className="py-16 md:py-24">
      <div className="container-custom space-y-16">
        {/* Hero Section with Course Header */}
        <motion.div 
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: '-100px' }}
          className="relative rounded-2xl overflow-hidden group"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent z-10" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent z-10" />
          
          <motion.div 
            variants={fadeIn}
            className="relative aspect-video w-full"
          >
            <VideoPlayer 
              src={courseVideo}
              poster={courseImage}
              className="h-full w-full"
              autoPlay
              loop
              muted
            />
          </motion.div>
          
          <div className="relative z-20 p-8 md:p-12">
            <motion.div variants={fadeInUp} className="max-w-3xl">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
                {course.title} <span className="text-primary-gold">Program</span>
              </h1>
              <p className="text-lg md:text-xl text-gray-200 mb-6">{course.description}</p>
              
              <div className="flex flex-wrap gap-4 mt-8">
                <motion.div 
                  variants={fadeInUp}
                  className="flex items-center bg-black/40 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/10"
                >
                  <Calendar className="w-5 h-5 text-primary-gold mr-2" />
                  <span className="text-sm text-white">Starts {course.nextStart}</span>
                </motion.div>
                
                <motion.div 
                  variants={fadeInUp}
                  className="flex items-center bg-black/40 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/10"
                >
                  <Clock className="w-5 h-5 text-primary-gold mr-2" />
                  <span className="text-sm text-white">{course.duration} Program</span>
                </motion.div>
                
                <motion.div 
                  variants={fadeInUp}
                  className="flex items-center bg-black/40 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/10"
                >
                  <UsersIcon className="w-5 h-5 text-primary-gold mr-2" />
                  <span className="text-sm text-white">Limited Seats</span>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Course Overview & Highlights */}
        <motion.div
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: '-100px' }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-8"
        >
          <motion.div variants={fadeInUp} className="lg:col-span-2 space-y-8">
            <GlassPanel className="p-8 rounded-2xl">
              <div className="flex items-center mb-6">
                <div className="w-1 h-8 bg-gradient-to-b from-primary-gold to-amber-400 rounded-full mr-3"></div>
                <h2 className="text-2xl font-semibold text-gradient-gold">
                  Program Overview
                </h2>
              </div>
              
              <div className="prose prose-invert max-w-none">
                <p className="text-gray-300 leading-relaxed mb-6">
                  {course.summary}
                </p>
                
                <p className="text-gray-300 leading-relaxed">
                  {course.description}
                </p>
                
                <div className="mt-8">
                  <h3 className="text-xl font-semibold text-white mb-4">Why Choose This Program?</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      'Industry-expert instructors with real-world experience',
                      'Hands-on projects and portfolio building',
                      'Small class sizes for personalized attention',
                      'Industry networking opportunities',
                      'Career support and job placement assistance',
                      'Access to professional equipment and facilities'
                    ].map((item, index) => (
                      <div key={index} className="flex items-start space-x-2">
                        <CheckCircle className="w-5 h-5 text-primary-gold mt-0.5 flex-shrink-0" />
                        <span className="text-gray-300">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </GlassPanel>
            
            {/* Student Testimonials */}
            <motion.div variants={fadeInUp}>
              <GlassPanel className="p-8 rounded-2xl">
                <div className="flex items-center mb-6">
                  <div className="w-1 h-8 bg-gradient-to-b from-primary-gold to-amber-400 rounded-full mr-3"></div>
                  <h2 className="text-2xl font-semibold text-gradient-gold">
                    Student Success Stories
                  </h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[1, 2].map((item) => (
                    <div key={item} className="bg-black/30 rounded-xl p-6 border border-white/5">
                      <div className="flex items-center mb-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-gold to-amber-500 flex items-center justify-center text-xl font-bold text-primary-black mr-4">
                          {['A', 'S', 'R', 'K'][item]}
                        </div>
                        <div>
                          <h4 className="font-semibold text-white">Student {item === 1 ? 'Aarav' : 'Sanya'}</h4>
                          <p className="text-sm text-gray-400">Batch of {2024 + item}</p>
                        </div>
                      </div>
                      <p className="text-gray-300 text-sm leading-relaxed">
                        "The {course.title} program transformed my skills and confidence. The hands-on approach and industry connections helped me land my dream job within a month of graduation!"
                      </p>
                    </div>
                  ))}
                </div>
              </GlassPanel>
            </motion.div>
          </motion.div>
          
          <motion.div variants={fadeInUp} className="space-y-6">
            <GlassPanel className="p-6 rounded-2xl">
              <h3 className="text-xl font-semibold text-gradient-gold mb-6 flex items-center">
                <Award className="w-5 h-5 mr-2" />
                Key Details
              </h3>
              <div className="space-y-4">
                <DetailItem 
                  icon={<Calendar className="w-4 h-4 text-primary-gold" />} 
                  label="Next Intake" 
                  value={course.nextStart} 
                />
                <DetailItem 
                  icon={<Clock className="w-4 h-4 text-primary-gold" />} 
                  label="Duration" 
                  value={course.duration} 
                />
                <DetailItem 
                  icon={<UsersIcon className="w-4 h-4 text-primary-gold" />} 
                  label="Class Size" 
                  value="Max 12 Students" 
                />
                <DetailItem 
                  label="Format" 
                  value={course.format} 
                />
                <DetailItem 
                  label="Level" 
                  value={course.level} 
                />
                <DetailItem 
                  label="Investment" 
                  value={course.investment} 
                  highlight 
                />
              </div>
              
              <div className="mt-8 space-y-4">
                <h4 className="font-medium text-white">Program Highlights</h4>
                <ul className="space-y-2">
                  {course.highlights.map((highlight, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle className="w-4 h-4 text-primary-gold mt-1 mr-2 flex-shrink-0" />
                      <span className="text-sm text-gray-300">{highlight}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <motion.div 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="mt-8"
              >
                <Link
                  href="/apply"
                  className={cn(
                    'w-full inline-flex items-center justify-center px-6 py-3 rounded-xl',
                    'bg-gradient-to-r from-primary-gold to-amber-500 text-primary-black font-medium',
                    'hover:shadow-gold-glow focus:outline-none focus:ring-2 focus:ring-primary-gold focus:ring-offset-2 focus:ring-offset-primary-black',
                    'transition-all duration-300'
                  )}
                >
                  Apply Now
                </Link>
              </motion.div>
            </GlassPanel>
            
            <GlassPanel className="p-6 rounded-2xl">
              <h4 className="font-medium text-white mb-4">Have Questions?</h4>
              <p className="text-sm text-gray-300 mb-4">
                Schedule a call with our admissions team to learn more about the program and financing options.
              </p>
              <Link 
                href="/contact" 
                className="text-primary-gold hover:text-amber-400 text-sm font-medium inline-flex items-center group"
              >
                Contact Admissions
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
            </GlassPanel>
          </motion.div>
        </motion.div>

        {/* Curriculum Section */}
        <motion.div
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: '-100px' }}
          className="relative py-16"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary-black/50 to-transparent -z-10" />
          
          <div className="text-center max-w-4xl mx-auto mb-16">
            <motion.span 
              variants={fadeInUp}
              className="inline-block text-primary-gold text-sm font-medium mb-3"
            >
              CURRICULUM
            </motion.span>
            <motion.h2 
              variants={fadeInUp}
              className="text-3xl md:text-4xl font-bold text-white mb-4"
            >
              Your Learning <span className="text-primary-gold">Journey</span>
            </motion.h2>
            <motion.p 
              variants={fadeInUp}
              className="text-gray-400 max-w-2xl mx-auto"
            >
              Our comprehensive curriculum is designed to take you from fundamentals to advanced techniques, with hands-on projects and real-world applications.
            </motion.p>
          </div>
          
          <div className="relative">
            <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary-gold/20 via-primary-gold/50 to-primary-gold/20 -ml-px" />
            
            <div className="space-y-16 lg:space-y-24">
              {course.curriculum.map((module, index) => {
                // Use different images for different modules
                const moduleImages = [
                  'https://files.ailey.org/sites/default/files/2024-06/Blog_Exploring%20the%20Horton%20Technique_The%20Ailey%20School%20Horton%20class%20taught%20by%20Ana%20Marie%20Forsythe.%20%20Photo%20by%20Kyle%20Froman_757.png',
                  'https://apeirodesign.com/wp-content/uploads/2023/07/Chapman-Dance-2023-3.jpg',
                  'https://cdn.prod.website-files.com/5e2b8863ba7fff8df8949888/5ea9e2e796b35056f5ad9fa6_5e28eaf045b607ed01ce0815_Show-Me-Love-13-1024x683.jpeg'
                ];
                const imageIndex = index % moduleImages.length;
                
                return (
                  <motion.div 
                    key={module.title} 
                    variants={fadeInUp}
                    className="relative group"
                  >
                    {/* Number badge for desktop */}
                    <div className="hidden lg:flex absolute left-1/2 -translate-x-1/2 -top-4 w-12 h-12 rounded-full bg-gradient-to-br from-primary-gold to-amber-500 items-center justify-center text-lg font-bold text-primary-black z-10 border-4 border-primary-black">
                      {index + 1}
                    </div>
                    
                    <div className="lg:flex items-start">
                      <div className={`lg:w-1/2 ${index % 2 === 0 ? 'lg:pr-12 lg:order-1' : 'lg:pl-12 lg:order-2'}`}>
                        <GlassPanel className={`p-8 rounded-2xl h-full ${index % 2 === 0 ? 'lg:ml-auto' : ''}`}>
                          <div className="flex items-center mb-4">
                            <div className="lg:hidden w-12 h-12 rounded-full bg-gradient-to-br from-primary-gold to-amber-500 flex items-center justify-center text-lg font-bold text-primary-black mr-4">
                              {index + 1}
                            </div>
                            <h3 className="text-xl font-semibold text-white">{module.title}</h3>
                          </div>
                          <p className="text-gray-300 mb-4">
                            {module.description}
                          </p>
                          <ul className="space-y-2 mt-6">
                            {module.points.map((point, i) => (
                              <li key={i} className="flex items-start">
                                <CheckCircle className="w-5 h-5 text-primary-gold mr-2 mt-0.5 flex-shrink-0" />
                                <span className="text-gray-300">{point}</span>
                              </li>
                            ))}
                          </ul>
                        </GlassPanel>
                      </div>

                      <div className={`lg:w-1/2 mt-8 lg:mt-0 ${index % 2 === 0 ? 'lg:order-2' : 'lg:order-1'}`}>
                        <motion.div 
                          className={`relative overflow-hidden rounded-xl aspect-video shadow-2xl ${index % 2 === 0 ? 'lg:ml-12' : 'lg:mr-12'}`}
                          whileHover={{ scale: 1.02 }}
                        >
                          <div className="absolute inset-0 bg-gradient-to-br from-primary-gold/20 to-transparent rounded-xl -z-10" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent -z-10" />
                          <div className="w-full h-full">
                            <Image
                              src={moduleImages[imageIndex]}
                              alt={`${module.title} - ${course.title} Program`}
                              fill
                              className="object-cover"
                              sizes="(max-width: 1024px) 100vw, 50vw"
                              priority={index < 2}
                            />
                          </div>
                          <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/90 to-transparent">
                            <span className="text-sm font-medium text-primary-gold">Module {index + 1}</span>
                            <h4 className="text-lg font-semibold text-white mt-1">{module.title}</h4>
                          </div>
                        </motion.div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* Outcomes & CTA Section */}
        <motion.div
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: '-100px' }}
          className="relative py-20 overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary-black to-primary-black/80 -z-10" />
          <div className="absolute inset-0 bg-[url('/pattern.svg')] bg-cover opacity-5 -z-10" />
          
          <div className="container-custom">
            <div className="max-w-5xl mx-auto text-center mb-16">
              <motion.span 
                variants={fadeInUp}
                className="inline-block text-primary-gold text-sm font-medium mb-3"
              >
                OUTCOMES
              </motion.span>
              <motion.h2 
                variants={fadeInUp}
                className="text-3xl md:text-4xl font-bold text-white mb-6"
              >
                What You'll <span className="text-primary-gold">Achieve</span>
              </motion.h2>
              <motion.p 
                variants={fadeInUp}
                className="text-gray-400 max-w-2xl mx-auto"
              >
                By the end of this program, you'll have the skills, portfolio, and industry connections to launch your career.
              </motion.p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
              {course.outcomes.map((outcome, index) => (
                <motion.div 
                  key={index} 
                  variants={fadeInUp}
                  className="group"
                >
                  <GlassPanel className="p-6 h-full transition-all duration-300 hover:bg-primary-black/50 group-hover:border-primary-gold/30">
                    <div className="w-12 h-12 rounded-xl bg-primary-gold/10 flex items-center justify-center mb-4 group-hover:bg-primary-gold/20 transition-colors">
                      <Award className="w-6 h-6 text-primary-gold" />
                    </div>
                    <h3 className="text-lg font-medium text-white mb-2">Outcome {index + 1}</h3>
                    <p className="text-gray-300">{outcome}</p>
                  </GlassPanel>
                </motion.div>
              ))}
            </div>
            
            <motion.div 
              variants={staggerContainer}
              className="relative bg-gradient-to-r from-primary-gold/5 to-primary-gold/10 rounded-2xl p-8 md:p-12 overflow-hidden"
            >
              <div className="absolute inset-0 bg-[url('/pattern.svg')] bg-cover opacity-10 -z-10" />
              <div className="absolute inset-0 bg-gradient-to-r from-primary-gold/5 to-transparent -z-10" />
              
              <div className="max-w-4xl mx-auto text-center">
                <motion.h3 
                  variants={fadeInUp}
                  className="text-2xl md:text-3xl font-bold text-white mb-4"
                >
                  Ready to Start Your Journey?
                </motion.h3>
                <motion.p 
                  variants={fadeInUp}
                  className="text-gray-300 mb-8 max-w-2xl mx-auto"
                >
                  Join our next cohort and transform your passion into a profession. Limited seats available for our {course.nextStart} intake.
                </motion.p>
                
                <motion.div 
                  variants={fadeInUp}
                  className="flex flex-col sm:flex-row justify-center gap-4"
                >
                  <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                    <Link
                      href="/apply"
                      className={cn(
                        'inline-flex items-center justify-center px-8 py-3.5 text-base font-semibold rounded-xl',
                        'bg-gradient-to-r from-primary-gold to-amber-500 text-primary-black',
                        'hover:shadow-gold-glow focus:shadow-gold-glow',
                        'focus:outline-none focus:ring-2 focus:ring-primary-gold focus:ring-offset-2 focus:ring-offset-primary-black',
                        'transition-all duration-300 w-full sm:w-auto'
                      )}
                    >
                      Apply Now
                    </Link>
                  </motion.div>
                  
                  <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                    <Link
                      href="/contact"
                      className={cn(
                        'inline-flex items-center justify-center px-8 py-3.5 text-base font-medium rounded-xl',
                        'border-2 border-primary-gold text-primary-gold',
                        'hover:bg-primary-gold hover:text-primary-black',
                        'focus:outline-none focus:ring-2 focus:ring-primary-gold focus:ring-offset-2 focus:ring-offset-primary-black',
                        'transition-all duration-300 w-full sm:w-auto'
                      )}
                    >
                      Book a Consultation
                    </Link>
                  </motion.div>
                </motion.div>
                
                <motion.p 
                  variants={fadeInUp}
                  className="text-sm text-gray-400 mt-6"
                >
                  Have questions? Email us at{' '}
                  <a href="mailto:admissions@glitzfusion.com" className="text-primary-gold hover:underline">
                    admissions@glitzfusion.com
                  </a>
                </motion.p>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

interface DetailItemProps {
  icon?: React.ReactNode
  label: string
  value: string | React.ReactNode
  highlight?: boolean
}

function DetailItem({ icon, label, value, highlight = false }: DetailItemProps) {
  return (
    <div className="flex justify-between items-start py-3 border-b border-white/5 last:border-0 last:pb-0">
      <div className="flex items-center">
        {icon && <span className="mr-2">{icon}</span>}
        <span className={`text-sm ${highlight ? 'text-primary-gold' : 'text-gray-400'}`}>
          {label}
        </span>
      </div>
      <span className={`text-sm font-medium text-right max-w-[60%] ${highlight ? 'text-primary-gold' : 'text-white'}`}>
        {value}
      </span>
    </div>
  )
}
