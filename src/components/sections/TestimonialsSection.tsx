'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Quote, Star } from 'lucide-react'
import { GlassPanel } from '@/components/ui/GlassPanel'
import { cn, fadeInUp, staggerContainer } from '@/lib/utils'

const testimonials = [
  {
    id: 1,
    name: 'Sarah Chen',
    role: 'Professional Actress',
    course: 'Acting Program',
    image: '/api/placeholder/80/80',
    quote: 'Glitz Fusion transformed my passion into a thriving career. The personalized attention and industry connections made all the difference.',
    rating: 5,
    achievement: 'Lead role in Netflix series'
  },
  {
    id: 2,
    name: 'Marcus Rodriguez',
    role: 'Commercial Photographer',
    course: 'Photography Course',
    image: '/api/placeholder/80/80',
    quote: 'The technical skills and creative vision I developed here launched my photography business. The instructors are true industry professionals.',
    rating: 5,
    achievement: 'Founded successful studio'
  },
  {
    id: 3,
    name: 'Emma Thompson',
    role: 'Contemporary Dancer',
    course: 'Dance Academy',
    image: '/api/placeholder/80/80',
    quote: 'The dance program pushed me beyond my limits. I discovered techniques and styles I never knew existed. Truly life-changing.',
    rating: 5,
    achievement: 'Principal dancer at renowned company'
  },
  {
    id: 4,
    name: 'David Kim',
    role: 'Film Director',
    course: 'Filmmaking Program',
    image: '/api/placeholder/80/80',
    quote: 'From concept to post-production, Glitz Fusion gave me the complete toolkit. My first short film won three festival awards.',
    rating: 5,
    achievement: 'Award-winning filmmaker'
  },
  {
    id: 5,
    name: 'Isabella Martinez',
    role: 'Fashion Model',
    course: 'Modeling Training',
    image: '/api/placeholder/80/80',
    quote: 'The confidence and professionalism I gained here opened doors I never imagined. The runway training was exceptional.',
    rating: 5,
    achievement: 'International runway model'
  }
]

