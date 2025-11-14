# GitHub Repository Setup

## Step 1: Create GitHub Repository

1. Go to [github.com](https://github.com) and sign in
2. Click the **+** icon in the top right → **New repository**
3. Repository settings:
   - **Repository name**: `aurumdesk-receipt-tracker` (or your preferred name)
   - **Description**: OCR Receipt Tracker with Supabase and Stripe
   - **Visibility**: Private (recommended) or Public
   - **DO NOT** initialize with README, .gitignore, or license (we already have these)
4. Click **Create repository**

## Step 2: Push Your Code

After creating the repository, GitHub will show you commands. Use these:

```bash
# Add the remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/aurumdesk-receipt-tracker.git

# Or if you prefer SSH:
# git remote add origin git@github.com:YOUR_USERNAME/aurumdesk-receipt-tracker.git

# Push to GitHub
git branch -M main
git push -u origin main
```

## Step 3: Verify

1. Go to your repository on GitHub
2. Verify all files are there
3. Check that `.env.local` is NOT in the repository (it should be in .gitignore)

## Step 4: Connect to Vercel

Now you can connect this GitHub repository to Vercel for automatic deployments!

