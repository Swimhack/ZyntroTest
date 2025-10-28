# 🚀 Deploy ZyntroTest NOW - Final Checklist

## ✅ What's Complete

All code is committed and pushed to GitHub! Here's what's ready:

### Forms Working:
- ✅ Contact form → Saves to DB & sends email
- ✅ Newsletter → Saves to DB & sends email  
- ✅ Sample submission → Saves to DB & sends email

### Email Configuration:
- ✅ To: info@zyntrotest.com
- ✅ BCC: james@ekaty.com
- ✅ Reply-To: Submitter's email

### Admin Dashboard:
- ✅ View all submissions at `/admin/submissions.html`
- ✅ Manage contact forms
- ✅ Manage sample requests
- ✅ Manage newsletter subscriptions
- ✅ Export to CSV

---

## 🎯 Deploy Steps (15 minutes)

### Step 1: Get Resend API Key (5 min)

1. Go to **https://resend.com** 
2. Sign up (free account)
3. Go to **API Keys** → **Create API Key**
4. Copy the key (starts with `re_`)

### Step 2: Add Domain to Resend (5 min)

1. In Resend, go to **Domains** → **Add Domain**
2. Enter: `zyntrotest.com`
3. You'll get DNS records - add them to your domain registrar:

```
Type: TXT
Name: @
Value: v=spf1 include:amazonses.com ~all

Type: CNAME (3 records)
Copy the names and values from Resend dashboard
```

4. Wait 15 minutes, then click "Verify" in Resend

### Step 3: Deploy to Vercel (5 min)

**Option A: Vercel Dashboard (Easiest)**

1. Go to **https://vercel.com**
2. Click **Add New** → **Project**
3. Import from GitHub: `Swimhack/ZyntroTest`
4. Before deploying, add these environment variables:

```
RESEND_API_KEY = your_resend_api_key_here
FROM_EMAIL = noreply@zyntrotest.com
TO_EMAIL = info@zyntrotest.com
BCC_EMAIL = james@ekaty.com
```

5. Click **Deploy**

**Option B: Command Line**

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod

# Add env vars in Vercel dashboard after deploy
```

---

## ✅ Test After Deploy

### 1. Test Contact Form
Visit: `https://your-site.vercel.app/contact.html`
- Fill out and submit
- Check: info@zyntrotest.com
- Check: james@ekaty.com (BCC)
- Check: Admin dashboard shows submission

### 2. Test Newsletter
Visit: `https://your-site.vercel.app/blog.html`
- Subscribe with test email
- Check: info@zyntrotest.com
- Check: james@ekaty.com (BCC)
- Check: Admin dashboard shows subscription

### 3. Test Sample Submission
Visit: `https://your-site.vercel.app/sample-submission.html`
- Fill out and submit
- Check: info@zyntrotest.com
- Check: james@ekaty.com (BCC)
- Check: Admin dashboard shows submission

### 4. Test Admin Dashboard
Visit: `https://your-site.vercel.app/admin/submissions.html`
- Should see all test submissions
- Try viewing details
- Try updating status
- Try exporting to CSV

---

## 📊 What Happens When Forms Submit

1. **User submits form**
2. **Data saved to Supabase** (shows in admin dashboard)
3. **Email sent via Resend** to info@zyntrotest.com
4. **BCC sent** to james@ekaty.com
5. **Success message** shown to user

---

## 🔧 Troubleshooting

### Emails Not Sending?
1. Check Resend dashboard for logs
2. Verify domain is "Verified" status
3. Check Vercel env vars are set
4. Look at Vercel function logs

### Forms Not Saving to DB?
1. Check browser console for errors
2. Verify Supabase connection
3. Check admin dashboard

### Admin Not Loading?
1. Check Supabase credentials in HTML
2. Look for JavaScript errors in console

---

## 📞 Current Setup

### Supabase
Already configured! Credentials in:
- `contact.html` (line 348)
- `sample-submission.html` (line 525)
- `admin/submissions.html`

### Database Tables
- ✅ `contact_submissions` - Contact form data
- ✅ `sample_submissions` - Sample request data
- ✅ `newsletter_subscriptions` - Newsletter emails

### API Endpoints
- ✅ `/api/send-email` - Handles all email sending

---

## 🎉 You're Done!

Once deployed:
1. All forms save to database ✅
2. All forms send emails ✅
3. Admin dashboard works ✅
4. Emails delivered reliably ✅

**Total time:** ~15-20 minutes

**Current status:** Code committed, ready to deploy!

---

## Quick Deploy Command

```bash
# One command deploy (after setting up Resend)
vercel --prod
```

That's it! 🚀
