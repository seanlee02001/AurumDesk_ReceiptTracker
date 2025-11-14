# Quick Setup Instructions

## ✅ Already Done
- [x] Supabase project created
- [x] Storage bucket "receipts" created

## 🔧 Next Steps

### 1. Run Database Setup SQL

1. Go to your Supabase dashboard: https://supabase.com/dashboard/project/hcixqtluhpeyqfdnrsaq
2. Click on **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy the entire contents of `supabase/complete-setup.sql`
5. Paste it into the SQL Editor
6. Click **Run** (or press Cmd/Ctrl + Enter)

This will:
- Create the `receipts` table
- Set up Row Level Security (RLS) policies
- Create storage policies for the receipts bucket
- Set up automatic timestamp updates

### 2. Verify Setup

After running the SQL:

1. Go to **Table Editor** → You should see the `receipts` table
2. Go to **Storage** → **Policies** for the `receipts` bucket → You should see 3 policies

### 3. Create .env.local File

Create a file named `.env.local` in the project root with:

```env
NEXT_PUBLIC_SUPABASE_URL=https://hcixqtluhpeyqfdnrsaq.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhjaXhxdGx1aHBleXFmZG5yc2FxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMwOTM3MTksImV4cCI6MjA3ODY2OTcxOX0.2u6830rkX9gb6EJebEMOtrcpHSB6thmuu8RijXVUy0s
```

### 4. Install and Run

```bash
npm install
npm run dev
```

### 5. Test the Application

1. Open http://localhost:3000
2. Sign up with a new account
3. Upload a receipt image
4. Verify it appears in the table with filters and export options

## 🎉 You're All Set!

The application is now ready to use with:
- ✅ User authentication
- ✅ Receipt storage in Supabase
- ✅ Table view with filtering
- ✅ Row selection
- ✅ CSV, Excel, and PDF export

