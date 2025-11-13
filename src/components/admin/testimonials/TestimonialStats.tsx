import { GlassPanel } from '@/components/ui/GlassPanel'
import { Star, Clock, CheckCircle, XCircle, Eye, Award } from 'lucide-react'

interface TestimonialStats {
  pending: number
  approved: number
  rejected: number
  published: number
  featured: number
  total: number
}

interface TestimonialStatsProps {
  stats: TestimonialStats
}

export default function TestimonialStats({ stats }: TestimonialStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-8">
      <GlassPanel className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-sm">Total</p>
            <p className="text-2xl font-bold text-white">{stats.total}</p>
          </div>
          <Star className="w-8 h-8 text-primary-gold" />
        </div>
      </GlassPanel>

      <GlassPanel className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-sm">Pending</p>
            <p className="text-2xl font-bold text-amber-400">{stats.pending}</p>
          </div>
          <Clock className="w-8 h-8 text-amber-400" />
        </div>
      </GlassPanel>

      <GlassPanel className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-sm">Approved</p>
            <p className="text-2xl font-bold text-emerald-400">{stats.approved}</p>
          </div>
          <CheckCircle className="w-8 h-8 text-emerald-400" />
        </div>
      </GlassPanel>

      <GlassPanel className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-sm">Rejected</p>
            <p className="text-2xl font-bold text-red-400">{stats.rejected}</p>
          </div>
          <XCircle className="w-8 h-8 text-red-400" />
        </div>
      </GlassPanel>

      <GlassPanel className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-sm">Published</p>
            <p className="text-2xl font-bold text-blue-400">{stats.published}</p>
          </div>
          <Eye className="w-8 h-8 text-blue-400" />
        </div>
      </GlassPanel>

      <GlassPanel className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-sm">Featured</p>
            <p className="text-2xl font-bold text-purple-400">{stats.featured}</p>
          </div>
          <Award className="w-8 h-8 text-purple-400" />
        </div>
      </GlassPanel>
    </div>
  )
}
