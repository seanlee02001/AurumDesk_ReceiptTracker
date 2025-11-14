'use client'

import { useState, useMemo } from 'react'
import { Receipt } from '@/types/receipt'
import { Download, Filter, X, CheckSquare, Square } from 'lucide-react'
import { exportToCSV, exportToExcel, exportToPDF } from '@/lib/export'

interface ReceiptTableProps {
  receipts: Receipt[]
  onReceiptDeleted: (id: string) => void
}

export default function ReceiptTable({ receipts, onReceiptDeleted }: ReceiptTableProps) {
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set())
  const [filters, setFilters] = useState({
    merchant: '',
    date: '',
    minTotal: '',
    maxTotal: '',
  })
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Receipt
    direction: 'asc' | 'desc'
  } | null>(null)

  const filteredAndSortedReceipts = useMemo(() => {
    let filtered = [...receipts]

    // Apply filters
    if (filters.merchant) {
      filtered = filtered.filter((r) =>
        r.merchant?.toLowerCase().includes(filters.merchant.toLowerCase())
      )
    }
    if (filters.date) {
      filtered = filtered.filter((r) => r.date?.includes(filters.date))
    }
    if (filters.minTotal) {
      const min = parseFloat(filters.minTotal)
      filtered = filtered.filter((r) => r.total && r.total >= min)
    }
    if (filters.maxTotal) {
      const max = parseFloat(filters.maxTotal)
      filtered = filtered.filter((r) => r.total && r.total <= max)
    }

    // Apply sorting
    if (sortConfig) {
      filtered.sort((a, b) => {
        const aVal = a[sortConfig.key]
        const bVal = b[sortConfig.key]

        if (aVal === undefined || aVal === null) return 1
        if (bVal === undefined || bVal === null) return -1

        if (typeof aVal === 'number' && typeof bVal === 'number') {
          return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal
        }

        const aStr = String(aVal)
        const bStr = String(bVal)
        return sortConfig.direction === 'asc'
          ? aStr.localeCompare(bStr)
          : bStr.localeCompare(aStr)
      })
    }

    return filtered
  }, [receipts, filters, sortConfig])

  const handleSort = (key: keyof Receipt) => {
    setSortConfig((current) => {
      if (current?.key === key) {
        return {
          key,
          direction: current.direction === 'asc' ? 'desc' : 'asc',
        }
      }
      return { key, direction: 'asc' }
    })
  }

  const toggleRowSelection = (id: string) => {
    setSelectedRows((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const toggleAllSelection = () => {
    if (selectedRows.size === filteredAndSortedReceipts.length) {
      setSelectedRows(new Set())
    } else {
      setSelectedRows(new Set(filteredAndSortedReceipts.map((r) => r.id)))
    }
  }

  const clearFilters = () => {
    setFilters({
      merchant: '',
      date: '',
      minTotal: '',
      maxTotal: '',
    })
  }

  const handleExport = async (format: 'csv' | 'excel' | 'pdf') => {
    const receiptsToExport =
      selectedRows.size > 0
        ? filteredAndSortedReceipts.filter((r) => selectedRows.has(r.id))
        : filteredAndSortedReceipts

    if (receiptsToExport.length === 0) {
      alert('No receipts to export')
      return
    }

    switch (format) {
      case 'csv':
        exportToCSV(receiptsToExport)
        break
      case 'excel':
        exportToExcel(receiptsToExport)
        break
      case 'pdf':
        exportToPDF(receiptsToExport)
        break
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this receipt?')) {
      return
    }

    try {
      const response = await fetch(`/api/receipts/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        onReceiptDeleted(id)
        setSelectedRows((prev) => {
          const next = new Set(prev)
          next.delete(id)
          return next
        })
      } else {
        throw new Error('Failed to delete receipt')
      }
    } catch (error) {
      console.error('Delete error:', error)
      alert('Failed to delete receipt')
    }
  }

  const hasActiveFilters = Object.values(filters).some((v) => v !== '')

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
      {/* Toolbar */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-gray-500" />
          <span className="font-medium text-gray-700 dark:text-gray-300">Filters</span>
        </div>

        <div className="flex-1 flex flex-wrap gap-2">
          <input
            type="text"
            placeholder="Merchant"
            value={filters.merchant}
            onChange={(e) => setFilters({ ...filters, merchant: e.target.value })}
            className="px-3 py-1.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            placeholder="Date"
            value={filters.date}
            onChange={(e) => setFilters({ ...filters, date: e.target.value })}
            className="px-3 py-1.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="number"
            placeholder="Min Total"
            value={filters.minTotal}
            onChange={(e) => setFilters({ ...filters, minTotal: e.target.value })}
            className="px-3 py-1.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-24"
          />
          <input
            type="number"
            placeholder="Max Total"
            value={filters.maxTotal}
            onChange={(e) => setFilters({ ...filters, maxTotal: e.target.value })}
            className="px-3 py-1.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-24"
          />
        </div>

        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white flex items-center gap-1"
          >
            <X className="h-4 w-4" />
            Clear
          </button>
        )}

        <div className="group relative">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export
          </button>
          <div className="absolute right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-1 min-w-[120px] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
            <button
              onClick={() => handleExport('csv')}
              className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm text-gray-900 dark:text-white"
            >
              Export CSV
            </button>
            <button
              onClick={() => handleExport('excel')}
              className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm text-gray-900 dark:text-white"
            >
              Export Excel
            </button>
            <button
              onClick={() => handleExport('pdf')}
              className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm text-gray-900 dark:text-white"
            >
              Export PDF
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th className="px-4 py-3 text-left">
                <button
                  onClick={toggleAllSelection}
                  className="flex items-center"
                >
                  {selectedRows.size === filteredAndSortedReceipts.length &&
                  filteredAndSortedReceipts.length > 0 ? (
                    <CheckSquare className="h-5 w-5 text-blue-600" />
                  ) : (
                    <Square className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                onClick={() => handleSort('merchant')}
              >
                Merchant {sortConfig?.key === 'merchant' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                onClick={() => handleSort('date')}
              >
                Date {sortConfig?.key === 'date' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                onClick={() => handleSort('total')}
              >
                Total {sortConfig?.key === 'total' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Items
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredAndSortedReceipts.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                  No receipts found
                </td>
              </tr>
            ) : (
              filteredAndSortedReceipts.map((receipt) => (
                <tr
                  key={receipt.id}
                  className={`hover:bg-gray-50 dark:hover:bg-gray-900/50 ${
                    selectedRows.has(receipt.id) ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                  }`}
                >
                  <td className="px-4 py-3">
                    <button onClick={() => toggleRowSelection(receipt.id)}>
                      {selectedRows.has(receipt.id) ? (
                        <CheckSquare className="h-5 w-5 text-blue-600" />
                      ) : (
                        <Square className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                    {receipt.merchant || '-'}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                    {receipt.date || '-'}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                    {receipt.total ? `$${receipt.total.toFixed(2)}` : '-'}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                    {receipt.items?.length || 0}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleDelete(receipt.id)}
                      className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 text-sm"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm text-gray-600 dark:text-gray-400">
        Showing {filteredAndSortedReceipts.length} of {receipts.length} receipts
        {selectedRows.size > 0 && ` (${selectedRows.size} selected)`}
      </div>
    </div>
  )
}

