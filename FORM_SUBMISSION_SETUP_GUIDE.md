# Form Submission Setup Guide

## Overview
This guide ensures form submissions are properly saved to the database and viewable in the admin panel.

## Prerequisites
- Supabase project configured
- Anon and Service Role keys added to your application

## Setup Steps

### 1. Database Schema Setup

Run the SQL schema file in your Supabase SQL Editor:

```bash
# File location
admin/setup-form-submissions.sql
```

This creates three tables:
1. **contact_submissions** - Contact form data
2. **sample_submissions** - Sample submission form data  
3. **newsletter_subscriptions** - Newsletter signup data

### 2. Verify RLS Policies

The schema includes Row Level Security (RLS) policies that:
- Allow **public (anon) INSERT** for form submissions from the website
- Allow **service role** full access for the admin panel
- Restrict public reads (except newsletter for unsubscribe links)

### 3. Frontend Configuration

Ensure Supabase is initialized in your HTML pages:

**For public pages (contact.html, sample-submission.html, etc.):**
```html
<script src="https://unpkg.com/@supabase/supabase-js@2.39.3/dist/umd/supabase.js"></script>
<script>
    const supabaseClient = supabase.createClient(
        'YOUR_SUPABASE_URL',
        'YOUR_ANON_KEY'
    );
    window.supabaseClient = supabaseClient;
</script>
<script src="js/email-config.js"></script>
<script src="js/script.js"></script>
```

**For admin pages (admin/submissions.html):**
```html
<script src="https://unpkg.com/@supabase/supabase-js@2"></script>
<script>
    const supabaseUrl = 'YOUR_SUPABASE_URL';
    const supabaseAnonKey = 'YOUR_ANON_KEY';
    const supabaseServiceKey = 'YOUR_SERVICE_KEY';
    
    window.supabaseClient = supabase.createClient(supabaseUrl, supabaseAnonKey);
    window.supabaseAdmin = supabase.createClient(supabaseUrl, supabaseServiceKey);
</script>
<script src="js/submissions-manager.js"></script>
```

## How It Works

### Form Submission Flow

1. **User fills out form** on website (contact.html, sample-submission.html)
2. **JavaScript validates** form data (email-config.js)
3. **Database save** via Supabase client using anon key (email-config.js)
   - `saveContactSubmission()` for contact forms
   - `saveSampleSubmission()` for sample forms
   - `saveNewsletterSubscription()` for newsletter
4. **Email notification** (optional - gracefully fails if not configured)
5. **Success message** shown to user

### Admin Panel Flow

1. **Admin opens** admin/submissions.html
2. **Supabase admin client** (using service role key) queries tables
3. **Submissions displayed** in filterable tables
4. **Admin can:**
   - View full submission details
   - Update status (unread → read → responded → completed)
   - Delete submissions
   - Export to CSV

## Data Flow Diagram

```
┌─────────────────┐
│  Website Form   │
│ (contact.html)  │
└────────┬────────┘
         │
         │ Submit
         ▼
┌─────────────────────────┐
│   Form Validation       │
│   (email-config.js)     │
└────────┬────────────────┘
         │
         │ Valid
         ▼
┌─────────────────────────┐
│  Save to Database       │
│  (supabaseClient)       │
│  Using ANON key         │
└────────┬────────────────┘
         │
         │ Success
         ▼
┌─────────────────────────┐
│  Show Success Message   │
│  + Optional Email       │
└─────────────────────────┘


┌─────────────────────────┐
│  Admin Panel            │
│  (submissions.html)     │
└────────┬────────────────┘
         │
         │ Query
         ▼
┌─────────────────────────┐
│  Read from Database     │
│  (supabaseAdmin)        │
│  Using SERVICE_ROLE key │
└────────┬────────────────┘
         │
         │ Data
         ▼
┌─────────────────────────┐
│  Display Submissions    │
│  View/Update/Delete     │
└─────────────────────────┘
```

## Field Mapping

### Contact Submissions

