# Stripe Subscription Setup

## Prerequisites

1. Create a Stripe account at [stripe.com](https://stripe.com)
2. Get your API keys from the Stripe Dashboard

## Setup Steps

### 1. Create Products and Prices in Stripe

1. Go to Stripe Dashboard → **Products**
2. Click **Add Product**
3. Create two products:

   **Monthly Plan:**
   - Name: Receipt Tracker Monthly
   - Pricing: Recurring
   - Price: $9.99 USD
   - Billing period: Monthly
   - Copy the **Price ID** (starts with `price_`)

   **Yearly Plan:**
   - Name: Receipt Tracker Yearly
   - Pricing: Recurring
   - Price: $99.99 USD
   - Billing period: Yearly
   - Copy the **Price ID** (starts with `price_`)

### 2. Get Stripe API Keys

1. Go to Stripe Dashboard → **Developers** → **API keys**
2. Copy:
   - **Publishable key** (starts with `pk_`)
   - **Secret key** (starts with `sk_`) - Click "Reveal test key"

### 3. Set Up Webhook

1. Go to Stripe Dashboard → **Developers** → **Webhooks**
2. Click **Add endpoint**
3. Endpoint URL: `https://yourdomain.com/api/subscription/webhook`
   - For local development, use Stripe CLI (see below)
4. Select events to listen to:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
5. Copy the **Webhook signing secret** (starts with `whsec_`)

### 4. Update Environment Variables

Add to your `.env.local`:

```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PRICE_ID_MONTHLY=price_...
NEXT_PUBLIC_STRIPE_PRICE_ID_YEARLY=price_...
```

### 5. Local Development with Stripe CLI

For local development, use Stripe CLI to forward webhooks:

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:3000/api/subscription/webhook
```

This will give you a webhook signing secret. Use this in your `.env.local` for local development.

### 6. Run Database Migration

Make sure you've run the updated `supabase/complete-setup.sql` which includes the subscriptions table.

## Testing

1. Use Stripe test cards:
   - Success: `4242 4242 4242 4242`
   - Decline: `4000 0000 0000 0002`
   - Any future expiry date and any CVC

2. Test the flow:
   - Sign up for an account
   - You should see the subscription gate
   - Click "Subscribe Now"
   - Complete checkout with test card
   - Webhook should update subscription status
   - You should now have access to the app

## Production

1. Switch to live mode in Stripe Dashboard
2. Update environment variables with live keys
3. Set up production webhook endpoint
4. Update webhook signing secret

