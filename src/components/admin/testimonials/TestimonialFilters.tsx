import { GlassPanel } from '@/components/ui/GlassPanel'
import { Search } from 'lucide-react'

interface TestimonialFilters {
  status: string
  isPublished: string
  isFeatured: string
  search: string
  sortBy: string
  sortOrder: 'asc' | 'desc'
  page: number
  limit: number
}

interface TestimonialFiltersProps {
  filters: TestimonialFilters
  onFilterChange: (filters: Partial<TestimonialFilters>) => void
}

export default function TestimonialFilters({ filters, onFilterChange }: TestimonialFiltersProps) {
  return (
    <GlassPanel className="p-6 mb-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Search</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={filters.search}
              onChange={(e) => onFilterChange({ search: e.target.value })}
              className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-gold focus:border-transparent"
              placeholder="Search testimonials..."
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
          <select
            value={filters.status}
            onChange={(e) => onFilterChange({ status: e.target.value })}
            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-gold focus:border-transparent"
          >
            <option value="all" className="bg-primary-black">All Status</option>
            <option value="pending" className="bg-primary-black">Pending</option>
            <option value="approved" className="bg-primary-black">Approved</option>
            <option value="rejected" className="bg-primary-black">Rejected</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Published</label>
          <select
            value={filters.isPublished}
            onChange={(e) => onFilterChange({ isPublished: e.target.value })}
            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-gold focus:border-transparent"
          >
            <option value="all" className="bg-primary-black">All</option>
            <option value="true" className="bg-primary-black">Published</option>
            <option value="false" className="bg-primary-black">Not Published</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Featured</label>
          <select
            value={filters.isFeatured}
            onChange={(e) => onFilterChange({ isFeatured: e.target.value })}
            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-gold focus:border-transparent"
          >
            <option value="all" className="bg-primary-black">All</option>
            <option value="true" className="bg-primary-black">Featured</option>
            <option value="false" className="bg-primary-black">Not Featured</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Sort By</label>
          <select
            value={`${filters.sortBy}-${filters.sortOrder}`}
            onChange={(e) => {
              const [sortBy, sortOrder] = e.target.value.split('-')
              onFilterChange({ sortBy, sortOrder: sortOrder as 'asc' | 'desc' })
            }}
            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-gold focus:border-transparent"
          >
            <option value="submittedAt-desc" className="bg-primary-black">Newest First</option>
            <option value="submittedAt-asc" className="bg-primary-black">Oldest First</option>
            <option value="rating-desc" className="bg-primary-black">Highest Rating</option>
            <option value="rating-asc" className="bg-primary-black">Lowest Rating</option>
            <option value="firstName-asc" className="bg-primary-black">Name A-Z</option>
            <option value="firstName-desc" className="bg-primary-black">Name Z-A</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Per Page</label>
          <select
            value={filters.limit}
            onChange={(e) => onFilterChange({ limit: parseInt(e.target.value) })}
            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-gold focus:border-transparent"
          >
            <option value="5" className="bg-primary-black">5 per page</option>
            <option value="10" className="bg-primary-black">10 per page</option>
            <option value="20" className="bg-primary-black">20 per page</option>
            <option value="50" className="bg-primary-black">50 per page</option>
          </select>
        </div>
      </div>
    </GlassPanel>
  )
}
