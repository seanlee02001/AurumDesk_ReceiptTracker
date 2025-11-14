'use client'

import { useState } from 'react'
import { Receipt } from '@/types/receipt'
import ReceiptCard from './ReceiptCard'
import { Receipt as ReceiptIcon } from 'lucide-react'

interface ReceiptListProps {
  receipts: Receipt[]
  onReceiptDeleted: (id: string) => void
}

export default function ReceiptList({ receipts, onReceiptDeleted }: ReceiptListProps) {
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null)

  if (receipts.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12 text-center">
        <ReceiptIcon className="mx-auto h-16 w-16 text-gray-400 mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Receipt Details
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <img
              src={receipt.imageUrl}
              alt="Receipt"
              className="w-full max-h-96 object-contain rounded-lg border border-gray-300 dark:border-gray-700"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {receipt.merchant && (
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Merchant
                </label>
                <p className="text-lg text-gray-900 dark:text-white">{receipt.merchant}</p>
              </div>
            )}

            {receipt.date && (
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Date
                </label>
                <p className="text-lg text-gray-900 dark:text-white">{receipt.date}</p>
              </div>
            )}

            {receipt.total && (
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Total
                </label>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  ${receipt.total.toFixed(2)}
                </p>
              </div>
            )}

            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Uploaded
              </label>
              <p className="text-lg text-gray-900 dark:text-white">
                {new Date(receipt.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          {receipt.items && receipt.items.length > 0 && (
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400 block mb-2">
                Items
              </label>
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                <ul className="space-y-2">
                  {receipt.items.map((item, index) => (
                    <li key={index} className="flex justify-between">
                      <span className="text-gray-900 dark:text-white">{item.name}</span>
                      {item.price && (
                        <span className="text-gray-600 dark:text-gray-400">
                          ${item.price.toFixed(2)}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          <div>
            <label className="text-sm font-medium text-gray-500 dark:text-gray-400 block mb-2">
              Extracted Text
            </label>
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 max-h-64 overflow-y-auto">
              <pre className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {receipt.rawText}
              </pre>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {isDeleting ? 'Deleting...' : 'Delete Receipt'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

