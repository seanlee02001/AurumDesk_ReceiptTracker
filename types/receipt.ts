export interface Receipt {
  id: string
  imageUrl: string
  rawText: string
  merchant?: string
  date?: string
  total?: number
  items?: ReceiptItem[]
  createdAt: string
  updatedAt: string
}

export interface ReceiptItem {
  name: string
  quantity?: number
  price?: number
}

