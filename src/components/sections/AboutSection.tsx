'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Award, Users, Target, Zap, Volume2, VolumeX, Pause, Play, Loader2 } from 'lucide-react'
import { GlassPanel } from '@/components/ui/GlassPanel'
import { cn, fadeInUp, staggerContainer } from '@/lib/utils'
import { useAbout } from '@/hooks/useAbout'

// Icon mapping for dynamic icons
const iconMap: Record<string, any> = {
  Award,
  Users,
  Target,
  Zap
}

// Default features as fallback
const defaultFeatures = [
  {
    icon: Award,
    title: 'Industry Excellence',
    description: 'Learn from award-winning professionals with decades of experience in entertainment and media.'
  },
  {
    icon: Users,
    title: 'Personalized Training',
    description: 'Small class sizes ensure individual attention and customized learning paths for every student.'
  },
  {
    icon: Target,
    title: 'Career Focus',
    description: 'Our curriculum is designed with industry needs in mind, preparing you for real-world success.'
  },
  {
    icon: Zap,
    title: 'Cutting-Edge Facilities',
    description: 'State-of-the-art studios, equipment, and technology to enhance your learning experience.'
  }
]

export function AboutSection() {
  const { content, loading } = useAbout()
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [userPaused, setUserPaused] = useState(false)


  // Create features array from dynamic content
  const features = [
    {
      icon: iconMap[content.feature1Icon || 'Award'] || Award,
      title: content.feature1Title || defaultFeatures[0].title,
      description: content.feature1Description || defaultFeatures[0].description
    },
    {
      icon: iconMap[content.feature2Icon || 'Users'] || Users,
      title: content.feature2Title || defaultFeatures[1].title,
      description: content.feature2Description || defaultFeatures[1].description
    },
    {
      icon: iconMap[content.feature3Icon || 'Target'] || Target,
      title: content.feature3Title || defaultFeatures[2].title,
      description: content.feature3Description || defaultFeatures[2].description
    },
    {
      icon: iconMap[content.feature4Icon || 'Zap'] || Zap,
      title: content.feature4Title || defaultFeatures[3].title,
      description: content.feature4Description || defaultFeatures[3].description
    }
  ]

  const playVideo = useCallback(async (preferUnmuted = true) => {
    const video = videoRef.current
    if (!video) return false

    const attemptPlay = async (muted: boolean) => {
      video.muted = muted
      setIsMuted(muted)
      try {
        await video.play()
        setIsPlaying(true)
        return true
      } catch (error) {
        setIsPlaying(false)
        return false
      }
    }

    if (preferUnmuted) {
      const unmutedPlayed = await attemptPlay(false)
      if (unmutedPlayed) {
        return true
      }
    }

    return attemptPlay(true)
  }, [])

  const togglePlay = () => {
    const video = videoRef.current
    if (!video) return

    if (video.paused) {
      playVideo(!isMuted).then((played) => {
        if (played) {
          setUserPaused(false)
        }
      })
    } else {
      video.pause()
      setIsPlaying(false)
      setUserPaused(true)
    }
  }

  const toggleMute = () => {
    const video = videoRef.current
    if (!video) return

    video.muted = !video.muted
    setIsMuted(video.muted)
  }

  const handlePlay = () => setIsPlaying(true)
  const handlePause = () => setIsPlaying(false)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (!userPaused) {
            playVideo(true)
          }
        } else {
          if (!video.paused) {
            video.pause()
            setIsPlaying(false)
          }
        }
      },
      {
        threshold: 0.5,
        rootMargin: '0px 0px -10% 0px'
      }
    )

    observer.observe(video)

    return () => {
      observer.unobserve(video)
      observer.disconnect()
    }
  }, [playVideo, userPaused])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    video.muted = isMuted
  }, [isMuted])

  // Show loading state
  if (loading) {
    return (
      <section className="py-20 relative">
        <div className="container-custom">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="flex items-center space-x-2 text-primary-gold">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span>Loading about content...</span>
            </div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-20 relative">
      <div className="container-custom">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Content Side */}
          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-100px" }}
          >
            <motion.h2 
              variants={fadeInUp}
              className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-gradient-gold mb-6"
            >
              {content.aboutTitle || 'About Glitz Fusion'}
            </motion.h2>
            
            <motion.p 
              variants={fadeInUp}
              className="text-lg md:text-xl text-gray-300 leading-relaxed mb-8"
            >
              {content.aboutDescription1 || 'For over a decade, Glitz Fusion has been the premier destination for aspiring artists and creative professionals. Our academy combines traditional techniques with modern innovation to create a learning environment where talent flourishes.'}
            </motion.p>

            <motion.p 
              variants={fadeInUp}
              className="text-base md:text-lg text-gray-400 leading-relaxed mb-12"
            >
              {content.aboutDescription2 || 'We believe that every individual has a unique creative voice waiting to be discovered. Our mission is to provide the tools, guidance, and opportunities needed to transform passion into professional success.'}
            </motion.p>

            {/* Features Grid */}
            <motion.div 
              variants={staggerContainer}
              className="grid grid-cols-1 sm:grid-cols-2 gap-6"
            >
              {features.map((feature) => {
                const Icon = feature.icon
                return (
                  <motion.div
                    key={feature.title}
                    variants={fadeInUp}
                    className="group"
                  >
                    <GlassPanel className="p-6 rounded-xl hover:shadow-gold-glow transition-all duration-300">
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 bg-gradient-gold rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                            <Icon className="w-6 h-6 text-primary-black" />
                          </div>
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-primary-gold transition-colors duration-300">
                            {feature.title}
                          </h3>
                          <p className="text-sm text-gray-300 leading-relaxed">
                            {feature.description}
                          </p>
                        </div>
                      </div>
                    </GlassPanel>
                  </motion.div>
                )
              })}
            </motion.div>
          </motion.div>

          {/* Video/Image Side */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
            viewport={{ once: true, margin: "-100px" }}
            className="relative"
          >
            <GlassPanel className="relative overflow-hidden rounded-2xl aspect-video group">
              {/* Video Background */}
              <video
                ref={videoRef}
                className="absolute inset-0 h-full w-full object-cover"
                src={content.aboutVideoUrl || '/Video assets/Video1.mp4'}
                loop
                muted={isMuted}
                playsInline
                onPlay={handlePlay}
                onPause={handlePause}
                controls={false}
              />

              {/* Play overlay when paused */}
              {!isPlaying && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.button
                    type="button"
                    onClick={togglePlay}
                    className={cn(
                      'w-20 h-20 bg-primary-gold/90 rounded-full flex items-center justify-center',
                      'hover:bg-primary-gold-light focus:bg-primary-gold-light',
                      'focus:outline-none focus:ring-4 focus:ring-primary-gold/30',
                      'transition-all duration-300'
                    )}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    aria-label="Play video"
                  >
                    <Play className="w-8 h-8 text-primary-black" />
                  </motion.button>
                </div>
              )}

              {/* Custom controls */}
              <div className="absolute bottom-4 right-4 flex items-center space-x-3 bg-primary-black/70 backdrop-blur-xl px-4 py-2 rounded-full border border-white/10">
                <button
                  type="button"
                  onClick={togglePlay}
                  className="text-white hover:text-primary-gold transition-colors"
                  aria-label={isPlaying ? 'Pause video' : 'Play video'}
                >
                  {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                </button>
                <span className="w-px h-5 bg-white/20" />
                <button
                  type="button"
                  onClick={toggleMute}
                  className="text-white hover:text-primary-gold transition-colors"
                  aria-label={isMuted ? 'Unmute video' : 'Mute video'}
                >
                  {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </button>
              </div>

              {/* Decorative accents */}
              <div className="pointer-events-none absolute top-4 left-4 w-8 h-8 border-2 border-primary-gold rounded-full opacity-60" />
              <div className="pointer-events-none absolute bottom-4 right-4 w-12 h-12 border-2 border-primary-gold rounded-full opacity-40" />
              <div className="pointer-events-none absolute top-1/2 right-8 w-6 h-6 border-2 border-primary-gold rounded-full opacity-50" />
            </GlassPanel>

            {/* Floating Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
              className="absolute -bottom-6 -left-6"
            >
              <GlassPanel className="p-4 rounded-xl">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gradient-gold">{content.stat1Value || '10+'}</div>
                  <div className="text-xs text-gray-300">{content.stat1Label || 'Years Experience'}</div>
                </div>
              </GlassPanel>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              viewport={{ once: true }}
              className="absolute -top-6 -right-6"
            >
              <GlassPanel className="p-4 rounded-xl">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gradient-gold">{content.stat2Value || '500+'}</div>
                  <div className="text-xs text-gray-300">{content.stat2Label || 'Success Stories'}</div>
                </div>
              </GlassPanel>
            </motion.div>
          </motion.div>
        </div>

        {/* Bottom CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="text-center mt-20"
        >
          <GlassPanel className="p-8 rounded-2xl max-w-4xl mx-auto">
            <h3 className="text-2xl md:text-3xl font-bold text-gradient-gold mb-4">
              {content.ctaTitle || 'Ready to Begin Your Creative Journey?'}
            </h3>
            <p className="text-lg text-gray-300 mb-8 leading-relaxed">
              {content.ctaDescription || 'Join hundreds of successful graduates who have transformed their passion into thriving careers.'}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                className={cn(
                  'px-8 py-4 text-lg font-semibold rounded-xl',
                  'bg-gradient-gold text-primary-black',
                  'hover:shadow-gold-glow-lg focus:shadow-gold-glow-lg',
                  'focus:outline-none focus:ring-2 focus:ring-primary-gold focus:ring-offset-2 focus:ring-offset-transparent',
                  'transition-all duration-300'
                )}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                {content.ctaButtonPrimary || 'Apply Now'}
              </motion.button>
              <motion.button
                className={cn(
                  'px-8 py-4 text-lg font-semibold rounded-xl',
                  'border-2 border-primary-gold text-primary-gold',
                  'hover:bg-primary-gold hover:text-primary-black',
                  'focus:outline-none focus:ring-2 focus:ring-primary-gold focus:ring-offset-2 focus:ring-offset-transparent',
                  'transition-all duration-300'
                )}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                {content.ctaButtonSecondary || 'Schedule Tour'}
              </motion.button>
            </div>
          </GlassPanel>
        </motion.div>
      </div>
    </section>
  )
}
