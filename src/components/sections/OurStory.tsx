'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { fadeIn, staggerContainer, fadeInUp } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface StoryMilestone {
  id: string;
  year: string;
  description: string;
}

interface StoryContent {
  subtitle?: string;
  title?: string;
  description?: string;
  mainImage?: string;
  mainImageCaption?: string;
  mainImageTitle?: string;
  secondaryImage?: string;
  milestones?: StoryMilestone[];
  quote?: string;
  quoteAuthor?: string;
  quoteAuthorTitle?: string;
}

export function OurStory() {
  const [content, setContent] = useState<StoryContent>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStoryContent = async () => {
      try {
        const response = await fetch('/api/about/story');
        if (response.ok) {
          const data = await response.json();
          setContent(data);
        }
      } catch (error) {
        console.error('Error fetching story content:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStoryContent();
  }, []);

  // Default content if no data is available
  const defaultContent: StoryContent = {
    subtitle: "Our Journey",
    title: "Crafting Excellence in Performing Arts Since 2015",
    description: "What started as a small studio with a big dream has grown into a premier institution for performing arts education. Our founder, Sarah Johnson, envisioned a space where passion meets professionalism.",
    mainImage: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=1470&auto=format&fit=crop",
    mainImageCaption: "Our First Studio, 2015",
    mainImageTitle: "Where It All Began",
    secondaryImage: "https://images.unsplash.com/photo-1547153760-18fc86324498?q=80&w=1374&auto=format&fit=crop",
    milestones: [
      {
        id: "1",
        year: "2015",
        description: "Established with just 3 instructors and 20 students"
      },
      {
        id: "2",
        year: "2018",
        description: "Expanded to include film and media production"
      },
      {
        id: "3",
        year: "2023",
        description: "Over 1,000 students trained with 85% industry placement"
      }
    ],
    quote: "Our vision was never just about teaching skills – it was about building a community where artists could grow, collaborate, and shine.",
    quoteAuthor: "Sarah Johnson",
    quoteAuthorTitle: "Founder & Creative Director"
  };

  const storyData = { ...defaultContent, ...content };

  if (loading) {
    return (
      <section className="relative py-20 md:py-28 bg-gradient-to-b from-primary-dark to-black">
        <div className="container-custom">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="flex items-center space-x-2 text-primary-gold">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span>Loading our story...</span>
            </div>
          </div>
        </div>
      </section>
    );
  }
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
                src={storyData.mainImage || ""}
                alt="Our humble beginnings"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <span className="inline-block px-3 py-1 text-xs font-medium text-primary-gold bg-black/50 rounded-full mb-2">
                  {storyData.mainImageCaption}
                </span>
                <h3 className="text-xl font-semibold text-white">{storyData.mainImageTitle}</h3>
              </div>
            </motion.div>
            
            {storyData.secondaryImage && (
              <motion.div 
                variants={fadeIn}
                className="hidden md:block absolute -bottom-8 -right-8 w-48 h-48 rounded-2xl overflow-hidden border-4 border-primary-gold/30"
              >
                <Image
                  src={storyData.secondaryImage}
                  alt="Our team"
                  fill
                  className="object-cover"
                  sizes="200px"
                />
              </motion.div>
            )}
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
              {storyData.subtitle}
            </motion.span>
            
            <motion.h2
              variants={fadeIn}
              className="text-3xl md:text-4xl font-bold text-white mb-6"
            >
              {storyData.title}
            </motion.h2>
            
            <motion.p 
              variants={fadeIn}
              className="text-gray-300 mb-6"
            >
              {storyData.description}
            </motion.p>
            
            <motion.div 
              variants={fadeInUp}
              className="space-y-4"
            >
              {storyData.milestones?.map((milestone) => (
                <div key={milestone.id} className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-2 h-2 rounded-full bg-primary-gold" />
                  </div>
                  <p className="ml-3 text-gray-300">
                    <span className="font-medium text-white">{milestone.year}:</span> {milestone.description}
                  </p>
                </div>
              ))}
            </motion.div>
            
            {storyData.quote && (
              <motion.div 
                variants={fadeIn}
                className="mt-8 pt-8 border-t border-gray-800"
              >
                <blockquote className="italic text-gray-300">
                  "{storyData.quote}"
                  <footer className="mt-4 text-primary-gold font-medium">
                    — {storyData.quoteAuthor}, {storyData.quoteAuthorTitle}
                  </footer>
                </blockquote>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
      
      {/* Decorative elements */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent -z-10" />
    </section>
  );
}
