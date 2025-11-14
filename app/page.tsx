'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'
import ReceiptUpload from '@/components/ReceiptUpload'
import ReceiptTable from '@/components/ReceiptTable'
import Auth from '@/components/Auth'
import SubscriptionGate from '@/components/SubscriptionGate'
import { Receipt } from '@/types/receipt'
import { LogOut, Table, Grid, Receipt as ReceiptIcon, User as UserIcon } from 'lucide-react'

export default function Home() {
  const [user, setUser] = useState<User | null>(null)
  const [receipts, setReceipts] = useState<Receipt[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table')
  const supabase = createClient()

  useEffect(() => {
    checkUser()
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        loadReceipts()
      } else {
        setReceipts([])
      }
    })
    return () => subscription.unsubscribe()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    setUser(user)
    if (user) {
      loadReceipts()
    } else {
      setLoading(false)
    }
  }

  const loadReceipts = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/receipts')
      if (response.ok) {
        const data = await response.json()
        setReceipts(data)
      } else if (response.status === 401) {
        setUser(null)
      }
    } catch (error) {
      console.error('Failed to load receipts:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleReceiptAdded = (receipt: Receipt) => {
    setReceipts([receipt, ...receipts])
  }

  const handleReceiptDeleted = (id: string) => {
    setReceipts(receipts.filter(r => r.id !== id))
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setReceipts([])
  }

  if (!user) {
    return <Auth />
  }

  return (
    <SubscriptionGate>
      <main className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="container mx-auto px-4 py-6 max-w-7xl">
          {/* Header */}
          <div className="mb-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <ReceiptIcon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Receipt Tracker
                  </h1>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Upload receipts and extract information using OCR
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                  <UserIcon className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {user.email}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition flex items-center gap-2 font-medium"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-5 border border-gray-100 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Receipts</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{receipts.length}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                  <ReceiptIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-5 border border-gray-100 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Amount</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    ${receipts.reduce((sum, r) => sum + (r.total || 0), 0).toFixed(2)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">$</span>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-5 border border-gray-100 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">This Month</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    {receipts.filter(r => {
                      const receiptDate = r.date ? new Date(r.date) : null
                      const now = new Date()
                      return receiptDate && receiptDate.getMonth() === now.getMonth() && receiptDate.getFullYear() === now.getFullYear()
                    }).length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">📅</span>
                </div>
              </div>
            </div>
          </div>

          {/* Upload Section */}
          <div className="mb-6">
            <ReceiptUpload onReceiptAdded={handleReceiptAdded} />
          </div>

          {/* View Toggle and Table */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Your Receipts</h2>
              <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('table')}
                  className={`px-4 py-2 rounded-md transition flex items-center gap-2 text-sm font-medium ${
                    viewMode === 'table'
                      ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <Table className="h-4 w-4" />
                  Table
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-4 py-2 rounded-md transition flex items-center gap-2 text-sm font-medium ${
                    viewMode === 'grid'
                      ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <Grid className="h-4 w-4" />
                  Grid
                </button>
              </div>
            </div>

            {/* Receipts Display */}
            {loading ? (
              <div className="text-center py-16">
                <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
                <p className="mt-4 text-gray-600 dark:text-gray-400">Loading receipts...</p>
              </div>
            ) : viewMode === 'table' ? (
              <ReceiptTable
                receipts={receipts}
                onReceiptDeleted={handleReceiptDeleted}
              />
            ) : (
              <div className="text-center py-16 text-gray-600 dark:text-gray-400">
                <Grid className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">Grid view coming soon</p>
                <p className="text-sm mt-2">Please use table view for now</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </SubscriptionGate>
  )
}
