'use client'

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { useRouter } from 'next/navigation'

interface User {
  id: string
  email: string
  name: string
  role: string
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  requireAuth: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null
  })
  
  const router = useRouter()

  const login = async (email: string, password: string): Promise<boolean> => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }))
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (response.ok) {
        localStorage.setItem('admin_token', data.token)
        setAuthState({
          user: data.user,
          isAuthenticated: true,
          isLoading: false,
          error: null
        })
        return true
      } else {
        setAuthState(prev => ({
          ...prev,
          isLoading: false,
          error: data.error || 'Login failed'
        }))
        return false
      }
    } catch (error) {
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Network error. Please try again.'
      }))
      return false
    }
  }

  const logout = useCallback(() => {
    localStorage.removeItem('admin_token')
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null
    })
    router.push('/admin/login')
  }, [router])

  const requireAuth = useCallback(() => {
    if (!authState.isLoading && !authState.isAuthenticated) {
      router.push('/admin/login')
    }
  }, [authState.isAuthenticated, authState.isLoading, router])

  // Single auth check on mount - no loops!
  useEffect(() => {
    let isMounted = true

    const checkAuth = async () => {
      const token = localStorage.getItem('admin_token')
      
      if (!token) {
        if (isMounted) {
          setAuthState(prev => ({ ...prev, isLoading: false }))
        }
        return
      }

      try {
        const response = await fetch('/api/auth/validate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        })

        if (!isMounted) return

        if (response.ok) {
          const userData = await response.json()
          setAuthState({
            user: userData.user,
            isAuthenticated: true,
            isLoading: false,
            error: null
          })
        } else {
          localStorage.removeItem('admin_token')
          setAuthState({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null
          })
        }
      } catch (error) {
        console.error('Auth check error:', error)
        if (isMounted) {
          localStorage.removeItem('admin_token')
          setAuthState({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null
          })
        }
      }
    }

    checkAuth()

    return () => {
      isMounted = false
    }
  }, []) // Only run once on mount

  return (
    <AuthContext.Provider value={{
      ...authState,
      login,
      logout,
      requireAuth
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
