'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { GlassPanel } from '@/components/ui/GlassPanel'
import { 
  ArrowLeft, 
  Save, 
  Plus, 
  Minus, 
  Loader2,
  Briefcase,
  Building,
  MapPin,
  DollarSign,
  Clock,
  Users,
  Star
} from 'lucide-react'
import toast from 'react-hot-toast'
import Link from 'next/link'

interface CareerForm {
  title: string
  department: string
  location: string
  type: 'full-time' | 'part-time' | 'contract' | 'internship'
  experience: string
  description: string
  responsibilities: string[]
  requirements: string[]
  qualifications: string[]
  benefits: string[]
  salary: {
    min: string
    max: string
    currency: string
    period: 'hourly' | 'monthly' | 'yearly'
  }
  isActive: boolean
  isFeatured: boolean
  applicationDeadline: string
  postedBy: string
}

const jobTypes = [
  { value: 'full-time', label: 'Full Time' },
  { value: 'part-time', label: 'Part Time' },
  { value: 'contract', label: 'Contract' },
  { value: 'internship', label: 'Internship' }
]

const departments = [
  'Creative Arts',
  'Performing Arts',
  'Music & Audio',
  'Fashion & Modeling',
  'Marketing & Digital Media',
  'Digital Media Production',
  'Audio Production',
  'Film Production',
  'Creative Writing',
  'Dance & Movement',
  'Technology',
  'Operations',
  'HR'
]

const salaryPeriods = [
  { value: 'hourly', label: 'Per Hour' },
  { value: 'monthly', label: 'Per Month' },
  { value: 'yearly', label: 'Per Year' }
]

