'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  User, Mail, Phone, MapPin, Calendar, Users, 
  GraduationCap, Youtube, Instagram, Upload, 
  FileText, Clock, Heart, AlertCircle, CheckCircle,
  Loader2
} from 'lucide-react'
import { GlassPanel } from '@/components/ui/GlassPanel'
import { cn, fadeInUp, staggerContainer } from '@/lib/utils'
import { useAdmissions } from '@/hooks/useAdmissions'
import { useCourseOptions } from '@/hooks/useCourseOptions'

interface FormData {
  firstName: string
  lastName: string
  email: string
  phone: string
  countryCode: string
  age: number | ''
  gender: 'male' | 'female' | 'other' | 'prefer-not-to-say' | ''
  location: {
    city: string
    state: string
    country: string
  }
  course: string
  resumeUrl: string
  youtubeUrl: string
  instagramUrl: string
  portfolioUrl: string
  experience: 'beginner' | 'intermediate' | 'advanced' | ''
  motivation: string
  previousTraining: string
  availability: string[]
  emergencyContact: {
    name: string
    phone: string
    relationship: string
  }
}

const countryCodes = [
  { code: '+91', country: 'India' },
  { code: '+1', country: 'USA' },
  { code: '+44', country: 'UK' },
  { code: '+61', country: 'Australia' },
  { code: '+971', country: 'UAE' },
]

const availabilityOptions = [
  'Monday Morning', 'Monday Evening',
  'Tuesday Morning', 'Tuesday Evening',
  'Wednesday Morning', 'Wednesday Evening',
  'Thursday Morning', 'Thursday Evening',
  'Friday Morning', 'Friday Evening',
  'Saturday Morning', 'Saturday Evening',
  'Sunday Morning', 'Sunday Evening'
]

