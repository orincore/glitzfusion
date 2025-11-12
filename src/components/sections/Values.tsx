'use client';

import { motion } from 'framer-motion';
import { Award, Users, Heart, Star, Zap, Target } from 'lucide-react';
import { fadeIn, staggerContainer } from '@/lib/utils';

const values = [
  {
    icon: <Award className="w-8 h-8 text-primary-gold" />,
    title: 'Excellence',
    description: 'We strive for the highest standards in all aspects of our programs and performances.'
  },
  {
    icon: <Users className="w-8 h-8 text-primary-gold" />,
    title: 'Community',
    description: 'Building a supportive network where artists can grow and collaborate together.'
  },
  {
    icon: <Heart className="w-8 h-8 text-primary-gold" />,
    title: 'Passion',
    description: 'Fostering a deep love and commitment to the performing arts in all our students.'
  },
  {
    icon: <Star className="w-8 h-8 text-primary-gold" />,
    title: 'Innovation',
    description: 'Embracing new techniques and technologies to push creative boundaries.'
  },
  {
    icon: <Zap className="w-8 h-8 text-primary-gold" />,
    title: 'Energy',
    description: 'Bringing enthusiasm and vitality to every class, rehearsal, and performance.'
  },
  {
    icon: <Target className="w-8 h-8 text-primary-gold" />,
    title: 'Focus',
    description: 'Helping students develop discipline and concentration in their craft.'
  }
];

export function Values() {
  return (
    <section className="relative py-20 md:py-28 bg-gradient-to-b from-black to-primary-dark/30">
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
            Our Values
          </motion.span>
          
          <motion.h2
            variants={fadeIn}
            className="text-3xl md:text-4xl font-bold text-white mb-6"
          >
            The Pillars of Our Success
          </motion.h2>
          
          <motion.p
            variants={fadeIn}
            className="max-w-2xl mx-auto text-gray-300"
          >
            These core values guide everything we do at Glitz Fusion and shape the experience of every student who walks through our doors.
          </motion.p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {values.map((value, index) => (
            <motion.div
              key={value.title}
              variants={fadeIn}
              custom={index * 0.1}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true, margin: '-50px' }}
              className="group relative p-8 bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-800 hover:border-primary-gold/30 transition-all duration-300 hover:-translate-y-1"
            >
              <div className="w-16 h-16 rounded-xl bg-primary-gold/10 flex items-center justify-center mb-6 group-hover:bg-primary-gold/20 transition-colors duration-300">
                {value.icon}
              </div>
              
              <h3 className="text-xl font-bold text-white mb-3">{value.title}</h3>
              <p className="text-gray-300">{value.description}</p>
              
              <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="w-2 h-2 rounded-full bg-primary-gold"></div>
              </div>
            </motion.div>
          ))}
        </div>
        
        <motion.div 
          variants={fadeIn}
          className="mt-16 bg-gradient-to-r from-primary-gold/10 to-primary-gold/5 p-8 rounded-2xl border border-primary-gold/20"
        >
          <div className="max-w-3xl mx-auto text-center">
            <h3 className="text-2xl font-bold text-white mb-4">Our Commitment to You</h3>
            <p className="text-gray-300">
              At Glitz Fusion, we're committed to providing an inclusive, supportive environment where every student can discover their unique voice and develop the skills to make their mark in the performing arts world.
            </p>
          </div>
        </motion.div>
      </div>
      
      {/* Decorative elements */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-primary-dark to-transparent -z-10" />
    </section>
  );
}
