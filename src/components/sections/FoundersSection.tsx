'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { fadeIn, staggerContainer } from '@/lib/utils';
import { useAbout, Founder } from '@/hooks/useAbout';
import { Loader2, Twitter, Linkedin, Instagram, Facebook, Award, ChevronRight, Eye } from 'lucide-react';
import { FounderModal } from '@/components/ui/FounderModal';

export function FoundersSection() {
  const { content, loading } = useAbout();
  const [founders, setFounders] = useState<Founder[]>([]);
  const [foundersLoading, setFoundersLoading] = useState(true);
  const [selectedFounder, setSelectedFounder] = useState<Founder | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openFounderModal = (founder: Founder) => {
    setSelectedFounder(founder);
    setIsModalOpen(true);
  };

  const closeFounderModal = () => {
    setIsModalOpen(false);
    setSelectedFounder(null);
  };

  useEffect(() => {
    const fetchFounders = async () => {
      try {
        const response = await fetch('/api/about/founders');
        if (response.ok) {
          const foundersData = await response.json();
          setFounders(foundersData.filter((founder: Founder) => founder.isActive).sort((a: Founder, b: Founder) => a.order - b.order));
        }
      } catch (error) {
        console.error('Error fetching founders:', error);
      } finally {
        setFoundersLoading(false);
      }
    };

    fetchFounders();
  }, []);

  const getSocialIcon = (platform: string) => {
    switch (platform) {
      case 'twitter': return <Twitter className="w-5 h-5" />;
      case 'linkedin': return <Linkedin className="w-5 h-5" />;
      case 'instagram': return <Instagram className="w-5 h-5" />;
      case 'facebook': return <Facebook className="w-5 h-5" />;
      default: return null;
    }
  };

  if (loading || foundersLoading) {
    return (
      <section className="relative py-20 md:py-28 bg-gradient-to-br from-primary-dark via-black to-primary-dark/80">
        <div className="container-custom">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="flex items-center space-x-2 text-primary-gold">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span>Loading founders...</span>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (founders.length === 0) {
    return null; // Don't render if no founders
  }

  return (
    <section className="relative py-32 md:py-40 bg-gradient-to-br from-black via-gray-950 to-black overflow-hidden">
      {/* Enhanced Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Animated particles */}
        {[...Array(25)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-primary-gold/20"
            style={{
              width: Math.random() * 6 + 2 + 'px',
              height: Math.random() * 6 + 2 + 'px',
              left: Math.random() * 100 + '%',
              top: Math.random() * 100 + '%',
            }}
            animate={{
              y: [0, -60, 0],
              x: [0, Math.random() * 80 - 40, 0],
              opacity: [0.1, 0.4, 0.1],
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
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-gold/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-amber-400/5 rounded-full blur-3xl" />
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
            <Award className="w-5 h-5 mr-3" />
            {content.foundersSubtitle || 'Visionary Leadership'}
          </motion.div>
          
          <motion.h2
            variants={fadeIn}
            className="text-5xl md:text-7xl lg:text-8xl font-black text-white mb-8 tracking-tight"
          >
            {content.foundersTitle ? (
              <span className="bg-gradient-to-r from-white via-gray-100 to-white bg-clip-text text-transparent">
                {content.foundersTitle}
              </span>
            ) : (
              <>
                <span className="block text-white/90">Meet Our</span>
                <span className="block bg-gradient-to-r from-primary-gold via-amber-300 to-primary-gold bg-clip-text text-transparent">
                  Visionary Founders
                </span>
              </>
            )}
          </motion.h2>
          
          <motion.p
            variants={fadeIn}
            className="max-w-4xl mx-auto text-xl md:text-2xl text-gray-300 leading-relaxed font-light"
          >
            {content.foundersDescription || 'The passionate leaders who founded GLITZFUSION with a vision to transform creative education and nurture the next generation of artists.'}
          </motion.p>
        </motion.div>

        {/* Premium Founder Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 max-w-7xl mx-auto">
          {founders.map((founder: Founder, index: number) => (
            <motion.div
              key={founder.id}
              variants={fadeIn}
              custom={index * 0.2}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true, margin: '-100px' }}
              className="group relative h-full"
            >
              {/* Outer glow effect */}
              <div className="absolute -inset-4 rounded-[32px] bg-gradient-to-r from-primary-gold/15 via-amber-300/10 to-primary-gold/15 opacity-0 group-hover:opacity-100 transition-all duration-500 blur-xl" />
              
              {/* Main card - Fixed height for consistency */}
              <div className="relative h-full min-h-[600px] sm:min-h-[650px] lg:min-h-[700px] overflow-hidden rounded-[32px] bg-gradient-to-br from-gray-900/95 via-black/90 to-gray-950/95 backdrop-blur-2xl border border-white/10 shadow-[0_40px_120px_-40px_rgba(0,0,0,0.8)] transition-all duration-500 group-hover:border-primary-gold/30 group-hover:shadow-[0_50px_140px_-50px_rgba(247,196,101,0.4)]">
                
                {/* Top accent line */}
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary-gold/60 to-transparent" />
                
                {/* Content Container */}
                <div className="relative h-full p-8 lg:p-10 flex flex-col">
                  
                  {/* Founder Image - Consistent size */}
                  <div className="relative flex-shrink-0 mx-auto mb-8">
                    {/* Image glow */}
                    <div className="absolute -inset-4 rounded-[24px] bg-gradient-to-br from-primary-gold/25 via-amber-200/15 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 blur-lg" />
                    
                    <div className="relative w-40 h-40 sm:w-48 sm:h-48 lg:w-52 lg:h-52 rounded-[24px] overflow-hidden border-2 border-white/15 shadow-[0_25px_60px_-25px_rgba(0,0,0,0.8)] group-hover:border-primary-gold/40 transition-all duration-500">
                      <Image
                        src={founder.image}
                        alt={founder.name}
                        fill
                        className="object-cover transition-all duration-500 group-hover:scale-105"
                        sizes="(max-width: 640px) 160px, (max-width: 1024px) 192px, 208px"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
                      
                      {/* Image overlay effect */}
                      <div className="absolute inset-0 bg-gradient-to-br from-primary-gold/10 via-transparent to-amber-300/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    </div>
                    
                    {/* Decorative elements */}
                    <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-primary-gold/30 blur-sm opacity-0 group-hover:opacity-100 transition-all duration-500" />
                    <div className="absolute -bottom-2 -left-2 w-4 h-4 rounded-full bg-amber-300/30 blur-sm opacity-0 group-hover:opacity-100 transition-all duration-500" />
                  </div>

                  {/* Founder Information - Flexible content area */}
                  <div className="flex-1 text-center space-y-6">
                    
                    {/* Name and Role */}
                    <div className="space-y-3">
                      <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight">
                        {founder.name}
                      </h3>
                      {founder.role && (
                        <div className="inline-flex items-center rounded-full border border-primary-gold/40 bg-gradient-to-r from-primary-gold/10 to-amber-300/10 px-4 py-2 text-sm font-semibold uppercase tracking-[0.15em] text-primary-gold backdrop-blur-sm">
                          {founder.role}
                        </div>
                      )}
                    </div>

                    {/* Bio - Consistent height with line clamping */}
                    <div className="min-h-[120px] flex items-center justify-center">
                      <div className="relative max-w-md">
                        <p className="text-base lg:text-lg text-gray-200 leading-relaxed font-light line-clamp-6">
                          {founder.bio}
                        </p>
                        {/* Read More Overlay */}
                        <button
                          onClick={() => openFounderModal(founder)}
                          className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 hover:opacity-100 transition-all duration-300 rounded-xl flex items-end justify-center pb-2 group"
                          aria-label={`Read more about ${founder.name}`}
                        >
                          <div className="flex items-center gap-2 px-3 py-1 bg-primary-gold/90 text-black text-sm font-semibold rounded-full transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                            <Eye className="w-4 h-4" />
                            <span>Read More</span>
                          </div>
                        </button>
                      </div>
                    </div>

                    {/* Achievements - Consistent layout */}
                    {founder.achievements && founder.achievements.length > 0 && (
                      <div className="space-y-4">
                        <h4 className="flex items-center justify-center text-xs font-bold uppercase tracking-[0.25em] text-primary-gold/80">
                          <Award className="mr-2 h-4 w-4 text-primary-gold" />
                          Key Highlights
                        </h4>
                        <div className="relative">
                          <div className="grid gap-2 max-h-32 overflow-hidden">
                            {founder.achievements.slice(0, 3).map((achievement, idx) => (
                              <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 10 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="flex items-start rounded-xl bg-gradient-to-r from-white/5 to-white/[0.02] p-3 text-sm text-gray-200 backdrop-blur-sm border border-white/5 transition-all duration-300 hover:bg-primary-gold/10 hover:border-primary-gold/20"
                              >
                                <ChevronRight className="mr-2 mt-0.5 h-3 w-3 flex-shrink-0 text-primary-gold" />
                                <span className="leading-relaxed font-medium line-clamp-2">
                                  {achievement}
                                </span>
                              </motion.div>
                            ))}
                          </div>
                          {/* View All Achievements Button */}
                          {founder.achievements.length > 3 && (
                            <button
                              onClick={() => openFounderModal(founder)}
                              className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 hover:opacity-100 transition-all duration-300 rounded-xl flex items-end justify-center pb-2 group"
                              aria-label={`View all achievements of ${founder.name}`}
                            >
                              <div className="flex items-center gap-2 px-3 py-1 bg-primary-gold/90 text-black text-xs font-semibold rounded-full transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                                <Eye className="w-3 h-3" />
                                <span>View All ({founder.achievements.length})</span>
                              </div>
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Social Links - Fixed bottom position */}
                  {founder.socialLinks && Object.keys(founder.socialLinks).length > 0 && (
                    <div className="pt-6 border-t border-white/10 space-y-3 mt-auto">
                      <span className="block text-xs font-bold uppercase tracking-[0.2em] text-gray-400 text-center">
                        Connect
                      </span>
                      <div className="flex justify-center items-center gap-3">
                        {Object.entries(founder.socialLinks).map(([platform, url]) =>
                          url ? (
                            <a
                              key={platform}
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="group/social inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/15 bg-gradient-to-br from-white/10 to-white/5 text-gray-300 transition-all duration-300 hover:border-primary-gold/60 hover:bg-gradient-to-br hover:from-primary-gold/20 hover:to-amber-300/10 hover:text-primary-gold hover:scale-105"
                              aria-label={`${founder.name}'s ${platform}`}
                            >
                              <span className="transition-transform duration-300 group-hover/social:scale-110">
                                {getSocialIcon(platform)}
                              </span>
                            </a>
                          ) : null
                        )}
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Bottom accent */}
                <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-primary-gold/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
            </motion.div>
          ))}
        </div>

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

      {/* Founder Modal */}
      <FounderModal
        founder={selectedFounder}
        isOpen={isModalOpen}
        onClose={closeFounderModal}
      />
    </section>
  );
}
