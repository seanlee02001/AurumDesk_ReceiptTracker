# Quick Vercel Deployment Guide

## Your Repository
✅ Code is now on GitHub: https://github.com/seanlee02001/AurumDesk_ReceiptTracker

## Step 1: Deploy to Vercel

### Option A: Via Vercel Dashboard (Recommended)

1. Go to [vercel.com](https://vercel.com) and sign in (or create account)
2. Click **"Add New Project"**
3. Click **"Import Git Repository"**
4. Find and select: `seanlee02001/AurumDesk_ReceiptTracker`
5. Click **"Import"**

### Option B: Via Vercel CLI

```bash
npm i -g vercel
vercel login
vercel
```

## Step 2: Configure Project Settings

Vercel will auto-detect:
- Framework: Next.js ✅
- Build Command: `npm run build` ✅
- Output Directory: `.next` ✅

Just click **"Deploy"** - these are already correct!

## Step 3: Add Environment Variables

**IMPORTANT:** Before deploying, add these in Vercel Dashboard → Settings → Environment Variables:

### Supabase (Required)
```
NEXT_PUBLIC_SUPABASE_URL=https://hcixqtluhpeyqfdnrsaq.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhjaXhxdGx1aHBleXFmZG5yc2FxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMwOTM3MTksImV4cCI6MjA3ODY2OTcxOX0.2u6830rkX9gb6EJebEMOtrcpHSB6thmuu8RijXVUy0s
```

### Stripe (Required for Subscriptions)
```
STRIPE_SECRET_KEY=sk_test_... (or sk_live_... for production)
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PRICE_ID_MONTHLY=price_...
NEXT_PUBLIC_STRIPE_PRICE_ID_YEARLY=price_...
```

**Set for:** Production, Preview, and Development environments

## Step 4: Configure Stripe Webhook

After deployment, you'll get a Vercel URL like: `https://your-app.vercel.app`

1. Go to Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://your-app.vercel.app/api/subscription/webhook`
3. Select events:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
4. Copy webhook secret and add to Vercel env vars

## Step 5: Update Supabase CORS

1. Go to Supabase Dashboard → Settings → API
2. Add your Vercel URL to "Allowed CORS origins"
3. Example: `https://your-app.vercel.app`

## Step 6: Redeploy

After adding environment variables, Vercel will automatically redeploy, or you can:
- Go to Deployments → Click "..." → Redeploy

## Done! 🎉

Your app will be live at: `https://your-app.vercel.app`

## Next Steps

- Test sign up flow
- Test subscription checkout
- Verify webhook receives events
- Test receipt upload and export

