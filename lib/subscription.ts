import { createClient } from '@/lib/supabase/server'

export interface SubscriptionStatus {
  isActive: boolean
  status?: string
  currentPeriodEnd?: Date
  cancelAtPeriodEnd?: boolean
  isTrial?: boolean
  trialEnd?: Date
  daysRemaining?: number
}

export async function checkSubscription(userId: string): Promise<SubscriptionStatus> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error || !data) {
    // Check if user should get a free trial
    return await checkAndCreateTrial(userId)
  }

  // Check if user is on trial
  if (data.is_trial && data.trial_end) {
    const trialEnd = new Date(data.trial_end)
    const now = new Date()
    
    if (now < trialEnd) {
      const daysRemaining = Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      return {
        isActive: true,
        status: 'trialing',
        isTrial: true,
        trialEnd,
        daysRemaining,
      }
    } else {
      // Trial expired, check if they have active subscription
      const isActive = data.status === 'active' || data.status === 'trialing'
      return {
        isActive,
        status: data.status,
        currentPeriodEnd: data.current_period_end ? new Date(data.current_period_end) : undefined,
        cancelAtPeriodEnd: data.cancel_at_period_end,
        isTrial: false,
      }
    }
  }

  // Regular subscription
  const isActive = data.status === 'active' || data.status === 'trialing'
  const currentPeriodEnd = data.current_period_end ? new Date(data.current_period_end) : undefined

  return {
    isActive,
    status: data.status,
    currentPeriodEnd,
    cancelAtPeriodEnd: data.cancel_at_period_end,
    isTrial: false,
  }
}

async function checkAndCreateTrial(userId: string): Promise<SubscriptionStatus> {
  const supabase = await createClient()
  
  // Get current user to check creation date
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user || user.id !== userId) {
    return { isActive: false }
  }

  const userCreatedAt = new Date(user.created_at)
  const now = new Date()
  const daysSinceSignup = Math.floor((now.getTime() - userCreatedAt.getTime()) / (1000 * 60 * 60 * 24))

  // If user signed up less than 7 days ago, they're eligible for trial
  if (daysSinceSignup < 7) {
    const trialEnd = new Date(userCreatedAt)
    trialEnd.setDate(trialEnd.getDate() + 7)
    
    // Try to create trial subscription (will fail silently if already exists)
    const { data: trialData } = await supabase
      .from('subscriptions')
      .upsert({
        user_id: userId,
        status: 'trialing',
        is_trial: true,
        trial_start: userCreatedAt.toISOString(),
        trial_end: trialEnd.toISOString(),
      }, {
        onConflict: 'user_id',
      })
      .select()
      .single()

    if (trialData) {
      const daysRemaining = Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      if (daysRemaining > 0) {
        return {
          isActive: true,
          status: 'trialing',
          isTrial: true,
          trialEnd,
          daysRemaining,
        }
      }
    }
  }

  return { isActive: false }
}

export async function requireSubscription(userId: string): Promise<boolean> {
  const subscription = await checkSubscription(userId)
  return subscription.isActive || (subscription.isTrial === true && (subscription.daysRemaining ?? 0) > 0)
}

