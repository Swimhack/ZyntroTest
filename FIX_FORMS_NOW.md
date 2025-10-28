# 🚨 FIX CONTACT FORMS NOW - 2 MINUTE SETUP

## The Problem
Your contact forms are **coded and ready** but the database tables don't exist yet.

## The Solution (2 minutes)

### Step 1: Run SQL Script
1. Open: https://supabase.com/dashboard/project/hctdzwmlkgnuxcuhjooe/sql
2. Copy **ALL contents** from: `admin/setup-form-submissions.sql`
3. Paste into SQL Editor
4. Click **"Run"**

### Step 2: Verify
1. Open in browser: `verify-database.html`
2. Click "Check Database Tables"
3. Should see ✅ for all 3 tables

## Done!
All forms (contact, sample submission, newsletter) will now save to database automatically.

---

**Forms Already Working:**
- ✅ `contact.html` → saves to `contact_submissions`
- ✅ `sample-submission.html` → saves to `sample_submissions`
- ✅ Newsletter forms → save to `newsletter_subscriptions`

**View Submissions:**
- Admin: `admin/submissions.html`
- Database: https://supabase.com/dashboard/project/hctdzwmlkgnuxcuhjooe/editor

---

For detailed info, see: `FORM_SUBMISSIONS_SETUP.md`
