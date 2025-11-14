'use client'

import { Receipt } from '@/types/receipt'
import { Trash2, Calendar, Store, DollarSign } from 'lucide-react'

interface ReceiptCardProps {
  receipt: Receipt
  onClick: () => void
  onDeleted: (id: string) => void
}

export default function ReceiptCard({ receipt, onClick, onDeleted }: ReceiptCardProps) {
  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm('Are you sure you want to delete this receipt?')) {
      return
    }

    try {
      const response = await fetch(`/api/receipts/${receipt.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        onDeleted(receipt.id)
      } else {
        throw new Error('Failed to delete receipt')
      }
    } catch (error) {
      console.error('Delete error:', error)
      alert('Failed to delete receipt')
    }
  }

  return (
    <div
      onClick={onClick}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow cursor-pointer group"
    >
      <div className="relative h-48 bg-gray-100 dark:bg-gray-700 overflow-hidden">
        <img
          src={receipt.imageUrl}
          alt="Receipt"
          className="w-full h-full object-contain"
        />
        <button
          onClick={handleDelete}
          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
        >
          <Trash2 size={16} />
        </button>
      </div>

      <div className="p-4 space-y-2">
        {receipt.merchant && (
          <div className="flex items-center gap-2">
            <Store size={16} className="text-gray-400" />
            <h3 className="font-semibold text-gray-900 dark:text-white truncate">
              {receipt.merchant}
            </h3>
          </div>
        )}

        <div className="flex items-center justify-between text-sm">
          {receipt.date && (
            <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
              <Calendar size={14} />
              <span>{receipt.date}</span>
            </div>
          )}

          {receipt.total && (
            <div className="flex items-center gap-1 font-semibold text-green-600 dark:text-green-400">
              <DollarSign size={14} />
              <span>{receipt.total.toFixed(2)}</span>
            </div>
          )}
        </div>

        {receipt.items && receipt.items.length > 0 && (
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {receipt.items.length} item{receipt.items.length !== 1 ? 's' : ''}
          </div>
        )}
      </div>
    </div>
  )
}

