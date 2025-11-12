'use client';

import { motion } from 'framer-motion';
import { fadeInUp, staggerContainer } from '@/lib/utils';

interface PageHeaderProps {
  title: string;
  description: string;
  className?: string;
}

export default function PageHeader({ title, description, className = '' }: PageHeaderProps) {
  return (
    <div className={`relative pt-20 md:pt-40 overflow-hidden ${className}`}>
      {/* Background Effects - matching homepage */}
      <div className="absolute inset-0 -z-10">
        {/* Spotlight Background */}
        <div className="absolute inset-0 bg-spotlight opacity-30" />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-black via-primary-black to-primary-dark/90" />
      </div>

      {/* Animated particles background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-primary-gold/30 rounded-full animate-float" />
        <div className="absolute top-3/4 right-1/4 w-1 h-1 bg-primary-gold/20 rounded-full animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-3/4 w-1.5 h-1.5 bg-primary-gold/25 rounded-full animate-float" style={{ animationDelay: '4s' }} />
      </div>

      <div className="container-custom relative z-10">
        <motion.div
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: "-100px" }}
          className="max-w-5xl mx-auto text-center"
        >
          <motion.h1 
            variants={fadeInUp}
            className="text-5xl md:text-6xl lg:text-7xl font-display font-bold text-gradient-gold pb-10 leading-tight"
          >
            {title}
          </motion.h1>
          <motion.p 
            variants={fadeInUp}
            className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed mb-2"
          >
            {description}
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
}
