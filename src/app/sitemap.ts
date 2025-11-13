import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://glitzfusion.in'
  
  // Static pages
  const staticPages = [
    '',
    '/about',
    '/courses',
    '/gallery',
    '/admissions',
    '/testimonials',
    '/careers',
    '/contact',
    '/blog'
  ]

  // Career-related pages for SEO
  const careerPages = [
    '/careers/photographer-jobs-badlapur',
    '/careers/acting-instructor-jobs',
    '/careers/music-teacher-badlapur',
    '/careers/choreographer-jobs-maharashtra',
    '/careers/content-creator-opportunities',
    '/careers/film-maker-jobs',
    '/careers/script-writer-careers',
    '/careers/voice-over-artist-jobs',
    '/careers/modeling-instructor-positions'
  ]

  const staticSitemap = staticPages.map((page) => ({
    url: `${baseUrl}${page}`,
    lastModified: new Date(),
    changeFrequency: page === '/careers' ? 'daily' as const : 'weekly' as const,
    priority: page === '' ? 1 : page === '/careers' ? 0.9 : 0.8,
  }))

  const careerSitemap = careerPages.map((page) => ({
    url: `${baseUrl}${page}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  return [...staticSitemap, ...careerSitemap]
}
