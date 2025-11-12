'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { GlassPanel } from '@/components/ui/GlassPanel'
import { cn, fadeInUp, staggerContainer } from '@/lib/utils'
import { courses } from '@/data/courses'

const MotionLink = motion(Link)

export function CoursesSection() {
  const featuredCourses = courses.slice(0, 5)

  return (
    <section className="py-20 relative">
      <div className="container-custom">
        {/* Section Header */}
        <motion.div
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: "-100px" }}
          className="text-center mb-16"
        >
          <motion.h2 
            variants={fadeInUp}
            className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-gradient-gold mb-6"
          >
            Our Courses
          </motion.h2>
          <motion.p 
            variants={fadeInUp}
            className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed"
          >
            Discover your creative potential with our comprehensive programs designed by industry professionals
          </motion.p>
        </motion.div>

        {/* Courses Grid */}
        <motion.div
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {featuredCourses.map((course, index) => {
            const Icon = course.icon
            return (
              <motion.div
                key={course.id}
                variants={fadeInUp}
                className="group"
              >
                <GlassPanel
                  className={cn(
                    'h-full p-8 rounded-2xl transition-all duration-500',
                    'hover:shadow-gold-glow-lg hover:-translate-y-2',
                    'cursor-pointer'
                  )}
                  whileHover={{ scale: 1.02 }}
                  glow
                >
                  {/* Course Icon */}
                  <div className="relative mb-6">
                    <div className={cn(
                      'w-16 h-16 rounded-xl bg-gradient-to-br flex items-center justify-center mb-4',
                      course.color
                    )}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    
                    {/* Floating Badge */}
                    <div className="absolute -top-2 -right-2">
                      <div className="w-6 h-6 bg-primary-gold rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-primary-black rounded-full animate-pulse" />
                      </div>
                    </div>
                  </div>

                  {/* Course Content */}
                  <div className="space-y-4">
                    <h3 className="text-2xl font-bold text-gradient-gold group-hover:scale-105 transition-transform duration-300">
                      {course.title}
                    </h3>
                    
                    <p className="text-gray-300 leading-relaxed">
                      {course.summary}
                    </p>

                    {/* Course Details */}
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Duration:</span>
                        <span className="text-primary-gold font-medium">{course.duration}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Level:</span>
                        <span className="text-primary-gold font-medium">{course.level}</span>
                      </div>
                    </div>

                    {/* Features */}
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold text-gray-200">What You'll Learn:</h4>
                      <div className="grid grid-cols-2 gap-1">
                        {course.highlights.slice(0, 4).map((highlight) => (
                          <div key={highlight} className="flex items-center space-x-2">
                            <div className="w-1.5 h-1.5 bg-primary-gold rounded-full" />
                            <span className="text-xs text-gray-300">{highlight}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* CTA Button */}
                    <MotionLink
                      href={`/courses/${course.slug}`}
                      className={cn(
                        'inline-flex w-full mt-6 items-center justify-center px-6 py-3 rounded-lg font-semibold',
                        'bg-gradient-to-r from-primary-gold/20 to-primary-gold/10',
                        'border border-primary-gold/30',
                        'hover:from-primary-gold hover:to-primary-gold-light hover:text-primary-black',
                        'focus:outline-none focus:ring-2 focus:ring-primary-gold focus:ring-offset-2 focus:ring-offset-transparent',
                        'transition-all duration-300 group-hover:shadow-gold-glow'
                      )}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Learn More
                    </MotionLink>
                  </div>

                  {/* Hover Effect Overlay */}
                  <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                    <div className={cn(
                      'absolute inset-0 rounded-2xl bg-gradient-to-br opacity-5',
                      course.color
                    )} />
                  </div>
                </GlassPanel>
              </motion.div>
            )
          })}
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <MotionLink
            href="/courses"
            className={cn(
              'inline-block px-8 py-4 text-lg font-semibold rounded-xl',
              'bg-gradient-gold text-primary-black',
              'hover:shadow-gold-glow-lg focus:shadow-gold-glow-lg',
              'focus:outline-none focus:ring-2 focus:ring-primary-gold focus:ring-offset-2 focus:ring-offset-primary-black',
              'transition-all duration-300'
            )}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            View All Courses
          </MotionLink>
        </motion.div>
      </div>
    </section>
  )
}
