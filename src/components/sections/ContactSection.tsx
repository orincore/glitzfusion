'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, Phone, MapPin, Send, Clock, Calendar } from 'lucide-react'
import { GlassPanel } from '@/components/ui/GlassPanel'
import { cn, fadeInUp, staggerContainer } from '@/lib/utils'

const contactInfo = [
  {
    icon: Mail,
    title: 'Email Us',
    details: 'info@glitzfusion.com',
    subtitle: 'admissions@glitzfusion.com'
  },
  {
    icon: Phone,
    title: 'Call Us',
    details: '+1 (555) 123-4567',
    subtitle: 'Mon-Fri 9AM-6PM PST'
  },
  {
    icon: MapPin,
    title: 'Visit Us',
    details: '123 Creative Arts Boulevard',
    subtitle: 'Los Angeles, CA 90028'
  }
]

export function ContactSection() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    course: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Reset form
    setFormData({
      name: '',
      email: '',
      phone: '',
      course: '',
      message: ''
    })
    setIsSubmitting(false)
  }

  return (
    <section className="py-20 relative">
      <div className="container-custom">
        {/* Section Header */}
        <motion.div
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: "-100px" }}
          className="text-center mb-16"
        >
          <motion.h2 
            variants={fadeInUp}
            className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-gradient-gold mb-6"
          >
            Get In Touch
          </motion.h2>
          <motion.p 
            variants={fadeInUp}
            className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed"
          >
            Ready to start your creative journey? Contact us today to learn more about our programs and schedule a tour.
          </motion.p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Contact Information */}
          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-50px" }}
            className="space-y-8"
          >
            {contactInfo.map((info) => {
              const Icon = info.icon
              return (
                <motion.div key={info.title} variants={fadeInUp}>
                  <GlassPanel className="p-6 rounded-xl hover:shadow-gold-glow transition-all duration-300 group">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-gradient-gold rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                          <Icon className="w-6 h-6 text-primary-black" />
                        </div>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-primary-gold transition-colors duration-300">
                          {info.title}
                        </h3>
                        <p className="text-base text-gray-200 mb-1">
                          {info.details}
                        </p>
                        <p className="text-sm text-gray-400">
                          {info.subtitle}
                        </p>
                      </div>
                    </div>
                  </GlassPanel>
                </motion.div>
              )
            })}

            {/* Additional Info Cards */}
            <motion.div variants={fadeInUp}>
              <GlassPanel className="p-6 rounded-xl border border-white/10 hover:border-primary-gold/50 transition-colors duration-300">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                      <Clock className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">
                      Office Hours
                    </h3>
                    <div className="space-y-1 text-sm text-gray-300">
                      <p>Monday - Friday: 9:00 AM - 6:00 PM</p>
                      <p>Saturday: 10:00 AM - 4:00 PM</p>
                      <p>Sunday: Closed</p>
                    </div>
                  </div>
                </div>
              </GlassPanel>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <GlassPanel className="p-6 rounded-xl">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">
                      Campus Tours
                    </h3>
                    <p className="text-sm text-gray-300 mb-3">
                      Schedule a personalized tour of our state-of-the-art facilities.
                    </p>
                    <motion.div
                      className={cn(
                        'inline-block',
                        'text-sm font-medium text-primary-gold hover:text-primary-gold-light',
                        'focus:outline-none focus:ring-2 focus:ring-primary-gold focus:ring-offset-2 focus:ring-offset-transparent',
                        'transition-colors duration-200 cursor-pointer'
                      )}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      suppressHydrationWarning
                    >
                      <button className="focus:outline-none">
                        Book a Tour →
                      </button>
                    </motion.div>
                  </div>
                </div>
              </GlassPanel>
            </motion.div>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
            viewport={{ once: true, margin: "-50px" }}
            className="lg:col-span-2"
          >
            <GlassPanel className="p-8 rounded-2xl">
              <h3 className="text-2xl font-bold text-gradient-gold mb-6">
                Send us a Message
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name and Email Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-200 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 rounded-lg bg-glass-dark border border-white/10 focus:border-primary-gold focus:ring-1 focus:ring-primary-gold/50 focus:outline-none transition-colors duration-200"
                      placeholder="Enter your full name"
                      suppressHydrationWarning
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-200 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 rounded-lg bg-glass-dark border border-white/10 focus:border-primary-gold focus:ring-1 focus:ring-primary-gold/50 focus:outline-none transition-colors duration-200"
                      placeholder="Enter your email"
                      suppressHydrationWarning
                    />
                  </div>
                </div>

                {/* Phone and Course Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-200 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-lg bg-glass-dark border border-white/10 focus:border-primary-gold focus:ring-1 focus:ring-primary-gold/50 focus:outline-none transition-colors duration-200"
                      placeholder="Enter your phone number"
                      suppressHydrationWarning
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="course" className="block text-sm font-medium text-gray-200 mb-2">
                      Course Interest
                    </label>
                    <select
                      id="course"
                      name="course"
                      value={formData.course}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-lg bg-glass-dark border border-white/10 focus:border-primary-gold focus:ring-1 focus:ring-primary-gold/50 focus:outline-none transition-colors duration-200 appearance-none"
                      suppressHydrationWarning
                    >
                      <option value="">Select a course</option>
                      <option value="acting">Acting</option>
                      <option value="dance">Dance</option>
                      <option value="photography">Photography</option>
                      <option value="filmmaking">Filmmaking</option>
                      <option value="modeling">Modeling</option>
                      <option value="multiple">Multiple Courses</option>
                    </select>
                  </div>
                </div>

                {/* Message */}
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-200 mb-2">
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    rows={5}
                    className="w-full px-4 py-3 rounded-lg bg-glass-dark border border-white/10 focus:border-primary-gold focus:ring-1 focus:ring-primary-gold/50 focus:outline-none transition-colors duration-200 resize-none"
                    placeholder="Tell us about your goals and any questions you have..."
                    suppressHydrationWarning
                  />
                </div>

                {/* Submit Button */}
                <motion.div
                  className="w-full"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  suppressHydrationWarning
                >
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={cn(
                      'w-full px-8 py-4 text-lg font-semibold rounded-xl',
                      'bg-gradient-gold text-primary-black',
                      'hover:shadow-gold-glow focus:shadow-gold-glow',
                      'focus:outline-none focus:ring-2 focus:ring-primary-gold focus:ring-offset-2 focus:ring-offset-primary-black',
                      'transition-all duration-300',
                      'disabled:opacity-70 disabled:cursor-not-allowed',
                      'flex items-center justify-center space-x-2'
                    )}
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-primary-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        <span>Send Message</span>
                      </>
                    )}
                  </button>
                </motion.div>
              </form>
            </GlassPanel>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
