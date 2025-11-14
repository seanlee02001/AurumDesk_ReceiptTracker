import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireSubscription } from '@/lib/subscription'
import { Receipt } from '@/types/receipt'

export async function GET() {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check subscription
    const hasSubscription = await requireSubscription(user.id)
    if (!hasSubscription) {
      return NextResponse.json({ error: 'Active subscription required' }, { status: 403 })
    }

    const { data, error } = await supabase
      .from('receipts')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      throw error
    }

    // Transform database format to Receipt type
    const receipts: Receipt[] = (data || []).map((row: any) => ({
      id: row.id,
      imageUrl: row.image_url,
      rawText: row.raw_text,
      merchant: row.merchant || undefined,
      date: row.date || undefined,
      total: row.total ? parseFloat(row.total) : undefined,
      items: row.items || undefined,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }))

    return NextResponse.json(receipts)
  } catch (error) {
    console.error('Error loading receipts:', error)
    return NextResponse.json({ error: 'Failed to load receipts' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check subscription
    const hasSubscription = await requireSubscription(user.id)
    if (!hasSubscription) {
      return NextResponse.json({ error: 'Active subscription required' }, { status: 403 })
    }

    const formData = await request.formData()
    const imageFile = formData.get('image') as File
    const rawText = formData.get('rawText') as string
    const merchant = formData.get('merchant') as string
    const date = formData.get('date') as string
    const total = formData.get('total') as string
    const itemsJson = formData.get('items') as string

    if (!imageFile) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 })
    }

    // Upload image to Supabase Storage
    const imageId = `${Date.now()}-${Math.random().toString(36).substring(7)}`
    const imageExtension = imageFile.name.split('.').pop() || 'jpg'
    const imageFileName = `${imageId}.${imageExtension}`
    const imagePath = `${user.id}/${imageFileName}`

    const bytes = await imageFile.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const { error: uploadError } = await supabase.storage
      .from('receipts')
      .upload(imagePath, buffer, {
        contentType: imageFile.type,
        upsert: false,
      })

    if (uploadError) {
      throw uploadError
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('receipts')
      .getPublicUrl(imagePath)

    // Insert receipt into database
    const { data: receiptData, error: dbError } = await supabase
      .from('receipts')
      .insert({
        user_id: user.id,
        image_url: urlData.publicUrl,
        raw_text: rawText || '',
        merchant: merchant || null,
        date: date || null,
        total: total ? parseFloat(total) : null,
        items: itemsJson ? JSON.parse(itemsJson) : null,
      })
      .select()
      .single()

    if (dbError) {
      throw dbError
    }

    // Transform to Receipt type
    const receipt: Receipt = {
      id: receiptData.id,
      imageUrl: receiptData.image_url,
      rawText: receiptData.raw_text,
      merchant: receiptData.merchant || undefined,
      date: receiptData.date || undefined,
      total: receiptData.total ? parseFloat(receiptData.total) : undefined,
      items: receiptData.items || undefined,
      createdAt: receiptData.created_at,
      updatedAt: receiptData.updated_at,
    }

    return NextResponse.json(receipt)
  } catch (error) {
    console.error('Error saving receipt:', error)
    return NextResponse.json({ error: 'Failed to save receipt' }, { status: 500 })
  }
}
