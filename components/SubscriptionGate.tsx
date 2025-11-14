'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'
import { CreditCard, CheckCircle, XCircle, Loader2 } from 'lucide-react'
import SubscriptionModal from './SubscriptionModal'

interface SubscriptionGateProps {
  children: React.ReactNode
}

export default function SubscriptionGate({ children }: SubscriptionGateProps) {
  const [user, setUser] = useState<User | null>(null)
  const [subscriptionStatus, setSubscriptionStatus] = useState<{
    isActive: boolean
    status?: string
    currentPeriodEnd?: Date
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    checkUserAndSubscription()
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        checkSubscription(session.user.id)
      } else {
        setSubscriptionStatus(null)
        setLoading(false)
      }
    })
    return () => subscription.unsubscribe()
  }, [])

  const checkUserAndSubscription = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    setUser(user)
    if (user) {
      await checkSubscription(user.id)
    } else {
      setLoading(false)
    }
  }

  const checkSubscription = async (userId: string) => {
    try {
      setLoading(true)
      const response = await fetch('/api/subscription/status')
      if (response.ok) {
        const data = await response.json()
        setSubscriptionStatus(data)
      }
    } catch (error) {
      console.error('Failed to check subscription:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    )
  }

  if (!user) {
    return <>{children}</>
  }

  if (!subscriptionStatus?.isActive) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-8 max-w-md w-full">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-4">
              <CreditCard className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Subscription Required
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              You need an active subscription to use Receipt Tracker
            </p>
          </div>

          {subscriptionStatus?.status && (
            <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <div className="flex items-center gap-2 text-yellow-800 dark:text-yellow-400">
                <XCircle className="h-5 w-5" />
                <span className="font-medium">
                  Status: {subscriptionStatus.status.replace('_', ' ').toUpperCase()}
                </span>
              </div>
            </div>
          )}

          <div className="space-y-4 mb-6">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Unlimited Receipt Uploads</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Upload as many receipts as you need</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Advanced OCR Processing</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Automatic text extraction and parsing</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Export to CSV, Excel, PDF</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Export your data in multiple formats</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Cloud Storage</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Secure cloud storage for all your receipts</p>
              </div>
            </div>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition font-medium"
          >
            Subscribe Now
          </button>
        </div>

        {showModal && (
          <SubscriptionModal
            onClose={() => setShowModal(false)}
            onSuccess={() => checkSubscription(user.id)}
          />
        )}
      </div>
    )
  }

  return <>{children}</>
}

