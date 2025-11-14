# Deployment Checklist

## Pre-Deployment

- [ ] Run database migrations in Supabase (`supabase/complete-setup.sql`)
- [ ] Create Stripe products and get Price IDs
- [ ] Set up Stripe webhook endpoint
- [ ] Test application locally
- [ ] Build passes successfully (`npm run build`)

## Vercel Setup

- [ ] Create Vercel account or login
- [ ] Connect Git repository (recommended) or prepare for manual deploy
- [ ] Install Vercel CLI (optional): `npm i -g vercel`

## Environment Variables in Vercel

Add these in Vercel Dashboard → Settings → Environment Variables:

### Supabase (Required)
- [ ] `NEXT_PUBLIC_SUPABASE_URL`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Stripe (Required for Subscriptions)
- [ ] `STRIPE_SECRET_KEY` (use `sk_live_...` for production)
- [ ] `STRIPE_WEBHOOK_SECRET` (from Stripe webhook setup)
- [ ] `NEXT_PUBLIC_STRIPE_PRICE_ID_MONTHLY`
- [ ] `NEXT_PUBLIC_STRIPE_PRICE_ID_YEARLY`

**Important:** Set variables for Production, Preview, and Development environments.

## Stripe Configuration

- [ ] Create products in Stripe Dashboard
- [ ] Create monthly price ($9.99/month)
- [ ] Create yearly price ($99.99/year)
- [ ] Set up webhook endpoint pointing to: `https://your-app.vercel.app/api/subscription/webhook`
- [ ] Select webhook events:
  - `checkout.session.completed`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
- [ ] Copy webhook signing secret to Vercel env vars

## Supabase Configuration

- [ ] Add Vercel domain to Supabase CORS settings:
  - Go to Settings → API
  - Add: `https://your-app.vercel.app`
- [ ] Verify RLS policies are enabled
- [ ] Test database connection

## Deploy

### Option 1: Vercel Dashboard
- [ ] Go to vercel.com
- [ ] Click "Add New Project"
- [ ] Import Git repository or upload project
- [ ] Configure build settings (auto-detected for Next.js)
- [ ] Add environment variables
- [ ] Deploy

### Option 2: Vercel CLI
```bash
vercel login
vercel
# For production: vercel --prod
```

## Post-Deployment

- [ ] Test sign up flow
- [ ] Test subscription checkout
- [ ] Verify webhook receives events (check Stripe dashboard)
- [ ] Test receipt upload
- [ ] Test export functionality
- [ ] Check error logs in Vercel dashboard
- [ ] Monitor Stripe webhook deliveries

## Production Checklist

- [ ] Switch Stripe to live mode
- [ ] Update Stripe keys to live keys
- [ ] Update webhook to production URL
- [ ] Test with real payment (small amount)
- [ ] Set up custom domain (optional)
- [ ] Configure monitoring/alerts
- [ ] Set up backup strategy

## Troubleshooting

If deployment fails:
1. Check build logs in Vercel
2. Verify all environment variables are set
3. Check TypeScript errors
4. Verify all dependencies are in package.json
5. Check Supabase connection
6. Verify Stripe webhook URL is correct

