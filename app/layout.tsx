import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'AurumDesk Receipt Tracker',
  description: 'Track and manage your receipts with OCR technology',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}

