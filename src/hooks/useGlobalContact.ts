import { useState, useEffect } from 'react'

export interface GlobalContactInfo {
  email?: string
  phone?: string
  address?: string
  social?: {
    instagram?: string
    facebook?: string
    twitter?: string
    youtube?: string
  }
}

export function useGlobalContact() {
  const [contactInfo, setContactInfo] = useState<GlobalContactInfo>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchContactInfo = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/about')
      
      if (!response.ok) {
        throw new Error('Failed to fetch contact information')
      }
      
      const data = await response.json()
      
      // Transform the data into a more structured format
      const contactInfo: GlobalContactInfo = {
        email: data.contactEmail,
        phone: data.contactPhone,
        address: data.contactAddress,
        social: {
          instagram: data.socialInstagram,
          facebook: data.socialFacebook,
          twitter: data.socialTwitter,
          youtube: data.socialYoutube
        }
      }
      
      setContactInfo(contactInfo)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      console.error('Error fetching contact information:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchContactInfo()
  }, [])

  return {
    contactInfo,
    loading,
    error,
    refetch: fetchContactInfo
  }
}
