'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'
import ReceiptUpload from '@/components/ReceiptUpload'
import ReceiptTable from '@/components/ReceiptTable'
import Auth from '@/components/Auth'
import SubscriptionGate from '@/components/SubscriptionGate'
import { Receipt } from '@/types/receipt'
import { LogOut, Table, Grid } from 'lucide-react'

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
      <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                Receipt Tracker
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                Upload receipts and extract information using OCR
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {user.email}
              </div>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          </div>

          {/* Upload Section */}
          <div className="mb-8">
            <ReceiptUpload onReceiptAdded={handleReceiptAdded} />
          </div>

          {/* View Toggle */}
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2 bg-white dark:bg-gray-800 rounded-lg p-1 border border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setViewMode('table')}
                className={`px-4 py-2 rounded-md transition flex items-center gap-2 ${
                  viewMode === 'table'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <Table className="h-4 w-4" />
                Table
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`px-4 py-2 rounded-md transition flex items-center gap-2 ${
                  viewMode === 'grid'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <Grid className="h-4 w-4" />
                Grid
              </button>
            </div>
          </div>

          {/* Receipts Display */}
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">Loading receipts...</p>
            </div>
          ) : viewMode === 'table' ? (
            <ReceiptTable
              receipts={receipts}
              onReceiptDeleted={handleReceiptDeleted}
            />
          ) : (
            <div className="text-center py-12 text-gray-600 dark:text-gray-400">
              Grid view coming soon. Please use table view for now.
            </div>
          )}
        </div>
      </main>
    </SubscriptionGate>
  )
}
