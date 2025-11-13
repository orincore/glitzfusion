'use client'

import { useState, useEffect } from 'react'
import Head from 'next/head'
import { GlassPanel } from '@/components/ui/GlassPanel'
import { 
  Briefcase, 
  MapPin, 
  Clock, 
  DollarSign, 
  Users, 
  Search, 
  Filter,
  ChevronRight,
  Star,
  Building,
  Calendar,
  Loader2
} from 'lucide-react'
import Link from 'next/link'

interface Career {
  _id: string
  title: string
  department: string
  location: string
  type: 'full-time' | 'part-time' | 'contract' | 'internship'
  experience: string
  description: string
  salary: {
    min?: number
    max?: number
    currency: string
    period: 'hourly' | 'monthly' | 'yearly'
  }
  isFeatured: boolean
  createdAt: string
}

const jobTypes = [
  { value: 'all', label: 'All Types' },
  { value: 'full-time', label: 'Full Time' },
  { value: 'part-time', label: 'Part Time' },
  { value: 'contract', label: 'Contract' },
  { value: 'internship', label: 'Internship' }
]

export default function CareersPage() {
  const [careers, setCareers] = useState<Career[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    search: '',
    type: 'all',
    department: 'all'
  })
  const [departments, setDepartments] = useState<string[]>([])

  useEffect(() => {
    fetchCareers()
  }, [filters])

  const fetchCareers = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filters.search) params.append('search', filters.search)
      if (filters.type !== 'all') params.append('type', filters.type)
      if (filters.department !== 'all') params.append('department', filters.department)
      params.append('isActive', 'true')

      const response = await fetch(`/api/careers?${params}`)
      const data = await response.json()

      if (response.ok) {
        setCareers(data.careers)
        // Extract unique departments
        const uniqueDepartments = [...new Set(data.careers.map((career: Career) => career.department))] as string[]
        setDepartments(uniqueDepartments)
      }
    } catch (error) {
      console.error('Error fetching careers:', error)
    } finally {
      setLoading(false)
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
    } else if (salary.max) {
      return `Up to ${salary.currency} ${formatAmount(salary.max)} per ${period}`
    }
    
    return 'Competitive'
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'full-time': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
      case 'part-time': return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      case 'contract': return 'bg-purple-500/20 text-purple-400 border-purple-500/30'
      case 'internship': return 'bg-amber-500/20 text-amber-400 border-amber-500/30'
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  // Generate structured data for SEO
  const generateStructuredData = () => {
    const jobPostings = careers.map(career => ({
      "@type": "JobPosting",
      "title": career.title,
      "description": career.description,
      "identifier": {
        "@type": "PropertyValue",
        "name": "GLITZFUSION Academy",
        "value": career._id
      },
      "datePosted": career.createdAt,
      "employmentType": career.type.toUpperCase().replace('-', '_'),
      "hiringOrganization": {
        "@type": "Organization",
        "name": "GLITZFUSION Academy",
        "sameAs": "https://glitzfusion.in",
        "logo": "https://glitzfusion.in/logo.png"
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
      "industry": "Creative Arts Education",
      "jobBenefits": "Health Insurance, Professional Development, Creative Environment"
    }))

    return {
      "@context": "https://schema.org",
      "@type": "ItemList",
      "name": "GLITZFUSION Academy Career Opportunities",
      "description": "Creative arts job opportunities in Badlapur, Maharashtra",
      "numberOfItems": careers.length,
      "itemListElement": jobPostings
    }
  }

  return (
    <>
      {/* Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateStructuredData())
        }}
      />
      
      <div className="min-h-screen pt-20">
        {/* Hero Section */}
        <div className="py-16">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              <span className="bg-gradient-gold bg-clip-text text-transparent">
                Creative Arts Jobs in Badlapur
              </span>
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Join GLITZFUSION Academy in Badlapur, Maharashtra and help shape the future of creative arts education. 
              We are hiring photographers, acting instructors, musicians, choreographers, content creators, and more creative professionals.
            </p>
            
            {/* SEO Keywords Section */}
            <div className="mt-8 text-center">
              <p className="text-gray-400 text-sm max-w-4xl mx-auto">
                <strong>Now Hiring:</strong> Photography Jobs Badlapur • Acting Instructor Careers • Music Teacher Positions • 
                Dance Choreographer Jobs • Content Creator Opportunities • Film Maker Careers • Script Writer Jobs • 
                Voice Over Artist Positions • Modeling Instructor Careers in Maharashtra
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="container mx-auto px-6 mb-12">
        <GlassPanel className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Search Jobs</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-gold focus:border-transparent"
                  placeholder="Job title, keywords..."
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Job Type</label>
              <select
                value={filters.type}
                onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-gold focus:border-transparent"
              >
                {jobTypes.map((type) => (
                  <option key={type.value} value={type.value} className="bg-primary-black">
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Department</label>
              <select
                value={filters.department}
                onChange={(e) => setFilters(prev => ({ ...prev, department: e.target.value }))}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-gold focus:border-transparent"
              >
                <option value="all" className="bg-primary-black">All Departments</option>
                {departments.map((dept) => (
                  <option key={dept} value={dept} className="bg-primary-black">
                    {dept}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </GlassPanel>
      </div>

      {/* Jobs Section */}
      <div className="container mx-auto px-6 pb-20">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary-gold" />
            <span className="ml-2 text-gray-300">Loading careers...</span>
          </div>
        ) : careers.length === 0 ? (
          <GlassPanel className="p-12 text-center">
            <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No jobs found</h3>
            <p className="text-gray-400">
              No career opportunities match your current filters. Try adjusting your search criteria.
            </p>
          </GlassPanel>
        ) : (
          <div className="space-y-6">
            {careers.map((career) => (
              <GlassPanel key={career._id} className="p-6 hover:shadow-gold-glow transition-all duration-300">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-xl font-bold text-white">{career.title}</h3>
                          {career.isFeatured && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-gold/20 text-primary-gold border border-primary-gold/30">
                              <Star className="w-3 h-3 mr-1" />
                              Featured
                            </span>
                          )}
                        </div>
                        <div className="flex items-center space-x-4 text-gray-300 text-sm mb-3">
                          <div className="flex items-center">
                            <Building className="w-4 h-4 mr-1" />
                            {career.department}
                          </div>
                          <div className="flex items-center">
                            <MapPin className="w-4 h-4 mr-1" />
                            {career.location}
                          </div>
                          <div className="flex items-center">
                            <Users className="w-4 h-4 mr-1" />
                            {career.experience}
                          </div>
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            {new Date(career.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getTypeColor(career.type)}`}>
                        <Clock className="w-3 h-3 mr-1" />
                        {career.type.charAt(0).toUpperCase() + career.type.slice(1).replace('-', ' ')}
                      </span>
                    </div>

                    <p className="text-gray-300 mb-4 line-clamp-2">
                      {career.description}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-primary-gold">
                        <DollarSign className="w-4 h-4 mr-1" />
                        <span className="font-medium">{formatSalary(career.salary)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 lg:mt-0 lg:ml-6">
                    <Link
                      href={`/careers/${career._id}`}
                      className="inline-flex items-center px-6 py-3 bg-gradient-gold text-primary-black rounded-lg font-semibold hover:shadow-gold-glow transition-all"
                    >
                      View Details
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </Link>
                  </div>
                </div>
              </GlassPanel>
            ))}
          </div>
        )}
      </div>
    </div>
    </>
  )
}
