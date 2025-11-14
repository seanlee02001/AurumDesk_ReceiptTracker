# Vercel Deployment Guide

## Prerequisites

1. ✅ Supabase project set up
2. ✅ Database migrations run
3. ✅ Stripe account configured
4. ✅ GitHub/GitLab/Bitbucket repository (optional but recommended)

## Step 1: Prepare Your Repository

If you haven't already, initialize git and push to a repository:

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-repo-url>
git push -u origin main
```

## Step 2: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **Add New Project**
3. Import your Git repository (or drag & drop your project folder)
4. Configure the project:
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `./` (default)
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `.next` (default)

### Option B: Deploy via Vercel CLI

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Login to Vercel:
```bash
vercel login
```

3. Deploy:
```bash
vercel
```

Follow the prompts. For production, run:
```bash
vercel --prod
```

## Step 3: Configure Environment Variables

In your Vercel project dashboard:

1. Go to **Settings** → **Environment Variables**
2. Add the following variables:

### Required Variables:

```
NEXT_PUBLIC_SUPABASE_URL=https://hcixqtluhpeyqfdnrsaq.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhjaXhxdGx1aHBleXFmZG5yc2FxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMwOTM3MTksImV4cCI6MjA3ODY2OTcxOX0.2u6830rkX9gb6EJebEMOtrcpHSB6thmuu8RijXVUy0s
```

### Stripe Variables (Required for Subscriptions):

```
STRIPE_SECRET_KEY=sk_live_... (or sk_test_... for testing)
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PRICE_ID_MONTHLY=price_...
NEXT_PUBLIC_STRIPE_PRICE_ID_YEARLY=price_...
```

### Environment Selection:

- Set all variables for **Production**, **Preview**, and **Development** environments
- Or configure separately for each environment

## Step 4: Configure Stripe Webhook

1. Go to Stripe Dashboard → **Developers** → **Webhooks**
2. Click **Add endpoint**
3. Enter your Vercel URL:
   ```
   https://your-project.vercel.app/api/subscription/webhook
   ```
4. Select events:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
5. Copy the **Webhook signing secret** and add it to Vercel environment variables as `STRIPE_WEBHOOK_SECRET`

## Step 5: Update Supabase Settings

1. Go to Supabase Dashboard → **Settings** → **API**
2. Add your Vercel domain to **Allowed CORS origins**:
   ```
   https://your-project.vercel.app
   ```

## Step 6: Verify Deployment

1. Visit your Vercel deployment URL
2. Test the application:
   - Sign up for an account
   - Check subscription flow
   - Upload a receipt
   - Test export functionality

## Troubleshooting

### Build Errors

- Check build logs in Vercel dashboard
- Ensure all dependencies are in `package.json`
- Verify TypeScript compilation passes locally

### Environment Variables Not Working

- Make sure variables are set for the correct environment (Production/Preview)
- Redeploy after adding new variables
- Check variable names match exactly (case-sensitive)

### Webhook Not Working

- Verify webhook URL is correct in Stripe dashboard
- Check webhook secret matches in Vercel
- View webhook logs in Stripe dashboard

### CORS Errors

- Add Vercel domain to Supabase CORS settings
- Check Supabase RLS policies are correct

## Custom Domain (Optional)

1. In Vercel dashboard, go to **Settings** → **Domains**
2. Add your custom domain
3. Follow DNS configuration instructions
4. Update Stripe webhook URL with new domain
5. Update Supabase CORS settings

## Continuous Deployment

Vercel automatically deploys on every push to your main branch. For other branches, it creates preview deployments.

## Monitoring

- View deployment logs in Vercel dashboard
- Check function logs for API routes
- Monitor Stripe webhook deliveries in Stripe dashboard