| Form Field         | Database Column   |
|-------------------|-------------------|
| name              | name              |
| email             | email             |
| phone             | phone             |
| company           | company           |
| services (checked)| service_type      |
| sample-type       | sample_type       |
| message           | message           |
| (auto)            | status            |
| (auto)            | created_at        |

### Sample Submissions

| Form Field         | Database Column      |
|-------------------|---------------------|
| client-name       | client_name         |
| client-email      | email               |
| phone             | phone               |
| company-name      | company             |
| sample-type       | sample_type         |
| num-samples       | sample_count        |
| testing-services  | analysis_requested  |
| turnaround        | rush_service        |
| (auto)            | status              |
| (auto)            | created_at          |

## Testing

### Manual Test

1. **Submit a form:**
   - Go to https://zyntrotest.com/contact.html
   - Fill out the form
   - Submit

2. **Verify in database:**
   - Open Supabase Dashboard
   - Go to Table Editor
   - Check `contact_submissions` table
   - Confirm new row appears

3. **Verify in admin panel:**
   - Go to admin/submissions.html
   - Click "Contact Forms" tab
   - Verify submission appears in table
   - Click "View" to see full details

### Automated Test

Run Playwright tests:
```bash
npx playwright test tests/contact-form.spec.js
```

## Troubleshooting

### Forms not saving to database

**Check:**
1. Supabase client initialized? (Check browser console)
2. Anon key correct in contact.html?
3. RLS policies allow INSERT for anon role?
4. Browser console shows any errors?

**Debug:**
```javascript
// In browser console
console.log('Supabase client:', window.supabaseClient);
console.log('Functions available:', {
    saveContact: typeof window.saveContactSubmission,
    saveSample: typeof window.saveSampleSubmission,
    saveNewsletter: typeof window.saveNewsletterSubscription
});
```

### Admin panel not showing submissions

**Check:**
1. Supabase admin client initialized? (Check console)
2. Service role key correct?
3. RLS policies allow SELECT for service_role?
4. Network tab shows successful queries?

**Debug:**
```javascript
// In browser console on admin page
console.log('Supabase admin:', window.supabaseAdmin);

// Test query
const { data, error } = await window.supabaseAdmin
    .from('contact_submissions')
    .select('*')
    .limit(1);
console.log('Test query:', { data, error });
```

### Common Errors

**Error: "relation does not exist"**
- Solution: Run the SQL schema file in Supabase

**Error: "new row violates row-level security policy"**
- Solution: Check RLS policies allow INSERT for anon role

**Error: "Database connection not available"**
- Solution: Verify Supabase client is initialized before form submission

## Security Best Practices

1. ✅ **RLS Policies** - Tables have RLS enabled
2. ✅ **Input Sanitization** - All inputs sanitized before database save
3. ✅ **Email Validation** - Emails validated with regex
4. ✅ **Separate Keys** - Anon key for public, service role for admin
5. ✅ **HTTPS Only** - Forms only work on HTTPS domains
6. ✅ **Rate Limiting** - Consider adding Supabase rate limits

## Maintenance

### Regular Tasks

- **Monitor submissions** in admin panel weekly
- **Export data** monthly for backup
- **Update status** as submissions are processed
- **Delete test submissions** to keep database clean

### Database Cleanup

```sql
-- Delete old test submissions (older than 30 days with test emails)
DELETE FROM contact_submissions 
WHERE email LIKE '%test%' 
AND created_at < NOW() - INTERVAL '30 days';
```

## Next Steps

1. ✅ Run SQL schema in Supabase
2. ✅ Update Supabase keys in HTML files
3. ✅ Test form submission manually
4. ✅ Test admin panel viewing
5. ✅ Run Playwright tests
6. ⬜ Configure email service (optional)
7. ⬜ Set up monitoring/alerts

## Support

For issues or questions:
- Check browser console for errors
- Review Supabase logs in dashboard
- Test with direct SQL queries
- Verify RLS policies in Supabase

---

**Last Updated:** 2025-01-29
