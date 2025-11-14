'use client'

import { useState } from 'react'
import { X, Loader2, Check } from 'lucide-react'

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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Choose Your Plan
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <button
              onClick={() => setSelectedPlan('monthly')}
              className={`p-6 rounded-lg border-2 transition ${
                selectedPlan === 'monthly'
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {plans.monthly.name}
                </h3>
                {selectedPlan === 'monthly' && (
                  <Check className="h-5 w-5 text-blue-500" />
                )}
              </div>
              <div className="mb-2">
                <span className="text-3xl font-bold text-gray-900 dark:text-white">
                  {plans.monthly.price}
                </span>
                <span className="text-gray-600 dark:text-gray-400 ml-2">
                  {plans.monthly.period}
                </span>
              </div>
            </button>

            <button
              onClick={() => setSelectedPlan('yearly')}
              className={`p-6 rounded-lg border-2 transition relative ${
                selectedPlan === 'yearly'
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              {plans.yearly.savings && (
                <div className="absolute -top-3 right-4 bg-green-500 text-white text-xs font-medium px-2 py-1 rounded">
                  {plans.yearly.savings}
                </div>
              )}
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {plans.yearly.name}
                </h3>
                {selectedPlan === 'yearly' && (
                  <Check className="h-5 w-5 text-blue-500" />
                )}
              </div>
              <div className="mb-2">
                <span className="text-3xl font-bold text-gray-900 dark:text-white">
                  {plans.yearly.price}
                </span>
                <span className="text-gray-600 dark:text-gray-400 ml-2">
                  {plans.yearly.period}
                </span>
              </div>
            </button>
          </div>

          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 mb-6">
            <h4 className="font-medium text-gray-900 dark:text-white mb-3">
              What's included:
            </h4>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                Unlimited receipt uploads
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                Advanced OCR processing
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                Export to CSV, Excel, and PDF
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                Cloud storage and backup
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                Priority support
              </li>
            </ul>
          </div>

          <div className="flex gap-4">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSubscribe}
              disabled={loading}
              className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Processing...
                </>
              ) : (
                `Subscribe - ${plans[selectedPlan].price}`
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