export default function NewCareerPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<CareerForm>({
    title: '',
    department: 'Creative Arts',
    location: 'Badlapur, Maharashtra, India',
    type: 'full-time',
    experience: '',
    description: '',
    responsibilities: [''],
    requirements: [''],
    qualifications: [''],
    benefits: [''],
    salary: {
      min: '',
      max: '',
      currency: 'INR',
      period: 'yearly'
    },
    isActive: true,
    isFeatured: false,
    applicationDeadline: '',
    postedBy: 'HR Team'
  })
  const [errors, setErrors] = useState<any>({})

  const handleInputChange = (field: keyof CareerForm, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev: any) => ({ ...prev, [field]: undefined }))
    }
  }

  const handleSalaryChange = (field: keyof CareerForm['salary'], value: string) => {
    setFormData(prev => ({
      ...prev,
      salary: { ...prev.salary, [field]: value }
    }))
  }

  const handleArrayChange = (field: keyof Pick<CareerForm, 'responsibilities' | 'requirements' | 'qualifications' | 'benefits'>, index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }))
  }

  const addArrayItem = (field: keyof Pick<CareerForm, 'responsibilities' | 'requirements' | 'qualifications' | 'benefits'>) => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }))
  }

  const removeArrayItem = (field: keyof Pick<CareerForm, 'responsibilities' | 'requirements' | 'qualifications' | 'benefits'>, index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }))
  }

  const validateForm = (): boolean => {
    const newErrors: any = {}

    if (!formData.title.trim()) newErrors.title = 'Job title is required'
    if (!formData.department.trim()) newErrors.department = 'Department is required'
    if (!formData.location.trim()) newErrors.location = 'Location is required'
    if (!formData.experience.trim()) newErrors.experience = 'Experience requirement is required'
    if (!formData.description.trim()) newErrors.description = 'Job description is required'
    if (!formData.postedBy.trim()) newErrors.postedBy = 'Posted by field is required'

    // Validate salary
    if (formData.salary.min && isNaN(Number(formData.salary.min))) {
      newErrors.salaryMin = 'Minimum salary must be a valid number'
    }
    if (formData.salary.max && isNaN(Number(formData.salary.max))) {
      newErrors.salaryMax = 'Maximum salary must be a valid number'
    }
    if (formData.salary.min && formData.salary.max && Number(formData.salary.min) > Number(formData.salary.max)) {
      newErrors.salaryMax = 'Maximum salary must be greater than minimum salary'
    }

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
      // Clean up array fields (remove empty strings)
      const cleanedData = {
        ...formData,
        responsibilities: formData.responsibilities.filter(item => item.trim()),
        requirements: formData.requirements.filter(item => item.trim()),
        qualifications: formData.qualifications.filter(item => item.trim()),
        benefits: formData.benefits.filter(item => item.trim()),
        salary: {
          ...formData.salary,
          min: formData.salary.min ? Number(formData.salary.min) : undefined,
          max: formData.salary.max ? Number(formData.salary.max) : undefined
        }
      }

      const response = await fetch('/api/careers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cleanedData)
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Job posted successfully!')
        router.push('/admin/careers')
      } else {
        toast.error(data.error || 'Failed to post job')
      }
    } catch (error) {
      toast.error('Network error occurred')
      console.error('Error posting job:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <Link
              href="/admin/careers"
              className="inline-flex items-center text-primary-gold hover:text-white transition-colors mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Careers
            </Link>
            <h1 className="text-3xl font-bold text-white mb-2">Post New Job</h1>
            <p className="text-gray-400">Create a new career opportunity</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <GlassPanel className="p-6">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center">
            <Briefcase className="w-5 h-5 mr-2" />
            Basic Information
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Job Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className={`w-full px-4 py-3 bg-white/5 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-gold focus:border-transparent ${
                  errors.title ? 'border-red-500' : 'border-white/10'
                }`}
                placeholder="e.g., Professional Photographer"
              />
              {errors.title && (
                <p className="text-red-400 text-sm mt-1">{errors.title}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Department *
              </label>
              <select
                value={formData.department}
                onChange={(e) => handleInputChange('department', e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-gold focus:border-transparent"
              >
                {departments.map((dept) => (
                  <option key={dept} value={dept} className="bg-primary-black">
                    {dept}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Location *
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                className={`w-full px-4 py-3 bg-white/5 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-gold focus:border-transparent ${
                  errors.location ? 'border-red-500' : 'border-white/10'
                }`}
                placeholder="e.g., Badlapur, Maharashtra, India"
              />
              {errors.location && (
                <p className="text-red-400 text-sm mt-1">{errors.location}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Job Type
              </label>
              <select
                value={formData.type}
                onChange={(e) => handleInputChange('type', e.target.value)}
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
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Experience Required *
              </label>
              <input
                type="text"
                value={formData.experience}
                onChange={(e) => handleInputChange('experience', e.target.value)}
                className={`w-full px-4 py-3 bg-white/5 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-gold focus:border-transparent ${
                  errors.experience ? 'border-red-500' : 'border-white/10'
                }`}
                placeholder="e.g., 2-5 years"
              />
              {errors.experience && (
                <p className="text-red-400 text-sm mt-1">{errors.experience}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Posted By *
              </label>
              <input
                type="text"
                value={formData.postedBy}
                onChange={(e) => handleInputChange('postedBy', e.target.value)}
                className={`w-full px-4 py-3 bg-white/5 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-gold focus:border-transparent ${
                  errors.postedBy ? 'border-red-500' : 'border-white/10'
                }`}
                placeholder="e.g., HR Team"
              />
              {errors.postedBy && (
                <p className="text-red-400 text-sm mt-1">{errors.postedBy}</p>
              )}
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Job Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={4}
              className={`w-full px-4 py-3 bg-white/5 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-gold focus:border-transparent resize-vertical ${
                errors.description ? 'border-red-500' : 'border-white/10'
              }`}
              placeholder="Provide a detailed description of the job role and what the candidate will be doing..."
            />
            {errors.description && (
              <p className="text-red-400 text-sm mt-1">{errors.description}</p>
            )}
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Application Deadline (Optional)
            </label>
            <input
              type="date"
              value={formData.applicationDeadline}
              onChange={(e) => handleInputChange('applicationDeadline', e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-gold focus:border-transparent"
            />
          </div>
        </GlassPanel>

        {/* Salary Information */}
        <GlassPanel className="p-6">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center">
            <DollarSign className="w-5 h-5 mr-2" />
            Salary Information
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Minimum Salary
              </label>
              <input
                type="number"
                value={formData.salary.min}
                onChange={(e) => handleSalaryChange('min', e.target.value)}
                className={`w-full px-4 py-3 bg-white/5 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-gold focus:border-transparent ${
                  errors.salaryMin ? 'border-red-500' : 'border-white/10'
                }`}
                placeholder="0"
              />
              {errors.salaryMin && (
                <p className="text-red-400 text-sm mt-1">{errors.salaryMin}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Maximum Salary
              </label>
              <input
                type="number"
                value={formData.salary.max}
                onChange={(e) => handleSalaryChange('max', e.target.value)}
                className={`w-full px-4 py-3 bg-white/5 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-gold focus:border-transparent ${
                  errors.salaryMax ? 'border-red-500' : 'border-white/10'
                }`}
                placeholder="0"
              />
              {errors.salaryMax && (
                <p className="text-red-400 text-sm mt-1">{errors.salaryMax}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Currency
              </label>
              <select
                value={formData.salary.currency}
                onChange={(e) => handleSalaryChange('currency', e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-gold focus:border-transparent"
              >
                <option value="INR" className="bg-primary-black">INR</option>
                <option value="USD" className="bg-primary-black">USD</option>
                <option value="EUR" className="bg-primary-black">EUR</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Period
              </label>
              <select
                value={formData.salary.period}
                onChange={(e) => handleSalaryChange('period', e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-gold focus:border-transparent"
              >
                {salaryPeriods.map((period) => (
                  <option key={period.value} value={period.value} className="bg-primary-black">
                    {period.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </GlassPanel>

        {/* Array Fields */}
        {[
          { field: 'responsibilities' as const, title: 'Key Responsibilities', icon: Users },
          { field: 'requirements' as const, title: 'Requirements', icon: Clock },
          { field: 'qualifications' as const, title: 'Preferred Qualifications', icon: Star },
          { field: 'benefits' as const, title: 'Benefits', icon: Building }
        ].map(({ field, title, icon: Icon }) => (
          <GlassPanel key={field} className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white flex items-center">
                <Icon className="w-5 h-5 mr-2" />
                {title}
              </h2>
              <button
                type="button"
                onClick={() => addArrayItem(field)}
                className="px-3 py-2 bg-primary-gold text-primary-black rounded-lg hover:shadow-gold-glow transition-all flex items-center text-sm"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Item
              </button>
            </div>
            
            <div className="space-y-3">
              {formData[field].map((item, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <input
                    type="text"
                    value={item}
                    onChange={(e) => handleArrayChange(field, index, e.target.value)}
                    className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-gold focus:border-transparent"
                    placeholder={`Enter ${title.toLowerCase().slice(0, -1)}...`}
                  />
                  {formData[field].length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeArrayItem(field, index)}
                      className="p-2 text-red-400 hover:text-red-300 transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </GlassPanel>
        ))}

        {/* Settings */}
        <GlassPanel className="p-6">
          <h2 className="text-xl font-bold text-white mb-6">Job Settings</h2>
          
          <div className="space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => handleInputChange('isActive', e.target.checked)}
                className="w-4 h-4 text-primary-gold bg-white/5 border-white/10 rounded focus:ring-primary-gold focus:ring-2"
              />
              <label htmlFor="isActive" className="ml-2 text-gray-300">
                Job is active and accepting applications
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="isFeatured"
                checked={formData.isFeatured}
                onChange={(e) => handleInputChange('isFeatured', e.target.checked)}
                className="w-4 h-4 text-primary-gold bg-white/5 border-white/10 rounded focus:ring-primary-gold focus:ring-2"
              />
              <label htmlFor="isFeatured" className="ml-2 text-gray-300">
                Feature this job (appears prominently in listings)
              </label>
            </div>
          </div>
        </GlassPanel>

        {/* Submit Button */}
        <div className="flex items-center justify-between">
          <Link
            href="/admin/careers"
            className="px-6 py-3 border border-white/20 text-white rounded-lg hover:bg-white/5 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-3 bg-gradient-gold text-primary-black rounded-lg font-semibold hover:shadow-gold-glow transition-all flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            ) : (
              <Save className="w-5 h-5 mr-2" />
            )}
            {loading ? 'Posting Job...' : 'Post Job'}
          </button>
        </div>
      </form>
    </div>
  )
}
