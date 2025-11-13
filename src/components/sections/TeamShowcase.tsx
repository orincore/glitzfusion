'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { fadeIn, staggerContainer } from '@/lib/utils';
import { useAbout, TeamMember } from '@/hooks/useAbout';
import { Loader2, Twitter, Linkedin, Instagram, Facebook, Users, Eye } from 'lucide-react';
import { TeamMemberModal } from '@/components/ui/TeamMemberModal';

export function TeamShowcase() {
  const { content, loading } = useAbout();
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [teamLoading, setTeamLoading] = useState(true);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openMemberModal = (member: TeamMember) => {
    setSelectedMember(member);
    setIsModalOpen(true);
  };

  const closeMemberModal = () => {
    setIsModalOpen(false);
    setSelectedMember(null);
  };

  useEffect(() => {
    const fetchTeamMembers = async () => {
      try {
        const response = await fetch('/api/about/team');
        if (response.ok) {
          const members = await response.json();
          setTeamMembers(members.filter((member: TeamMember) => member.isActive).sort((a: TeamMember, b: TeamMember) => a.order - b.order));
        }
      } catch (error) {
        console.error('Error fetching team members:', error);
      } finally {
        setTeamLoading(false);
      }
    };

    fetchTeamMembers();
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

  if (loading || teamLoading) {
    return (
      <section className="relative py-20 md:py-28 bg-black">
        <div className="container-custom">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="flex items-center space-x-2 text-primary-gold">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span>Loading team members...</span>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative py-32 md:py-40 bg-gradient-to-br from-black via-gray-950 to-black overflow-hidden">
      {/* Enhanced Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Animated particles */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-primary-gold/15"
            style={{
              width: Math.random() * 4 + 2 + 'px',
              height: Math.random() * 4 + 2 + 'px',
              left: Math.random() * 100 + '%',
              top: Math.random() * 100 + '%',
            }}
            animate={{
              y: [0, -40, 0],
              x: [0, Math.random() * 60 - 30, 0],
              opacity: [0.1, 0.3, 0.1],
            }}
            transition={{
              duration: Math.random() * 15 + 15,
              repeat: Infinity,
              ease: 'easeInOut',
              repeatType: 'reverse',
            }}
          />
        ))}
        
        {/* Gradient overlays */}
        <div className="absolute top-0 right-1/4 w-80 h-80 bg-primary-gold/3 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-amber-400/3 rounded-full blur-3xl" />
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
            <Users className="w-5 h-5 mr-3" />
            {content.teamSubtitle || 'Expert Team'}
          </motion.div>
          
          <motion.h2
            variants={fadeIn}
            className="text-5xl md:text-7xl lg:text-8xl font-black text-white mb-8 tracking-tight"
          >
            {content.teamTitle ? (
              <span className="bg-gradient-to-r from-white via-gray-100 to-white bg-clip-text text-transparent">
                {content.teamTitle}
              </span>
            ) : (
              <>
                <span className="block text-white/90">Meet Our</span>
                <span className="block bg-gradient-to-r from-primary-gold via-amber-300 to-primary-gold bg-clip-text text-transparent">
                  Expert Team
                </span>
              </>
            )}
          </motion.h2>
          
          <motion.p
            variants={fadeIn}
            className="max-w-4xl mx-auto text-xl md:text-2xl text-gray-300 leading-relaxed font-light"
          >
            {content.teamDescription || 'Our faculty comprises industry professionals who bring real-world experience and a passion for teaching to every class.'}
          </motion.p>
        </motion.div>

        {/* Premium Team Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 lg:gap-10 max-w-8xl mx-auto">
          {teamMembers.map((member: TeamMember, index: number) => (
            <motion.div
              key={member.id}
              variants={fadeIn}
              custom={index * 0.1}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true, margin: '-100px' }}
              className="group relative h-full"
            >
              {/* Outer glow effect */}
              <div className="absolute -inset-4 rounded-[32px] bg-gradient-to-r from-primary-gold/10 via-amber-300/5 to-primary-gold/10 opacity-0 group-hover:opacity-100 transition-all duration-500 blur-xl" />
              
              {/* Main card - Fixed height for consistency */}
              <div className="relative h-full min-h-[480px] sm:min-h-[520px] lg:min-h-[560px] overflow-hidden rounded-[32px] bg-gradient-to-br from-gray-900/95 via-black/90 to-gray-950/95 backdrop-blur-2xl border border-white/10 shadow-[0_40px_120px_-40px_rgba(0,0,0,0.8)] transition-all duration-500 group-hover:border-primary-gold/30 group-hover:shadow-[0_50px_140px_-50px_rgba(247,196,101,0.4)]">
                
                {/* Top accent line */}
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary-gold/60 to-transparent" />
                
                {/* Content Container */}
                <div className="relative h-full p-6 lg:p-8 flex flex-col">
                  
                  {/* Member Image - Consistent size */}
                  <div className="relative flex-shrink-0 mx-auto mb-6">
                    {/* Image glow */}
                    <div className="absolute -inset-3 rounded-[20px] bg-gradient-to-br from-primary-gold/20 via-amber-200/10 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 blur-lg" />
                    
                    <div className="relative w-32 h-32 sm:w-36 sm:h-36 lg:w-40 lg:h-40 rounded-[20px] overflow-hidden border-2 border-white/15 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.8)] group-hover:border-primary-gold/40 transition-all duration-500">
                      <Image
                        src={member.image}
                        alt={member.name}
                        fill
                        className="object-cover transition-all duration-500 group-hover:scale-105"
                        sizes="(max-width: 640px) 128px, (max-width: 1024px) 144px, 160px"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
                      
                      {/* Image overlay effect */}
                      <div className="absolute inset-0 bg-gradient-to-br from-primary-gold/10 via-transparent to-amber-300/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    </div>
                    
                    {/* Decorative elements */}
                    <div className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-primary-gold/25 blur-sm opacity-0 group-hover:opacity-100 transition-all duration-500" />
                    <div className="absolute -bottom-2 -left-2 w-3 h-3 rounded-full bg-amber-300/25 blur-sm opacity-0 group-hover:opacity-100 transition-all duration-500" />
                  </div>

                  {/* Member Information - Flexible content area */}
                  <div className="flex-1 text-center space-y-4">
                    
                    {/* Name and Role */}
                    <div className="space-y-2">
                      <h3 className="text-xl sm:text-2xl lg:text-2xl font-black text-white tracking-tight leading-tight">
                        {member.name}
                      </h3>
                      {member.role && (
                        <div className="inline-flex items-center rounded-full border border-primary-gold/40 bg-gradient-to-r from-primary-gold/10 to-amber-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.15em] text-primary-gold backdrop-blur-sm">
                          {member.role}
                        </div>
                      )}
                    </div>

                    {/* Bio - Consistent height with line clamping */}
                    <div className="min-h-[80px] flex items-center justify-center">
                      <div className="relative">
                        <p className="text-sm lg:text-base text-gray-200 leading-relaxed font-light line-clamp-4">
                          {member.bio}
                        </p>
                        {/* Read More Overlay */}
                        <button
                          onClick={() => openMemberModal(member)}
                          className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 hover:opacity-100 transition-all duration-300 rounded-xl flex items-end justify-center pb-1 group"
                          aria-label={`Read more about ${member.name}`}
                        >
                          <div className="flex items-center gap-1 px-2 py-1 bg-primary-gold/90 text-black text-xs font-semibold rounded-full transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                            <Eye className="w-3 h-3" />
                            <span>Read More</span>
                          </div>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Social Links - Fixed bottom position */}
                  {member.socialLinks && Object.keys(member.socialLinks).length > 0 && (
                    <div className="pt-4 border-t border-white/10 space-y-2 mt-auto">
                      <span className="block text-xs font-bold uppercase tracking-[0.2em] text-gray-400 text-center">
                        Connect
                      </span>
                      <div className="flex justify-center items-center gap-2">
                        {Object.entries(member.socialLinks).map(([platform, url]) =>
                          url ? (
                            <a
                              key={platform}
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="group/social inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/15 bg-gradient-to-br from-white/10 to-white/5 text-gray-300 transition-all duration-300 hover:border-primary-gold/60 hover:bg-gradient-to-br hover:from-primary-gold/20 hover:to-amber-300/10 hover:text-primary-gold hover:scale-105"
                              aria-label={`${member.name}'s ${platform}`}
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

      {/* Team Member Modal */}
      <TeamMemberModal
        member={selectedMember}
        isOpen={isModalOpen}
        onClose={closeMemberModal}
      />
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent -z-10" />
    </section>
  );
}
