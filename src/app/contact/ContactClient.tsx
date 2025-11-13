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

export default function ContactClient() {
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

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit contact form')
      }

      setSubmittedContact(data.contact)
      setShowConfirmation(true)
      toast.success('Message sent successfully!')
      
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
    } catch (error: any) {
      console.error('Contact form error:', error)
      toast.error(error.message || 'Failed to send message. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: keyof ContactForm, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  if (showConfirmation && submittedContact) {
    return (
      <div className="relative min-h-screen">
        {/* Background Effects */}
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-spotlight opacity-30" />
        </div>

        <div className="relative z-10 container-custom py-20">
          <div className="max-w-2xl mx-auto text-center">
            <GlassPanel className="p-8">
              <div className="flex items-center justify-center w-16 h-16 mx-auto mb-6 rounded-full bg-green-500/20">
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>
              
              <h1 className="text-3xl font-bold text-gradient-gold mb-4">
                Message Sent Successfully!
              </h1>
              
              <p className="text-gray-300 mb-6">
                Thank you for contacting GLITZFUSION Academy. We've received your message and will get back to you within 24 hours.
              </p>
              
              <div className="bg-white/5 rounded-lg p-4 mb-6 text-left">
                <h3 className="font-semibold text-primary-gold mb-2">Your Message Details:</h3>
                <p><span className="text-gray-400">Name:</span> {submittedContact.firstName} {submittedContact.lastName}</p>
                <p><span className="text-gray-400">Email:</span> {submittedContact.email}</p>
                <p><span className="text-gray-400">Subject:</span> {submittedContact.subject}</p>
                <p><span className="text-gray-400">Category:</span> {categories.find(c => c.value === submittedContact.category)?.label}</p>
              </div>
              
              <button
                onClick={() => setShowConfirmation(false)}
                className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-gold text-primary-black font-semibold rounded-lg hover:shadow-gold-glow-lg transition-all duration-300"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Send Another Message</span>
              </button>
            </GlassPanel>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-spotlight opacity-30" />
      </div>

      <div className="relative z-10 container-custom py-20">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gradient-gold mb-4">
              Get in Touch
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Have questions about our courses or want to start your creative journey? 
              We're here to help you every step of the way.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Contact Info */}
            <div className="lg:col-span-1">
              <GlassPanel className="p-6 h-fit">
                <h2 className="text-2xl font-bold text-gradient-gold mb-6">Contact Information</h2>
                
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary-gold/10">
                      <Mail className="w-5 h-5 text-primary-gold" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white mb-1">Email</h3>
                      <p className="text-gray-300">contact@glitzfusion.in</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary-gold/10">
                      <Phone className="w-5 h-5 text-primary-gold" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white mb-1">Phone</h3>
                      <p className="text-gray-300">+91 98765 43210</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary-gold/10">
                      <MapPin className="w-5 h-5 text-primary-gold" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white mb-1">Address</h3>
                      <p className="text-gray-300">
                        GLITZFUSION Academy<br />
                        Badlapur, Maharashtra<br />
                        India
                      </p>
                    </div>
                  </div>
                </div>
              </GlassPanel>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <GlassPanel className="p-6">
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
                      rows={6}
                      className={`w-full px-4 py-3 bg-white/5 border rounded-lg focus:ring-2 focus:ring-primary-gold/50 focus:border-primary-gold/50 transition-all duration-300 resize-none ${
                        errors.message ? 'border-red-500' : 'border-white/10'
                      }`}
                      placeholder="Enter your message here..."
                    />
                    {errors.message && (
                      <p className="text-red-400 text-sm mt-1">{errors.message}</p>
                    )}
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full px-8 py-4 bg-gradient-gold text-primary-black font-semibold rounded-lg hover:shadow-gold-glow-lg focus:shadow-gold-glow-lg focus:outline-none focus:ring-2 focus:ring-primary-gold focus:ring-offset-2 focus:ring-offset-primary-black transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center space-x-2">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Sending Message...</span>
                      </span>
                    ) : (
                      <span className="flex items-center justify-center space-x-2">
                        <Send className="w-5 h-5" />
                        <span>Send Message</span>
                      </span>
                    )}
                  </button>
                </form>
              </GlassPanel>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
