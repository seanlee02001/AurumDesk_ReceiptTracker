'use client'

import { useState, useMemo } from 'react'
import { Receipt } from '@/types/receipt'
import { Download, Filter, X, CheckSquare, Square, Trash2, ArrowUpDown } from 'lucide-react'
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
  const [showExportMenu, setShowExportMenu] = useState(false)

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
    setShowExportMenu(false)
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
    <div>
      {/* Toolbar */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            <span className="font-semibold text-gray-700 dark:text-gray-300">Filters</span>
          </div>

          <div className="flex-1 flex flex-wrap gap-2">
            <input
              type="text"
              placeholder="Merchant name..."
              value={filters.merchant}
              onChange={(e) => setFilters({ ...filters, merchant: e.target.value })}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
            <input
              type="text"
              placeholder="Date..."
              value={filters.date}
              onChange={(e) => setFilters({ ...filters, date: e.target.value })}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
            <input
              type="number"
              placeholder="Min $"
              value={filters.minTotal}
              onChange={(e) => setFilters({ ...filters, minTotal: e.target.value })}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition w-28"
            />
            <input
              type="number"
              placeholder="Max $"
              value={filters.maxTotal}
              onChange={(e) => setFilters({ ...filters, maxTotal: e.target.value })}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition w-28"
            />
          </div>

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
            >
              <X className="h-4 w-4" />
              Clear Filters
            </button>
          )}

          <div className="relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition flex items-center gap-2 font-semibold shadow-lg hover:shadow-xl"
            >
              <Download className="h-4 w-4" />
              Export
            </button>
            {showExportMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowExportMenu(false)}
                />
                <div className="absolute right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl py-2 min-w-[160px] z-20">
                  <button
                    onClick={() => handleExport('csv')}
                    className="w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm text-gray-900 dark:text-white transition flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Export CSV
                  </button>
                  <button
                    onClick={() => handleExport('excel')}
                    className="w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm text-gray-900 dark:text-white transition flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Export Excel
                  </button>
                  <button
                    onClick={() => handleExport('pdf')}
                    className="w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm text-gray-900 dark:text-white transition flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Export PDF
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th className="px-6 py-4 text-left">
                <button
                  onClick={toggleAllSelection}
                  className="flex items-center hover:opacity-70 transition"
                >
                  {selectedRows.size === filteredAndSortedReceipts.length &&
                  filteredAndSortedReceipts.length > 0 ? (
                    <CheckSquare className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  ) : (
                    <Square className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </th>
              <th
                className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition group"
                onClick={() => handleSort('merchant')}
              >
                <div className="flex items-center gap-2">
                  Merchant
                  <ArrowUpDown className="h-3 w-3 opacity-0 group-hover:opacity-100 transition" />
                  {sortConfig?.key === 'merchant' && (
                    <span className="text-blue-600 dark:text-blue-400">
                      {sortConfig.direction === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </div>
              </th>
              <th
                className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition group"
                onClick={() => handleSort('date')}
              >
                <div className="flex items-center gap-2">
                  Date
                  <ArrowUpDown className="h-3 w-3 opacity-0 group-hover:opacity-100 transition" />
                  {sortConfig?.key === 'date' && (
                    <span className="text-blue-600 dark:text-blue-400">
                      {sortConfig.direction === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </div>
              </th>
              <th
                className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition group"
                onClick={() => handleSort('total')}
              >
                <div className="flex items-center gap-2">
                  Total
                  <ArrowUpDown className="h-3 w-3 opacity-0 group-hover:opacity-100 transition" />
                  {sortConfig?.key === 'total' && (
                    <span className="text-blue-600 dark:text-blue-400">
                      {sortConfig.direction === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </div>
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Items
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
            {filteredAndSortedReceipts.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-16 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                      <Filter className="h-8 w-8 text-gray-400" />
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 font-medium">No receipts found</p>
                    <p className="text-sm text-gray-400 dark:text-gray-500">
                      {hasActiveFilters ? 'Try adjusting your filters' : 'Upload your first receipt to get started'}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredAndSortedReceipts.map((receipt) => (
                <tr
                  key={receipt.id}
                  className={`hover:bg-gray-50 dark:hover:bg-gray-900/50 transition ${
                    selectedRows.has(receipt.id) ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                  }`}
                >
                  <td className="px-6 py-4">
                    <button onClick={() => toggleRowSelection(receipt.id)} className="hover:opacity-70 transition">
                      {selectedRows.has(receipt.id) ? (
                        <CheckSquare className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      ) : (
                        <Square className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-medium text-gray-900 dark:text-white">
                      {receipt.merchant || <span className="text-gray-400">—</span>}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                    {receipt.date || <span className="text-gray-400">—</span>}
                  </td>
                  <td className="px-6 py-4">
                    {receipt.total ? (
                      <span className="font-semibold text-green-600 dark:text-green-400">
                        ${receipt.total.toFixed(2)}
                      </span>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
                      {receipt.items?.length || 0} item{receipt.items?.length !== 1 ? 's' : ''}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleDelete(receipt.id)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
                    >
                      <Trash2 className="h-4 w-4" />
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
      <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 flex items-center justify-between text-sm">
        <div className="text-gray-600 dark:text-gray-400">
          Showing <span className="font-semibold text-gray-900 dark:text-white">{filteredAndSortedReceipts.length}</span> of{' '}
          <span className="font-semibold text-gray-900 dark:text-white">{receipts.length}</span> receipts
          {selectedRows.size > 0 && (
            <span className="ml-2 text-blue-600 dark:text-blue-400 font-semibold">
              ({selectedRows.size} selected)
            </span>
          )}
        </div>
        {selectedRows.size > 0 && (
          <button
            onClick={() => setSelectedRows(new Set())}
            className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition"
          >
            Clear selection
          </button>
        )}
      </div>
    </div>
  )
}
