import { GlassPanel } from '@/components/ui/GlassPanel'
import { Star, Eye, Trash2, Clock, CheckCircle, XCircle } from 'lucide-react'
import { ITestimonial } from '@/models/Testimonial'

interface TestimonialTableProps {
  testimonials: ITestimonial[]
  onViewDetails: (testimonial: ITestimonial) => void
  onDelete: (id: string) => void
}

const statusColors = {
  pending: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  approved: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  rejected: 'bg-red-500/20 text-red-400 border-red-500/30'
}

const statusIcons = {
  pending: Clock,
  approved: CheckCircle,
  rejected: XCircle
}

export default function TestimonialTable({ testimonials, onViewDetails, onDelete }: TestimonialTableProps) {
  const getStatusIcon = (status: string) => {
    const Icon = statusIcons[status as keyof typeof statusIcons] || Clock
    return <Icon className="w-4 h-4" />
  }

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating
                ? 'text-primary-gold fill-primary-gold'
                : 'text-gray-400'
            }`}
          />
        ))}
        <span className="ml-2 text-gray-300 text-sm">{rating}</span>
      </div>
    )
  }

  return (
    <GlassPanel className="overflow-hidden mb-8">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-white/5 border-b border-white/10">
            <tr>
              <th className="text-left py-4 px-6 text-gray-300 font-medium">Customer</th>
              <th className="text-left py-4 px-6 text-gray-300 font-medium">Rating</th>
              <th className="text-left py-4 px-6 text-gray-300 font-medium">Review</th>
              <th className="text-left py-4 px-6 text-gray-300 font-medium">Status</th>
              <th className="text-left py-4 px-6 text-gray-300 font-medium">Published</th>
              <th className="text-left py-4 px-6 text-gray-300 font-medium">Featured</th>
              <th className="text-left py-4 px-6 text-gray-300 font-medium">Submitted</th>
              <th className="text-left py-4 px-6 text-gray-300 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {testimonials.map((testimonial) => (
              <tr key={testimonial._id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                <td className="py-4 px-6">
                  <div>
                    <div className="text-white font-medium">
                      {testimonial.firstName} {testimonial.lastName}
                    </div>
                    <div className="text-gray-400 text-sm">{testimonial.email}</div>
                  </div>
                </td>
                <td className="py-4 px-6">
                  {renderStars(testimonial.rating)}
                </td>
                <td className="py-4 px-6">
                  <div className="text-white max-w-xs truncate" title={testimonial.review}>
                    {testimonial.review}
                  </div>
                </td>
                <td className="py-4 px-6">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${statusColors[testimonial.status as keyof typeof statusColors]}`}>
                    {getStatusIcon(testimonial.status)}
                    <span className="ml-1 capitalize">{testimonial.status}</span>
                  </span>
                </td>
                <td className="py-4 px-6">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    testimonial.isPublished
                      ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                      : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                  }`}>
                    {testimonial.isPublished ? 'Yes' : 'No'}
                  </span>
                </td>
                <td className="py-4 px-6">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    testimonial.isFeatured
                      ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                      : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                  }`}>
                    {testimonial.isFeatured ? 'Yes' : 'No'}
                  </span>
                </td>
                <td className="py-4 px-6">
                  <span className="text-gray-300 text-sm">
                    {formatDate(testimonial.submittedAt)}
                  </span>
                </td>
                <td className="py-4 px-6">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => onViewDetails(testimonial)}
                      className="p-2 text-gray-400 hover:text-primary-gold transition-colors"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDelete(testimonial._id)}
                      className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                      title="Delete Testimonial"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </GlassPanel>
  )
}
