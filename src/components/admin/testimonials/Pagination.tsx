import { GlassPanel } from '@/components/ui/GlassPanel'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface PaginationInfo {
  page: number
  limit: number
  total: number
  pages: number
}

interface PaginationProps {
  pagination: PaginationInfo
  onPageChange: (page: number) => void
}

export default function Pagination({ pagination, onPageChange }: PaginationProps) {
  const { page, pages, total } = pagination

  if (pages <= 1) return null

  const getPageNumbers = () => {
    const delta = 2
    const range = []
    const rangeWithDots = []

    for (let i = Math.max(2, page - delta); i <= Math.min(pages - 1, page + delta); i++) {
      range.push(i)
    }

    if (page - delta > 2) {
      rangeWithDots.push(1, '...')
    } else {
      rangeWithDots.push(1)
    }

    rangeWithDots.push(...range)

    if (page + delta < pages - 1) {
      rangeWithDots.push('...', pages)
    } else {
      rangeWithDots.push(pages)
    }

    return rangeWithDots
  }

  return (
    <GlassPanel className="p-4">
      <div className="flex items-center justify-between">
        <div className="text-gray-300 text-sm">
          Showing {((page - 1) * pagination.limit) + 1} to {Math.min(page * pagination.limit, total)} of {total} testimonials
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onPageChange(page - 1)}
            disabled={page === 1}
            className="p-2 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {getPageNumbers().map((pageNum, index) => (
            <button
              key={index}
              onClick={() => typeof pageNum === 'number' ? onPageChange(pageNum) : undefined}
              disabled={pageNum === '...'}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                pageNum === page
                  ? 'bg-primary-gold text-primary-black'
                  : pageNum === '...'
                  ? 'text-gray-400 cursor-default'
                  : 'text-gray-400 hover:text-white hover:bg-white/10'
              }`}
            >
              {pageNum}
            </button>
          ))}

          <button
            onClick={() => onPageChange(page + 1)}
            disabled={page === pages}
            className="p-2 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </GlassPanel>
  )
}
