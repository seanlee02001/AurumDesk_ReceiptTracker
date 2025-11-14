# Setup Guide

## Quick Start

### 1. Supabase Project Setup

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the project to be fully provisioned (takes a few minutes)

### 2. Database Setup

1. In your Supabase dashboard, go to **SQL Editor**
2. Click **New Query**
3. Copy and paste the contents of `supabase/migrations/001_create_receipts_table.sql`
4. Click **Run** to execute the migration
5. Verify the table was created by going to **Table Editor** - you should see a `receipts` table

### 3. Storage Setup

1. In your Supabase dashboard, go to **Storage**
2. Click **Create a new bucket**
3. Name it `receipts`
4. Make it **Public** (toggle the public switch)
5. Click **Create bucket**

Alternatively, you can run the SQL from `supabase/storage-setup.sql` in the SQL Editor.

### 4. Storage Policies (Important!)

After creating the bucket, you need to set up policies:

1. Go to **Storage** > **Policies** for the `receipts` bucket
2. Click **New Policy**
3. Create policies for:
   - **INSERT**: Users can upload their own receipts
   - **SELECT**: Users can view their own receipts  
   - **DELETE**: Users can delete their own receipts

Or run the SQL from `supabase/storage-setup.sql` which includes all the policies.

### 5. Get API Keys

1. Go to **Project Settings** > **API**
2. Copy:
   - **Project URL** (under Project URL)
   - **anon public** key (under Project API keys)

### 6. Configure Environment Variables

1. Create a `.env.local` file in the project root:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

2. Replace the values with your actual Supabase credentials

### 7. Install and Run

```bash
npm install
npm run dev
```

### 8. Test the Application

1. Open [http://localhost:3000](http://localhost:3000)
2. Sign up with a new account
3. Upload a receipt image
4. Verify the receipt appears in the table
5. Test filtering, sorting, and export features

## Troubleshooting

### "Unauthorized" errors
- Check that your `.env.local` file has the correct Supabase credentials
- Verify the user is logged in

### Images not loading
- Ensure the `receipts` storage bucket is set to **Public**
- Check that storage policies are set up correctly
- Verify the image URL in the database matches the storage bucket path

### Database errors
- Make sure you ran the migration SQL
- Check that Row Level Security (RLS) is enabled on the `receipts` table
- Verify the policies are correctly set up

### Export not working
- Check browser console for errors
- Ensure all dependencies are installed (`xlsx`, `jspdf`, `jspdf-autotable`)

## Production Deployment

For production:

1. Update your Supabase project settings to allow your production domain
2. Set environment variables in your hosting platform (Vercel, Netlify, etc.)
3. Ensure CORS is properly configured in Supabase
4. Consider enabling email confirmation for sign-ups

