'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion'
import { ArrowRight, Play } from 'lucide-react'
import { GlassPanel } from '@/components/ui/GlassPanel'
import { cn, fadeInUp, staggerContainer } from '@/lib/utils'

export function Hero() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [mounted, setMounted] = useState(false)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start']
  })

  const y = useTransform(scrollYProgress, [0, 1], ['0%', '50%'])
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])
  const prefersReducedMotion = useReducedMotion()

  useEffect(() => {
    setMounted(true);
  }, [prefersReducedMotion])

  const sparkles = useMemo(() => {
    if (prefersReducedMotion) return [] as Array<never>

    return Array.from({ length: 28 }).map((_, index) => {
      const size = Math.random() * 6 + 4 // 4px - 10px
      return {
        id: `sparkle-${index}`,
        size,
        left: Math.random() * 100,
        top: Math.random() * 100,
        duration: Math.random() * 6 + 8, // 8s - 14s
        delay: Math.random() * 4,
        offset: Math.random() * 30 + 10
      }
    })
  }, [prefersReducedMotion])

  return (
    <section 
      ref={containerRef}
      className="relative h-screen flex items-center justify-center w-full bg-transparent"
    >
      {!prefersReducedMotion && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-10">
          {sparkles.map((sparkle) => (
            <motion.span
              key={sparkle.id}
              className="absolute rounded-full bg-primary-gold/70 shadow-[0_0_20px_rgba(212,175,55,0.45)]"
              style={{
                width: sparkle.size,
                height: sparkle.size,
                left: `${sparkle.left}%`,
                top: `${sparkle.top}%`,
                filter: 'blur(0.5px)'
              }}
              initial={{ opacity: 0, scale: 0.3 }}
              animate={{
                opacity: [0, 0.8, 0],
                scale: [0.6, 1.1, 0.6],
                y: [0, -sparkle.offset, 0]
              }}
              transition={{
                duration: sparkle.duration,
                delay: sparkle.delay,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
            />
          ))}
        </div>
      )}

      {/* Main Content */}
      <div className="container-custom relative z-20 flex items-center justify-center min-h-screen">
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="text-center max-w-5xl mx-auto w-full px-4"
        >
          {/* Main Heading */}
          <motion.div variants={fadeInUp} className="mb-8">
            <motion.h1 
              className="font-display font-bold leading-none mb-4 text-5xl md:text-7xl lg:text-8xl pt-16 md:mt-24"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ 
                duration: 1.2, 
                ease: [0.25, 0.46, 0.45, 0.94],
                delay: 0.2 
              }}
              style={{ paddingTop: '6rem' }}
            >
              <span className="inline-block text-gradient-gold">GLITZFUSION</span>
            </motion.h1>
            
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              transition={{ duration: 1.5, delay: 1 }}
              className="h-1 bg-gradient-gold mx-auto max-w-xs mb-6"
            />
            
            <motion.p 
              className="text-xl md:text-2xl lg:text-3xl font-light text-gray-200 max-w-3xl mx-auto leading-relaxed"
              variants={fadeInUp}
            >
              Badlapur's First Media Academy
            </motion.p>
          </motion.div>

          {/* Subtitle */}
          <motion.p 
            variants={fadeInUp}
            className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto mb-12 leading-relaxed"
          >
            Master the arts of <span className="text-primary-gold font-medium">Acting</span>, 
            <span className="text-primary-gold font-medium"> Dancing</span>, 
            <span className="text-primary-gold font-medium"> Photography</span>, 
            <span className="text-primary-gold font-medium"> Filmmaking</span>, and 
            <span className="text-primary-gold font-medium"> Modeling</span> at Badlapur's premier creative academy with industry experts.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div 
            variants={fadeInUp}
            className="flex flex-col sm:flex-row items-center justify-center gap-6 w-full max-w-2xl mx-auto"
          >
            {/* Primary CTA */}
            <motion.button
              className={cn(
                'group relative px-8 py-4 text-lg font-semibold rounded-xl',
                'bg-gradient-gold text-primary-black',
                'hover:shadow-gold-glow-lg focus:shadow-gold-glow-lg',
                'focus:outline-none focus:ring-2 focus:ring-primary-gold focus:ring-offset-2 focus:ring-offset-primary-black',
                'transition-all duration-300 touch-target w-full sm:w-auto text-center',
                'flex-shrink-0' // Prevent button from shrinking
              )}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="relative z-10 flex items-center space-x-2">
                <span>Explore the Academy</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
              </span>
              
              {/* Shimmer Effect */}
              <div className="absolute inset-0 rounded-xl overflow-hidden">
                <div className="shimmer absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              </div>
            </motion.button>

            {/* Secondary CTA */}
            <motion.div
              className="w-full sm:w-auto mt-4 sm:mt-0"
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="relative">
                <GlassPanel
                  className={cn(
                    'group relative w-full px-8 py-4 text-lg font-medium',
                    'transition-all duration-300 hover:bg-white/5',
                    'border border-white/10 hover:border-white/20',
                    'focus:outline-none focus:ring-2 focus:ring-primary-gold/50 focus:ring-offset-2 focus:ring-offset-primary-black',
                    'cursor-pointer' // Add cursor pointer
                  )}
                  glow
                >
                  <span className="relative z-10 flex items-center justify-center space-x-3">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary-gold/10 group-hover:bg-primary-gold/20 transition-all duration-300">
                      <Play className="w-4 h-4 text-primary-gold group-hover:scale-110 transition-transform duration-200" />
                    </span>
                    <span className="text-white font-medium">Watch Our Story</span>
                  </span>
                  
                  {/* Subtle hover effect */}
                  <div className="absolute inset-0 rounded-xl overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />
                  </div>
                </GlassPanel>
                
                {/* Clickable overlay for better UX */}
                <button 
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer rounded-[inherit]" 
                  aria-label="Watch Our Story"
                />
              </div>
            </motion.div>
          </motion.div>

          {/* Stats */}
          <motion.div 
            variants={fadeInUp}
            className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8"
          >
            {[
              { number: '500+', label: 'Students Trained' },
              { number: '15+', label: 'Expert Instructors' },
              { number: '50+', label: 'Industry Partners' },
              { number: '95%', label: 'Success Rate' },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial="hidden"
                animate="visible"
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { 
                    opacity: 1, 
                    y: 0,
                    transition: { 
                      delay: 0.2 + index * 0.1,
                      duration: 0.5 
                    } 
                  }
                }}
                transition={{ 
                  duration: 0.6, 
                  delay: 1.5 + index * 0.1,
                  ease: [0.25, 0.46, 0.45, 0.94]
                }}
                className="text-center"
              >
                <div className="text-3xl md:text-4xl font-bold text-gradient-gold mb-2">
                  {stat.number}
                </div>
                <div className="text-sm md:text-base text-gray-300">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>

    </section>
  )
}
