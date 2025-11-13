import { useState, useEffect } from 'react'

export interface TeamMember {
  id: string
  name: string
  role: string
  bio: string
  image: string
  socialLinks?: {
    twitter?: string
    linkedin?: string
    instagram?: string
    facebook?: string
  }
  order: number
  isActive: boolean
}

export interface Founder {
  id: string
  name: string
  role: string
  bio: string
  image: string
  longBio?: string
  achievements?: string[]
  socialLinks?: {
    twitter?: string
    linkedin?: string
    instagram?: string
    facebook?: string
  }
  order: number
  isActive: boolean
}

export interface AboutContent {
  // Hero Section
  heroTitle?: string
  heroSubtitle?: string
  heroDescription?: string
  heroButtonPrimary?: string
  heroButtonSecondary?: string
  
  // Main About Section
  aboutTitle?: string
  aboutDescription1?: string
  aboutDescription2?: string
  aboutVideoUrl?: string
  
  // Our Story Section
  storyTitle?: string
  storyDescription?: string
  storyImage?: string
  
  // Features
  feature1Title?: string
  feature1Description?: string
  feature1Icon?: string
  
  feature2Title?: string
  feature2Description?: string
  feature2Icon?: string
  
  feature3Title?: string
  feature3Description?: string
  feature3Icon?: string
  
  feature4Title?: string
  feature4Description?: string
  feature4Icon?: string
  
  // Stats
  stat1Value?: string
  stat1Label?: string
  stat2Value?: string
  stat2Label?: string
  
  // Values Section
  valuesTitle?: string
  valuesDescription?: string
  
  // Team Section
  teamTitle?: string
  teamSubtitle?: string
  teamDescription?: string
  
  // Founders Section
  foundersTitle?: string
  foundersSubtitle?: string
  foundersDescription?: string
  
  // Journey Section
  journeyTitle?: string
  journeySubtitle?: string
  journeyDescription?: string
  
  // CTA Section
  ctaTitle?: string
  ctaDescription?: string
  ctaButtonPrimary?: string
  ctaButtonSecondary?: string
  
  // Contact Information (Global)
  contactEmail?: string
  contactPhone?: string
  contactAddress?: string
  
  // Social Media Links (Global)
  socialInstagram?: string
  socialFacebook?: string
  socialTwitter?: string
  socialYoutube?: string
  
  // Dynamic Data
  teamMembers?: TeamMember[]
  founders?: Founder[]
}

export function useAbout() {
  const [content, setContent] = useState<AboutContent>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchContent = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/about', {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache'
        }
      })
      
      if (!response.ok) {
        throw new Error('Failed to fetch about content')
      }
      
      const data = await response.json()
      setContent(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      console.error('❌ Error fetching about content:', err)
    } finally {
      setLoading(false)
    }
  }

  const updateContent = async (updates: Partial<AboutContent>) => {
    try {
      const updateArray = Object.entries(updates).map(([key, value]) => ({
        key,
        type: typeof value === 'string' ? 'text' : 'json',
        value,
        description: `About section ${key}`
      }))

      const response = await fetch('/api/about', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ updates: updateArray }),
      })

      if (!response.ok) {
        throw new Error('Failed to update about content')
      }

      // Refresh content after update
      await fetchContent()
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      console.error('Error updating about content:', err)
      return false
    }
  }

  const updateSingleField = async (key: string, value: any) => {
    try {
      const response = await fetch('/api/about', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          key,
          type: typeof value === 'string' ? 'text' : 'json',
          value,
          description: `About section ${key}`
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update content')
      }

      // Update local state
      setContent(prev => ({ ...prev, [key]: value }))
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      console.error('Error updating content:', err)
      return false
    }
  }

  useEffect(() => {
    fetchContent()
  }, [])

  return {
    content,
    loading,
    error,
    refetch: fetchContent,
    updateContent,
    updateSingleField
  }
}
