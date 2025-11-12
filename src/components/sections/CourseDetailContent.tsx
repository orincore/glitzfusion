'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'

import { GlassPanel } from '@/components/ui/GlassPanel'
import { cn, fadeInUp, staggerContainer } from '@/lib/utils'
import type { CourseInfo } from '@/data/courses'

interface CourseDetailContentProps {
  course: CourseInfo
}

export function CourseDetailContent({ course }: CourseDetailContentProps) {
  return (
    <section className="py-20">
      <div className="container-custom space-y-16">
        <motion.div
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: '-120px' }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-10"
        >
          <motion.div variants={fadeInUp} className="lg:col-span-2 space-y-6">
            <GlassPanel className="p-8 rounded-2xl">
              <h2 className="text-3xl font-semibold text-gradient-gold mb-4">
                Program Overview
              </h2>
              <p className="text-gray-300 leading-relaxed">
                {course.summary}
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                {course.highlights.map((highlight) => (
                  <span
                    key={highlight}
                    className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border border-primary-gold/30 bg-primary-black/60 text-primary-gold"
                  >
                    {highlight}
                  </span>
                ))}
              </div>
            </GlassPanel>
          </motion.div>

          <motion.div variants={fadeInUp}>
            <GlassPanel className="p-8 rounded-2xl h-full">
              <h3 className="text-xl font-semibold text-gradient-gold mb-6">
                Key Details
              </h3>
              <div className="space-y-4 text-sm text-gray-300">
                <DetailItem label="Duration" value={course.duration} />
                <DetailItem label="Level" value={course.level} />
                <DetailItem label="Format" value={course.format} />
                <DetailItem label="Investment" value={course.investment} />
                <DetailItem label="Next Cohort" value={course.nextStart} />
              </div>
            </GlassPanel>
          </motion.div>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: '-120px' }}
          className="space-y-8"
        >
          <motion.h2
            variants={fadeInUp}
            className="text-3xl md:text-4xl font-display font-semibold text-gradient-gold"
          >
            Curriculum Journey
          </motion.h2>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {course.curriculum.map((module) => (
              <motion.div key={module.title} variants={fadeInUp}>
                <GlassPanel className="p-6 rounded-2xl h-full">
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 rounded-full bg-primary-gold/20 flex items-center justify-center text-primary-gold font-semibold">
                      {module.title.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-2">{module.title}</h3>
                      <p className="text-sm text-gray-300 leading-relaxed mb-4">
                        {module.description}
                      </p>
                      <ul className="space-y-2 text-sm text-gray-400">
                        {module.points.map((point) => (
                          <li key={point} className="flex items-start space-x-2">
                            <span className="mt-1 block w-1.5 h-1.5 rounded-full bg-primary-gold" />
                            <span>{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </GlassPanel>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: '-120px' }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-10"
        >
          <motion.div variants={fadeInUp}>
            <GlassPanel className="p-8 rounded-2xl h-full">
              <h2 className="text-3xl font-semibold text-gradient-gold mb-4">
                What You'll Walk Away With
              </h2>
              <ul className="space-y-4 text-gray-300">
                {course.outcomes.map((outcome) => (
                  <li key={outcome} className="flex items-start space-x-3">
                    <span className="mt-1 block w-2 h-2 rounded-full bg-primary-gold" />
                    <span>{outcome}</span>
                  </li>
                ))}
              </ul>
            </GlassPanel>
          </motion.div>

          <motion.div variants={fadeInUp}>
            <GlassPanel className="p-8 rounded-2xl h-full">
              <h2 className="text-3xl font-semibold text-gradient-gold mb-6">
                Ready to get started?
              </h2>
              <p className="text-gray-300 leading-relaxed mb-6">
                Schedule a call with our admissions team to discuss portfolio requirements,
                flexible payment plans, and audition dates for the {course.title} program.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
                  <Link
                    href="/contact"
                    className={cn(
                      'inline-flex w-full items-center justify-center px-8 py-4 text-lg font-semibold rounded-xl',
                      'bg-gradient-gold text-primary-black',
                      'hover:shadow-gold-glow-lg focus:shadow-gold-glow-lg',
                      'focus:outline-none focus:ring-2 focus:ring-primary-gold focus:ring-offset-2 focus:ring-offset-transparent',
                      'transition-all duration-300'
                    )}
                  >
                    Book Consultation
                  </Link>
                </motion.div>

                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
                  <Link
                    href="/apply"
                    className={cn(
                      'inline-flex w-full items-center justify-center px-8 py-4 text-lg font-semibold rounded-xl',
                      'border-2 border-primary-gold text-primary-gold',
                      'hover:bg-primary-gold hover:text-primary-black',
                      'focus:outline-none focus:ring-2 focus:ring-primary-gold focus:ring-offset-2 focus:ring-offset-transparent',
                      'transition-all duration-300'
                    )}
                  >
                    Apply Now
                  </Link>
                </motion.div>
              </div>
            </GlassPanel>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

interface DetailItemProps {
  label: string
  value: string
}

function DetailItem({ label, value }: DetailItemProps) {
  return (
    <div className="flex justify-between items-start border-b border-white/5 pb-3 last:border-b-0 last:pb-0">
      <span className="text-gray-400 uppercase tracking-wide text-xs">{label}</span>
      <span className="text-sm text-white font-medium text-right max-w-[60%]">{value}</span>
    </div>
  )
}
