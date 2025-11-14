'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, Phone, MapPin, Send, Clock, Calendar } from 'lucide-react'
import { GlassPanel } from '@/components/ui/GlassPanel'
import { cn, fadeInUp, staggerContainer } from '@/lib/utils'
import toast from 'react-hot-toast'

interface ContactForm {
  firstName: string
  lastName: string
  email: string
  phone: string
  countryCode: string
  subject: string
  message: string
  category: string
  priority: string
}

const categories = [
  { value: 'general', label: 'General Inquiry' },
  { value: 'admissions', label: 'Admissions' },
  { value: 'courses', label: 'Course Information' },
  { value: 'technical', label: 'Technical Support' },
  { value: 'partnership', label: 'Partnership' },
  { value: 'other', label: 'Other' }
]

const priorities = [
  { value: 'low', label: 'Low Priority' },
  { value: 'medium', label: 'Medium Priority' },
  { value: 'high', label: 'High Priority' }
]

const countryCodes = [
  { code: '+1', country: 'US/CA' },
  { code: '+91', country: 'India' },
  { code: '+44', country: 'UK' },
  { code: '+61', country: 'Australia' },
  { code: '+49', country: 'Germany' },
  { code: '+33', country: 'France' }
]

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
  const [formData, setFormData] = useState<ContactForm>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    countryCode: '+91',
    subject: '',
    message: '',
    category: 'general',
    priority: 'medium'
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Partial<ContactForm>>({})

  const handleInputChange = (field: keyof ContactForm, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Partial<ContactForm> = {}

    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required'
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required'
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }
    if (!formData.subject.trim()) newErrors.subject = 'Subject is required'
    if (!formData.message.trim()) newErrors.message = 'Message is required'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      toast.error('Please fix the errors in the form')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit contact form')
      }

      toast.success('Message sent successfully!')

      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        countryCode: '+91',
        subject: '',
        message: '',
        category: 'general',
        priority: 'medium'
      })
      setErrors({})
    } catch (error: any) {
      console.error('Home contact form error:', error)
      toast.error(error.message || 'Failed to send message. Please try again.')
    } finally {
      setLoading(false)
    }
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
                      <button className="focus:outline-none" suppressHydrationWarning>
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
                {/* Name Fields */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      First Name *
                    </label>
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      className={`w-full px-4 py-3 bg-white/5 border rounded-lg focus:ring-2 focus:ring-primary-gold/50 focus:border-primary-gold/50 transition-all duration-300 ${
                        errors.firstName ? 'border-red-500' : 'border-white/10'
                      }`}
                      placeholder="Enter your first name"
                    />
                    {errors.firstName && (
                      <p className="text-red-400 text-sm mt-1">{errors.firstName}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      className={`w-full px-4 py-3 bg-white/5 border rounded-lg focus:ring-2 focus:ring-primary-gold/50 focus:border-primary-gold/50 transition-all duration-300 ${
                        errors.lastName ? 'border-red-500' : 'border-white/10'
                      }`}
                      placeholder="Enter your last name"
                    />
                    {errors.lastName && (
                      <p className="text-red-400 text-sm mt-1">{errors.lastName}</p>
                    )}
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={`w-full px-4 py-3 bg-white/5 border rounded-lg focus:ring-2 focus:ring-primary-gold/50 focus:border-primary-gold/50 transition-all duration-300 ${
                      errors.email ? 'border-red-500' : 'border-white/10'
                    }`}
                    placeholder="Enter your email address"
                  />
                  {errors.email && (
                    <p className="text-red-400 text-sm mt-1">{errors.email}</p>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Phone Number
                  </label>
                  <div className="flex">
                    <select
                      value={formData.countryCode}
                      onChange={(e) => handleInputChange('countryCode', e.target.value)}
                      className="px-3 py-3 bg-white/5 border border-white/10 rounded-l-lg focus:ring-2 focus:ring-primary-gold/50 focus:border-primary-gold/50 transition-all duration-300"
                    >
                      {countryCodes.map((country) => (
                        <option key={country.code} value={country.code} className="bg-primary-dark">
                          {country.code} ({country.country})
                        </option>
                      ))}
                    </select>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="flex-1 px-4 py-3 bg-white/5 border border-l-0 border-white/10 rounded-r-lg focus:ring-2 focus:ring-primary-gold/50 focus:border-primary-gold/50 transition-all duration-300"
                      placeholder="Enter your phone number"
                    />
                  </div>
                </div>

                {/* Category and Priority */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Category
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => handleInputChange('category', e.target.value)}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-primary-gold/50 focus:border-primary-gold/50 transition-all duration-300"
                    >
                      {categories.map((category) => (
                        <option key={category.value} value={category.value} className="bg-primary-dark">
                          {category.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Priority
                    </label>
                    <select
                      value={formData.priority}
                      onChange={(e) => handleInputChange('priority', e.target.value)}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-primary-gold/50 focus:border-primary-gold/50 transition-all duration-300"
                    >
                      {priorities.map((priority) => (
                        <option key={priority.value} value={priority.value} className="bg-primary-dark">
                          {priority.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Subject */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Subject *
                  </label>
                  <input
                    type="text"
                    value={formData.subject}
                    onChange={(e) => handleInputChange('subject', e.target.value)}
                    className={`w-full px-4 py-3 bg-white/5 border rounded-lg focus:ring-2 focus:ring-primary-gold/50 focus:border-primary-gold/50 transition-all duration-300 ${
                      errors.subject ? 'border-red-500' : 'border-white/10'
                    }`}
                    placeholder="Enter the subject of your message"
                  />
                  {errors.subject && (
                    <p className="text-red-400 text-sm mt-1">{errors.subject}</p>
                  )}
                </div>

                {/* Message */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Message *
                  </label>
                  <textarea
                    value={formData.message}
                    onChange={(e) => handleInputChange('message', e.target.value)}
                    rows={5}
                    className={`w-full px-4 py-3 rounded-lg bg-glass-dark border border-white/10 focus:border-primary-gold focus:ring-1 focus:ring-primary-gold/50 focus:outline-none transition-colors duration-200 resize-none ${
                      errors.message ? 'border-red-500' : 'border-white/10'
                    }`}
                    placeholder="Tell us about your goals and any questions you have..."
                  />
                  {errors.message && (
                    <p className="text-red-400 text-sm mt-1">{errors.message}</p>
                  )}
                </div>

                {/* Submit Button */}
                <motion.div
                  className="w-full"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <button
                    type="submit"
                    disabled={loading}
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
                    {loading ? (
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
