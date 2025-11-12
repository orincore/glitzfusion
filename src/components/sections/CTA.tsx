'use client';

import { motion } from 'framer-motion';
import { fadeIn, staggerContainer } from '@/lib/utils';

export function CTA() {
  return (
    <section className="relative py-20 md:py-28 bg-gradient-to-b from-black to-primary-dark">
      <div className="container-custom">
        <motion.div
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: '-100px' }}
          className="relative z-10 max-w-4xl mx-auto text-center"
        >
          <motion.span
            variants={fadeIn}
            className="inline-block text-primary-gold font-medium mb-4"
          >
            Ready to Begin Your Journey?
          </motion.span>
          
          <motion.h2
            variants={fadeIn}
            className="text-3xl md:text-5xl font-bold text-white mb-6"
          >
            Join the Glitz Fusion Family Today
          </motion.h2>
          
          <motion.p
            variants={fadeIn}
            className="text-xl text-gray-300 mb-10 max-w-3xl mx-auto"
          >
            Take the first step toward your performing arts career. Our enrollment specialists are here to guide you through the process and help you find the perfect program.
          </motion.p>
          
          <motion.div 
            variants={fadeIn}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <a
              href="/contact"
              className="px-8 py-4 bg-primary-gold hover:bg-amber-400 text-primary-dark font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary-gold focus:ring-offset-2 focus:ring-offset-primary-dark"
            >
              Schedule a Tour
            </a>
            <a
              href="/programs"
              className="px-8 py-4 border-2 border-primary-gold text-white hover:bg-primary-gold/10 font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary-gold focus:ring-offset-2 focus:ring-offset-primary-dark"
            >
              Explore Programs
            </a>
          </motion.div>
          
          <motion.p 
            variants={fadeIn}
            className="mt-8 text-gray-400 text-sm"
          >
            Have questions? Call us at <a href="tel:+1234567890" className="text-primary-gold hover:underline">(123) 456-7890</a> or email <a href="mailto:admissions@glitzfusion.com" className="text-primary-gold hover:underline">admissions@glitzfusion.com</a>
          </motion.p>
        </motion.div>
        
        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden opacity-10">
          {['🎭', '💃', '🎬', '🎤', '🎨', '🎹'].map((emoji, i) => (
            <motion.span
              key={i}
              className="absolute text-4xl"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                transform: `rotate(${Math.random() * 360}deg)`,
              }}
              animate={{
                y: [0, -20, 0],
                rotate: [0, Math.random() * 360],
              }}
              transition={{
                duration: Math.random() * 10 + 10,
                repeat: Infinity,
                ease: 'easeInOut',
                repeatType: 'reverse',
              }}
            >
              {emoji}
            </motion.span>
          ))}
        </div>
      </div>
      
      {/* Decorative elements */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-primary-dark to-transparent -z-10" />
    </section>
  );
}
