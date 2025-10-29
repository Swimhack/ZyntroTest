# Form Submission System - Quick Reference

## 🚀 Quick Start

### 1. Run SQL Schema (One-time setup)
```bash
# In Supabase SQL Editor, run:
admin/setup-form-submissions.sql
```

### 2. Verify Setup
```bash
node verify-form-setup.js
```

### 3. Test
```bash
# Manual test
Open https://zyntrotest.com/contact.html → Submit form → Check admin/submissions.html

# Automated test
npx playwright test tests/contact-form.spec.js
```

---

## 📁 File Structure

```
├── admin/
│   ├── setup-form-submissions.sql    # Database schema
│   ├── submissions.html              # Admin panel (view submissions)
│   └── js/
│       └── submissions-manager.js    # Admin panel logic
├── js/
│   ├── email-config.js               # Form save functions + validation
│   └── script.js                     # Form submission handlers
├── contact.html                       # Contact form page
├── tests/
│   └── contact-form.spec.js          # Playwright tests
└── verify-form-setup.js               # Setup verification script
```

---

## 🔑 Key Functions

### Frontend (Public Pages)

**email-config.js:**
- `saveContactSubmission(formData)` - Save contact form to DB
- `saveSampleSubmission(formData)` - Save sample form to DB
- `saveNewsletterSubscription(email)` - Save newsletter signup
- `validateFormData(data, required)` - Validate form data
- `sanitizeInput(input)` - Clean user input

**script.js:**
- Handles form submit events
- Calls save functions
- Shows success/error messages

### Backend (Admin Panel)

**submissions-manager.js:**
- `loadContactSubmissions()` - Load all contact submissions
- `loadSampleSubmissions()` - Load all sample submissions
- `loadNewsletterSubscriptions()` - Load all newsletter signups
- `viewSubmission(type, id)` - Show full submission details
- `updateStatus(type, id, status)` - Update submission status
- `deleteSubmission(type, id)` - Delete a submission
- `exportToCSV(data, filename)` - Export data to CSV

---

## 🗄️ Database Tables

### contact_submissions
```sql
id UUID PRIMARY KEY
name TEXT NOT NULL
email TEXT NOT NULL
phone TEXT
company TEXT
service_type TEXT
sample_type TEXT
message TEXT
status TEXT DEFAULT 'unread'
created_at TIMESTAMP
updated_at TIMESTAMP
```

### sample_submissions
```sql
id UUID PRIMARY KEY
client_name TEXT NOT NULL
email TEXT NOT NULL
phone TEXT
company TEXT
sample_type TEXT
sample_count INTEGER
analysis_requested TEXT
rush_service BOOLEAN
shipping_method TEXT
message TEXT
status TEXT DEFAULT 'unread'
created_at TIMESTAMP
updated_at TIMESTAMP
```

### newsletter_subscriptions
```sql
id UUID PRIMARY KEY
email TEXT NOT NULL UNIQUE
status TEXT DEFAULT 'active'
subscribed_at TIMESTAMP
unsubscribed_at TIMESTAMP
source TEXT DEFAULT 'website'
```

---

## 🔒 Security Setup

### RLS Policies Required

**For Public (anon role):**
```sql
-- Allow form submissions from website
CREATE POLICY "Allow public insert contact submissions"
ON contact_submissions FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public insert sample submissions"
ON sample_submissions FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public insert newsletter subscriptions"
ON newsletter_subscriptions FOR INSERT WITH CHECK (true);
```

**For Admin (service_role):**
```sql
-- Allow admin to manage all data
CREATE POLICY "Allow service role to manage contact submissions"
ON contact_submissions FOR ALL USING (true);

CREATE POLICY "Allow service role to manage sample submissions"
ON sample_submissions FOR ALL USING (true);

CREATE POLICY "Allow service role to manage newsletter subscriptions"
ON newsletter_subscriptions FOR ALL USING (true);
```

---

## 🐛 Common Issues & Fixes

| Issue | Cause | Fix |
|-------|-------|-----|
| Forms not saving | Tables don't exist | Run SQL schema in Supabase |
| "Permission denied" error | Missing RLS policy | Check anon role has INSERT permission |
| Admin panel empty | Wrong service key | Verify service_role key in admin page |
| Checkbox test failing | Hidden inputs | Use `.getByText()` instead of `.check()` |
| Database connection failed | Wrong URL/key | Check Supabase credentials in HTML |

---

## 🔍 Debugging Commands

### Browser Console (Public Page)
```javascript
// Check if Supabase initialized
window.supabaseClient

// Check if save functions available
typeof window.saveContactSubmission

// Test database save
await window.saveContactSubmission({
    name: 'Test',
    email: 'test@example.com',
    serviceType: 'peptide',
    sampleType: 'peptide'
})
```

### Browser Console (Admin Panel)
```javascript
// Check admin client
window.supabaseAdmin

// Test query
const { data, error } = await window.supabaseAdmin
    .from('contact_submissions')
    .select('*')
    .limit(5);
console.log({ data, error });

// Test insert permission
const { data, error } = await window.supabaseClient
    .from('contact_submissions')
    .insert([{
        name: 'Test',
        email: 'test@test.com',
        status: 'unread',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    }]);
console.log({ data, error });
```

### Supabase SQL Query
```sql
-- Check if tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE '%submissions%';

-- Check RLS policies
SELECT tablename, policyname, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('contact_submissions', 'sample_submissions', 'newsletter_subscriptions');

-- View recent submissions
SELECT id, name, email, status, created_at 
FROM contact_submissions 
ORDER BY created_at DESC 
LIMIT 10;
```

---

## 📊 Status Values

### Contact & Sample Submissions
- `unread` - New submission
- `read` - Viewed by admin
- `responded` - Email sent to customer
- `completed` - Request fulfilled
- `in_progress` - Sample being processed (samples only)

### Newsletter
- `active` - Subscribed
- `unsubscribed` - Opted out

---

## ✅ Verification Checklist

- [ ] SQL schema run in Supabase
- [ ] Tables created: contact_submissions, sample_submissions, newsletter_subscriptions
- [ ] RLS policies configured (public INSERT, service_role ALL)
- [ ] Supabase client initialized in contact.html
- [ ] Admin client initialized in admin/submissions.html
- [ ] Test form submission saves to database
- [ ] Test admin panel displays submissions
- [ ] Playwright tests pass
- [ ] Verification script passes: `node verify-form-setup.js`

---

## 📞 Support

**Check in order:**
1. Browser console for errors
2. Supabase logs in dashboard
3. Network tab for API requests
4. RLS policies in Supabase
5. Run `node verify-form-setup.js`

**Common Commands:**
```bash
# Verify setup
node verify-form-setup.js

# Run tests
npx playwright test

# Run specific test
npx playwright test tests/contact-form.spec.js

# Run tests in UI mode (visual debugging)
npx playwright test --ui
```
