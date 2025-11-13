'use client'

import { useState } from 'react'
import { Mail, Send, CheckCircle, XCircle, Settings, Loader2 } from 'lucide-react'
import { GlassPanel } from '@/components/ui/GlassPanel'
import toast from 'react-hot-toast'

interface SMTPConfig {
  smtpConfigured: boolean
  smtpConnected: boolean
  config: {
    host: string
    port: string
    user: string
    from: string
  }
}

export function EmailTestPanel() {
  const [testEmail, setTestEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [smtpConfig, setSMTPConfig] = useState<SMTPConfig | null>(null)
  const [checkingConfig, setCheckingConfig] = useState(false)

  const checkSMTPConfig = async () => {
    setCheckingConfig(true)
    try {
      const response = await fetch('/api/test-email')
      const data = await response.json()
      setSMTPConfig(data)
    } catch (error) {
      toast.error('Failed to check SMTP configuration')
    } finally {
      setCheckingConfig(false)
    }
  }

  const sendTestEmail = async () => {
    if (!testEmail) {
      toast.error('Please enter an email address')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/test-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: testEmail }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success(`Test email sent successfully to ${testEmail}`)
        setTestEmail('')
      } else {
        toast.error(data.error || 'Failed to send test email')
      }
    } catch (error) {
      toast.error('Failed to send test email')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* SMTP Configuration Status */}
      <GlassPanel className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-white flex items-center">
            <Settings className="w-5 h-5 mr-2 text-primary-gold" />
            SMTP Configuration
          </h3>
          <button
            onClick={checkSMTPConfig}
            disabled={checkingConfig}
            className="px-4 py-2 bg-primary-gold text-primary-black rounded-lg hover:shadow-gold-glow transition-all flex items-center"
          >
            {checkingConfig ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Settings className="w-4 h-4 mr-2" />
            )}
            Check Config
          </button>
        </div>

        {smtpConfig && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                {smtpConfig.smtpConfigured ? (
                  <CheckCircle className="w-5 h-5 text-green-400" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-400" />
                )}
                <span className="text-white">
                  SMTP Configured: {smtpConfig.smtpConfigured ? 'Yes' : 'No'}
                </span>
              </div>
              
              <div className="flex items-center space-x-2">
                {smtpConfig.smtpConnected ? (
                  <CheckCircle className="w-5 h-5 text-green-400" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-400" />
                )}
                <span className="text-white">
                  SMTP Connected: {smtpConfig.smtpConnected ? 'Yes' : 'No'}
                </span>
              </div>
            </div>

            <div className="bg-white/5 rounded-lg p-4 border border-white/10">
              <h4 className="text-primary-gold font-semibold mb-2">Current Configuration:</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-gray-400">Host:</span>
                  <span className="text-white ml-2">{smtpConfig.config.host}</span>
                </div>
                <div>
                  <span className="text-gray-400">Port:</span>
                  <span className="text-white ml-2">{smtpConfig.config.port}</span>
                </div>
                <div>
                  <span className="text-gray-400">User:</span>
                  <span className="text-white ml-2">{smtpConfig.config.user}</span>
                </div>
                <div>
                  <span className="text-gray-400">From:</span>
                  <span className="text-white ml-2">{smtpConfig.config.from}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </GlassPanel>

      {/* Test Email */}
      <GlassPanel className="p-6">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center">
          <Mail className="w-5 h-5 mr-2 text-primary-gold" />
          Test Email Functionality
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Test Email Address
            </label>
            <input
              type="email"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-gold focus:border-transparent"
              placeholder="Enter email address to test..."
            />
          </div>
          
          <button
            onClick={sendTestEmail}
            disabled={loading || !testEmail}
            className="px-6 py-3 bg-gradient-gold text-primary-black rounded-lg hover:shadow-gold-glow transition-all flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Send className="w-4 h-4 mr-2" />
            )}
            Send Test Email
          </button>
          
          <p className="text-gray-400 text-sm">
            This will send a sample admission confirmation email to the specified address.
          </p>
        </div>
      </GlassPanel>

      {/* Environment Variables Guide */}
      <GlassPanel className="p-6">
        <h3 className="text-xl font-bold text-white mb-4">SMTP Environment Variables</h3>
        <div className="bg-gray-900 rounded-lg p-4 font-mono text-sm">
          <div className="text-gray-400 mb-2"># Add these to your .env.local file:</div>
          <div className="space-y-1 text-green-400">
            <div>SMTP_HOST=smtp.gmail.com</div>
            <div>SMTP_PORT=587</div>
            <div>SMTP_SECURE=false</div>
            <div>SMTP_USER=your-email@gmail.com</div>
            <div>SMTP_PASS=your-app-password</div>
            <div>SMTP_FROM=contact@glitzfusion.in</div>
          </div>
        </div>
        
        <div className="mt-4 text-sm text-gray-300">
          <p className="mb-2"><strong>Note:</strong> For Gmail, you'll need to:</p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Enable 2-factor authentication</li>
            <li>Generate an App Password (not your regular password)</li>
            <li>Use the App Password in SMTP_PASS</li>
          </ul>
        </div>
      </GlassPanel>
    </div>
  )
}
