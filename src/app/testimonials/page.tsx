'use client'

import { useState, useEffect } from 'react'
import { GlassPanel } from '@/components/ui/GlassPanel'
import { Star, Send, Loader2, MessageCircle, User, Mail, Heart, CheckCircle, ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'
import { useTestimonials } from '@/hooks/useTestimonials'

interface TestimonialForm {
  firstName: string
  lastName: string
  email: string
  rating: number
  review: string
}

interface TestimonialFormErrors {
  firstName?: string
  lastName?: string
  email?: string
  rating?: string
  review?: string
}

export default function TestimonialsPage() {
  const [formData, setFormData] = useState<TestimonialForm>({
    firstName: '',
    lastName: '',
    email: '',
    rating: 5,
    review: ''
  })
  
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<TestimonialFormErrors>({})
  const [hoveredRating, setHoveredRating] = useState(0)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [submittedTestimonial, setSubmittedTestimonial] = useState<any>(null)

  // Fetch top submitted reviews
  const { testimonials: topReviews, loading: reviewsLoading } = useTestimonials({
    published: true,
    limit: 6
  })

  const validateForm = (): boolean => {
    const newErrors: TestimonialFormErrors = {}

    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required'
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required'
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }
    if (formData.rating < 1 || formData.rating > 5) {
      newErrors.rating = 'Please select a rating between 1 and 5 stars'
    }
    if (!formData.review.trim()) {
      newErrors.review = 'Review is required'
    } else if (formData.review.trim().length < 10) {
      newErrors.review = 'Review must be at least 10 characters long'
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
      const response = await fetch('/api/testimonials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (response.ok) {
        // Show confirmation page instead of just toast
        setSubmittedTestimonial(data.testimonial)
        setShowConfirmation(true)
        toast.success('Thank you for your testimonial!')
        // Reset form
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          rating: 5,
          review: ''
        })
        setErrors({})
      } else {
        toast.error(data.error || 'Failed to submit testimonial')
      }
    } catch (error) {
      toast.error('Network error occurred')
      console.error('Testimonial form error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: keyof TestimonialForm, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const renderStars = () => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => handleInputChange('rating', star)}
            onMouseEnter={() => setHoveredRating(star)}
            onMouseLeave={() => setHoveredRating(0)}
            className="focus:outline-none transition-colors"
          >
            <Star
              className={`w-8 h-8 transition-colors ${
                star <= (hoveredRating || formData.rating)
                  ? 'text-primary-gold fill-primary-gold'
                  : 'text-gray-400 hover:text-primary-gold'
              }`}
            />
          </button>
        ))}
        <span className="ml-3 text-gray-300">
          {formData.rating} star{formData.rating !== 1 ? 's' : ''}
        </span>
      </div>
    )
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
                    Thank You!
                  </span>
                </h1>
                
                <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                  Your testimonial has been submitted successfully. Our team will review it and publish it on our website soon.
                </p>
                
                <div className="bg-white/5 rounded-lg p-6 mb-8">
                  <h3 className="text-lg font-semibold text-white mb-4">What happens next?</h3>
                  <div className="text-left space-y-3 text-gray-300">
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-primary-gold rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-primary-black text-sm font-bold">1</span>
                      </div>
                      <p>Our team will review your testimonial for quality and authenticity</p>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-primary-gold rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-primary-black text-sm font-bold">2</span>
                      </div>
                      <p>Once approved, it will be published on our website and may appear on our homepage</p>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-primary-gold rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-primary-black text-sm font-bold">3</span>
                      </div>
                      <p>Your review will help other students discover GLITZFUSION Academy</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={() => setShowConfirmation(false)}
                    className="px-6 py-3 bg-gradient-gold text-primary-black rounded-lg font-semibold hover:shadow-gold-glow transition-all flex items-center justify-center"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Submit Another Review
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
                Share Your Experience
              </span>
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Your feedback helps us improve and helps others discover the transformative power of 
              creative arts education. Share your journey with GLITZFUSION Academy.
            </p>
          </div>
        </div>
      </div>

      {/* Testimonial Section */}
      <div className="container mx-auto px-6 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Information Panel */}
          <div className="lg:col-span-1">
            <GlassPanel className="p-8 h-fit">
              <h2 className="text-2xl font-bold text-white mb-8">Why Your Review Matters</h2>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-primary-gold/20 rounded-lg">
                    <Heart className="w-6 h-6 text-primary-gold" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-1">Help Others</h3>
                    <p className="text-gray-300 text-sm">Your experience guides future students in their creative journey</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-primary-gold/20 rounded-lg">
                    <Star className="w-6 h-6 text-primary-gold" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-1">Improve Quality</h3>
                    <p className="text-gray-300 text-sm">Your feedback helps us enhance our courses and teaching methods</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-primary-gold/20 rounded-lg">
                    <MessageCircle className="w-6 h-6 text-primary-gold" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-1">Share Success</h3>
                    <p className="text-gray-300 text-sm">Celebrate your achievements and inspire others to pursue their dreams</p>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-8 border-t border-white/10">
                <h3 className="font-semibold text-white mb-4">Review Guidelines</h3>
                <ul className="text-gray-300 text-sm space-y-2">
                  <li>• Be honest and specific about your experience</li>
                  <li>• Mention specific courses or instructors if relevant</li>
                  <li>• Share how the course impacted your skills or career</li>
                  <li>• Keep it respectful and constructive</li>
                </ul>
              </div>
            </GlassPanel>
          </div>

          {/* Testimonial Form */}
          <div className="lg:col-span-2">
            <GlassPanel className="p-8">
              <h2 className="text-2xl font-bold text-white mb-8 flex items-center">
                <Star className="w-6 h-6 mr-3 text-primary-gold" />
                Write Your Review
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
                  <p className="text-gray-400 text-sm mt-1">
                    Your email will not be displayed publicly
                  </p>
                </div>

                {/* Rating */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">
                    <Star className="w-4 h-4 inline mr-2" />
                    Rating *
                  </label>
                  {renderStars()}
                  {errors.rating && (
                    <p className="text-red-400 text-sm mt-2">{errors.rating}</p>
                  )}
                </div>

                {/* Review */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    <MessageCircle className="w-4 h-4 inline mr-2" />
                    Your Review *
                  </label>
                  <textarea
                    value={formData.review}
                    onChange={(e) => handleInputChange('review', e.target.value)}
                    rows={6}
                    className={`w-full px-4 py-3 bg-white/5 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-gold focus:border-transparent transition-colors resize-vertical ${
                      errors.review ? 'border-red-500' : 'border-white/10'
                    }`}
                    placeholder="Share your experience with GLITZFUSION Academy. What did you learn? How did it impact your creative journey? What would you tell others considering our courses?"
                  />
                  <div className="flex justify-between items-center mt-1">
                    {errors.review && (
                      <p className="text-red-400 text-sm">{errors.review}</p>
                    )}
                    <p className="text-gray-400 text-sm ml-auto">
                      {formData.review.length}/1000 characters
                    </p>
                  </div>
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
                  {loading ? 'Submitting...' : 'Submit Review'}
                </button>

                <p className="text-gray-400 text-sm text-center">
                  Your review will be reviewed by our team before being published on our website.
                </p>
              </form>
            </GlassPanel>
          </div>
        </div>
      </div>

      {/* Top Reviews Section */}
      <div className="container mx-auto px-6 pb-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="bg-gradient-gold bg-clip-text text-transparent">
              Recent Student Reviews
            </span>
          </h2>
          <p className="text-gray-300 max-w-2xl mx-auto">
            See what our students are saying about their experience at GLITZFUSION Academy
          </p>
        </div>

        {reviewsLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary-gold" />
            <span className="ml-2 text-gray-300">Loading reviews...</span>
          </div>
        ) : topReviews.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {topReviews.map((review) => (
              <GlassPanel key={review._id} className="p-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-gradient-gold rounded-full flex items-center justify-center text-primary-black font-bold text-lg">
                    {review.firstName[0]}{review.lastName[0]}
                  </div>
                  <div className="ml-3">
                    <h3 className="font-semibold text-white">
                      {review.firstName} {review.lastName}
                    </h3>
                    <div className="flex items-center">
                      {[...Array(review.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 text-primary-gold fill-primary-gold" />
                      ))}
                      <span className="ml-2 text-gray-400 text-sm">{review.rating} stars</span>
                    </div>
                  </div>
                </div>
                <p className="text-gray-300 text-sm leading-relaxed line-clamp-4">
                  "{review.review}"
                </p>
                <div className="mt-4 text-xs text-gray-400">
                  {new Date(review.submittedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>
              </GlassPanel>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Star className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-400">No reviews available yet. Be the first to share your experience!</p>
          </div>
        )}
      </div>
    </div>
  )
}
