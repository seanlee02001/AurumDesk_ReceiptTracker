import { createClient } from '@/lib/supabase/server'

export interface SubscriptionStatus {
  isActive: boolean
  status?: string
  currentPeriodEnd?: Date
  cancelAtPeriodEnd?: boolean
}

export async function checkSubscription(userId: string): Promise<SubscriptionStatus> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error || !data) {
    return { isActive: false }
  }

  const isActive = data.status === 'active' || data.status === 'trialing'
  const currentPeriodEnd = data.current_period_end ? new Date(data.current_period_end) : undefined

  return {
    isActive,
    status: data.status,
    currentPeriodEnd,
    cancelAtPeriodEnd: data.cancel_at_period_end,
  }
}

export async function requireSubscription(userId: string): Promise<boolean> {
  const subscription = await checkSubscription(userId)
  return subscription.isActive
}

