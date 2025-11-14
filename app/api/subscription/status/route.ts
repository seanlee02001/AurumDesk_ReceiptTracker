import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (error && error.code !== 'PGRST116') {
      throw error
    }

    if (!data) {
      return NextResponse.json({
        isActive: false,
        status: 'none',
      })
    }

    const isActive = data.status === 'active' || data.status === 'trialing'

    return NextResponse.json({
      isActive,
      status: data.status,
      currentPeriodEnd: data.current_period_end,
      cancelAtPeriodEnd: data.cancel_at_period_end,
    })
  } catch (error) {
    console.error('Error checking subscription:', error)
    return NextResponse.json({ error: 'Failed to check subscription' }, { status: 500 })
  }
}

