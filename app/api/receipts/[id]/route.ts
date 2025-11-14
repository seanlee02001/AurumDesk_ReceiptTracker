import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireSubscription } from '@/lib/subscription'

export const dynamic = 'force-dynamic'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Get receipt to find image path
    const { data: receipt, error: fetchError } = await supabase
      .from('receipts')
      .select('image_url')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !receipt) {
      return NextResponse.json({ error: 'Receipt not found' }, { status: 404 })
    }

    // Extract file path from URL
    const url = new URL(receipt.image_url)
    const pathParts = url.pathname.split('/')
    const filePath = pathParts.slice(pathParts.indexOf('receipts') + 1).join('/')

    // Delete image from storage
    if (filePath) {
      await supabase.storage.from('receipts').remove([filePath])
    }

    // Delete receipt from database
    const { error: deleteError } = await supabase
      .from('receipts')
      .delete()
      .eq('id', params.id)
      .eq('user_id', user.id)

    if (deleteError) {
      throw deleteError
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting receipt:', error)
    return NextResponse.json({ error: 'Failed to delete receipt' }, { status: 500 })
  }
}
