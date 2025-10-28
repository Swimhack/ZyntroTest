# 🚀 Quick Start - Deploy ZyntroTest with Resend

## What's Been Done ✅

All contact forms are now configured to use Resend for email delivery:
- Contact form → info@zyntrotest.com (BCC: james@ekaty.com)
- Newsletter → info@zyntrotest.com (BCC: james@ekaty.com)  
- Sample submission → info@zyntrotest.com (BCC: james@ekaty.com)

## Deploy in 5 Steps

### Step 1: Get Resend API Key (5 minutes)

1. Go to **https://resend.com** and sign up
2. Click **API Keys** → **Create API Key**
3. Name it "ZyntroTest" and click create
4. **Copy the API key** (starts with `re_`)
5. Save it somewhere safe!

### Step 2: Add Domain to Resend (10 minutes)

1. In Resend, click **Domains** → **Add Domain**
2. Enter `zyntrotest.com`
3. You'll get DNS records to add. Add these to your domain registrar:

**DNS Records to Add:**
```
Type: TXT
Name: @
Value: v=spf1 include:amazonses.com ~all

Type: CNAME (3 records - copy from Resend)
Names: Will be shown in Resend dashboard
Values: Will be shown in Resend dashboard
```

4. Wait 15-30 minutes for DNS propagation
5. Click "Verify Domain" in Resend

### Step 3: Set Up Environment Variables

Update your `.env` file with your Resend API key:

```bash
RESEND_API_KEY=re_your_actual_api_key_here
FROM_EMAIL=noreply@zyntrotest.com
TO_EMAIL=info@zyntrotest.com
BCC_EMAIL=james@ekaty.com
```

### Step 4: Commit Your Changes

```bash
# Add all new files
git add .

# Commit changes
git commit -m "Add Resend email integration for all contact forms"

# Push to GitHub
git push origin main
```

### Step 5: Deploy to Vercel

**Option A: Via Vercel Dashboard (Easiest)**

1. Go to **https://vercel.com** and sign in
2. Click **Add New** → **Project**
3. Import your GitHub repository
4. Before deploying, add environment variables:
   - `RESEND_API_KEY`: Your Resend API key
   - `FROM_EMAIL`: noreply@zyntrotest.com
   - `TO_EMAIL`: info@zyntrotest.com
   - `BCC_EMAIL`: james@ekaty.com
5. Click **Deploy**
6. Wait 2-3 minutes for deployment

**Option B: Via Command Line**

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
npm run deploy

# Add environment variables
vercel env add RESEND_API_KEY production
vercel env add FROM_EMAIL production
vercel env add TO_EMAIL production
vercel env add BCC_EMAIL production
```

## Test Your Deployment ✅

After deployment, test all forms:

### 1. Test Contact Form
- Visit your site: `https://your-site.vercel.app/contact.html`
- Fill out the form with test data
- Submit
- **Check:** Email at info@zyntrotest.com
- **Check:** BCC at james@ekaty.com

### 2. Test Newsletter
- Visit: `https://your-site.vercel.app/blog.html`
- Enter a test email
- Subscribe
- **Check:** Email at info@zyntrotest.com
- **Check:** BCC at james@ekaty.com

### 3. Test Sample Submission
- Visit: `https://your-site.vercel.app/sample-submission.html`
- Fill out sample request
- Submit
- **Check:** Email at info@zyntrotest.com
- **Check:** BCC at james@ekaty.com

## Troubleshooting 🔧

### Emails Not Arriving?

1. **Check Resend Dashboard** - Go to Logs section
2. **Verify Domain** - Make sure zyntrotest.com shows "Verified"
3. **Check Spam Folders** - Look in spam for both email addresses
4. **Verify API Key** - Make sure it's correct in Vercel env vars

### Still Having Issues?

1. Check Vercel function logs: `vercel logs`
2. Review Resend documentation: https://resend.com/docs
3. Check browser console for JavaScript errors

## What Changed?

### New Files Created:
- `api/send-email.js` - Email sending API
- `.env` - Your environment variables
- `vercel.json` - Deployment configuration
- Documentation files (this file and others)

### Modified Files:
- `js/email-config.js` - Now uses Resend instead of EmailJS
- `package.json` - Added resend dependency

### No Changes to HTML Files!
All your existing forms work without any HTML modifications.

## Next Steps After Deployment

1. ✅ Test all forms thoroughly
2. ✅ Monitor Resend dashboard for delivery
3. ✅ Add custom domain in Vercel (optional)
4. ✅ Set up monitoring alerts (optional)

## Need Help?

- **Full Setup Guide**: See `RESEND_SETUP_GUIDE.md`
- **Deployment Guide**: See `DEPLOYMENT.md`
- **Summary**: See `RESEND_MIGRATION_SUMMARY.md`
- **Resend Docs**: https://resend.com/docs
- **Vercel Docs**: https://vercel.com/docs

---

## Summary

✅ Resend package installed  
✅ Email API created  
✅ Forms configured  
✅ Documentation complete  
⏳ Ready to deploy!

**Time to deploy: ~20 minutes total**

Just follow the 5 steps above and you'll be live! 🚀
