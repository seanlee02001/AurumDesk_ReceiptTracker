'use client'

import { useState, useRef } from 'react'
import { Upload, X, Loader2 } from 'lucide-react'
import { Receipt } from '@/types/receipt'
import { createWorker } from 'tesseract.js'

interface ReceiptUploadProps {
  onReceiptAdded: (receipt: Receipt) => void
}

export default function ReceiptUpload({ onReceiptAdded }: ReceiptUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [preview, setPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith('image/')) {
      handleFile(file)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFile(file)
    }
  }

  const handleFile = async (file: File) => {
    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)

    setIsProcessing(true)
    setProgress(0)

    try {
      // Initialize Tesseract worker
      const worker = await createWorker('eng')
      
      // Perform OCR
      const { data: { text } } = await worker.recognize(file, {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            setProgress(Math.round(m.progress * 100))
          }
        },
      })

      await worker.terminate()

      // Parse the extracted text
      const { parseReceiptText } = await import('@/lib/receiptParser')
      const parsedData = parseReceiptText(text)

      // Upload image and save receipt
      const formData = new FormData()
      formData.append('image', file)
      formData.append('rawText', text)
      formData.append('merchant', parsedData.merchant || '')
      formData.append('date', parsedData.date || '')
      formData.append('total', parsedData.total?.toString() || '')
      formData.append('items', JSON.stringify(parsedData.items || []))

      const response = await fetch('/api/receipts', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        const receipt = await response.json()
        onReceiptAdded(receipt)
        setPreview(null)
        setProgress(0)
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
      } else {
        throw new Error('Failed to save receipt')
      }
    } catch (error) {
      console.error('OCR processing error:', error)
      alert('Failed to process receipt. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  const clearPreview = () => {
    setPreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
      <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
        Upload Receipt
      </h2>

      {preview && !isProcessing && (
        <div className="mb-4 relative">
          <img
            src={preview}
            alt="Receipt preview"
            className="w-full max-h-64 object-contain rounded-lg border border-gray-300 dark:border-gray-700"
          />
          <button
            onClick={clearPreview}
            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition"
          >
            <X size={20} />
          </button>
        </div>
      )}

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center transition-colors
          ${isDragging
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
            : 'border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50'
          }
          ${isProcessing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-blue-400'}
        `}
        onClick={() => !isProcessing && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
          disabled={isProcessing}
        />

        {isProcessing ? (
          <div className="space-y-4">
            <Loader2 className="mx-auto h-12 w-12 text-blue-500 animate-spin" />
            <div>
              <p className="text-gray-700 dark:text-gray-300 font-medium">
                Processing receipt... {progress}%
              </p>
              <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <div>
              <p className="text-gray-700 dark:text-gray-300 font-medium">
                Drag and drop a receipt image here, or click to select
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                Supports JPG, PNG, and other image formats
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

