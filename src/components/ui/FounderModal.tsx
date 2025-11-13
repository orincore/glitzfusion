'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { X, Award, ChevronRight, Twitter, Linkedin, Instagram, Facebook } from 'lucide-react';
import { Founder } from '@/hooks/useAbout';

interface FounderModalProps {
  founder: Founder | null;
  isOpen: boolean;
  onClose: () => void;
}

export function FounderModal({ founder, isOpen, onClose }: FounderModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const getSocialIcon = (platform: string) => {
    switch (platform) {
      case 'twitter': return <Twitter className="w-5 h-5" />;
      case 'linkedin': return <Linkedin className="w-5 h-5" />;
      case 'instagram': return <Instagram className="w-5 h-5" />;
      case 'facebook': return <Facebook className="w-5 h-5" />;
      default: return null;
    }
  };

  if (!mounted || !founder) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
          
          {/* Modal */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="relative w-full max-w-4xl max-h-[90vh] bg-gradient-to-br from-gray-900/95 via-black/90 to-gray-950/95 backdrop-blur-2xl border border-white/10 rounded-[32px] shadow-[0_50px_150px_-50px_rgba(0,0,0,0.8)] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="relative p-8 border-b border-white/10">
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary-gold/60 to-transparent" />
              
              <div className="flex items-start justify-between gap-6">
                <div className="flex items-start gap-6">
                  {/* Founder Image */}
                  <div className="relative flex-shrink-0">
                    <div className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-2xl overflow-hidden border-2 border-white/15 shadow-[0_20px_50px_-25px_rgba(0,0,0,0.8)]">
                      <Image
                        src={founder.image}
                        alt={founder.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 96px, 128px"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
                    </div>
                  </div>

                  {/* Name and Role */}
                  <div className="space-y-3">
                    <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight">
                      {founder.name}
                    </h2>
                    {founder.role && (
                      <div className="inline-flex items-center rounded-full border border-primary-gold/40 bg-gradient-to-r from-primary-gold/10 to-amber-300/10 px-4 py-2 text-sm font-semibold uppercase tracking-[0.15em] text-primary-gold backdrop-blur-sm">
                        {founder.role}
                      </div>
                    )}
                  </div>
                </div>

                {/* Close Button */}
                <button
                  onClick={onClose}
                  className="flex-shrink-0 p-3 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all duration-300"
                  aria-label="Close modal"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="overflow-y-auto max-h-[calc(90vh-200px)] p-8 space-y-8">
              
              {/* Bio Section */}
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-white flex items-center">
                  <div className="w-1 h-6 bg-primary-gold rounded-full mr-3" />
                  About {founder.name.split(' ')[0]}
                </h3>
                <div className="bg-gradient-to-r from-white/5 to-white/[0.02] rounded-2xl p-6 border border-white/5">
                  <p className="text-lg text-gray-200 leading-relaxed font-light">
                    {founder.longBio || founder.bio}
                  </p>
                </div>
              </div>

              {/* Achievements Section */}
              {founder.achievements && founder.achievements.length > 0 && (
                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-white flex items-center">
                    <Award className="w-6 h-6 text-primary-gold mr-3" />
                    Key Achievements & Highlights
                  </h3>
                  <div className="grid gap-4">
                    {founder.achievements.map((achievement, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="flex items-start rounded-2xl bg-gradient-to-r from-white/5 to-white/[0.02] p-5 border border-white/5 hover:bg-primary-gold/5 hover:border-primary-gold/20 transition-all duration-300"
                      >
                        <ChevronRight className="mr-4 mt-1 h-5 w-5 flex-shrink-0 text-primary-gold" />
                        <span className="text-base text-gray-200 leading-relaxed font-medium">
                          {achievement}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Social Links Section */}
              {founder.socialLinks && Object.keys(founder.socialLinks).length > 0 && (
                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-white flex items-center">
                    <div className="w-1 h-6 bg-primary-gold rounded-full mr-3" />
                    Connect with {founder.name.split(' ')[0]}
                  </h3>
                  <div className="flex flex-wrap items-center gap-4">
                    {Object.entries(founder.socialLinks).map(([platform, url]) =>
                      url ? (
                        <a
                          key={platform}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group inline-flex items-center gap-3 px-6 py-3 rounded-2xl border border-white/15 bg-gradient-to-br from-white/10 to-white/5 text-gray-300 hover:border-primary-gold/60 hover:bg-gradient-to-br hover:from-primary-gold/20 hover:to-amber-300/10 hover:text-primary-gold transition-all duration-300"
                          aria-label={`${founder.name}'s ${platform}`}
                        >
                          <span className="transition-transform duration-300 group-hover:scale-110">
                            {getSocialIcon(platform)}
                          </span>
                          <span className="font-medium capitalize">{platform}</span>
                        </a>
                      ) : null
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Bottom accent */}
            <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-primary-gold/40 to-transparent" />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
