'use client'

import { EmailTestPanel } from '@/components/admin/EmailTestPanel'
import { Toaster } from 'react-hot-toast'

export default function EmailAdminPage() {
  return (
    <div className="min-h-screen bg-primary-black">
      <Toaster position="top-right" />
      
      {/* Header */}
      <div className="border-b border-white/10 bg-glass-dark backdrop-blur-xl">
        <div className="container-custom py-8">
          <div>
            <h1 className="text-3xl font-bold text-gradient-gold mb-2">
              Email Configuration
            </h1>
            <p className="text-gray-300">
              Configure and test SMTP settings for admission confirmations
            </p>
          </div>
        </div>
      </div>

      <div className="container-custom py-8">
        <EmailTestPanel />
      </div>
    </div>
  )
}
