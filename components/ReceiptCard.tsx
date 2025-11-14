'use client'

import { Receipt } from '@/types/receipt'
import { Trash2, Calendar, Store, DollarSign, Package } from 'lucide-react'

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
      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all cursor-pointer group border border-gray-100 dark:border-gray-700"
    >
      <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 overflow-hidden">
        <img
          src={receipt.imageUrl}
          alt="Receipt"
          className="w-full h-full object-contain p-2"
        />
        <button
          onClick={handleDelete}
          className="absolute top-3 right-3 bg-red-500 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 shadow-lg"
        >
          <Trash2 size={16} />
        </button>
      </div>

      <div className="p-5 space-y-3">
        {receipt.merchant && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
              <Store size={16} className="text-white" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white truncate flex-1">
              {receipt.merchant}
            </h3>
          </div>
        )}

        <div className="flex items-center justify-between text-sm">
          {receipt.date && (
            <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
              <Calendar size={14} />
              <span>{receipt.date}</span>
            </div>
          )}

          {receipt.total && (
            <div className="flex items-center gap-1.5 font-bold text-green-600 dark:text-green-400">
              <DollarSign size={16} />
              <span className="text-lg">{receipt.total.toFixed(2)}</span>
            </div>
          )}
        </div>

        {receipt.items && receipt.items.length > 0 && (
          <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-200 dark:border-gray-700">
            <Package size={14} />
            <span>{receipt.items.length} item{receipt.items.length !== 1 ? 's' : ''}</span>
          </div>
        )}
      </div>
    </div>
  )
}
