'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { fadeIn, staggerContainer, fadeInUp } from '@/lib/utils';

export function OurStory() {
  return (
    <section className="relative py-20 md:py-28 bg-gradient-to-b from-primary-dark to-black">
      <div className="container-custom">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: '-100px' }}
            className="relative"
          >
            <motion.div 
              variants={fadeIn}
              className="relative aspect-video rounded-2xl overflow-hidden shadow-2xl"
            >
              <Image
                src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=1470&auto=format&fit=crop"
                alt="Our humble beginnings"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <span className="inline-block px-3 py-1 text-xs font-medium text-primary-gold bg-black/50 rounded-full mb-2">
                  Our First Studio, 2015
                </span>
                <h3 className="text-xl font-semibold text-white">Where It All Began</h3>
              </div>
            </motion.div>
            
            <motion.div 
              variants={fadeIn}
              className="hidden md:block absolute -bottom-8 -right-8 w-48 h-48 rounded-2xl overflow-hidden border-4 border-primary-gold/30"
            >
              <Image
                src="https://images.unsplash.com/photo-1547153760-18fc86324498?q=80&w=1374&auto=format&fit=crop"
                alt="Our team"
                fill
                className="object-cover"
                sizes="200px"
              />
            </motion.div>
          </motion.div>
          
          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: '-100px' }}
          >
            <motion.span
              variants={fadeIn}
              className="inline-block text-primary-gold font-medium mb-4"
            >
              Our Journey
            </motion.span>
            
            <motion.h2
              variants={fadeIn}
              className="text-3xl md:text-4xl font-bold text-white mb-6"
            >
              Crafting Excellence in Performing Arts Since 2015
            </motion.h2>
            
            <motion.p 
              variants={fadeIn}
              className="text-gray-300 mb-6"
            >
              What started as a small studio with a big dream has grown into a premier institution for performing arts education. Our founder, Sarah Johnson, envisioned a space where passion meets professionalism.
            </motion.p>
            
            <motion.div 
              variants={fadeInUp}
              className="space-y-4"
            >
              <div className="flex items-start">
                <div className="flex-shrink-0 mt-1">
                  <div className="w-2 h-2 rounded-full bg-primary-gold" />
                </div>
                <p className="ml-3 text-gray-300">
                  <span className="font-medium text-white">2015:</span> Established with just 3 instructors and 20 students
                </p>
              </div>
              
              <div className="flex items-start">
                <div className="flex-shrink-0 mt-1">
                  <div className="w-2 h-2 rounded-full bg-primary-gold" />
                </div>
                <p className="ml-3 text-gray-300">
                  <span className="font-medium text-white">2018:</span> Expanded to include film and media production
                </p>
              </div>
              
              <div className="flex items-start">
                <div className="flex-shrink-0 mt-1">
                  <div className="w-2 h-2 rounded-full bg-primary-gold" />
                </div>
                <p className="ml-3 text-gray-300">
                  <span className="font-medium text-white">2023:</span> Over 1,000 students trained with 85% industry placement
                </p>
              </div>
            </motion.div>
            
            <motion.div 
              variants={fadeIn}
              className="mt-8 pt-8 border-t border-gray-800"
            >
              <blockquote className="italic text-gray-300">
                "Our vision was never just about teaching skills – it was about building a community where artists could grow, collaborate, and shine."
                <footer className="mt-4 text-primary-gold font-medium">
                  — Sarah Johnson, Founder & Creative Director
                </footer>
              </blockquote>
            </motion.div>
          </motion.div>
        </div>
      </div>
      
      {/* Decorative elements */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent -z-10" />
    </section>
  );
}
