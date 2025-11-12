'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { fadeIn, staggerContainer } from '@/lib/utils';

const teamMembers = [
  {
    name: 'Sarah Johnson',
    role: 'Founder & Creative Director',
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=688&auto=format&fit=crop',
    bio: '20+ years in theater and film. Julliard graduate with a passion for nurturing new talent.'
  },
  {
    name: 'Michael Chen',
    role: 'Head of Dance',
    image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=687&auto=format&fit=crop',
    bio: 'Former principal dancer with 15 years of international performance experience.'
  },
  {
    name: 'Elena Rodriguez',
    role: 'Acting Coach',
    image: 'https://images.unsplash.com/photo-1551836022-d5d9e7830866?q=80&w=687&auto=format&fit=crop',
    bio: 'Award-winning actress with extensive stage and screen credits.'
  },
  {
    name: 'David Kim',
    role: 'Music Director',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=687&auto=format&fit=crop',
    bio: 'Composer and music producer with 50+ film and theater credits.'
  }
];

export function TeamShowcase() {
  return (
    <section className="relative py-20 md:py-28 bg-black">
      <div className="container-custom">
        <motion.div
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: '-100px' }}
          className="text-center mb-16"
        >
          <motion.span
            variants={fadeIn}
            className="inline-block text-primary-gold font-medium mb-4"
          >
            Meet Our Team
          </motion.span>
          
          <motion.h2
            variants={fadeIn}
            className="text-3xl md:text-4xl font-bold text-white mb-6"
          >
            World-Class Instructors & Mentors
          </motion.h2>
          
          <motion.p
            variants={fadeIn}
            className="max-w-2xl mx-auto text-gray-300"
          >
            Our faculty comprises industry professionals who bring real-world experience and a passion for teaching to every class.
          </motion.p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {teamMembers.map((member, index) => (
            <motion.div
              key={member.name}
              variants={fadeIn}
              custom={index * 0.1}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true, margin: '-50px' }}
              className="group relative overflow-hidden rounded-2xl bg-gray-900/50 backdrop-blur-sm border border-gray-800 hover:border-primary-gold/30 transition-all duration-300"
            >
              <div className="relative aspect-square overflow-hidden">
                <Image
                  src={member.image}
                  alt={member.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-70" />
                
                <div className="absolute bottom-0 left-0 right-0 p-6 text-left">
                  <h3 className="text-xl font-bold text-white">{member.name}</h3>
                  <p className="text-primary-gold text-sm">{member.role}</p>
                </div>
                
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/70 transition-opacity duration-300 p-6">
                  <p className="text-gray-200 text-center">{member.bio}</p>
                </div>
              </div>
              
              <div className="p-6">
                <div className="flex space-x-4 justify-center">
                  {['twitter', 'linkedin', 'instagram'].map((social) => (
                    <a
                      key={social}
                      href="#"
                      className="text-gray-400 hover:text-primary-gold transition-colors"
                      aria-label={`${member.name}'s ${social}`}
                    >
                      <span className="sr-only">{social}</span>
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                      </svg>
                    </a>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        
        <motion.div
          variants={fadeIn}
          className="mt-16 text-center"
        >
          <p className="text-gray-400 mb-6">And 20+ dedicated professionals across all departments</p>
          <button className="px-8 py-3 border-2 border-primary-gold text-primary-gold hover:bg-primary-gold/10 font-medium rounded-lg transition-all duration-300">
            View All Team Members
          </button>
        </motion.div>
      </div>
      
      {/* Decorative elements */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent -z-10" />
    </section>
  );
}
