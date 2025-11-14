'use client'

import { useState } from 'react'
import { X, Loader2, Check, Sparkles } from 'lucide-react'

interface SubscriptionModalProps {
  onClose: () => void
  onSuccess: () => void
}

export default function SubscriptionModal({ onClose, onSuccess }: SubscriptionModalProps) {
  const [loading, setLoading] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('monthly')

  const plans = {
    monthly: {
      name: 'Monthly',
      price: '$9.99',
      period: 'per month',
      priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_MONTHLY || 'price_monthly',
    },
    yearly: {
      name: 'Yearly',
      price: '$99.99',
      period: 'per year',
      priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_YEARLY || 'price_yearly',
      savings: 'Save 17%',
    },
  }

  const handleSubscribe = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/subscription/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId: plans[selectedPlan].priceId,
        }),
      })

      if (response.ok) {
        const { url } = await response.json()
        window.location.href = url
      } else {
        const error = await response.json()
        alert(error.message || 'Failed to create checkout session')
      }
    } catch (error) {
      console.error('Subscription error:', error)
      alert('Failed to start subscription process')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-gray-100 dark:border-gray-700">
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-5 flex justify-between items-center z-10">
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Choose Your Plan
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Select the plan that works best for you
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <button
              onClick={() => setSelectedPlan('monthly')}
              className={`p-6 rounded-xl border-2 transition-all relative ${
                selectedPlan === 'monthly'
                  ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 shadow-lg scale-105'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-md'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  {plans.monthly.name}
                </h3>
                {selectedPlan === 'monthly' && (
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <Check className="h-5 w-5 text-white" />
                  </div>
                )}
              </div>
              <div className="mb-2">
                <span className="text-4xl font-bold text-gray-900 dark:text-white">
                  {plans.monthly.price}
                </span>
                <span className="text-gray-600 dark:text-gray-400 ml-2">
                  {plans.monthly.period}
                </span>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                Billed monthly
              </p>
            </button>

            <button
              onClick={() => setSelectedPlan('yearly')}
              className={`p-6 rounded-xl border-2 transition-all relative ${
                selectedPlan === 'yearly'
                  ? 'border-purple-500 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 shadow-lg scale-105'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-md'
              }`}
            >
              {plans.yearly.savings && (
                <div className="absolute -top-3 right-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                  {plans.yearly.savings}
                </div>
              )}
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  {plans.yearly.name}
                </h3>
                {selectedPlan === 'yearly' && (
                  <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                    <Check className="h-5 w-5 text-white" />
                  </div>
                )}
              </div>
              <div className="mb-2">
                <span className="text-4xl font-bold text-gray-900 dark:text-white">
                  {plans.yearly.price}
                </span>
                <span className="text-gray-600 dark:text-gray-400 ml-2">
                  {plans.yearly.period}
                </span>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                Billed annually
              </p>
            </button>
          </div>

          <div className="bg-gradient-to-br from-gray-50 to-blue-50/30 dark:from-gray-900 dark:to-blue-900/10 rounded-xl p-6 mb-6 border border-gray-200 dark:border-gray-700">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              What&apos;s included:
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                'Unlimited receipt uploads',
                'Advanced OCR processing',
                'Export to CSV, Excel, and PDF',
                'Cloud storage and backup',
                'Priority support',
                'Automatic data extraction',
              ].map((feature, index) => (
                <div key={index} className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition font-semibold"
            >
              Cancel
            </button>
            <button
              onClick={handleSubscribe}
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  Subscribe - {plans[selectedPlan].price}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
