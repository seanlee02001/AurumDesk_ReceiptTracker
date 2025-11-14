# AurumDesk Receipt Tracker

A modern OCR-powered receipt tracking application built with Next.js, TypeScript, Tesseract.js, and Supabase.

## Features

- 🔐 **User Authentication**: Secure sign up and sign in with Supabase Auth
- 📸 **Upload Receipts**: Drag and drop or click to upload receipt images
- 🔍 **OCR Processing**: Automatically extract text from receipts using Tesseract.js
- 📊 **Smart Parsing**: Automatically extracts merchant name, date, total amount, and items
- 📋 **Table View**: View all receipts in a sortable, filterable table
- ✅ **Row Selection**: Select multiple receipts for bulk operations
- 📥 **Export**: Export receipts to CSV, Excel, or PDF formats
- 🔎 **Advanced Filtering**: Filter by merchant, date, and amount range
- 💾 **Cloud Storage**: All receipts stored securely in Supabase with user isolation
- 🎨 **Modern UI**: Beautiful, responsive interface with dark mode support

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- A Supabase account and project

### Supabase Setup

1. Create a new Supabase project at [supabase.com](https://supabase.com)

2. Run the database migration:
   - Go to your Supabase project dashboard
   - Navigate to SQL Editor
   - Run the SQL from `supabase/migrations/001_create_receipts_table.sql`

3. Set up Storage:
   - Go to Storage in your Supabase dashboard
   - Create a new bucket named `receipts` (make it public)
   - Or run the SQL from `supabase/storage-setup.sql` in the SQL Editor

4. Get your Supabase credentials:
   - Go to Project Settings > API
   - Copy your Project URL and anon/public key

### Installation

1. Clone the repository and install dependencies:
```bash
npm install
```

2. Create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## How It Works

1. **Authentication**: Users sign up/sign in with email and password
2. **Upload**: Upload a receipt image (JPG, PNG, etc.)
3. **OCR**: The app uses Tesseract.js to extract text from the image
4. **Parse**: Smart parsing algorithms extract structured data:
   - Merchant name
   - Date
   - Total amount
   - Individual items (if detected)
5. **Store**: Receipt data and images are stored in Supabase (isolated per user)
6. **View**: Browse receipts in a table with filtering, sorting, and export options

## Project Structure

```
├── app/
│   ├── api/
│   │   └── receipts/        # Receipt CRUD API (Supabase)
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Main page with auth
│   └── globals.css          # Global styles
├── components/
│   ├── Auth.tsx             # Authentication component
│   ├── ReceiptUpload.tsx    # Upload component
│   ├── ReceiptTable.tsx     # Table view with filters and export
│   ├── ReceiptList.tsx      # Grid view (legacy)
│   └── ReceiptCard.tsx      # Individual receipt card
├── lib/
│   ├── supabase/            # Supabase client setup
│   ├── receiptParser.ts     # OCR text parsing logic
│   └── export.ts            # Export functions (CSV, Excel, PDF)
├── types/
│   └── receipt.ts           # TypeScript types
├── supabase/
│   ├── migrations/           # Database migrations
│   └── storage-setup.sql    # Storage bucket setup
└── middleware.ts            # Auth middleware
```

## Technologies

- **Next.js 14**: React framework with App Router
- **TypeScript**: Type safety
- **Supabase**: Backend (Auth, Database, Storage)
- **Tesseract.js**: Client-side OCR processing
- **Tailwind CSS**: Styling
- **Lucide React**: Icons
- **xlsx**: Excel export
- **jspdf**: PDF export

## Database Schema

The `receipts` table includes:
- `id`: UUID primary key
- `user_id`: Foreign key to auth.users (enforces user isolation)
- `image_url`: URL to stored receipt image
- `raw_text`: Extracted OCR text
- `merchant`: Parsed merchant name
- `date`: Parsed receipt date
- `total`: Parsed total amount
- `items`: JSONB array of receipt items
- `created_at`: Timestamp
- `updated_at`: Timestamp

Row Level Security (RLS) ensures users can only access their own receipts.

## Export Features

- **CSV Export**: Comma-separated values format
- **Excel Export**: .xlsx format with formatting
- **PDF Export**: Formatted PDF with table layout

Exports can include all receipts or only selected rows.

## Security

- All API routes are protected by authentication middleware
- Row Level Security (RLS) policies ensure data isolation
- Storage policies restrict access to user's own files
- User authentication handled securely by Supabase

## License

MIT
