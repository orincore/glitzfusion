import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://glitzfusion.in'
  
  // Main pages with SEO priorities
  const mainPages = [
    { url: '', priority: 1.0, changeFreq: 'daily' as const },
    { url: '/courses', priority: 0.9, changeFreq: 'weekly' as const },
    { url: '/admissions', priority: 0.9, changeFreq: 'weekly' as const },
    { url: '/about', priority: 0.8, changeFreq: 'monthly' as const },
    { url: '/gallery', priority: 0.8, changeFreq: 'weekly' as const },
    { url: '/testimonials', priority: 0.8, changeFreq: 'weekly' as const },
    { url: '/contact', priority: 0.8, changeFreq: 'monthly' as const },
    { url: '/careers', priority: 0.7, changeFreq: 'weekly' as const }
  ]

  // Course pages - high priority for SEO
  const coursePages = [
    { url: '/courses/acting', priority: 0.9, changeFreq: 'weekly' as const },
    { url: '/courses/dance', priority: 0.9, changeFreq: 'weekly' as const },
    { url: '/courses/photography', priority: 0.9, changeFreq: 'weekly' as const },
    { url: '/courses/filmmaking', priority: 0.9, changeFreq: 'weekly' as const },
    { url: '/courses/modeling', priority: 0.9, changeFreq: 'weekly' as const }
  ]

  // Location-based SEO pages
  const locationPages = [
    { url: '/badlapur-media-academy', priority: 0.8, changeFreq: 'monthly' as const },
    { url: '/acting-classes-badlapur', priority: 0.8, changeFreq: 'monthly' as const },
    { url: '/dance-classes-badlapur', priority: 0.8, changeFreq: 'monthly' as const },
    { url: '/photography-courses-badlapur', priority: 0.8, changeFreq: 'monthly' as const },
    { url: '/modeling-school-badlapur', priority: 0.8, changeFreq: 'monthly' as const },
    { url: '/filmmaking-institute-badlapur', priority: 0.8, changeFreq: 'monthly' as const }
  ]

  // Service area pages for local SEO
  const serviceAreaPages = [
    { url: '/media-academy-kalyan-dombivli', priority: 0.7, changeFreq: 'monthly' as const },
    { url: '/acting-classes-near-me', priority: 0.7, changeFreq: 'monthly' as const },
    { url: '/dance-academy-maharashtra', priority: 0.7, changeFreq: 'monthly' as const },
    { url: '/best-media-academy-mumbai-region', priority: 0.7, changeFreq: 'monthly' as const }
  ]

  // Career and industry pages
  const careerPages = [
    { url: '/careers/acting-instructor-jobs-badlapur', priority: 0.6, changeFreq: 'weekly' as const },
    { url: '/careers/dance-teacher-opportunities', priority: 0.6, changeFreq: 'weekly' as const },
    { url: '/careers/photography-mentor-positions', priority: 0.6, changeFreq: 'weekly' as const },
    { url: '/careers/filmmaking-faculty-jobs', priority: 0.6, changeFreq: 'weekly' as const },
    { url: '/careers/modeling-coach-vacancies', priority: 0.6, changeFreq: 'weekly' as const }
  ]

  // Blog/content pages for SEO
  const contentPages = [
    { url: '/blog/acting-tips-beginners', priority: 0.6, changeFreq: 'monthly' as const },
    { url: '/blog/dance-styles-guide', priority: 0.6, changeFreq: 'monthly' as const },
    { url: '/blog/photography-basics', priority: 0.6, changeFreq: 'monthly' as const },
    { url: '/blog/filmmaking-career-guide', priority: 0.6, changeFreq: 'monthly' as const },
    { url: '/blog/modeling-industry-insights', priority: 0.6, changeFreq: 'monthly' as const }
  ]

  const allPages = [
    ...mainPages,
    ...coursePages,
    ...locationPages,
    ...serviceAreaPages,
    ...careerPages,
    ...contentPages
  ]

  return allPages.map((page) => ({
    url: `${baseUrl}${page.url}`,
    lastModified: new Date(),
    changeFrequency: page.changeFreq,
    priority: page.priority,
  }))
}
