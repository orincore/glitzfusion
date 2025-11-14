'use client'

import { ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { SparklesContainer } from '@/components/ui/Sparkles'

interface LayoutShellProps {
  children: ReactNode
}

export function LayoutShell({ children }: LayoutShellProps) {
  const pathname = usePathname()
  const isAdminRoute = pathname?.startsWith('/admin')
  const isEditorRoute = pathname?.startsWith('/blog-editor')

  if (isAdminRoute || isEditorRoute) {
    return <>{children}</>
  }

  return (
    <SparklesContainer className="min-h-screen" sparklesCount={150} color="#FFD700">
      <div className="relative z-10">
        <Navbar />
        <main>{children}</main>
        <Footer />
      </div>
    </SparklesContainer>
  )
}
