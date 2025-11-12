'use client'

import { useState } from 'react'
import { CheckCircle, AlertCircle, Loader } from 'lucide-react'

interface SetupStep {
  id: string
  name: string
  description: string
  status: 'pending' | 'running' | 'completed' | 'error'
  error?: string
}

export default function SetupPage() {
  const [steps, setSteps] = useState<SetupStep[]>([
    {
      id: 'admin',
      name: 'Create Admin User',
      description: 'Set up the initial admin account',
      status: 'pending'
    },
    {
      id: 'migrate',
      name: 'Migrate Course Data',
      description: 'Import existing course data to database',
      status: 'pending'
    }
  ])

  const updateStepStatus = (stepId: string, status: SetupStep['status'], error?: string) => {
    setSteps(prev => prev.map(step => 
      step.id === stepId ? { ...step, status, error } : step
    ))
  }

  const runSetup = async () => {
    // Step 1: Create admin user
    updateStepStatus('admin', 'running')
    try {
      const adminResponse = await fetch('/api/auth/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
      
      if (adminResponse.ok) {
        updateStepStatus('admin', 'completed')
      } else {
        const error = await adminResponse.json()
        updateStepStatus('admin', 'error', error.error)
      }
    } catch (error) {
      updateStepStatus('admin', 'error', 'Network error')
    }

    // Step 2: Migrate course data
    updateStepStatus('migrate', 'running')
    try {
      const migrateResponse = await fetch('/api/migrate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
      
      if (migrateResponse.ok) {
        updateStepStatus('migrate', 'completed')
      } else {
        const error = await migrateResponse.json()
        updateStepStatus('migrate', 'error', error.error)
      }
    } catch (error) {
      updateStepStatus('migrate', 'error', 'Network error')
    }
  }

  const isSetupComplete = steps.every(step => step.status === 'completed')
  const hasErrors = steps.some(step => step.status === 'error')

  return (
    <div className="min-h-screen bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white">Glitz Fusion Setup</h1>
          <p className="mt-2 text-gray-400">Initialize your admin panel and database</p>
        </div>

        <div className="bg-gray-800 shadow rounded-lg border border-gray-700 p-6">
          <div className="space-y-6">
            {steps.map((step) => (
              <div key={step.id} className="flex items-start">
                <div className="flex-shrink-0 mr-4">
                  {step.status === 'completed' && (
                    <CheckCircle className="h-6 w-6 text-green-400" />
                  )}
                  {step.status === 'error' && (
                    <AlertCircle className="h-6 w-6 text-red-400" />
                  )}
                  {step.status === 'running' && (
                    <Loader className="h-6 w-6 text-yellow-400 animate-spin" />
                  )}
                  {step.status === 'pending' && (
                    <div className="h-6 w-6 rounded-full border-2 border-gray-600" />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-white">{step.name}</h3>
                  <p className="text-gray-400">{step.description}</p>
                  {step.error && (
                    <p className="text-red-400 text-sm mt-1">{step.error}</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 flex justify-center">
            {!isSetupComplete && !hasErrors && (
              <button
                onClick={runSetup}
                disabled={steps.some(step => step.status === 'running')}
                className="px-6 py-3 bg-yellow-400 text-black font-medium rounded-md hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {steps.some(step => step.status === 'running') ? 'Setting up...' : 'Start Setup'}
              </button>
            )}

            {isSetupComplete && (
              <div className="text-center">
                <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">Setup Complete!</h3>
                <p className="text-gray-400 mb-4">Your admin panel is ready to use.</p>
                <a
                  href="/admin/login"
                  className="inline-flex items-center px-6 py-3 bg-yellow-400 text-black font-medium rounded-md hover:bg-yellow-500"
                >
                  Go to Admin Login
                </a>
              </div>
            )}

            {hasErrors && (
              <div className="text-center">
                <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">Setup Failed</h3>
                <p className="text-gray-400 mb-4">Please check the errors above and try again.</p>
                <button
                  onClick={runSetup}
                  className="px-6 py-3 bg-yellow-400 text-black font-medium rounded-md hover:bg-yellow-500"
                >
                  Retry Setup
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 bg-gray-800 shadow rounded-lg border border-gray-700 p-6">
          <h3 className="text-lg font-medium text-white mb-4">Environment Configuration</h3>
          <div className="space-y-2 text-sm">
            <p className="text-gray-400">Make sure you have configured the following environment variables in your <code className="bg-gray-700 px-2 py-1 rounded">.env.local</code> file:</p>
            <ul className="list-disc list-inside text-gray-400 space-y-1 ml-4">
              <li>MONGODB_URI - Your MongoDB connection string</li>
              <li>CLOUDFLARE_R2_* - Your Cloudflare R2 storage credentials</li>
              <li>JWT_SECRET - A secure random string for JWT tokens</li>
              <li>ADMIN_EMAIL - Your admin email (optional, defaults to admin@glitzfusion.com)</li>
              <li>ADMIN_PASSWORD - Your admin password (optional, defaults to admin123)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
