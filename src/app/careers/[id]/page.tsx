'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { GlassPanel } from '@/components/ui/GlassPanel'
import { 
  Briefcase, 
  MapPin, 
  Clock, 
  DollarSign, 
  Users, 
  Building,
  Calendar,
  CheckCircle,
  ArrowLeft,
  Upload,
  Send,
  Loader2,
  User,
  Mail,
  Phone,
  Globe,
  FileText,
  Link as LinkIcon
} from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'

interface Career {
  _id: string
  title: string
  department: string
  location: string
  type: string
  experience: string
  description: string
  responsibilities: string[]
  requirements: string[]
  qualifications: string[]
  benefits: string[]
  salary: {
    min?: number
    max?: number
    currency: string
    period: string
  }
  applicationDeadline?: string
  createdAt: string
}

interface ApplicationForm {
  firstName: string
  lastName: string
  email: string
  phone: string
  countryCode: string
  location: string
  experience: string
  coverLetter: string
  expectedSalaryAmount: string
  expectedSalaryCurrency: string
  expectedSalaryPeriod: string
  availableFrom: string
  portfolioUrl: string
  linkedinUrl: string
  additionalInfo: string
  resume: File | null
}

const countryCodes = [
  { code: '+1', country: 'US/CA' },
  { code: '+91', country: 'India' },
  { code: '+44', country: 'UK' },
  { code: '+61', country: 'Australia' },
  { code: '+49', country: 'Germany' },
  { code: '+33', country: 'France' }
]

