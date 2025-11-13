import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'

export function middleware(request: NextRequest) {
  // Allow access to login page
  if (request.nextUrl.pathname === '/admin/login') {
    return NextResponse.next()
  }

  // Check for admin routes
  if (request.nextUrl.pathname.startsWith('/admin')) {
    const token = request.headers.get('authorization')?.replace('Bearer ', '') ||
                  request.cookies.get('admin_token')?.value

    if (!token) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }

    try {
      const payload = verifyToken(token)
      
      // Check if payload exists and user has admin role
      if (!payload || payload.role !== 'admin') {
        return NextResponse.redirect(new URL('/admin/login', request.url))
      }

      // Add user info to headers for downstream use
      const response = NextResponse.next()
      response.headers.set('x-user-id', payload.userId)
      response.headers.set('x-user-email', payload.email)
      response.headers.set('x-user-role', payload.role)
      
      return response
    } catch (error) {
      console.error('Token verification failed:', error)
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*']
}
