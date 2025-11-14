'use client';

import { motion } from 'framer-motion';
import { fadeIn, staggerContainer } from '@/lib/utils';
import { useAbout } from '@/hooks/useAbout';
import { Loader2 } from 'lucide-react';

export function AboutHero() {
  const { content, loading } = useAbout();

  // Show loading state
  if (loading) {
    return (
      <section className="relative py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-dark via-black to-primary-dark/80 -z-10" />
        <div className="container-custom relative z-10">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="flex items-center space-x-2 text-primary-gold">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span>Loading hero content...</span>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative py-20 md:py-32 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-dark via-black to-primary-dark/80 -z-10" />
      
      {/* Animated particles */}
      <div className="absolute inset-0 overflow-hidden opacity-20">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-primary-gold"
            style={{
              width: Math.random() * 6 + 2 + 'px',
              height: Math.random() * 6 + 2 + 'px',
              left: Math.random() * 100 + '%',
              top: Math.random() * 100 + '%',
              opacity: Math.random() * 0.5 + 0.1,
            }}
            animate={{
              y: [0, -30, 0],
              x: [0, Math.random() * 40 - 20, 0],
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              ease: 'easeInOut',
              repeatType: 'reverse',
            }}
          />
        ))}
      </div>

      <div className="container-custom relative z-10">
        <motion.div
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: '-100px' }}
          className="max-w-4xl mx-auto text-center"
        >
          <motion.span
            variants={fadeIn}
            className="inline-block px-4 py-2 mb-6 text-sm font-medium tracking-wider text-primary-gold uppercase rounded-full bg-primary-gold/10 backdrop-blur-sm"
          >
            {content.heroSubtitle || 'Our Story'}
          </motion.span>
          
          <motion.h1
            variants={fadeIn}
            className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6"
          >
            {content.heroTitle ? (
              content.heroTitle
            ) : (
              <>
                Where{' '}
                <span className="bg-gradient-to-r from-primary-gold to-amber-300 bg-clip-text text-transparent">
                  Talent
                </span>{' '}
                Meets{' '}
                <span className="bg-gradient-to-r from-primary-gold to-amber-300 bg-clip-text text-transparent">
                  Opportunity
                </span>
              </>
            )}
          </motion.h1>
          
          <motion.p
            variants={fadeIn}
            className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto"
          >
            {content.heroDescription || 'At Glitz Fusion, we believe in the transformative power of performing arts. Our mission is to nurture creativity, build confidence, and launch successful careers in the entertainment industry.'}
          </motion.p>
        </motion.div>
      </div>
      
      {/* Decorative elements */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-primary-dark to-transparent -z-10" />
      <div className="absolute -bottom-1 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary-gold to-transparent opacity-50" />
    </section>
  );
}
