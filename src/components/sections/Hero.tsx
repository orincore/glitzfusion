'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion'
import { ArrowRight, Play } from 'lucide-react'
import { GlassPanel } from '@/components/ui/GlassPanel'
import { cn, fadeInUp, staggerContainer } from '@/lib/utils'

type Particle = {
  id: number
  left: string
  top: string
  size: number
  delay: number
  duration: number
  path: Array<{ x: number; y: number }>
}

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
  const [particleConfig, setParticleConfig] = useState<Particle[]>([])

  // Generate more organic and varied movement paths
  const generateMovementPath = (index: number) => {
    const pathType = index % 5; // Cycle through different path types
    const size = 15 + Math.random() * 20; // Random path size
    
    switch(pathType) {
      case 0: // Flower pattern
        return Array.from({ length: 5 }).map((_, i) => {
          const angle = (i / 5) * Math.PI * 2;
          const petalSize = size * (0.7 + 0.3 * Math.sin(angle * 3));
          return {
            x: Math.cos(angle) * petalSize,
            y: Math.sin(angle) * petalSize * 0.7
          };
        });
        
      case 1: // Infinity/Figure-8
        return Array.from({ length: 9 }).map((_, i) => {
          const t = (i / 8) * Math.PI * 2;
          return {
            x: Math.sin(t) * size * 1.5,
            y: Math.sin(t * 2) * size * 0.8
          };
        });
        
      case 2: // Spiral
        return Array.from({ length: 8 }).map((_, i) => {
          const t = (i / 7) * Math.PI * 2;
          const r = (i / 7) * size;
          return {
            x: Math.cos(t) * r,
            y: Math.sin(t) * r * 0.7
          };
        });
        
      case 3: // Zigzag
        return [
          { x: 0, y: 0 },
          { x: size * 0.8, y: -size * 0.6 },
          { x: 0, y: -size * 0.3 },
          { x: -size * 0.8, y: -size * 0.9 },
          { x: 0, y: -size * 0.6 },
          { x: size * 0.8, y: -size * 1.2 },
          { x: 0, y: -size * 0.9 },
          { x: -size * 0.8, y: -size * 0.6 },
          { x: 0, y: 0 }
        ];
        
      default: // Random organic path
        return Array.from({ length: 7 }).map((_, i) => {
          const t = (i / 6) * Math.PI * 2;
          const r = size * (0.7 + 0.3 * Math.sin(t * 2 + Math.PI / 4));
          return {
            x: Math.cos(t * 1.3) * r * (i % 2 === 0 ? 1 : 0.8),
            y: Math.sin(t * 1.1) * r * 0.7
          };
        });
    }
  };

  useEffect(() => {
    setMounted(true);
    
    if (typeof window !== 'undefined' && !prefersReducedMotion) {
      const particles: Particle[] = Array.from({ length: 28 }).map((_, index) => {
        // Vary sizes and speeds more
        const size = 3 + Math.random() * 8; // 3-11px
        const duration = 12 + Math.random() * 24; // 12-36s
        const delay = Math.random() * 8;
        
        // Generate path based on particle index for better distribution
        const path = generateMovementPath(index);
        
        // Add some randomness to the paths
        const scaleX = 0.8 + Math.random() * 0.4; // 0.8-1.2
        const scaleY = 0.7 + Math.random() * 0.6; // 0.7-1.3
        path.forEach(point => {
          point.x *= scaleX;
          point.y *= scaleY;
        });
        
        // Randomly flip some paths for more variety
        if (Math.random() > 0.5) path.forEach(p => { p.x *= -1; });
        if (Math.random() > 0.5) path.forEach(p => { p.y *= -1; });
        
        return {
          id: index,
          left: `${10 + Math.random() * 80}%`, // Keep away from edges
          top: `${10 + Math.random() * 80}%`,
          size: size,
          delay: delay,
          duration: duration,
          path: path
        };
      });
      
      setParticleConfig(particles);
    } else {
      setParticleConfig([]);
    }
  }, [prefersReducedMotion])

  return (
    <section 
      ref={containerRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden pt-24"
    >
      {/* Background Container */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 z-0">
          {/* Base gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary-black via-primary-black/90 to-primary-black/80" />
          
          {/* Animated radial washes */}
          {mounted && !prefersReducedMotion && (
            <>
              <motion.div
                className="absolute -top-1/2 left-1/2 h-[120vw] w-[120vw] -translate-x-1/2 rounded-full bg-gradient-to-br from-primary-gold/30 via-primary-gold/10 to-transparent opacity-40 mix-blend-screen"
                initial={{ 
                  rotate: 0,
                  scale: 0.9,
                  opacity: 0.3 
                }}
                animate={{ 
                  rotate: 360,
                  scale: [1, 1.1, 0.9, 1],
                  opacity: [0.3, 0.5, 0.3]
                }}
                transition={{ 
                  duration: 45 + Math.random() * 30, // Random duration between 45-75s
                  ease: [0.2, 0.8, 0.4, 1], // Custom bezier curve for organic feel
                  repeat: Infinity,
                  repeatType: 'loop',
                  times: [0, 0.3, 0.6, 1]
                }}
                style={{ zIndex: 1 }}
              />
              <motion.div
                className="absolute -bottom-1/3 left-[-20%] h-[90vw] w-[90vw] rounded-full bg-gradient-to-tr from-primary-gold/25 via-transparent to-transparent opacity-30 mix-blend-screen"
                initial={{ 
                  rotate: 0,
                  scale: 0.8,
                  opacity: 0.2 
                }}
                animate={{ 
                  rotate: -360,
                  scale: [0.9, 1.2, 0.8],
                  opacity: [0.2, 0.4, 0.2]
                }}
                transition={{ 
                  duration: 65 + Math.random() * 40, // Random duration between 65-105s
                  ease: [0.3, 0.7, 0.1, 0.9], // Different bezier curve for variation
                  repeat: Infinity,
                  repeatType: 'loop',
                  times: [0, 0.4, 0.8, 1]
                }}
                style={{ zIndex: 1 }}
              />
            </>
          )}
          
          {/* Floating particles */}
          {mounted && !prefersReducedMotion && (
            <div className="particles">
              {Array.from({ length: 20 }).map((_, i) => (
                <div
                  key={i}
                  className="particle"
                  style={{
                    width: `${3 + Math.random() * 8}px`,
                    height: `${3 + Math.random() * 8}px`,
                  }}
                />
              ))}
            </div>
          )}
          
          {/* Dark overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-primary-black/50 via-primary-black/30 to-primary-black/90 z-10" />
        </div>
        {/* Main content container */}
        <div className="relative z-20 h-full w-full">
          <motion.div 
            className="w-full h-full bg-cover bg-center bg-no-repeat"
            style={{ 
              y,
              opacity,
              backgroundImage: `url('data:image/svg+xml,${encodeURIComponent(`
                <svg width="1920" height="1080" viewBox="0 0 1920 1080" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <radialGradient id="spotlight" cx="50%" cy="30%" r="60%">
                      <stop offset="0%" style="stop-color:rgba(212,175,55,0.3);stop-opacity:1" />
                      <stop offset="50%" style="stop-color:rgba(212,175,55,0.1);stop-opacity:1" />
                      <stop offset="100%" style="stop-color:rgba(10,10,10,1);stop-opacity:1" />
                    </radialGradient>
                    <pattern id="grain" patternUnits="userSpaceOnUse" width="4" height="4">
                      <circle cx="2" cy="2" r="0.5" fill="rgba(255,255,255,0.03)"/>
                    </pattern>
                  </defs>
                  <rect width="1920" height="1080" fill="url(#spotlight)"/>
                  <rect width="1920" height="1080" fill="url(#grain)" opacity="0.1"/>
                </svg>
              `)})`,
              position: 'relative',
              zIndex: 5
            }}
          />
        </div>

        {/* Animated radial washes */}
        {mounted && !prefersReducedMotion && (
          <>
            <motion.div
              className="absolute -top-1/2 left-1/2 h-[120vw] w-[120vw] -translate-x-1/2 rounded-full bg-gradient-to-br from-primary-gold/30 via-primary-gold/10 to-transparent opacity-40 mix-blend-screen allow-motion"
              initial={{ rotate: 0 }}
              animate={{ rotate: 360 }}
              transition={{ 
                duration: 45, 
                ease: 'linear', 
                repeat: Infinity,
                repeatType: 'loop'
              }}
              style={{ zIndex: 5 }}
            />
            <motion.div
              className="absolute -bottom-1/3 left-[-20%] h-[90vw] w-[90vw] rounded-full bg-gradient-to-tr from-primary-gold/25 via-transparent to-transparent opacity-30 mix-blend-screen allow-motion"
              initial={{ rotate: 0 }}
              animate={{ rotate: -360 }}
              transition={{ 
                duration: 55, 
                ease: 'linear', 
                repeat: Infinity,
                repeatType: 'loop'
              }}
              style={{ zIndex: 5 }}
            />
          </>
        )}

        {/* Floating particles */}
        {mounted && particleConfig.length > 0 && (
          <div className="pointer-events-none absolute inset-0 overflow-hidden allow-motion" style={{ zIndex: 6 }}>
            {particleConfig.map((particle) => (
              <div
                key={particle.id}
                className="absolute rounded-full bg-gradient-to-br from-primary-gold/80 via-primary-gold/40 to-transparent shadow-gold-glow"
                style={{
                  left: particle.left,
                  top: particle.top,
                  width: particle.size,
                  height: particle.size,
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Spotlight Animation */}
      <div className="absolute inset-0 spotlight-container z-5" />

      {/* Main Content */}
      <div className="container-custom relative z-20">
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="text-center max-w-5xl mx-auto"
        >
          {/* Main Heading */}
          <motion.div variants={fadeInUp} className="mb-8">
            <motion.h1 
              className="font-display font-bold leading-none mb-4"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ 
                duration: 1.2, 
                ease: [0.25, 0.46, 0.45, 0.94],
                delay: 0.2 
              }}
            >
              <span className="block text-gradient-gold">GLITZ</span>
              <span className="block text-gradient-gold">FUSION</span>
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
              The Premier Media Academy
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
            <span className="text-primary-gold font-medium"> Modeling</span> at the premier creative academy.
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
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
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
