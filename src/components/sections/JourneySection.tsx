'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { fadeIn, staggerContainer } from '@/lib/utils';
import { Loader2, Calendar, Users, Award, Quote, MapPin } from 'lucide-react';

interface JourneyMilestone {
  id: string;
  year: string;
  title: string;
  description: string;
  image?: string;
  stats?: {
    label: string;
    value: string;
  }[];
}

interface JourneyContent {
  title?: string;
  subtitle?: string;
  description?: string;
  founderQuote?: string;
  founderName?: string;
  founderTitle?: string;
  founderImage?: string;
  milestones?: JourneyMilestone[];
}

export function JourneySection() {
  const [content, setContent] = useState<JourneyContent>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJourneyContent = async () => {
      try {
        const response = await fetch('/api/about/journey');
        if (response.ok) {
          const data = await response.json();
          setContent(data);
        }
      } catch (error) {
        console.error('Error fetching journey content:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchJourneyContent();
  }, []);

  if (loading) {
    return (
      <section className="relative py-20 md:py-28 bg-gradient-to-br from-primary-dark via-black to-primary-dark/80">
        <div className="container-custom">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="flex items-center space-x-2 text-primary-gold">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span>Loading our journey...</span>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Default content if no data is available
  const defaultContent: JourneyContent = {
    title: "Our Journey",
    subtitle: "Crafting Excellence in Performing Arts Since 2015",
    description: "What started as a small studio with a big dream has grown into a premier institution for performing arts education. Our founder, Sarah Johnson, envisioned a space where passion meets professionalism.",
    founderQuote: "Our vision was never just about teaching skills – it was about building a community where artists could grow, collaborate, and shine.",
    founderName: "Sarah Johnson",
    founderTitle: "Founder & Creative Director",
    milestones: [
      {
        id: "1",
        year: "2015",
        title: "The Beginning",
        description: "Established with just 3 instructors and 20 students",
        stats: [
          { label: "Instructors", value: "3" },
          { label: "Students", value: "20" }
        ]
      },
      {
        id: "2",
        year: "2018",
        title: "Expansion",
        description: "Expanded to include film and media production",
        stats: [
          { label: "New Programs", value: "5" },
          { label: "Students", value: "150" }
        ]
      },
      {
        id: "3",
        year: "2023",
        title: "Excellence",
        description: "Over 1,000 students trained with 85% industry placement",
        stats: [
          { label: "Students Trained", value: "1,000+" },
          { label: "Industry Placement", value: "85%" }
        ]
      }
    ]
  };

  const journeyData = { ...defaultContent, ...content };

  return (
    <section className="relative py-32 md:py-40 bg-gradient-to-br from-black via-gray-950 to-black overflow-hidden">
      {/* Enhanced Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Animated particles */}
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-primary-gold/15"
            style={{
              width: Math.random() * 4 + 1 + 'px',
              height: Math.random() * 4 + 1 + 'px',
              left: Math.random() * 100 + '%',
              top: Math.random() * 100 + '%',
            }}
            animate={{
              y: [0, -30, 0],
              x: [0, Math.random() * 40 - 20, 0],
              opacity: [0.1, 0.3, 0.1],
            }}
            transition={{
              duration: Math.random() * 20 + 20,
              repeat: Infinity,
              ease: 'easeInOut',
              repeatType: 'reverse',
            }}
          />
        ))}
        
        {/* Gradient overlays */}
        <div className="absolute top-1/4 left-0 w-96 h-96 bg-primary-gold/3 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-amber-400/3 rounded-full blur-3xl" />
      </div>

      <div className="container-custom relative z-10">
        {/* Enhanced Header */}
        <motion.div
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: '-100px' }}
          className="text-center mb-24"
        >
          <motion.div
            variants={fadeIn}
            className="inline-flex items-center px-6 py-3 mb-8 text-sm font-semibold tracking-[0.2em] text-primary-gold uppercase rounded-full bg-gradient-to-r from-primary-gold/10 via-amber-300/5 to-primary-gold/10 backdrop-blur-sm border border-primary-gold/20"
          >
            <MapPin className="w-5 h-5 mr-3" />
            {journeyData.subtitle || 'Our Story'}
          </motion.div>
          
          <motion.h2
            variants={fadeIn}
            className="text-5xl md:text-7xl lg:text-8xl font-black text-white mb-8 tracking-tight"
          >
            <span className="bg-gradient-to-r from-white via-gray-100 to-white bg-clip-text text-transparent">
              {journeyData.title || 'Our Journey'}
            </span>
          </motion.h2>
          
          <motion.p
            variants={fadeIn}
            className="max-w-4xl mx-auto text-xl md:text-2xl text-gray-300 leading-relaxed font-light"
          >
            {journeyData.description}
          </motion.p>
        </motion.div>

        {/* Timeline Section */}
        <div className="max-w-6xl mx-auto mb-24">
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-primary-gold/60 via-primary-gold/40 to-primary-gold/20 rounded-full" />
            
            {/* Milestones */}
            <div className="space-y-24">
              {journeyData.milestones?.map((milestone, index) => (
                <motion.div
                  key={milestone.id}
                  variants={fadeIn}
                  custom={index * 0.2}
                  initial="initial"
                  whileInView="animate"
                  viewport={{ once: true, margin: '-100px' }}
                  className={`relative flex items-center ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}
                >
                  {/* Timeline dot */}
                  <div className="absolute left-1/2 transform -translate-x-1/2 w-6 h-6 bg-primary-gold rounded-full border-4 border-black shadow-[0_0_20px_rgba(247,196,101,0.5)] z-10" />
                  
                  {/* Content */}
                  <div className={`w-5/12 ${index % 2 === 0 ? 'pr-12 text-right' : 'pl-12 text-left'}`}>
                    <div className="group relative overflow-hidden rounded-[24px] bg-gradient-to-br from-gray-900/95 via-black/90 to-gray-950/95 backdrop-blur-2xl border border-white/10 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.8)] transition-all duration-500 hover:border-primary-gold/30 hover:shadow-[0_40px_100px_-40px_rgba(247,196,101,0.3)]">
                      
                      {/* Top accent line */}
                      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary-gold/60 to-transparent" />
                      
                      <div className="p-8">
                        {/* Year badge */}
                        <div className="inline-flex items-center rounded-full border border-primary-gold/40 bg-gradient-to-r from-primary-gold/10 to-amber-300/10 px-4 py-2 text-lg font-bold uppercase tracking-[0.15em] text-primary-gold backdrop-blur-sm mb-4">
                          <Calendar className="w-4 h-4 mr-2" />
                          {milestone.year}
                        </div>
                        
                        {/* Title */}
                        <h3 className="text-2xl md:text-3xl font-black text-white mb-4 tracking-tight">
                          {milestone.title}
                        </h3>
                        
                        {/* Description */}
                        <p className="text-lg text-gray-200 leading-relaxed font-light mb-6">
                          {milestone.description}
                        </p>
                        
                        {/* Stats */}
                        {milestone.stats && milestone.stats.length > 0 && (
                          <div className="grid grid-cols-2 gap-4">
                            {milestone.stats.map((stat, idx) => (
                              <div key={idx} className="text-center p-4 rounded-xl bg-gradient-to-r from-white/5 to-white/[0.02] border border-white/5">
                                <div className="text-2xl font-black text-primary-gold mb-1">
                                  {stat.value}
                                </div>
                                <div className="text-sm text-gray-400 uppercase tracking-wide">
                                  {stat.label}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      {/* Bottom accent */}
                      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-primary-gold/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Founder Quote Section */}
        {journeyData.founderQuote && (
          <motion.div
            variants={fadeIn}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: '-100px' }}
            className="max-w-5xl mx-auto"
          >
            <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-gray-900/95 via-black/90 to-gray-950/95 backdrop-blur-2xl border border-white/10 shadow-[0_40px_120px_-40px_rgba(0,0,0,0.8)]">
              
              {/* Top accent line */}
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary-gold/60 to-transparent" />
              
              <div className="p-12 lg:p-16 text-center">
                {/* Quote icon */}
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-primary-gold/20 to-amber-300/20 border border-primary-gold/30 mb-8">
                  <Quote className="w-8 h-8 text-primary-gold" />
                </div>
                
                {/* Quote text */}
                <blockquote className="text-2xl md:text-3xl lg:text-4xl font-light text-white leading-relaxed mb-8 italic">
                  "{journeyData.founderQuote}"
                </blockquote>
                
                {/* Founder info */}
                <div className="flex items-center justify-center space-x-4">
                  {journeyData.founderImage && (
                    <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-primary-gold/30">
                      <Image
                        src={journeyData.founderImage}
                        alt={journeyData.founderName || 'Founder'}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    </div>
                  )}
                  <div className="text-left">
                    <div className="text-lg font-bold text-primary-gold">
                      — {journeyData.founderName}
                    </div>
                    <div className="text-sm text-gray-400 uppercase tracking-wide">
                      {journeyData.founderTitle}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Bottom accent */}
              <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-primary-gold/40 to-transparent" />
            </div>
          </motion.div>
        )}

        {/* Enhanced Bottom Section */}
        <motion.div
          variants={fadeIn}
          className="mt-32 text-center"
        >
          <div className="inline-flex items-center space-x-4">
            <div className="w-24 h-px bg-gradient-to-r from-transparent to-primary-gold/60" />
            <div className="w-3 h-3 rounded-full bg-primary-gold/60" />
            <div className="w-24 h-px bg-gradient-to-l from-transparent to-primary-gold/60" />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
