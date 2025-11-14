'use client'

import { useState } from 'react'
import { Receipt } from '@/types/receipt'
import ReceiptCard from './ReceiptCard'
import { Receipt as ReceiptIcon, X, Trash2 } from 'lucide-react'

interface ReceiptListProps {
  receipts: Receipt[]
  onReceiptDeleted: (id: string) => void
}

export default function ReceiptList({ receipts, onReceiptDeleted }: ReceiptListProps) {
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null)

  if (receipts.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-16 text-center border border-gray-100 dark:border-gray-700">
        <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <ReceiptIcon className="h-10 w-10 text-blue-600 dark:text-blue-400" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          No receipts yet
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Upload your first receipt to get started
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {receipts.map((receipt) => (
          <ReceiptCard
            key={receipt.id}
            receipt={receipt}
            onClick={() => setSelectedReceipt(receipt)}
            onDeleted={onReceiptDeleted}
          />
        ))}
      </div>

      {selectedReceipt && (
        <ReceiptDetailModal
          receipt={selectedReceipt}
          onClose={() => setSelectedReceipt(null)}
          onDeleted={() => {
            onReceiptDeleted(selectedReceipt.id)
            setSelectedReceipt(null)
          }}
        />
      )}
    </>
  )
}

function ReceiptDetailModal({
  receipt,
  onClose,
  onDeleted,
}: {
  receipt: Receipt
  onClose: () => void
  onDeleted: () => void
}) {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this receipt?')) {
      return
    }

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/receipts/${receipt.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        onDeleted()
      } else {
        throw new Error('Failed to delete receipt')
      }
    } catch (error) {
      console.error('Delete error:', error)
      alert('Failed to delete receipt')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-100 dark:border-gray-700">
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-5 flex justify-between items-center z-10">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Receipt Details
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="rounded-xl overflow-hidden border-2 border-gray-200 dark:border-gray-700">
            <img
              src={receipt.imageUrl}
              alt="Receipt"
              className="w-full max-h-96 object-contain bg-gray-50 dark:bg-gray-900"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {receipt.merchant && (
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1 block">
                  Merchant
                </label>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">{receipt.merchant}</p>
              </div>
            )}

            {receipt.date && (
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-4 border border-purple-200 dark:border-purple-800">
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1 block">
                  Date
                </label>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">{receipt.date}</p>
              </div>
            )}

            {receipt.total && (
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-4 border border-green-200 dark:border-green-800">
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1 block">
                  Total
                </label>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  ${receipt.total.toFixed(2)}
                </p>
              </div>
            )}

            <div className="bg-gradient-to-br from-cyan-50 to-teal-50 dark:from-cyan-900/20 dark:to-teal-900/20 rounded-xl p-4 border border-cyan-200 dark:border-cyan-800">
              <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1 block">
                Uploaded
              </label>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {new Date(receipt.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          {receipt.items && receipt.items.length > 0 && (
            <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 block mb-3">
                Items ({receipt.items.length})
              </label>
              <div className="space-y-2">
                {receipt.items.map((item, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                    <span className="text-gray-900 dark:text-white font-medium">{item.name}</span>
                    {item.price && (
                      <span className="text-gray-600 dark:text-gray-400 font-semibold">
                        ${item.price.toFixed(2)}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 block mb-3">
              Extracted Text
            </label>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 max-h-64 overflow-y-auto border border-gray-200 dark:border-gray-700">
              <pre className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap font-mono">
                {receipt.rawText}
              </pre>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="px-6 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition font-semibold shadow-lg hover:shadow-xl flex items-center gap-2"
            >
              <Trash2 className="h-5 w-5" />
              {isDeleting ? 'Deleting...' : 'Delete Receipt'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
