'use client'

import { useState, useEffect } from 'react'
import { GlassPanel } from '@/components/ui/GlassPanel'
import { Settings, Mail, CheckCircle, XCircle, Loader2, Send, Edit, Upload, Users, Plus, X } from 'lucide-react'
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
  
  // Custom email states
  const [customEmail, setCustomEmail] = useState({
    to: '',
    subject: '',
    message: ''
  })
  const [sendingCustom, setSendingCustom] = useState(false)
  
  // Bulk email states
  const [emailMode, setEmailMode] = useState<'single' | 'multiple' | 'csv'>('single')
  const [recipients, setRecipients] = useState<string[]>([''])
  const [csvFile, setCsvFile] = useState<File | null>(null)
  const [csvEmails, setCsvEmails] = useState<string[]>([])
  const [bulkProgress, setBulkProgress] = useState({ sent: 0, total: 0, sending: false })

  // Email templates
  const emailTemplates = [
    {
      name: 'Welcome Message',
      subject: 'Welcome to GLITZFUSION!',
      message: `Dear Student,

Welcome to GLITZFUSION! We're thrilled to have you join our creative community.

We're excited to support you on your creative journey and help you develop your skills in the arts.

If you have any questions or need assistance, please don't hesitate to reach out to us.

Best regards,
The GLITZFUSION Team`
    },
    {
      name: 'Course Information',
      subject: 'Course Information & Updates',
      message: `Dear Student,

We hope this message finds you well. We wanted to share some important information about your course.

[Please add specific course details here]

If you have any questions about your course, please feel free to contact us.

Best regards,
The GLITZFUSION Team`
    },
    {
      name: 'Event Invitation',
      subject: 'Special Event Invitation',
      message: `Dear Creative Community Member,

You're invited to join us for an exciting event at GLITZFUSION!

[Please add event details, date, time, and location here]

We look forward to seeing you there!

Best regards,
The GLITZFUSION Team`
    }
  ]

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
      const response = await fetch('/api/test-email-production', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ testEmail: testEmail })
      })

      const data = await response.json()
      
      if (response.ok && data.success) {
        toast.success('Test email sent successfully!')
        console.log('Email test result:', data)
      } else {
        toast.error(data.error || 'Failed to send test email')
        console.error('Email test failed:', data)
      }
    } catch (error) {
      toast.error('Network error occurred')
      console.error('Test email error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCsvUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.name.endsWith('.csv')) {
      toast.error('Please upload a CSV file')
      return
    }

    setCsvFile(file)
    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      const emails = parseCsvEmails(text)
      setCsvEmails(emails)
      toast.success(`Loaded ${emails.length} email addresses from CSV`)
    }
    reader.readAsText(file)
  }

  const parseCsvEmails = (csvText: string): string[] => {
    const lines = csvText.split('\n')
    const emails: string[] = []
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    lines.forEach((line, index) => {
      const trimmedLine = line.trim()
      if (trimmedLine && emailRegex.test(trimmedLine)) {
        emails.push(trimmedLine)
      } else if (trimmedLine) {
        // Try to extract email from comma-separated values
        const parts = trimmedLine.split(',')
        for (const part of parts) {
          const cleanEmail = part.trim().replace(/['"]/g, '')
          if (emailRegex.test(cleanEmail)) {
            emails.push(cleanEmail)
            break
          }
        }
      }
    })

    return Array.from(new Set(emails)) // Remove duplicates
  }

  const addRecipient = () => {
    setRecipients([...recipients, ''])
  }

  const removeRecipient = (index: number) => {
    if (recipients.length > 1) {
      setRecipients(recipients.filter((_, i) => i !== index))
    }
  }

  const updateRecipient = (index: number, email: string) => {
    const newRecipients = [...recipients]
    newRecipients[index] = email
    setRecipients(newRecipients)
  }

  const getEmailList = (): string[] => {
    switch (emailMode) {
      case 'single':
        return [customEmail.to].filter(Boolean)
      case 'multiple':
        return recipients.filter(email => email.trim() !== '')
      case 'csv':
        return csvEmails
      default:
        return []
    }
  }

  const sendCustomEmail = async () => {
    if (!customEmail.subject || !customEmail.message) {
      toast.error('Please fill in subject and message')
      return
    }

    const emailList = getEmailList()
    if (emailList.length === 0) {
      toast.error('Please add at least one recipient')
      return
    }

    // Validate all emails
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    const invalidEmails = emailList.filter(email => !emailRegex.test(email))
    if (invalidEmails.length > 0) {
      toast.error(`Invalid email addresses: ${invalidEmails.join(', ')}`)
      return
    }

    if (emailList.length > 1) {
      await sendBulkEmails(emailList)
    } else {
      await sendSingleEmail(emailList[0])
    }
  }

  const sendSingleEmail = async (email: string) => {
    setSendingCustom(true)
    try {
      const response = await fetch('/api/send-custom-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: email,
          subject: customEmail.subject,
          message: customEmail.message
        })
      })

      const data = await response.json()
      
      if (response.ok && data.success) {
        toast.success('Email sent successfully!')
        clearForm()
      } else {
        toast.error(data.error || 'Failed to send email')
      }
    } catch (error) {
      toast.error('Network error occurred')
      console.error('Email error:', error)
    } finally {
      setSendingCustom(false)
    }
  }

  const sendBulkEmails = async (emailList: string[]) => {
    setBulkProgress({ sent: 0, total: emailList.length, sending: true })
    setSendingCustom(true)

    let successCount = 0
    let failCount = 0

    for (let i = 0; i < emailList.length; i++) {
      const email = emailList[i]
      try {
        const response = await fetch('/api/send-custom-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: email,
            subject: customEmail.subject,
            message: customEmail.message
          })
        })

        if (response.ok) {
          successCount++
        } else {
          failCount++
        }
      } catch (error) {
        failCount++
        console.error(`Failed to send email to ${email}:`, error)
      }

      setBulkProgress({ sent: i + 1, total: emailList.length, sending: true })
      
      // Add small delay to prevent overwhelming the server
      if (i < emailList.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 500))
      }
    }

    setBulkProgress({ sent: emailList.length, total: emailList.length, sending: false })
    setSendingCustom(false)

    if (successCount > 0) {
      toast.success(`Successfully sent ${successCount} emails!`)
    }
    if (failCount > 0) {
      toast.error(`Failed to send ${failCount} emails`)
    }

    if (successCount === emailList.length) {
      clearForm()
    }
  }

  const clearForm = () => {
    setCustomEmail({ to: '', subject: '', message: '' })
    setRecipients([''])
    setCsvFile(null)
    setCsvEmails([])
    setBulkProgress({ sent: 0, total: 0, sending: false })
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

      {/* Custom Email Sender */}
      <GlassPanel className="p-6">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center">
          <Edit className="w-5 h-5 mr-2 text-primary-gold" />
          Send Custom Email
        </h3>
        
        <div className="space-y-4">
          {/* Email Template Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Quick Templates (Optional)
            </label>
            <select
              onChange={(e) => {
                const template = emailTemplates.find(t => t.name === e.target.value)
                if (template) {
                  setCustomEmail(prev => ({
                    ...prev,
                    subject: template.subject,
                    message: template.message
                  }))
                }
              }}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-gold focus:border-transparent"
            >
              <option value="">Select a template...</option>
              {emailTemplates.map((template) => (
                <option key={template.name} value={template.name} className="bg-primary-black">
                  {template.name}
                </option>
              ))}
            </select>
          </div>

          {/* Email Mode Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Recipient Mode
            </label>
            <div className="flex space-x-4">
              <button
                onClick={() => setEmailMode('single')}
                className={`px-4 py-2 rounded-lg flex items-center transition-colors ${
                  emailMode === 'single' 
                    ? 'bg-primary-gold text-primary-black' 
                    : 'bg-white/5 text-white hover:bg-white/10'
                }`}
              >
                <Mail className="w-4 h-4 mr-2" />
                Single
              </button>
              <button
                onClick={() => setEmailMode('multiple')}
                className={`px-4 py-2 rounded-lg flex items-center transition-colors ${
                  emailMode === 'multiple' 
                    ? 'bg-primary-gold text-primary-black' 
                    : 'bg-white/5 text-white hover:bg-white/10'
                }`}
              >
                <Users className="w-4 h-4 mr-2" />
                Multiple
              </button>
              <button
                onClick={() => setEmailMode('csv')}
                className={`px-4 py-2 rounded-lg flex items-center transition-colors ${
                  emailMode === 'csv' 
                    ? 'bg-primary-gold text-primary-black' 
                    : 'bg-white/5 text-white hover:bg-white/10'
                }`}
              >
                <Upload className="w-4 h-4 mr-2" />
                CSV Import
              </button>
            </div>
          </div>

          {/* Recipients Section */}
          {emailMode === 'single' && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Recipient Email Address
              </label>
              <input
                type="email"
                value={customEmail.to}
                onChange={(e) => setCustomEmail(prev => ({ ...prev, to: e.target.value }))}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-gold focus:border-transparent"
                placeholder="recipient@example.com"
              />
            </div>
          )}

          {emailMode === 'multiple' && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-300">
                  Recipient Email Addresses
                </label>
                <button
                  onClick={addRecipient}
                  className="px-3 py-1 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 flex items-center"
                >
                  <Plus className="w-3 h-3 mr-1" />
                  Add
                </button>
              </div>
              <div className="space-y-2">
                {recipients.map((email, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => updateRecipient(index, e.target.value)}
                      className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-gold focus:border-transparent"
                      placeholder={`recipient${index + 1}@example.com`}
                    />
                    {recipients.length > 1 && (
                      <button
                        onClick={() => removeRecipient(index)}
                        className="p-2 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {emailMode === 'csv' && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Upload CSV File
              </label>
              <div className="space-y-3">
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleCsvUpload}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary-gold file:text-primary-black hover:file:bg-yellow-600"
                />
                {csvEmails.length > 0 && (
                  <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                    <p className="text-green-400 text-sm font-medium">
                      ✅ Loaded {csvEmails.length} email addresses
                    </p>
                    <div className="mt-2 max-h-32 overflow-y-auto">
                      <div className="text-xs text-green-300 space-y-1">
                        {csvEmails.slice(0, 5).map((email, index) => (
                          <div key={index}>• {email}</div>
                        ))}
                        {csvEmails.length > 5 && (
                          <div>... and {csvEmails.length - 5} more</div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                  <p className="text-blue-400 text-sm font-medium mb-2">CSV Format:</p>
                  <div className="text-blue-300 text-xs space-y-1">
                    <div>• One email per line: user@example.com</div>
                    <div>• Or CSV format: name,email@example.com,other</div>
                    <div>• Duplicates will be automatically removed</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Subject
            </label>
            <input
              type="text"
              value={customEmail.subject}
              onChange={(e) => setCustomEmail(prev => ({ ...prev, subject: e.target.value }))}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-gold focus:border-transparent"
              placeholder="Email subject..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Message
            </label>
            <textarea
              value={customEmail.message}
              onChange={(e) => setCustomEmail(prev => ({ ...prev, message: e.target.value }))}
              rows={6}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-gold focus:border-transparent resize-vertical"
              placeholder="Type your message here..."
            />
          </div>
          
          {/* Progress Indicator for Bulk Emails */}
          {bulkProgress.sending && (
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-blue-400 font-medium">Sending Bulk Emails...</span>
                <span className="text-blue-300 text-sm">
                  {bulkProgress.sent} / {bulkProgress.total}
                </span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(bulkProgress.sent / bulkProgress.total) * 100}%` }}
                />
              </div>
            </div>
          )}

          <button
            onClick={sendCustomEmail}
            disabled={sendingCustom || !customEmail.subject || !customEmail.message || getEmailList().length === 0}
            className="px-6 py-3 bg-gradient-gold text-primary-black rounded-lg hover:shadow-gold-glow transition-all flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {sendingCustom ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Send className="w-4 h-4 mr-2" />
            )}
            {getEmailList().length > 1 ? `Send to ${getEmailList().length} Recipients` : 'Send Email'}
          </button>
          
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4">
            <p className="text-amber-400 text-sm font-medium mb-2">⚠️ Important Notes:</p>
            <ul className="text-amber-300 text-sm space-y-1">
              <li>• This will send a professional email with GLITZFUSION branding</li>
              <li>• Make sure the recipient expects to receive emails from you</li>
              <li>• Use this feature responsibly for official communications only</li>
              <li>• The email will be sent from: contact@glitzfusion.in</li>
            </ul>
          </div>
        </div>
      </GlassPanel>
    </div>
  )
}
