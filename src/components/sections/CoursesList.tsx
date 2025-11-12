'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Loader2 } from 'lucide-react';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { cn, fadeInUp, staggerContainer } from '@/lib/utils';
import { useCourses } from '@/hooks/useCourses';
import { courses as fallbackCourses } from '@/data/courses';

export default function CoursesList() {
  const { courses, isLoading, error } = useCourses()
  
  // Use API data if available, otherwise fallback to static data
  const displayCourses = courses.length > 0 ? courses : fallbackCourses

  if (isLoading) {
    return (
      <section className="py-20 relative">
        <div className="container-custom">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary-gold mx-auto mb-4" />
              <p className="text-gray-300">Loading courses...</p>
            </div>
          </div>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="py-20 relative">
        <div className="container-custom">
          <div className="text-center text-red-400 mb-8">
            <p>Error loading courses: {error}</p>
            <p className="text-sm text-gray-400 mt-2">Showing fallback courses</p>
          </div>
        </div>
      </section>
    )
  }
  return (
    <section className="py-20 relative">
      <div className="container-custom">
        {/* Courses Grid */}
        <motion.div
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {displayCourses.map((course, index) => {
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
                    
                    <p className="leading-relaxed text-gray-300">
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
                    <Link
                      href={`/courses/${course.slug}`}
                      className={cn(
                        'mt-6 inline-flex items-center space-x-2 text-sm font-semibold text-primary-gold',
                        'group-hover:text-primary-gold-light transition-colors'
                      )}
                    >
                      <span>Learn More</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Link
                        href={`/courses/${course.slug}`}
                        className={cn(
                          'block mt-4 px-6 py-3 rounded-lg font-semibold text-center',
                          'bg-gradient-to-r from-primary-gold/20 to-primary-gold/10',
                          'border border-primary-gold/30',
                          'hover:from-primary-gold hover:to-primary-gold-light hover:text-primary-black',
                          'focus:outline-none focus:ring-2 focus:ring-primary-gold focus:ring-offset-2 focus:ring-offset-transparent',
                          'transition-all duration-300 group-hover:shadow-gold-glow'
                        )}
                      >
                        Enroll Now
                      </Link>
                    </motion.div>
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

      </div>
    </section>
  );
}
