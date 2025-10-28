# Submissions Page Troubleshooting Guide

## What Was Fixed

### 1. **Supabase Initialization Timing Issue**
- Added `ensureSupabase()` function that waits for Supabase admin client to be ready
- Prevents "supabaseAdmin is undefined" errors
- All database queries now wait for proper initialization

### 2. **Duplicate Script Loading**
- Removed duplicate `<script>` tags in submissions.html
- Scripts now load in correct order only once

### 3. **Better Error Handling**
- Added detailed error messages with retry buttons
- Console logging for debugging
- Proper error display for missing tables

## Testing Steps

### Step 1: Test Database Connection
1. Open `admin/test-db-connection.html` in your browser
2. Click **"Check Tables"** button
3. Verify that all required tables exist:
   - ✓ contact_submissions
   - ✓ sample_submissions
   - ✓ newsletter_subscriptions
   - ✓ coas

**If tables are missing**, you need to create them in Supabase dashboard.

### Step 2: Create Database Tables (if needed)

Go to your Supabase dashboard SQL Editor and run:

```sql
-- Contact Submissions Table
CREATE TABLE IF NOT EXISTS contact_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    company TEXT,
    service_type TEXT,
    sample_type TEXT,
    message TEXT,
    status TEXT DEFAULT 'unread',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sample Submissions Table
CREATE TABLE IF NOT EXISTS sample_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    company TEXT,
    sample_type TEXT,
    sample_count INTEGER,
    analysis_requested TEXT,
    rush_service BOOLEAN DEFAULT FALSE,
    shipping_method TEXT,
    message TEXT,
    status TEXT DEFAULT 'unread',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Newsletter Subscriptions Table
CREATE TABLE IF NOT EXISTS newsletter_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    status TEXT DEFAULT 'active',
    source TEXT DEFAULT 'website',
    subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    unsubscribed_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS (Row Level Security)
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE sample_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscriptions ENABLE ROW LEVEL SECURITY;

-- Create policies for service role (admin access)
CREATE POLICY "Service role can do everything on contact_submissions"
ON contact_submissions FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "Service role can do everything on sample_submissions"
ON sample_submissions FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "Service role can do everything on newsletter_subscriptions"
ON newsletter_subscriptions FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Create policies for anon role (public inserts only)
CREATE POLICY "Anyone can insert contact submissions"
ON contact_submissions FOR INSERT
TO anon
WITH CHECK (true);

CREATE POLICY "Anyone can insert sample submissions"
ON sample_submissions FOR INSERT
TO anon
WITH CHECK (true);

CREATE POLICY "Anyone can insert newsletter subscriptions"
ON newsletter_subscriptions FOR INSERT
TO anon
WITH CHECK (true);
```

### Step 3: Test Submissions Page
1. Open `admin/submissions.html`
2. Check browser console (F12) for errors
3. You should see:
   - "Supabase clients initialized successfully"
   - "Loaded contact submissions: X"
   - No errors in red

### Step 4: Create Test Data
1. Use `admin/test-db-connection.html`
2. Click **"Create Test Submission"**
3. Refresh submissions page
4. Test submission should appear

## Common Errors and Solutions

### Error: "Table does not exist"
**Solution:** Run the SQL script above in Supabase SQL Editor

### Error: "Supabase admin client not available"
**Solution:** Check that:
1. `js/supabase-config.js` is loaded before `js/submissions-manager.js`
2. Supabase credentials are correct
3. Wait a few seconds and try refreshing

### Error: "No data displayed but no errors"
**Solution:** 
1. Check Supabase RLS policies (see SQL above)
2. Verify service role key is correct in `supabase-config.js`
3. Submit a test form from the website to create data

### Error: "Permission denied"
**Solution:** 
1. Verify RLS policies are created (see SQL above)
2. Make sure you're using the service role key for admin operations
3. Check that tables have proper policies

## Verifying Everything Works

### Test Form Submission Flow
1. Go to `contact.html` on your website
2. Fill out and submit the contact form
3. Check browser console - should see:
   - "Saving contact submission to database"
   - "Contact submission saved successfully"
4. Go to `admin/submissions.html`
5. Submission should appear in the Contact Forms tab
6. Click "View" to see full details
7. Click "Update" to change status

### Test All Tabs
1. **Contact Forms Tab**: Should show all contact form submissions
2. **Sample Submissions Tab**: Should show sample submission requests
3. **Newsletter Tab**: Should show newsletter subscriptions

### Test Export Features
1. Click "Export Contact Forms" button
2. CSV file should download with all submissions
3. Repeat for other tabs

## File Structure

```
admin/
├── submissions.html          # Main submissions page
├── test-db-connection.html   # Database testing tool
└── js/
    ├── supabase-config.js    # Supabase initialization
    └── submissions-manager.js # Submissions page logic
```

## Debugging Tips

### Check Console Logs
Open browser console (F12) and look for:
- `Supabase clients initialized successfully`
- `Loaded contact submissions: X`
- Any red error messages

### Check Network Tab
1. Open browser DevTools (F12)
2. Go to Network tab
3. Filter by "supabase"
4. Look for failed requests (red)
5. Click on failed requests to see error details

### Check Supabase Dashboard
1. Go to https://supabase.com/dashboard
2. Select your project
3. Go to "Table Editor"
4. Verify tables exist and have data
5. Go to "Authentication" > "Policies"
6. Verify RLS policies are set up

## Next Steps

Once submissions page is working:
1. Test email deliverability (see EMAIL_DELIVERABILITY_GUIDE.md)
2. Configure EmailJS with real credentials
3. Submit real test forms
4. Monitor submissions in admin panel

## Support

If issues persist:
1. Run `test-db-connection.html` and share results
2. Check browser console for specific error messages
3. Verify Supabase project is active
4. Check that service role key has not expired
