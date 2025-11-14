import { Receipt, ReceiptItem } from '@/types/receipt'

/**
 * Extracts structured data from OCR text
 */
export function parseReceiptText(text: string): Partial<Receipt> {
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0)
  
  const result: Partial<Receipt> = {
    rawText: text,
  }

  // Extract merchant name (usually first line or contains common merchant keywords)
  const merchantPatterns = [
    /^(.*?)(?:store|shop|market|restaurant|cafe|coffee|pizza|burger|gas|station|pharmacy|supermarket)/i,
    /^([A-Z][A-Z\s&]+?)(?:\s+\d|$)/,
  ]
  
  for (const pattern of merchantPatterns) {
    const match = lines[0]?.match(pattern)
    if (match) {
      result.merchant = match[1].trim()
      break
    }
  }
  
  if (!result.merchant && lines[0]) {
    result.merchant = lines[0].substring(0, 30)
  }

  // Extract date (various formats)
  const datePatterns = [
    /\b(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})\b/,
    /\b(\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2})\b/,
    /\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[\s,]+(\d{1,2})[\s,]+(\d{4})\b/i,
  ]
  
  for (const line of lines) {
    for (const pattern of datePatterns) {
      const match = line.match(pattern)
      if (match) {
        result.date = match[0]
        break
      }
    }
    if (result.date) break
  }

  // Extract total amount (look for patterns like "Total", "TOTAL", "Amount", etc.)
  const totalPatterns = [
    /(?:total|amount|sum|balance|due)[\s:]*\$?(\d+\.\d{2})/i,
    /\$(\d+\.\d{2})\s*$/,
    /(\d+\.\d{2})\s*(?:total|tax|amount)/i,
  ]
  
  // Check lines in reverse order (total is usually at the end)
  for (let i = lines.length - 1; i >= 0; i--) {
    for (const pattern of totalPatterns) {
      const match = lines[i].match(pattern)
      if (match) {
        result.total = parseFloat(match[1])
        break
      }
    }
    if (result.total) break
  }

  // If no total found, look for the largest number that could be a total
  if (!result.total) {
    const amounts: number[] = []
    for (const line of lines) {
      const matches = line.match(/\$?(\d+\.\d{2})/g)
      if (matches) {
        matches.forEach(m => {
          const amount = parseFloat(m.replace('$', ''))
          if (amount > 0 && amount < 100000) {
            amounts.push(amount)
          }
        })
      }
    }
    if (amounts.length > 0) {
      result.total = Math.max(...amounts)
    }
  }

  // Extract items (lines that look like item descriptions with prices)
  const items: ReceiptItem[] = []
  const itemPattern = /^(.+?)\s+\$?(\d+\.\d{2})\s*$/
  
  for (const line of lines) {
    // Skip lines that are clearly not items
    if (
      line.match(/total|subtotal|tax|discount|change|cash|card|thank|receipt/i) ||
      line.length < 3 ||
      line.match(/^\d+[\/\-]\d+[\/\-]\d+/) // Date pattern
    ) {
      continue
    }
    
    const match = line.match(itemPattern)
    if (match) {
      items.push({
        name: match[1].trim(),
        price: parseFloat(match[2]),
      })
    }
  }

  if (items.length > 0) {
    result.items = items.slice(0, 20) // Limit to 20 items
  }

  return result
}