export function TestimonialsSection() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)

  // Auto-advance testimonials
  useEffect(() => {
    if (!isAutoPlaying) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [isAutoPlaying])

  const goToSlide = (index: number) => {
    setCurrentIndex(index)
    setIsAutoPlaying(false)
    setTimeout(() => setIsAutoPlaying(true), 10000) // Resume auto-play after 10s
  }

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)
    setIsAutoPlaying(false)
    setTimeout(() => setIsAutoPlaying(true), 10000)
  }

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length)
    setIsAutoPlaying(false)
    setTimeout(() => setIsAutoPlaying(true), 10000)
  }

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
            Success Stories
          </motion.h2>
          <motion.p 
            variants={fadeInUp}
            className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed"
          >
            Hear from our graduates who have transformed their creative dreams into professional success
          </motion.p>
        </motion.div>

        {/* Testimonials Carousel */}
        <div className="relative max-w-5xl mx-auto">
          <GlassPanel className="relative overflow-hidden rounded-3xl p-8 md:p-12">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="text-center"
              >
                {/* Quote Icon */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.4, delay: 0.2 }}
                  className="flex justify-center mb-8"
                >
                  <div className="w-16 h-16 bg-gradient-gold rounded-full flex items-center justify-center">
                    <Quote className="w-8 h-8 text-primary-black" />
                  </div>
                </motion.div>

                {/* Testimonial Content */}
                <div className="space-y-8">
                  {/* Quote */}
                  <motion.blockquote
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="text-xl md:text-2xl lg:text-3xl font-light text-white leading-relaxed max-w-4xl mx-auto"
                  >
                    "{testimonials[currentIndex].quote}"
                  </motion.blockquote>

                  {/* Rating */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, delay: 0.4 }}
                    className="flex justify-center space-x-1"
                  >
                    {Array.from({ length: testimonials[currentIndex].rating }).map((_, i) => (
                      <Star key={i} className="w-6 h-6 fill-primary-gold text-primary-gold" />
                    ))}
                  </motion.div>

                  {/* Author Info */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.5 }}
                    className="flex flex-col md:flex-row items-center justify-center space-y-4 md:space-y-0 md:space-x-6"
                  >
                    {/* Avatar */}
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary-gold/30 to-primary-gold/10 border-2 border-primary-gold/30 flex items-center justify-center">
                      <div className="w-16 h-16 rounded-full bg-gradient-gold flex items-center justify-center text-primary-black font-bold text-xl">
                        {testimonials[currentIndex].name.split(' ').map(n => n[0]).join('')}
                      </div>
                    </div>

                    {/* Details */}
                    <div className="text-center md:text-left">
                      <h3 className="text-xl font-bold text-white mb-1">
                        {testimonials[currentIndex].name}
                      </h3>
                      <p className="text-primary-gold font-medium mb-1">
                        {testimonials[currentIndex].role}
                      </p>
                      <p className="text-sm text-gray-400">
                        {testimonials[currentIndex].course} Graduate
                      </p>
                      <p className="text-xs text-primary-gold/80 mt-2">
                        {testimonials[currentIndex].achievement}
                      </p>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Navigation Arrows */}
            <motion.button
              onClick={goToPrevious}
              className={cn(
                'absolute left-4 top-1/2 transform -translate-y-1/2',
                'w-12 h-12 rounded-full bg-glass-dark border border-white/10',
                'hover:border-primary-gold/50 hover:bg-primary-gold/10',
                'focus:outline-none focus:ring-2 focus:ring-primary-gold focus:ring-offset-2 focus:ring-offset-transparent',
                'transition-all duration-300 group'
              )}
              aria-label="Previous testimonial"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              suppressHydrationWarning
            >
              <ChevronLeft className="w-6 h-6 text-white group-hover:text-primary-gold mx-auto" />
            </motion.button>

            <motion.button
              onClick={goToNext}
              className={cn(
                'absolute right-4 top-1/2 transform -translate-y-1/2',
                'w-12 h-12 rounded-full bg-glass-dark border border-white/10',
                'hover:border-primary-gold/50 hover:bg-primary-gold/10',
                'focus:outline-none focus:ring-2 focus:ring-primary-gold focus:ring-offset-2 focus:ring-offset-transparent',
                'transition-all duration-300 group'
              )}
              aria-label="Next testimonial"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              suppressHydrationWarning
            >
              <ChevronRight className="w-6 h-6 text-white group-hover:text-primary-gold mx-auto" />
            </motion.button>
          </GlassPanel>

          {/* Dots Indicator */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
            className="flex justify-center space-x-3 mt-8"
          >
            {testimonials.map((_, index) => (
              <motion.button
                key={index}
                onClick={() => goToSlide(index)}
                className={cn(
                  'w-3 h-3 rounded-full transition-all duration-300',
                  index === currentIndex
                    ? 'bg-primary-gold scale-125'
                    : 'bg-white/30 hover:bg-white/50'
                )}
                aria-label={`Go to testimonial ${index + 1}`}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                suppressHydrationWarning
              />
            ))}
          </motion.div>
        </div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-20"
        >
          {[
            { number: '95%', label: 'Career Success Rate' },
            { number: '500+', label: 'Happy Graduates' },
            { number: '50+', label: 'Industry Awards' },
            { number: '15+', label: 'Years Excellence' },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ 
                duration: 0.6, 
                delay: 0.5 + index * 0.1,
                ease: [0.25, 0.46, 0.45, 0.94]
              }}
              viewport={{ once: true }}
              className="text-center"
            >
              <GlassPanel className="p-6 rounded-xl hover:shadow-gold-glow transition-all duration-300">
                <div className="text-3xl md:text-4xl font-bold text-gradient-gold mb-2">
                  {stat.number}
                </div>
                <div className="text-sm md:text-base text-gray-300">
                  {stat.label}
                </div>
              </GlassPanel>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
