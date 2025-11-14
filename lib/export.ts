import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { Receipt } from '@/types/receipt'

export function exportToCSV(receipts: Receipt[]) {
  const headers = ['Merchant', 'Date', 'Total', 'Items Count', 'Created At']
  const rows = receipts.map((r) => [
    r.merchant || '',
    r.date || '',
    r.total?.toFixed(2) || '',
    r.items?.length || 0,
    new Date(r.createdAt).toLocaleDateString(),
  ])

  const csvContent = [
    headers.join(','),
    ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
  ].join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', `receipts_${new Date().toISOString().split('T')[0]}.csv`)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export function exportToExcel(receipts: Receipt[]) {
  const data = receipts.map((r) => ({
    Merchant: r.merchant || '',
    Date: r.date || '',
    Total: r.total || 0,
    'Items Count': r.items?.length || 0,
    'Created At': new Date(r.createdAt).toLocaleDateString(),
  }))

  const worksheet = XLSX.utils.json_to_sheet(data)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Receipts')

  XLSX.writeFile(workbook, `receipts_${new Date().toISOString().split('T')[0]}.xlsx`)
}

export function exportToPDF(receipts: Receipt[]) {
  const doc = new jsPDF()

  doc.setFontSize(18)
  doc.text('Receipts Export', 14, 22)

  const tableData = receipts.map((r) => [
    r.merchant || '-',
    r.date || '-',
    r.total ? `$${r.total.toFixed(2)}` : '-',
    (r.items?.length || 0).toString(),
    new Date(r.createdAt).toLocaleDateString(),
  ])

  autoTable(doc, {
    head: [['Merchant', 'Date', 'Total', 'Items', 'Created At']],
    body: tableData,
    startY: 30,
    styles: { fontSize: 9 },
    headStyles: { fillColor: [66, 139, 202] },
  })

  doc.save(`receipts_${new Date().toISOString().split('T')[0]}.pdf`)
}

