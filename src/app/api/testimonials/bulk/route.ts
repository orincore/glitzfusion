import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Testimonial from '@/models/Testimonial'

// POST /api/testimonials/bulk - Bulk operations on testimonials
export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const { action, ids, data } = await request.json()

    if (!action) {
      return NextResponse.json(
        { error: 'Action is required' },
        { status: 400 }
      )
    }

    let result
    let message = ''

    switch (action) {
      case 'approve-all':
        // Approve all pending testimonials
        result = await Testimonial.updateMany(
          { status: 'pending' },
          { 
            status: 'approved',
            isPublished: true,
            publishedAt: new Date()
          }
        )
        message = `Successfully approved ${result.modifiedCount} testimonials`
        break

      case 'approve-selected':
        // Approve selected testimonials
        if (!ids || !Array.isArray(ids)) {
          return NextResponse.json(
            { error: 'IDs array is required for approve-selected action' },
            { status: 400 }
          )
        }
        result = await Testimonial.updateMany(
          { _id: { $in: ids } },
          { 
            status: 'approved',
            isPublished: true,
            publishedAt: new Date()
          }
        )
        message = `Successfully approved ${result.modifiedCount} testimonials`
        break

      case 'reject-all':
        // Reject all pending testimonials
        result = await Testimonial.updateMany(
          { status: 'pending' },
          { 
            status: 'rejected',
            isPublished: false
          }
        )
        message = `Successfully rejected ${result.modifiedCount} testimonials`
        break

      case 'publish-all-approved':
        // Publish all approved testimonials
        result = await Testimonial.updateMany(
          { status: 'approved', isPublished: false },
          { 
            isPublished: true,
            publishedAt: new Date()
          }
        )
        message = `Successfully published ${result.modifiedCount} testimonials`
        break

      case 'feature-selected':
        // Feature selected testimonials
        if (!ids || !Array.isArray(ids)) {
          return NextResponse.json(
            { error: 'IDs array is required for feature-selected action' },
            { status: 400 }
          )
        }
        result = await Testimonial.updateMany(
          { _id: { $in: ids } },
          { isFeatured: true }
        )
        message = `Successfully featured ${result.modifiedCount} testimonials`
        break

      case 'delete-selected':
        // Delete selected testimonials
        if (!ids || !Array.isArray(ids)) {
          return NextResponse.json(
            { error: 'IDs array is required for delete-selected action' },
            { status: 400 }
          )
        }
        result = await Testimonial.deleteMany(
          { _id: { $in: ids } }
        )
        message = `Successfully deleted ${result.deletedCount} testimonials`
        break

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }

    return NextResponse.json({
      message,
      result: {
        modifiedCount: 'modifiedCount' in result ? result.modifiedCount : 0,
        deletedCount: 'deletedCount' in result ? result.deletedCount : 0,
        matchedCount: 'matchedCount' in result ? result.matchedCount : 0
      }
    })

  } catch (error: any) {
    console.error('Bulk testimonial operation error:', error)
    return NextResponse.json(
      { error: 'Failed to perform bulk operation' },
      { status: 500 }
    )
  }
}
