import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function POST() {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user already has a subscription
    const { data: existing } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (existing) {
      return NextResponse.json({ 
        error: 'User already has a subscription or trial' 
      }, { status: 400 })
    }

    // Get user creation date
    const userCreatedAt = new Date(user.created_at)
    const now = new Date()
    const daysSinceSignup = Math.floor((now.getTime() - userCreatedAt.getTime()) / (1000 * 60 * 60 * 24))

    // Only allow trial if signed up less than 7 days ago
    if (daysSinceSignup >= 7) {
      return NextResponse.json({ 
        error: 'Trial period has expired. Please subscribe to continue.' 
      }, { status: 400 })
    }

    // Calculate trial end date (7 days from signup)
    const trialEnd = new Date(userCreatedAt)
    trialEnd.setDate(trialEnd.getDate() + 7)

    // Create trial subscription
    const { data: trialData, error } = await supabase
      .from('subscriptions')
      .insert({
        user_id: user.id,
        status: 'trialing',
        is_trial: true,
        trial_start: userCreatedAt.toISOString(),
        trial_end: trialEnd.toISOString(),
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    const daysRemaining = Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

    return NextResponse.json({
      success: true,
      isTrial: true,
      trialEnd: trialData.trial_end,
      daysRemaining,
    })
  } catch (error) {
    console.error('Error starting trial:', error)
    return NextResponse.json({ error: 'Failed to start trial' }, { status: 500 })
  }
}

