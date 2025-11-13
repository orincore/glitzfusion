/**
 * Utility functions for handling media URLs
 */

/**
 * Converts R2 keys to public R2 URLs
 */
export function getPublicMediaUrl(cloudflareKey: string): string {
  const envDomain = process.env.NEXT_PUBLIC_R2_PUBLIC_BASE_URL
  const publicR2Domain = (envDomain && envDomain.trim().replace(/\/$/, ''))

  return `${publicR2Domain}/${cloudflareKey}`
}

/**
 * Processes gallery items to use public R2 URLs
 */
export function processGalleryItemUrls(item: any, baseUrl?: string) {
  return {
    ...item,
    mediaUrl: item.cloudflareKey ? getPublicMediaUrl(item.cloudflareKey) : item.mediaUrl,
    thumbnailUrl: item.thumbnailUrl && item.cloudflareKey 
      ? getPublicMediaUrl(`thumb_${item.cloudflareKey}`) 
      : item.thumbnailUrl
  }
}

/**
 * Processes course media to use public R2 URLs
 */
export function processCourseMediaUrls(media: any, baseUrl?: string) {
  if (!media || !media.cloudflareKey) return media
  
  return {
    ...media,
    url: getPublicMediaUrl(media.cloudflareKey)
  }
}
