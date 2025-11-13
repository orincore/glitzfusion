import { useState } from 'react'
import { GlassPanel } from '@/components/ui/GlassPanel'
import { 
  XCircle, 
  User, 
  Mail, 
  Calendar, 
  Star, 
  Save, 
  Trash2, 
  Loader2,
  Eye,
  Award
} from 'lucide-react'
import toast from 'react-hot-toast'
import { ITestimonial } from '@/models/Testimonial'

interface TestimonialModalProps {
  testimonial: ITestimonial
  onClose: () => void
  onUpdate: () => void
}

export default function TestimonialModal({ testimonial, onClose, onUpdate }: TestimonialModalProps) {
  const [status, setStatus] = useState(testimonial.status)
  const [isPublished, setIsPublished] = useState(testimonial.isPublished)
  const [isFeatured, setIsFeatured] = useState(testimonial.isFeatured)
  const [adminNotes, setAdminNotes] = useState(testimonial.adminNotes || '')
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    
    try {
      const response = await fetch(`/api/testimonials/${testimonial._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          isPublished,
          isFeatured,
          adminNotes
        })
      })

      const responseData = await response.json()

      if (response.ok) {
        toast.success('Testimonial updated successfully')
        onUpdate()
      } else {
        toast.error('Failed to update testimonial')
        console.error('Update failed:', responseData)
      }
    } catch (error) {
      toast.error('Network error occurred')
      console.error('Update testimonial error:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this testimonial?')) return

    try {
      const response = await fetch(`/api/testimonials/${testimonial._id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success('Testimonial deleted successfully')
        onUpdate()
      } else {
        toast.error('Failed to delete testimonial')
      }
    } catch (error) {
      toast.error('Network error occurred')
      console.error('Delete testimonial error:', error)
    }
  }

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-5 h-5 ${
              star <= rating
                ? 'text-primary-gold fill-primary-gold'
                : 'text-gray-400'
            }`}
          />
        ))}
        <span className="ml-2 text-gray-300 font-medium">{rating} stars</span>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-primary-black border border-white/10 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <GlassPanel className="p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Testimonial Details</h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white transition-colors"
            >
              <XCircle className="w-6 h-6" />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Testimonial Information */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Customer Information</h3>
              <div className="space-y-4">
                <div className="flex items-center text-gray-300">
                  <User className="w-4 h-4 mr-3" />
                  <span>{testimonial.firstName} {testimonial.lastName}</span>
                </div>
                <div className="flex items-center text-gray-300">
                  <Mail className="w-4 h-4 mr-3" />
                  <span>{testimonial.email}</span>
                </div>
                <div className="flex items-center text-gray-300">
                  <Calendar className="w-4 h-4 mr-3" />
                  <span>Submitted: {new Date(testimonial.submittedAt).toLocaleDateString()}</span>
                </div>
              </div>

              <h3 className="text-lg font-semibold text-white mb-4 mt-8">Review Details</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-gray-400 text-sm">Rating</label>
                  <div className="mt-1">
                    {renderStars(testimonial.rating)}
                  </div>
                </div>
                <div>
                  <label className="text-gray-400 text-sm">Review</label>
                  <div className="bg-white/5 rounded-lg p-4 mt-2">
                    <p className="text-white whitespace-pre-wrap">{testimonial.review}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Management Section */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Management</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as 'pending' | 'approved' | 'rejected')}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-gold focus:border-transparent"
                  >
                    <option value="pending" className="bg-primary-black">Pending Review</option>
                    <option value="approved" className="bg-primary-black">Approved</option>
                    <option value="rejected" className="bg-primary-black">Rejected</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={isPublished}
                        onChange={(e) => setIsPublished(e.target.checked)}
                        className="rounded border-white/20 bg-white/5 text-primary-gold focus:ring-primary-gold focus:ring-offset-0"
                      />
                      <span className="text-gray-300 text-sm flex items-center">
                        <Eye className="w-4 h-4 mr-1" />
                        Published
                      </span>
                    </label>
                    <p className="text-gray-400 text-xs mt-1">Show on website</p>
                  </div>

                  <div>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={isFeatured}
                        onChange={(e) => setIsFeatured(e.target.checked)}
                        className="rounded border-white/20 bg-white/5 text-primary-gold focus:ring-primary-gold focus:ring-offset-0"
                      />
                      <span className="text-gray-300 text-sm flex items-center">
                        <Award className="w-4 h-4 mr-1" />
                        Featured
                      </span>
                    </label>
                    <p className="text-gray-400 text-xs mt-1">Highlight on homepage</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Admin Notes</label>
                  <textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    rows={6}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-gold focus:border-transparent resize-vertical"
                    placeholder="Add internal notes about this testimonial..."
                  />
                  <p className="text-gray-400 text-xs mt-1">
                    Internal notes for team reference.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/10">
            <button
              onClick={handleDelete}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </button>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={onClose}
                className="px-6 py-2 border border-white/20 text-white rounded-lg hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-2 bg-gradient-gold text-primary-black rounded-lg hover:shadow-gold-glow transition-all flex items-center"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Save Changes
              </button>
            </div>
          </div>
        </GlassPanel>
      </div>
    </div>
  )
}
