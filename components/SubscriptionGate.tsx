'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'
import { CreditCard, CheckCircle, XCircle, Loader2, Sparkles, Clock } from 'lucide-react'
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
    isTrial?: boolean
    trialEnd?: string
    daysRemaining?: number
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <>{children}</>
  }

  // Show trial banner if on trial
  if (subscriptionStatus?.isTrial && subscriptionStatus?.isActive) {
    return (
      <>
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 text-white px-4 py-3 shadow-lg relative overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}></div>
          </div>
          <div className="container mx-auto max-w-7xl flex items-center justify-between relative z-10">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 backdrop-blur-sm rounded-full p-2">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold text-lg">Free Trial Active</p>
                <p className="text-sm text-blue-100 flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {subscriptionStatus.daysRemaining} day{subscriptionStatus.daysRemaining !== 1 ? 's' : ''} remaining
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="px-5 py-2 bg-white text-blue-600 rounded-xl hover:bg-blue-50 transition font-semibold text-sm shadow-lg hover:shadow-xl"
            >
              Subscribe Now
            </button>
          </div>
        </div>
        {children}
        {showModal && (
          <SubscriptionModal
            onClose={() => setShowModal(false)}
            onSuccess={() => checkSubscription(user.id)}
          />
        )}
      </>
    )
  }

  if (!subscriptionStatus?.isActive) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 max-w-lg w-full border border-gray-100 dark:border-gray-700">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl mb-4 shadow-lg">
              <CreditCard className="h-10 w-10 text-white" />
            </div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
              Start Your Free Trial
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              Get 7 days free to try Receipt Tracker
            </p>
          </div>

          {subscriptionStatus?.status && subscriptionStatus.status !== 'none' && (
            <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500 rounded-lg">
              <div className="flex items-center gap-2 text-amber-800 dark:text-amber-400">
                <XCircle className="h-5 w-5" />
                <span className="font-medium">
                  Status: {subscriptionStatus.status.replace('_', ' ').toUpperCase()}
                </span>
              </div>
            </div>
          )}

          <div className="space-y-4 mb-8">
            <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border border-green-200 dark:border-green-800">
              <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">Unlimited Receipt Uploads</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Upload as many receipts as you need</p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
              <CheckCircle className="h-6 w-6 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">Advanced OCR Processing</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Automatic text extraction and parsing</p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl border border-purple-200 dark:border-purple-800">
              <CheckCircle className="h-6 w-6 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">Export to CSV, Excel, PDF</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Export your data in multiple formats</p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-cyan-50 to-teal-50 dark:from-cyan-900/20 dark:to-teal-900/20 rounded-xl border border-cyan-200 dark:border-cyan-800">
              <CheckCircle className="h-6 w-6 text-cyan-600 dark:text-cyan-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">Cloud Storage</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Secure cloud storage for all your receipts</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={async () => {
                try {
                  const response = await fetch('/api/subscription/start-trial', {
                    method: 'POST',
                  })
                  if (response.ok) {
                    await checkSubscription(user.id)
                  } else {
                    const error = await response.json()
                    if (error.error?.includes('already has')) {
                      await checkSubscription(user.id)
                    } else {
                      setShowModal(true)
                    }
                  }
                } catch (error) {
                  setShowModal(true)
                }
              }}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 px-4 rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all font-semibold shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
            >
              <Sparkles className="h-5 w-5" />
              Start 7-Day Free Trial
            </button>
            <button
              onClick={() => setShowModal(true)}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-4 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all font-semibold shadow-lg hover:shadow-xl"
            >
              Subscribe Now
            </button>
          </div>
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