export default function CareerDetailPage() {
  const params = useParams()
  const [career, setCareer] = useState<Career | null>(null)
  const [loading, setLoading] = useState(true)
  const [applying, setApplying] = useState(false)
  const [showApplication, setShowApplication] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [formData, setFormData] = useState<ApplicationForm>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    countryCode: '+91',
    location: '',
    experience: '',
    coverLetter: '',
    expectedSalaryAmount: '',
    expectedSalaryCurrency: 'INR',
    expectedSalaryPeriod: 'monthly',
    availableFrom: '',
    portfolioUrl: '',
    linkedinUrl: '',
    additionalInfo: '',
    resume: null
  })
  const [errors, setErrors] = useState<any>({})

  useEffect(() => {
    if (params?.id) {
      fetchCareer()
    }
  }, [params?.id])

  const fetchCareer = async () => {
    if (!params?.id) return
    
    try {
      const response = await fetch(`/api/careers/${params.id}`)
      const data = await response.json()

      if (response.ok) {
        setCareer(data.career)
      } else {
        toast.error('Career not found')
      }
    } catch (error) {
      toast.error('Error loading career details')
    } finally {
      setLoading(false)
    }
  }

  const validateForm = (): boolean => {
    const newErrors: any = {}

    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required'
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required'
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required'
    if (!formData.location.trim()) newErrors.location = 'Location is required'
    if (!formData.experience.trim()) newErrors.experience = 'Experience is required'
    if (!formData.resume) newErrors.resume = 'Resume is required'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      toast.error('Please fix the errors in the form')
      return
    }

    setApplying(true)
    try {
      const formDataToSend = new FormData()
      formDataToSend.append('careerId', params?.id as string)
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== null && value !== '') {
          formDataToSend.append(key, value)
        }
      })

      const response = await fetch('/api/applications', {
        method: 'POST',
        body: formDataToSend
      })

      const data = await response.json()

      if (response.ok) {
        setShowConfirmation(true)
        toast.success('Application submitted successfully!')
      } else {
        toast.error(data.error || 'Failed to submit application')
      }
    } catch (error) {
      toast.error('Network error occurred')
    } finally {
      setApplying(false)
    }
  }

  const handleInputChange = (field: keyof ApplicationForm, value: string | File | null) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev: any) => ({ ...prev, [field]: undefined }))
    }
  }

  const formatSalary = (salary: Career['salary']) => {
    if (!salary.min && !salary.max) return 'Competitive'
    
    const formatAmount = (amount: number) => {
      if (amount >= 100000) return `${(amount / 100000).toFixed(1)}L`
      if (amount >= 1000) return `${(amount / 1000).toFixed(0)}K`
      return amount.toString()
    }

    const period = salary.period === 'yearly' ? 'year' : salary.period === 'monthly' ? 'month' : 'hour'
    
    if (salary.min && salary.max) {
      return `${salary.currency} ${formatAmount(salary.min)} - ${formatAmount(salary.max)} per ${period}`
    } else if (salary.min) {
      return `${salary.currency} ${formatAmount(salary.min)}+ per ${period}`
    }
    
    return 'Competitive'
  }

  if (loading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-gold" />
        <span className="ml-2 text-gray-300">Loading career details...</span>
      </div>
    )
  }

  if (!career) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <GlassPanel className="p-12 text-center">
          <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">Career not found</h3>
          <p className="text-gray-400 mb-6">The job posting you're looking for doesn't exist.</p>
          <Link
            href="/careers"
            className="inline-flex items-center px-6 py-3 bg-gradient-gold text-primary-black rounded-lg font-semibold hover:shadow-gold-glow transition-all"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Careers
          </Link>
        </GlassPanel>
      </div>
    )
  }

  // Show confirmation page
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
                    Application Submitted!
                  </span>
                </h1>
                
                <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                  Thank you for applying to <strong>{career.title}</strong>. Your application has been received and will be reviewed by our team.
                </p>
                
                <div className="bg-white/5 rounded-lg p-6 mb-8">
                  <h3 className="text-lg font-semibold text-white mb-4">What happens next?</h3>
                  <div className="text-left space-y-3 text-gray-300">
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-primary-gold rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-primary-black text-sm font-bold">1</span>
                      </div>
                      <p>Our HR team will review your application and resume</p>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-primary-gold rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-primary-black text-sm font-bold">2</span>
                      </div>
                      <p>If shortlisted, we'll contact you within 5-7 business days</p>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-primary-gold rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-primary-black text-sm font-bold">3</span>
                      </div>
                      <p>You'll receive email updates about your application status</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    href="/careers"
                    className="px-6 py-3 bg-gradient-gold text-primary-black rounded-lg font-semibold hover:shadow-gold-glow transition-all flex items-center justify-center"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    View More Jobs
                  </Link>
                  <Link
                    href="/"
                    className="px-6 py-3 border border-white/20 text-white rounded-lg hover:bg-white/5 transition-colors flex items-center justify-center"
                  >
                    Back to Homepage
                  </Link>
                </div>
              </GlassPanel>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Generate structured data for individual job posting
  const generateJobStructuredData = () => {
    if (!career) return {}
    
    return {
      "@context": "https://schema.org",
      "@type": "JobPosting",
      "title": career.title,
      "description": career.description,
      "identifier": {
        "@type": "PropertyValue",
        "name": "GLITZFUSION Academy",
        "value": career._id
      },
      "datePosted": career.createdAt,
      "validThrough": career.applicationDeadline || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
      "employmentType": career.type.toUpperCase().replace('-', '_'),
      "hiringOrganization": {
        "@type": "Organization",
        "name": "GLITZFUSION Academy",
        "sameAs": "https://glitzfusion.in",
        "logo": "https://glitzfusion.in/logo.png",
        "description": "Premier creative arts education academy in Badlapur, Maharashtra"
      },
      "jobLocation": {
        "@type": "Place",
        "address": {
          "@type": "PostalAddress",
          "streetAddress": "GLITZFUSION Academy Campus",
          "addressLocality": "Badlapur",
          "addressRegion": "Maharashtra",
          "postalCode": "421503",
          "addressCountry": "IN"
        }
      },
      "baseSalary": {
        "@type": "MonetaryAmount",
        "currency": career.salary.currency,
        "value": {
          "@type": "QuantitativeValue",
          "minValue": career.salary.min,
          "maxValue": career.salary.max,
          "unitText": career.salary.period.toUpperCase()
        }
      },
      "experienceRequirements": career.experience,
      "educationRequirements": "Bachelor's degree or equivalent experience",
      "industry": "Creative Arts Education",
      "jobBenefits": career.benefits?.join(', ') || "Health Insurance, Professional Development, Creative Environment",
      "responsibilities": career.responsibilities?.join(', '),
      "qualifications": career.requirements?.join(', '),
      "workHours": career.type === 'full-time' ? '40 hours per week' : 'Flexible hours',
      "applicationContact": {
        "@type": "ContactPoint",
        "telephone": "+91-555-123-4567",
        "email": process.env.CAREERS_EMAIL || "careers@glitzfusion.in",
        "contactType": "HR Department"
      }
    }
  }

  return (
    <>
      {/* SEO Structured Data */}
      {career && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(generateJobStructuredData())
          }}
        />
      )}
      
      <div className="min-h-screen pt-20">
      {/* Header */}
      <div className="py-8">
        <div className="container mx-auto px-6">
          <Link
            href="/careers"
            className="inline-flex items-center text-primary-gold hover:text-white transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Careers
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-6 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Job Details */}
          <div className="lg:col-span-2">
            <GlassPanel className="p-8">
              <div className="mb-8">
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">{career.title}</h1>
                <div className="flex flex-wrap items-center gap-4 text-gray-300 mb-6">
                  <div className="flex items-center">
                    <Building className="w-4 h-4 mr-2" />
                    {career.department}
                  </div>
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-2" />
                    {career.location}
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-2" />
                    {career.type.charAt(0).toUpperCase() + career.type.slice(1).replace('-', ' ')}
                  </div>
                  <div className="flex items-center">
                    <Users className="w-4 h-4 mr-2" />
                    {career.experience}
                  </div>
                </div>
                <div className="flex items-center text-primary-gold mb-6">
                  <DollarSign className="w-5 h-5 mr-2" />
                  <span className="text-lg font-semibold">{formatSalary(career.salary)}</span>
                </div>
              </div>

              <div className="space-y-8">
                <div>
                  <h2 className="text-xl font-bold text-white mb-4">Job Description</h2>
                  <p className="text-gray-300 leading-relaxed">{career.description}</p>
                </div>

                {career.responsibilities && career.responsibilities.length > 0 && (
                  <div>
                    <h2 className="text-xl font-bold text-white mb-4">Key Responsibilities</h2>
                    <ul className="space-y-2">
                      {career.responsibilities.map((item, index) => (
                        <li key={index} className="flex items-start text-gray-300">
                          <span className="w-2 h-2 bg-primary-gold rounded-full mt-2 mr-3 flex-shrink-0"></span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {career.requirements && career.requirements.length > 0 && (
                  <div>
                    <h2 className="text-xl font-bold text-white mb-4">Requirements</h2>
                    <ul className="space-y-2">
                      {career.requirements.map((item, index) => (
                        <li key={index} className="flex items-start text-gray-300">
                          <span className="w-2 h-2 bg-primary-gold rounded-full mt-2 mr-3 flex-shrink-0"></span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {career.qualifications && career.qualifications.length > 0 && (
                  <div>
                    <h2 className="text-xl font-bold text-white mb-4">Preferred Qualifications</h2>
                    <ul className="space-y-2">
                      {career.qualifications.map((item, index) => (
                        <li key={index} className="flex items-start text-gray-300">
                          <span className="w-2 h-2 bg-primary-gold rounded-full mt-2 mr-3 flex-shrink-0"></span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {career.benefits && career.benefits.length > 0 && (
                  <div>
                    <h2 className="text-xl font-bold text-white mb-4">Benefits</h2>
                    <ul className="space-y-2">
                      {career.benefits.map((item, index) => (
                        <li key={index} className="flex items-start text-gray-300">
                          <span className="w-2 h-2 bg-primary-gold rounded-full mt-2 mr-3 flex-shrink-0"></span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </GlassPanel>
          </div>

          {/* Application Form */}
          <div className="lg:col-span-1">
            <GlassPanel className="p-6 sticky top-24">
              <div className="mb-6">
                <h3 className="text-xl font-bold text-white mb-2">Apply for this position</h3>
                <p className="text-gray-400 text-sm">
                  Fill out the form below to submit your application
                </p>
              </div>

              {!showApplication ? (
                <button
                  onClick={() => setShowApplication(true)}
                  className="w-full px-6 py-3 bg-gradient-gold text-primary-black rounded-lg font-semibold hover:shadow-gold-glow transition-all flex items-center justify-center"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Apply Now
                </button>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Personal Information */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        First Name *
                      </label>
                      <input
                        type="text"
                        value={formData.firstName}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                        className={`w-full px-3 py-2 bg-white/5 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-gold focus:border-transparent text-sm ${
                          errors.firstName ? 'border-red-500' : 'border-white/10'
                        }`}
                        placeholder="First name"
                      />
                      {errors.firstName && (
                        <p className="text-red-400 text-xs mt-1">{errors.firstName}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        Last Name *
                      </label>
                      <input
                        type="text"
                        value={formData.lastName}
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                        className={`w-full px-3 py-2 bg-white/5 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-gold focus:border-transparent text-sm ${
                          errors.lastName ? 'border-red-500' : 'border-white/10'
                        }`}
                        placeholder="Last name"
                      />
                      {errors.lastName && (
                        <p className="text-red-400 text-xs mt-1">{errors.lastName}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className={`w-full px-3 py-2 bg-white/5 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-gold focus:border-transparent text-sm ${
                        errors.email ? 'border-red-500' : 'border-white/10'
                      }`}
                      placeholder="your.email@example.com"
                    />
                    {errors.email && (
                      <p className="text-red-400 text-xs mt-1">{errors.email}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Phone *
                    </label>
                    <div className="flex">
                      <select
                        value={formData.countryCode}
                        onChange={(e) => handleInputChange('countryCode', e.target.value)}
                        className="px-2 py-2 bg-white/5 border border-white/10 rounded-l-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-gold focus:border-transparent text-sm"
                      >
                        {countryCodes.map((country) => (
                          <option key={country.code} value={country.code} className="bg-primary-black">
                            {country.code}
                          </option>
                        ))}
                      </select>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        className={`flex-1 px-3 py-2 bg-white/5 border border-l-0 border-white/10 rounded-r-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-gold focus:border-transparent text-sm ${
                          errors.phone ? 'border-red-500' : 'border-white/10'
                        }`}
                        placeholder="1234567890"
                      />
                    </div>
                    {errors.phone && (
                      <p className="text-red-400 text-xs mt-1">{errors.phone}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Location *
                    </label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      className={`w-full px-3 py-2 bg-white/5 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-gold focus:border-transparent text-sm ${
                        errors.location ? 'border-red-500' : 'border-white/10'
                      }`}
                      placeholder="City, Country"
                    />
                    {errors.location && (
                      <p className="text-red-400 text-xs mt-1">{errors.location}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Experience *
                    </label>
                    <input
                      type="text"
                      value={formData.experience}
                      onChange={(e) => handleInputChange('experience', e.target.value)}
                      className={`w-full px-3 py-2 bg-white/5 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-gold focus:border-transparent text-sm ${
                        errors.experience ? 'border-red-500' : 'border-white/10'
                      }`}
                      placeholder="e.g., 2-3 years"
                    />
                    {errors.experience && (
                      <p className="text-red-400 text-xs mt-1">{errors.experience}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Resume *
                    </label>
                    <div className="relative">
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={(e) => handleInputChange('resume', e.target.files?.[0] || null)}
                        className="hidden"
                        id="resume-upload"
                      />
                      <label
                        htmlFor="resume-upload"
                        className={`w-full px-3 py-2 bg-white/5 border rounded-lg text-white cursor-pointer hover:bg-white/10 transition-colors flex items-center text-sm ${
                          errors.resume ? 'border-red-500' : 'border-white/10'
                        }`}
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        {formData.resume ? formData.resume.name : 'Choose file (PDF, DOC, DOCX)'}
                      </label>
                    </div>
                    {errors.resume && (
                      <p className="text-red-400 text-xs mt-1">{errors.resume}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Cover Letter
                    </label>
                    <textarea
                      value={formData.coverLetter}
                      onChange={(e) => handleInputChange('coverLetter', e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-gold focus:border-transparent text-sm resize-vertical"
                      placeholder="Why are you interested in this position?"
                    />
                  </div>

                  <div className="flex space-x-3">
                    <button
                      type="button"
                      onClick={() => setShowApplication(false)}
                      className="flex-1 px-4 py-2 border border-white/20 text-white rounded-lg hover:bg-white/5 transition-colors text-sm"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={applying}
                      className="flex-1 px-4 py-2 bg-gradient-gold text-primary-black rounded-lg font-semibold hover:shadow-gold-glow transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                      {applying ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4 mr-2" />
                      )}
                      {applying ? 'Submitting...' : 'Submit Application'}
                    </button>
                  </div>
                </form>
              )}
            </GlassPanel>
          </div>
        </div>
      </div>
    </div>
    </>
  )
}
