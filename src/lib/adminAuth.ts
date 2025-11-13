import { NextRequest } from 'next/server'
import { verifyToken } from '@/lib/auth'
import dbConnect from '@/lib/mongodb'
import User from '@/models/User'

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    id: string
    email: string
    role: string
  }
}

export async function requireAdminAuth(request: NextRequest) {
  try {
    // Get token from Authorization header or cookies
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '') || 
                  request.cookies.get('admin_token')?.value

    if (!token) {
      return {
        error: 'No authentication token provided',
        status: 401
      }
    }

    // Verify the token
    const payload = verifyToken(token)
    
    if (!payload) {
      return {
        error: 'Invalid authentication token',
        status: 401
      }
    }

    // Connect to database and verify user
    await dbConnect()
    const user = await User.findById(payload.userId).select('-password')
    
    if (!user || !user.isActive) {
      return {
        error: 'User not found or inactive',
        status: 401
      }
    }

    if (user.role !== 'admin') {
      return {
        error: 'Insufficient permissions. Admin access required.',
        status: 403
      }
    }

    // Return user data for use in the API route
    return {
      user: {
        id: user._id.toString(),
        email: user.email,
        role: user.role
      }
    }

  } catch (error) {
    console.error('Admin auth error:', error)
    return {
      error: 'Authentication failed',
      status: 401
    }
  }
}

// Wrapper function for API routes that require admin authentication
export function withAdminAuth(handler: (request: NextRequest, user: any) => Promise<Response>) {
  return async (request: NextRequest) => {
    const authResult = await requireAdminAuth(request)
    
    if ('error' in authResult) {
      return new Response(
        JSON.stringify({ error: authResult.error }),
        { 
          status: authResult.status,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    // Call the original handler with the authenticated user
    return handler(request, authResult.user)
  }
}
