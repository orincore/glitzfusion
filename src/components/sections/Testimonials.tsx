'use client';

import { motion } from 'framer-motion';
import { fadeIn, staggerContainer } from '@/lib/utils';

const testimonials = [
  {
    id: 1,
    name: 'Jessica Martinez',
    role: 'Professional Dancer, Broadway',
    content: 'Glitz Fusion transformed my career. The training I received here gave me the skills and confidence to land my dream role on Broadway.',
    rating: 5,
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=1470&auto=format&fit=crop'
  },
  {
    id: 2,
    name: 'Marcus Chen',
    role: 'Film Actor',
    content: 'The acting program at Glitz Fusion is second to none. The instructors are industry professionals who genuinely care about your growth.',
    rating: 5,
    image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=1374&auto=format&fit=crop'
  },
  {
    id: 3,
    name: 'Sophia Williams',
    role: 'Musical Theater Performer',
    content: 'The community at Glitz Fusion is incredible. I found lifelong friends and collaborators during my time here.',
    rating: 5,
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1374&auto=format&fit=crop'
  }
];

export function Testimonials() {
  return (
    <section className="relative py-20 md:py-28 bg-gradient-to-b from-primary-dark to-black">
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
            Testimonials
          </motion.span>
          
          <motion.h2
            variants={fadeIn}
            className="text-3xl md:text-4xl font-bold text-white mb-6"
          >
            Success Stories
          </motion.h2>
          
          <motion.p
            variants={fadeIn}
            className="max-w-2xl mx-auto text-gray-300"
          >
            Don't just take our word for it. Here's what our students and alumni have to say about their Glitz Fusion experience.
          </motion.p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              variants={fadeIn}
              custom={index * 0.2}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true, margin: '-50px' }}
              className="group relative p-8 bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-800 hover:border-primary-gold/30 transition-all duration-300"
            >
              <div className="flex items-center mb-6">
                <div className="relative w-16 h-16 rounded-full overflow-hidden mr-4 border-2 border-primary-gold/50">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h4 className="font-bold text-white">{testimonial.name}</h4>
                  <p className="text-sm text-gray-400">{testimonial.role}</p>
                </div>
              </div>
              
              <div className="mb-4 text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-xl">★</span>
                ))}
              </div>
              
              <p className="text-gray-300 italic">"{testimonial.content}"</p>
              
              <div className="absolute -top-4 -right-4 w-10 h-10 rounded-full bg-primary-gold flex items-center justify-center text-primary-dark font-bold text-lg transform rotate-12 group-hover:rotate-0 transition-transform duration-300">
                "
              </div>
            </motion.div>
          ))}
        </div>
        
        <motion.div 
          variants={fadeIn}
          className="mt-16 text-center"
        >
          <p className="text-gray-400 mb-6">Join hundreds of successful artists who started their journey at Glitz Fusion</p>
          <button className="px-8 py-3 bg-primary-gold hover:bg-amber-400 text-primary-dark font-medium rounded-lg transition-all duration-300 transform hover:scale-105">
            Read More Success Stories
          </button>
        </motion.div>
      </div>
      
      {/* Decorative elements */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent -z-10" />
    </section>
  );
}
