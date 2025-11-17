/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    domains: [
      'files.ailey.org',
      'apeirodesign.com',
      'cdn.prod.website-files.com',
      'images.unsplash.com',
      'pub-ab8a0d13b5164870b78c22a5bb310c57.r2.dev',
      'media.glitzfusion.in'
    ],
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  // Configure API routes to handle larger file uploads
  experimental: {
    // Increase body size limit for API routes
    isrMemoryCacheSize: 0, // Disable ISR memory cache to free up memory for uploads
    serverComponentsExternalPackages: ['sharp'], // External packages for image processing
  },
  // Configure API route body size limits
  api: {
    bodyParser: {
      sizeLimit: '100mb', // Set body size limit to 100MB
    },
    responseLimit: false, // Disable response size limit
  },
}

module.exports = nextConfig
