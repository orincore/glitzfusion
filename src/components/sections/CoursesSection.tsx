'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { GlassPanel } from '@/components/ui/GlassPanel'
import { cn, fadeInUp, staggerContainer } from '@/lib/utils'
import { useCourses } from '@/hooks/useCourses'
import { courses as fallbackCourses } from '@/data/courses'

const MotionLink = motion(Link)

export function CoursesSection() {
  const { courses, isLoading, error } = useCourses()
  
  // Show loading state
  if (isLoading) {
    return (
      <section className="py-20 relative">
        <div className="container-custom">
          <div className="text-center">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-gradient-gold mb-6">
              Our Courses
            </h2>
            <div className="h-4 bg-gray-800 rounded-full w-1/3 mx-auto mb-8">
              <div className="h-full bg-gradient-to-r from-primary-gold to-yellow-300 rounded-full animate-pulse"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-gray-900/50 rounded-2xl p-8 animate-pulse h-80">
                  <div className="h-12 w-12 bg-gray-800 rounded-lg mb-6"></div>
                  <div className="h-6 bg-gray-800 rounded w-3/4 mb-4"></div>
                  <div className="space-y-3">
                    <div className="h-4 bg-gray-800 rounded w-full"></div>
                    <div className="h-4 bg-gray-800 rounded w-5/6"></div>
                    <div className="h-4 bg-gray-800 rounded w-4/5"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    )
  }

  // Show error state
  if (error) {
    return (
      <section className="py-20 relative">
        <div className="container-custom text-center">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-gradient-gold mb-6">
            Our Courses
          </h2>
          <div className="bg-red-900/30 border border-red-500 text-red-200 rounded-lg p-6 max-w-2xl mx-auto">
            <p className="text-xl font-medium mb-2">Failed to load courses</p>
            <p className="text-sm text-red-300 mb-4">Please check your internet connection and try again.</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </section>
    )
  }

  // Use API data or fallback to static data if API returns empty
  const displayCourses = courses.length > 0 ? courses : fallbackCourses
  const featuredCourses = displayCourses.slice(0, 6) // Show top 6 courses

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
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 min-h-[600px]"
        >
          {featuredCourses.map((course, index) => {
            const Icon = course.icon
            return (
              <MotionLink
                href={`/courses/${course.slug || course.id}`}
                key={course.id}
                variants={fadeInUp}
                className="group/card block h-full"
              >
                <GlassPanel
                  className={cn(
                    'group/glass relative h-full p-8 rounded-3xl transition-all duration-300',
                    'bg-[rgba(8,6,18,0.35)] backdrop-blur-xl backdrop-saturate-150',
                    'shadow-[0_25px_80px_-45px_rgba(255,215,128,0.35)]',
                    'cursor-pointer overflow-hidden hover:shadow-[0_25px_80px_-35px_rgba(255,215,128,0.4)]',
                    'hover:translate-y-[-2px] hover:scale-[1.005]',
                    'border border-white/5 hover:border-white/10'
                  )}
                  whileHover={{ scale: 1.01 }}
                  glow={false}
                  border={false}
                  highlight={false}
                  variant="light"
                >
                  {/* Course Icon */}
                  <div className="relative mb-6">
                    <div className={cn(
                      'w-16 h-16 rounded-2xl bg-gradient-to-br flex items-center justify-center mb-4 shadow-[0_18px_35px_-20px_rgba(255,215,128,0.55)]',
                      course.color
                    )}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <div className="absolute -top-2 -right-2">
                      <div className="w-6 h-6 bg-primary-gold/90 rounded-full flex items-center justify-center shadow-[0_0_14px_rgba(255,215,128,0.65)]">
                        <div className="w-2 h-2 bg-primary-black rounded-full" />
                      </div>
                    </div>
                  </div>

                  {/* Course Content */}
                  <div className="space-y-4">
                    <h3 className="text-2xl font-bold text-gradient-gold group-hover/card:scale-[1.04] transition-transform duration-400">
                      {course.title}
                    </h3>
                    
                    <p className="text-gray-300/95 leading-relaxed">
                      {course.summary}
                    </p>

                    {/* Course Details */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Duration:</span>
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-primary-gold/15 text-primary-gold font-medium border border-primary-gold/35">
                          {course.duration}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Level:</span>
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-primary-gold/15 text-primary-gold font-medium border border-primary-gold/35">
                          {course.level}
                        </span>
                      </div>
                    </div>

                    {/* Features */}
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold text-gray-200 uppercase tracking-wide">What You'll Learn:</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {course.highlights.slice(0, 4).map((highlight) => (
                          <div key={highlight} className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-primary-gold/80 rounded-full shadow-[0_0_8px_rgba(255,215,128,0.6)]" />
                            <span className="text-[11px] text-gray-300/95">{highlight}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* CTA Button */}
                    <MotionLink
                      href={`/courses/${course.slug}`}
                      className={cn(
                        'inline-flex w-full mt-6 items-center justify-center px-6 py-3 rounded-lg font-semibold',
                        'bg-[linear-gradient(120deg,rgba(255,215,128,0.18),rgba(255,215,128,0.06))]',
                        'border border-primary-gold/30 shadow-[0_18px_45px_-35px_rgba(255,215,128,0.6)]',
                        'hover:bg-primary-gold hover:text-primary-black',
                        'focus:outline-none focus:ring-2 focus:ring-primary-gold focus:ring-offset-2 focus:ring-offset-transparent',
                        'transition-all duration-400 group-hover/card:shadow-[0_28px_85px_-45px_rgba(255,215,128,0.75)]'
                      )}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Learn More
                    </MotionLink>
                  </div>

                  {/* Hover Effect Overlay (disabled) */}
                  </GlassPanel>
                </MotionLink>
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
