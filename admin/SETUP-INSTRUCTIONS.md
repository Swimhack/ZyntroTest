# ZyntroTest COA Dashboard - Supabase Setup Instructions

## 📋 Prerequisites
- Supabase project created and accessible
- Admin access to Supabase dashboard

## 🔧 Database Setup

### Step 1: Create Database Schema
1. Go to your Supabase dashboard: https://app.supabase.com
2. Navigate to **SQL Editor**
3. Copy and paste the contents of `setup-database.sql`
4. Click **Run** to execute the SQL

### Step 2: Verify Database Setup
After running the SQL, verify these items were created:
- ✅ `coas` table with proper columns
- ✅ `public_coas` view for public access
- ✅ `get_coa_by_id()` function for COA search
- ✅ `coa-files` storage bucket
- ✅ Sample data inserted (3 test COAs)

### Step 3: Configure Storage
1. Go to **Storage** in your Supabase dashboard
2. Verify the `coa-files` bucket exists
3. Check that upload policies are configured

## 🚀 Dashboard Usage

### Login Credentials
- **URL**: `admin/index.html`
- **Username**: `drew`
- **Password**: `ZyntroAdmin2025!`

### Features Available
- ✅ **Dashboard Overview**: Statistics and recent activity
- ✅ **Upload COAs**: Drag & drop PDF upload with metadata
- ✅ **Manage COAs**: Search, edit, delete existing COAs
- ✅ **File Storage**: PDFs stored in Supabase Storage
- ✅ **Public Integration**: COAs appear in public search

## 🔍 Testing

### Test COA Search
1. Go to the public COA search: `coa-samples.html`
2. Try searching for these sample COAs:
   - `ZT-2024-001` (BPC-157 - Peptide)
   - `ZT-2024-025` (Pre-Workout - Supplement)
   - `ZT-2024-050` (API Intermediate - Biotech)

### Test Admin Dashboard
1. Login to admin dashboard
2. Upload a new COA with PDF
3. Verify it appears in public search
4. Edit/delete COAs and verify changes

## 📊 Database Structure

### COAs Table Columns
- `id` - Primary key (ZT-YYYY-XXX format)
- `client` - Client company name
- `compound` - Compound/product name
- `analysis_type` - Type of analysis
- `test_date` - Date of testing
- `status` - Complete/Pending/In Progress
- `purity` - Purity percentage (optional)
- `result` - Test result (optional)
- `notes` - Internal notes
- `file_name` - Uploaded PDF filename
- `file_size` - File size in bytes
- `file_url` - Supabase Storage URL
- `created_at` - Creation timestamp
- `updated_at` - Last modified timestamp
- `created_by` - User who created record

## 🔐 Security Features

### Row Level Security (RLS)
- ✅ RLS enabled on `coas` table
- ✅ Service role has full access
- ✅ Public users can only read completed COAs

### Storage Security
- ✅ Private bucket (not publicly accessible)
- ✅ Service role can manage files
- ✅ File type restricted to PDF only
- ✅ File size limit: 10MB

## 🛠️ Troubleshooting

### Common Issues

#### "Database table not found"
- **Solution**: Run the `setup-database.sql` script in Supabase SQL Editor

#### "Storage bucket not found"
- **Solution**: Manually create the `coa-files` bucket in Supabase Storage

#### "Permission denied"
- **Solution**: Check that RLS policies are correctly configured

#### COAs not appearing in public search
- **Solution**: Ensure COA status is set to 'Complete'

### Debug Console
Check browser console (F12) for detailed error messages:
- Supabase connection issues
- Database query errors
- File upload problems

## 📈 Migration from localStorage

The system automatically handles migration from the old localStorage system:
1. Existing localStorage COAs are preserved as fallback
2. New COAs are stored in Supabase
3. Public search checks Supabase first, then localStorage

## 🔄 Backup & Recovery

### Export Data
Use the dashboard's "Export Backup" feature to download JSON backup

### Manual Backup
```sql
-- Export all COAs
SELECT * FROM coas;

-- Export as CSV
COPY coas TO '/path/to/backup.csv' WITH CSV HEADER;
```

## 📞 Support

If you encounter issues:
1. Check the setup instructions above
2. Verify Supabase project is accessible
3. Check browser console for error messages
4. Ensure all SQL scripts ran successfully

## 🔄 Version Information

- **Database Version**: 1.0
- **Dashboard Version**: 2.0 (Supabase)
- **Supabase Client**: 2.39.3
- **Compatible Browsers**: Chrome, Firefox, Safari, Edge