export default function AdmissionForm() {
  const { submitAdmission, loading } = useAdmissions()
  const { courses, loading: coursesLoading, error: coursesError } = useCourseOptions()
  const [submitted, setSubmitted] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    countryCode: '+91',
    age: '',
    gender: '',
    location: {
      city: '',
      state: '',
      country: 'India'
    },
    course: '',
    resumeUrl: '',
    youtubeUrl: '',
    instagramUrl: '',
    portfolioUrl: '',
    experience: '',
    motivation: '',
    previousTraining: '',
    availability: [],
    emergencyContact: {
      name: '',
      phone: '',
      relationship: ''
    }
  })

  const handleInputChange = (field: string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.')
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof FormData] as any,
          [child]: value
        }
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }))
    }
  }

  const handleAvailabilityChange = (option: string) => {
    setFormData(prev => ({
      ...prev,
      availability: prev.availability.includes(option)
        ? prev.availability.filter(item => item !== option)
        : [...prev.availability, option]
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const submissionData = {
        ...formData,
        age: Number(formData.age),
        gender: formData.gender as 'male' | 'female' | 'other' | 'prefer-not-to-say',
        experience: formData.experience as 'beginner' | 'intermediate' | 'advanced'
      }
      
      await submitAdmission(submissionData)
      setSubmitted(true)
    } catch (error) {
      console.error('Submission error:', error)
    }
  }

  if (submitted) {
    return (
      <section className="py-20 relative">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto text-center"
          >
            <GlassPanel className="p-12">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-6" />
              <h2 className="text-3xl font-bold text-gradient-gold mb-4">
                Application Submitted Successfully!
              </h2>
              <p className="text-gray-300 mb-6">
                Thank you for your interest in GLITZFUSION! We have received your application 
                and will review it within 2-3 business days. A confirmation email with detailed 
                information about next steps has been sent to <strong className="text-primary-gold">{formData.email}</strong>.
              </p>
              <motion.button
                onClick={() => setSubmitted(false)}
                className={cn(
                  'px-8 py-3 bg-gradient-gold text-primary-black font-semibold rounded-xl',
                  'hover:shadow-gold-glow transition-all duration-300'
                )}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Submit Another Application
              </motion.button>
            </GlassPanel>
          </motion.div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-20 relative">
      <div className="container-custom">
        <motion.div
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          className="max-w-4xl mx-auto"
        >
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Personal Information */}
            <motion.div variants={fadeInUp}>
              <GlassPanel className="p-8">
                <div className="flex items-center mb-6">
                  <User className="w-6 h-6 text-primary-gold mr-3" />
                  <h3 className="text-2xl font-bold text-white">Personal Information</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      First Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-gold focus:border-transparent"
                      placeholder="Enter your first name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-gold focus:border-transparent"
                      placeholder="Enter your last name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-gold focus:border-transparent"
                      placeholder="your.email@example.com"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Phone Number *
                    </label>
                    <div className="flex">
                      <select
                        value={formData.countryCode}
                        onChange={(e) => handleInputChange('countryCode', e.target.value)}
                        className="px-3 py-3 bg-white/5 border border-white/10 rounded-l-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-gold"
                      >
                        {countryCodes.map(({ code, country }) => (
                          <option key={code} value={code} className="bg-primary-black">
                            {code} ({country})
                          </option>
                        ))}
                      </select>
                      <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        className="flex-1 px-4 py-3 bg-white/5 border border-white/10 border-l-0 rounded-r-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-gold"
                        placeholder="1234567890"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Age *
                    </label>
                    <input
                      type="number"
                      required
                      min="16"
                      max="65"
                      value={formData.age}
                      onChange={(e) => handleInputChange('age', e.target.value ? parseInt(e.target.value) : '')}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-gold focus:border-transparent"
                      placeholder="25"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Gender *
                    </label>
                    <select
                      required
                      value={formData.gender}
                      onChange={(e) => handleInputChange('gender', e.target.value)}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-gold"
                    >
                      <option value="" className="bg-primary-black">Select Gender</option>
                      <option value="male" className="bg-primary-black">Male</option>
                      <option value="female" className="bg-primary-black">Female</option>
                      <option value="other" className="bg-primary-black">Other</option>
                      <option value="prefer-not-to-say" className="bg-primary-black">Prefer not to say</option>
                    </select>
                  </div>
                </div>
              </GlassPanel>
            </motion.div>

            {/* Location Information */}
            <motion.div variants={fadeInUp}>
              <GlassPanel className="p-8">
                <div className="flex items-center mb-6">
                  <MapPin className="w-6 h-6 text-primary-gold mr-3" />
                  <h3 className="text-2xl font-bold text-white">Location</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      City *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.location.city}
                      onChange={(e) => handleInputChange('location.city', e.target.value)}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-gold focus:border-transparent"
                      placeholder="Mumbai"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      State *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.location.state}
                      onChange={(e) => handleInputChange('location.state', e.target.value)}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-gold focus:border-transparent"
                      placeholder="Maharashtra"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Country *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.location.country}
                      onChange={(e) => handleInputChange('location.country', e.target.value)}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-gold focus:border-transparent"
                      placeholder="India"
                    />
                  </div>
                </div>
              </GlassPanel>
            </motion.div>

            {/* Course Selection */}
            <motion.div variants={fadeInUp}>
              <GlassPanel className="p-8">
                <div className="flex items-center mb-6">
                  <GraduationCap className="w-6 h-6 text-primary-gold mr-3" />
                  <h3 className="text-2xl font-bold text-white">Course & Experience</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Course *
                    </label>
                    <select
                      required
                      value={formData.course}
                      onChange={(e) => handleInputChange('course', e.target.value)}
                      disabled={coursesLoading}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-gold disabled:opacity-50"
                    >
                      <option value="" className="bg-primary-black">
                        {coursesLoading ? 'Loading courses...' : 'Select a Course'}
                      </option>
                      {courses.map((course) => (
                        <option key={course.id} value={course.title} className="bg-primary-black">
                          {course.title} - {course.duration} ({course.level})
                        </option>
                      ))}
                    </select>
                    {coursesError && (
                      <p className="text-red-400 text-sm mt-1 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {coursesError}
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Experience Level *
                    </label>
                    <select
                      required
                      value={formData.experience}
                      onChange={(e) => handleInputChange('experience', e.target.value)}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-gold"
                    >
                      <option value="" className="bg-primary-black">Select Experience Level</option>
                      <option value="beginner" className="bg-primary-black">Beginner</option>
                      <option value="intermediate" className="bg-primary-black">Intermediate</option>
                      <option value="advanced" className="bg-primary-black">Advanced</option>
                    </select>
                  </div>
                </div>
                
                {/* Selected Course Information */}
                {formData.course && (
                  <div className="mt-6 p-4 bg-primary-gold/10 border border-primary-gold/20 rounded-lg">
                    {(() => {
                      const selectedCourse = courses.find(c => c.title === formData.course)
                      if (!selectedCourse) return null
                      
                      return (
                        <div>
                          <h4 className="text-primary-gold font-semibold mb-2">Course Details</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-gray-400">Duration:</span>
                              <span className="text-white ml-2">{selectedCourse.duration}</span>
                            </div>
                            <div>
                              <span className="text-gray-400">Level:</span>
                              <span className="text-white ml-2">{selectedCourse.level}</span>
                            </div>
                            <div>
                              <span className="text-gray-400">Investment:</span>
                              <span className="text-white ml-2">{selectedCourse.investment}</span>
                            </div>
                            <div>
                              <span className="text-gray-400">Next Start:</span>
                              <span className="text-white ml-2">{selectedCourse.nextStart}</span>
                            </div>
                          </div>
                        </div>
                      )
                    })()}
                  </div>
                )}
                
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Previous Training (Optional)
                  </label>
                  <textarea
                    value={formData.previousTraining}
                    onChange={(e) => handleInputChange('previousTraining', e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-gold focus:border-transparent resize-none"
                    placeholder="Describe any previous training or experience in your chosen field..."
                  />
                </div>
              </GlassPanel>
            </motion.div>

            {/* Portfolio Links */}
            <motion.div variants={fadeInUp}>
              <GlassPanel className="p-8">
                <div className="flex items-center mb-6">
                  <Upload className="w-6 h-6 text-primary-gold mr-3" />
                  <h3 className="text-2xl font-bold text-white">Portfolio & Social Media</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      <FileText className="w-4 h-4 inline mr-1" />
                      Resume URL (Optional)
                    </label>
                    <input
                      type="url"
                      value={formData.resumeUrl}
                      onChange={(e) => handleInputChange('resumeUrl', e.target.value)}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-gold focus:border-transparent"
                      placeholder="https://drive.google.com/..."
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Portfolio Website (Optional)
                    </label>
                    <input
                      type="url"
                      value={formData.portfolioUrl}
                      onChange={(e) => handleInputChange('portfolioUrl', e.target.value)}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-gold focus:border-transparent"
                      placeholder="https://yourportfolio.com"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      <Youtube className="w-4 h-4 inline mr-1" />
                      YouTube Channel (Optional)
                    </label>
                    <input
                      type="url"
                      value={formData.youtubeUrl}
                      onChange={(e) => handleInputChange('youtubeUrl', e.target.value)}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-gold focus:border-transparent"
                      placeholder="https://youtube.com/@yourchannel"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      <Instagram className="w-4 h-4 inline mr-1" />
                      Instagram Profile (Optional)
                    </label>
                    <input
                      type="url"
                      value={formData.instagramUrl}
                      onChange={(e) => handleInputChange('instagramUrl', e.target.value)}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-gold focus:border-transparent"
                      placeholder="https://instagram.com/yourprofile"
                    />
                  </div>
                </div>
              </GlassPanel>
            </motion.div>

            {/* Motivation */}
            <motion.div variants={fadeInUp}>
              <GlassPanel className="p-8">
                <div className="flex items-center mb-6">
                  <Heart className="w-6 h-6 text-primary-gold mr-3" />
                  <h3 className="text-2xl font-bold text-white">Motivation</h3>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Why do you want to join GLITZFUSION? *
                  </label>
                  <textarea
                    required
                    value={formData.motivation}
                    onChange={(e) => handleInputChange('motivation', e.target.value)}
                    rows={5}
                    maxLength={1000}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-gold focus:border-transparent resize-none"
                    placeholder="Tell us about your passion, goals, and what you hope to achieve through our program..."
                  />
                  <div className="text-right text-sm text-gray-400 mt-1">
                    {formData.motivation.length}/1000 characters
                  </div>
                </div>
              </GlassPanel>
            </motion.div>

            {/* Availability */}
            <motion.div variants={fadeInUp}>
              <GlassPanel className="p-8">
                <div className="flex items-center mb-6">
                  <Clock className="w-6 h-6 text-primary-gold mr-3" />
                  <h3 className="text-2xl font-bold text-white">Availability</h3>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-4">
                    Select your preferred time slots (Choose at least 3) *
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {availabilityOptions.map((option) => (
                      <label
                        key={option}
                        className={cn(
                          'flex items-center p-3 rounded-lg border cursor-pointer transition-all',
                          formData.availability.includes(option)
                            ? 'border-primary-gold bg-primary-gold/10 text-primary-gold'
                            : 'border-white/10 bg-white/5 text-gray-300 hover:border-primary-gold/50'
                        )}
                      >
                        <input
                          type="checkbox"
                          checked={formData.availability.includes(option)}
                          onChange={() => handleAvailabilityChange(option)}
                          className="sr-only"
                        />
                        <span className="text-sm">{option}</span>
                      </label>
                    ))}
                  </div>
                  {formData.availability.length < 3 && (
                    <p className="text-amber-400 text-sm mt-2 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      Please select at least 3 time slots
                    </p>
                  )}
                </div>
              </GlassPanel>
            </motion.div>

            {/* Emergency Contact */}
            <motion.div variants={fadeInUp}>
              <GlassPanel className="p-8">
                <div className="flex items-center mb-6">
                  <Users className="w-6 h-6 text-primary-gold mr-3" />
                  <h3 className="text-2xl font-bold text-white">Emergency Contact</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Contact Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.emergencyContact.name}
                      onChange={(e) => handleInputChange('emergencyContact.name', e.target.value)}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-gold focus:border-transparent"
                      placeholder="Full Name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      value={formData.emergencyContact.phone}
                      onChange={(e) => handleInputChange('emergencyContact.phone', e.target.value)}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-gold focus:border-transparent"
                      placeholder="Phone Number"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Relationship *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.emergencyContact.relationship}
                      onChange={(e) => handleInputChange('emergencyContact.relationship', e.target.value)}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-gold focus:border-transparent"
                      placeholder="Parent/Guardian/Spouse"
                    />
                  </div>
                </div>
              </GlassPanel>
            </motion.div>

            {/* Submit Button */}
            <motion.div variants={fadeInUp} className="text-center">
              <motion.button
                type="submit"
                disabled={loading || formData.availability.length < 3}
                className={cn(
                  'px-12 py-4 text-lg font-semibold rounded-xl transition-all duration-300',
                  loading || formData.availability.length < 3
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    : 'bg-gradient-gold text-primary-black hover:shadow-gold-glow-lg'
                )}
                whileHover={!loading && formData.availability.length >= 3 ? { scale: 1.05, y: -2 } : {}}
                whileTap={!loading && formData.availability.length >= 3 ? { scale: 0.95 } : {}}
              >
                {loading ? (
                  <span className="flex items-center">
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    Submitting Application...
                  </span>
                ) : (
                  'Submit Application'
                )}
              </motion.button>
              
              <p className="text-gray-400 text-sm mt-4">
                By submitting this form, you agree to our terms and conditions. 
                We will contact you within 2-3 business days.
              </p>
            </motion.div>
          </form>
        </motion.div>
      </div>
    </section>
  )
}
