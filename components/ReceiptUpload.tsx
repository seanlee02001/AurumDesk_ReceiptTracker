'use client'

import { useState, useRef } from 'react'
import { Upload, X, Loader2, Image as ImageIcon } from 'lucide-react'
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
        logger: (m: any) => {
          if (m.status === 'recognizing text') {
            setProgress(Math.round(m.progress * 100))
          }
        },
      } as any)

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
        const error = await response.json()
        throw new Error(error.error || 'Failed to save receipt')
      }
    } catch (error: any) {
      console.error('OCR processing error:', error)
      alert(error.message || 'Failed to process receipt. Please try again.')
      setPreview(null)
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
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
          <Upload className="h-5 w-5 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Upload Receipt</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">Extract data from receipt images</p>
        </div>
      </div>

      {preview && !isProcessing && (
        <div className="mb-4 relative group">
          <div className="relative rounded-xl overflow-hidden border-2 border-gray-200 dark:border-gray-700">
            <img
              src={preview}
              alt="Receipt preview"
              className="w-full max-h-64 object-contain bg-gray-50 dark:bg-gray-900"
            />
            <button
              onClick={clearPreview}
              className="absolute top-3 right-3 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition shadow-lg opacity-0 group-hover:opacity-100"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      )}

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          border-2 border-dashed rounded-xl p-12 text-center transition-all
          ${isDragging
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 scale-[1.02]'
            : 'border-gray-300 dark:border-gray-600 bg-gray-50/50 dark:bg-gray-900/50'
          }
          ${isProcessing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-900/10'}
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
          <div className="space-y-6">
            <div className="relative">
              <Loader2 className="mx-auto h-16 w-16 text-blue-500 animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold text-blue-600">{progress}%</span>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-gray-700 dark:text-gray-300 font-semibold text-lg">
                Processing receipt...
              </p>
              <div className="w-full max-w-xs mx-auto bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-full rounded-full transition-all duration-300 shadow-lg"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Extracting text and parsing data
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-center">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-2xl flex items-center justify-center">
                <ImageIcon className="h-10 w-10 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div>
              <p className="text-gray-700 dark:text-gray-300 font-semibold text-lg mb-2">
                Drag and drop a receipt image here
              </p>
              <p className="text-gray-500 dark:text-gray-400 mb-4">or</p>
              <button
                type="button"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all font-semibold shadow-lg hover:shadow-xl"
              >
                <Upload className="h-5 w-5" />
                Browse Files
              </button>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
              Supports JPG, PNG, WEBP and other image formats
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
