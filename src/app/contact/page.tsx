'use client'

import { useState } from 'react'
import { GlassPanel } from '@/components/ui/GlassPanel'
import { Mail, Phone, MapPin, Send, Loader2, MessageCircle, User, Building, CheckCircle, ArrowLeft } from 'lucide-react'
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

export default function ContactPage() {
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
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [submittedContact, setSubmittedContact] = useState<any>(null)

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

      if (response.ok) {
        // Show confirmation page instead of just toast
        setSubmittedContact(data.contact)
        setShowConfirmation(true)
        toast.success('Your message has been sent successfully!')
        // Reset form
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
      } else {
        toast.error(data.error || 'Failed to send message')
      }
    } catch (error) {
      toast.error('Network error occurred')
      console.error('Contact form error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: keyof ContactForm, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  // Show confirmation page after successful submission
  if (showConfirmation) {
    return (
      <div className="min-h-screen pt-20">
        <div className="py-16">
          <div className="container mx-auto px-6">
            <div className="max-w-2xl mx-auto text-center">
              <GlassPanel className="p-12">
                <div className="w-20 h-20 bg-gradient-gold rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-10 h-10 text-primary-black" />
                </div>
                
                <h1 className="text-4xl md:text-5xl font-bold mb-6">
                  <span className="bg-gradient-gold bg-clip-text text-transparent">
                    Message Sent!
                  </span>
                </h1>
                
                <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                  Thank you for contacting us! Your message has been received and we'll get back to you soon.
                </p>
                
                <div className="bg-white/5 rounded-lg p-6 mb-8">
                  <h3 className="text-lg font-semibold text-white mb-4">What happens next?</h3>
                  <div className="text-left space-y-3 text-gray-300">
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-primary-gold rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-primary-black text-sm font-bold">1</span>
                      </div>
                      <p>Our team will review your message and determine the best person to help you</p>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-primary-gold rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-primary-black text-sm font-bold">2</span>
                      </div>
                      <p>You'll receive a response within 24 hours during business days</p>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-primary-gold rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-primary-black text-sm font-bold">3</span>
                      </div>
                      <p>For urgent matters, you can also call us at +91 (555) 123-4567</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={() => setShowConfirmation(false)}
                    className="px-6 py-3 bg-gradient-gold text-primary-black rounded-lg font-semibold hover:shadow-gold-glow transition-all flex items-center justify-center"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Send Another Message
                  </button>
                  <a
                    href="/"
                    className="px-6 py-3 border border-white/20 text-white rounded-lg hover:bg-white/5 transition-colors flex items-center justify-center"
                  >
                    Back to Homepage
                  </a>
                </div>
              </GlassPanel>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-20">
      {/* Hero Section */}
      <div className="py-16">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              <span className="bg-gradient-gold bg-clip-text text-transparent">
                Get In Touch
              </span>
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Have questions about our courses, admissions, or want to collaborate? 
              We'd love to hear from you. Send us a message and we'll get back to you soon.
            </p>
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <div className="container mx-auto px-6 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Contact Information */}
          <div className="lg:col-span-1">
            <GlassPanel className="p-8 h-fit">
              <h2 className="text-2xl font-bold text-white mb-8">Contact Information</h2>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-primary-gold/20 rounded-lg">
                    <Mail className="w-6 h-6 text-primary-gold" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-1">Email</h3>
                    <p className="text-gray-300">contact@glitzfusion.in</p>
                    <p className="text-gray-400 text-sm">We'll respond within 24 hours</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-primary-gold/20 rounded-lg">
                    <Phone className="w-6 h-6 text-primary-gold" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-1">Phone</h3>
                    <p className="text-gray-300">+91 (555) 123-4567</p>
                    <p className="text-gray-400 text-sm">Mon - Fri, 9:00 AM - 6:00 PM IST</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-primary-gold/20 rounded-lg">
                    <MapPin className="w-6 h-6 text-primary-gold" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-1">Address</h3>
                    <p className="text-gray-300">123 Creative Arts Blvd</p>
                    <p className="text-gray-300">Mumbai, Maharashtra 400001</p>
                    <p className="text-gray-400 text-sm">India</p>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-8 border-t border-white/10">
                <h3 className="font-semibold text-white mb-4">Follow Us</h3>
                <div className="flex space-x-4">
                  <a href="https://instagram.com/glitzfusion" className="text-gray-400 hover:text-primary-gold transition-colors">
                    Instagram
                  </a>
                  <a href="https://facebook.com/glitzfusion" className="text-gray-400 hover:text-primary-gold transition-colors">
                    Facebook
                  </a>
                  <a href="https://youtube.com/@glitzfusion" className="text-gray-400 hover:text-primary-gold transition-colors">
                    YouTube
                  </a>
                </div>
              </div>
            </GlassPanel>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <GlassPanel className="p-8">
              <h2 className="text-2xl font-bold text-white mb-8 flex items-center">
                <MessageCircle className="w-6 h-6 mr-3 text-primary-gold" />
                Send us a Message
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      <User className="w-4 h-4 inline mr-2" />
                      First Name *
                    </label>
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      className={`w-full px-4 py-3 bg-white/5 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-gold focus:border-transparent transition-colors ${
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
                      className={`w-full px-4 py-3 bg-white/5 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-gold focus:border-transparent transition-colors ${
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
                    <Mail className="w-4 h-4 inline mr-2" />
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={`w-full px-4 py-3 bg-white/5 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-gold focus:border-transparent transition-colors ${
                      errors.email ? 'border-red-500' : 'border-white/10'
                    }`}
                    placeholder="your.email@example.com"
                  />
                  {errors.email && (
                    <p className="text-red-400 text-sm mt-1">{errors.email}</p>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    <Phone className="w-4 h-4 inline mr-2" />
                    Phone Number (Optional)
                  </label>
                  <div className="flex">
                    <select
                      value={formData.countryCode}
                      onChange={(e) => handleInputChange('countryCode', e.target.value)}
                      className="px-3 py-3 bg-white/5 border border-white/10 rounded-l-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-gold focus:border-transparent"
                    >
                      {countryCodes.map((country) => (
                        <option key={country.code} value={country.code} className="bg-primary-black">
                          {country.code} ({country.country})
                        </option>
                      ))}
                    </select>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="flex-1 px-4 py-3 bg-white/5 border border-l-0 border-white/10 rounded-r-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-gold focus:border-transparent"
                      placeholder="1234567890"
                    />
                  </div>
                </div>

                {/* Category and Priority */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      <Building className="w-4 h-4 inline mr-2" />
                      Category
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => handleInputChange('category', e.target.value)}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-gold focus:border-transparent"
                    >
                      {categories.map((category) => (
                        <option key={category.value} value={category.value} className="bg-primary-black">
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
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-gold focus:border-transparent"
                    >
                      {priorities.map((priority) => (
                        <option key={priority.value} value={priority.value} className="bg-primary-black">
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
                    className={`w-full px-4 py-3 bg-white/5 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-gold focus:border-transparent transition-colors ${
                      errors.subject ? 'border-red-500' : 'border-white/10'
                    }`}
                    placeholder="What's this about?"
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
                    rows={6}
                    className={`w-full px-4 py-3 bg-white/5 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-gold focus:border-transparent transition-colors resize-vertical ${
                      errors.message ? 'border-red-500' : 'border-white/10'
                    }`}
                    placeholder="Tell us more about your inquiry..."
                  />
                  {errors.message && (
                    <p className="text-red-400 text-sm mt-1">{errors.message}</p>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full px-8 py-4 bg-gradient-gold text-primary-black rounded-lg font-semibold hover:shadow-gold-glow transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5 mr-2" />
                  )}
                  {loading ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            </GlassPanel>
          </div>
        </div>
      </div>
    </div>
  )
}
