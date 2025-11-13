/**
 * Utility functions for handling media URLs and CORS proxy
 */

/**
 * Converts R2 URLs to proxy URLs for development to avoid CORS issues
 */
export function getProxyUrl(cloudflareKey: string, baseUrl?: string): string {
  // In production, you might want to use direct R2 URLs
  // In development, use the proxy to avoid CORS issues
  const isDevelopment = process.env.NODE_ENV === 'development'
  
  if (isDevelopment) {
    const base = baseUrl || 
                 process.env.NEXT_PUBLIC_BASE_URL || 
                 'http://localhost:3000'
    return `${base}/api/media/proxy/${encodeURIComponent(cloudflareKey)}`
  }
  
  // In production, you can still use proxy or direct URLs based on your setup
  // For now, let's use proxy for consistency
  const base = baseUrl || 
               process.env.NEXT_PUBLIC_BASE_URL || 
               (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')
  return `${base}/api/media/proxy/${encodeURIComponent(cloudflareKey)}`
}

/**
 * Processes gallery items to use proxy URLs
 */
export function processGalleryItemUrls(item: any, baseUrl?: string) {
  return {
    ...item,
    mediaUrl: item.cloudflareKey ? getProxyUrl(item.cloudflareKey, baseUrl) : item.mediaUrl,
    thumbnailUrl: item.thumbnailUrl && item.cloudflareKey 
      ? getProxyUrl(`thumb_${item.cloudflareKey}`, baseUrl) 
      : item.thumbnailUrl
  }
}

/**
 * Processes course media to use proxy URLs
 */
export function processCourseMediaUrls(media: any, baseUrl?: string) {
  if (!media || !media.cloudflareKey) return media
  
  return {
    ...media,
    url: getProxyUrl(media.cloudflareKey, baseUrl)
  }
}
