# Resend Email Setup Guide for ZyntroTest

This guide walks you through setting up Resend for reliable email delivery across all contact forms on the ZyntroTest website.

## Overview

All contact forms now use **Resend** for email delivery:
- Contact form (`contact.html`)
- Newsletter subscription (`blog.html` and other pages)
- Sample submission form (`sample-submission.html`)

**Email Configuration:**
- **To:** info@zyntrotest.com
- **BCC:** james@ekaty.com
- **From:** noreply@zyntrotest.com

## Prerequisites

1. A Resend account (sign up at https://resend.com)
2. A verified domain (zyntrotest.com)
3. Node.js deployment environment (Vercel recommended)

## Setup Steps

### 1. Create Resend Account

1. Go to [https://resend.com](https://resend.com)
2. Sign up for a free account
3. Verify your email address

### 2. Verify Your Domain

1. In Resend dashboard, go to **Domains**
2. Click **Add Domain**
3. Enter `zyntrotest.com`
4. Add the provided DNS records to your domain:
   - **SPF Record** (TXT): `v=spf1 include:amazonses.com ~all`
   - **DKIM Records** (TXT): Three CNAME records provided by Resend
   - **DMARC Record** (TXT): `v=DMARC1; p=none;`

5. Wait for DNS propagation (usually 15-30 minutes)
6. Verify the domain in Resend dashboard

### 3. Get Your API Key

1. In Resend dashboard, go to **API Keys**
2. Click **Create API Key**
3. Give it a name (e.g., "ZyntroTest Production")
4. Select **Full Access** permissions
5. Copy the API key (starts with `re_`)
6. Store it securely - you won't see it again!

### 4. Configure Environment Variables

#### For Local Development:
1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and add your Resend API key:
   ```env
   RESEND_API_KEY=re_your_actual_api_key_here
   FROM_EMAIL=noreply@zyntrotest.com
   TO_EMAIL=info@zyntrotest.com
   BCC_EMAIL=james@ekaty.com
   ```

#### For Production (Vercel):
1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add these variables:
   - `RESEND_API_KEY`: Your Resend API key
   - `FROM_EMAIL`: `noreply@zyntrotest.com`
   - `TO_EMAIL`: `info@zyntrotest.com`
   - `BCC_EMAIL`: `james@ekaty.com`

### 5. Deploy to Production

#### Using Vercel (Recommended):

1. Install Vercel CLI (if not already installed):
   ```bash
   npm i -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Deploy:
   ```bash
   vercel --prod
   ```

4. Ensure environment variables are set in Vercel dashboard

#### Using Other Platforms:

If deploying to another platform (Netlify, AWS, etc.), ensure:
- The `api/send-email.js` file is configured as a serverless function
- Environment variables are set
- The API endpoint `/api/send-email` is accessible

### 6. Test Email Functionality

1. Test Contact Form:
   - Go to `https://zyntrotest.com/contact.html`
   - Fill out and submit the form
   - Check that email arrives at info@zyntrotest.com
   - Verify BCC copy arrives at james@ekaty.com

2. Test Newsletter Subscription:
   - Go to `https://zyntrotest.com/blog.html`
   - Enter an email in the newsletter form
   - Submit and verify email delivery

3. Test Sample Submission:
   - Go to `https://zyntrotest.com/sample-submission.html`
   - Fill out the sample submission form
   - Verify email delivery with all form details

## Email Templates

All emails are sent as HTML with the following structure:

### Contact Form Email:
- Subject: `[ZyntroTest Contact] {Name} - {Sample Type}`
- Includes: Name, Email, Phone, Company, Service Type, Sample Type, Message
- Reply-To set to submitter's email

### Newsletter Email:
- Subject: `[ZyntroTest Newsletter] New Subscription`
- Includes: Subscriber email, timestamp

### Sample Submission Email:
- Subject: `[ZyntroTest Sample] {Client Name} - {Sample Type}`
- Includes: All sample submission details
- Reply-To set to submitter's email

## Troubleshooting

### Emails Not Sending

1. **Check API Key**: Ensure your Resend API key is correct and has full access
2. **Verify Domain**: Make sure zyntrotest.com is fully verified in Resend
3. **Check DNS**: Verify all DNS records are properly configured
4. **Check Logs**: View Resend logs in dashboard for detailed error messages
5. **Environment Variables**: Ensure all env vars are set correctly in production

### Emails Going to Spam

1. **SPF/DKIM**: Verify SPF and DKIM records are set up correctly
2. **DMARC**: Add a DMARC policy to improve deliverability
3. **Content**: Ensure email content doesn't trigger spam filters
4. **Warm Up**: Send gradually increasing volumes to build reputation

### BCC Not Working

1. Verify `BCC_EMAIL` environment variable is set
2. Check Resend dashboard logs to confirm BCC is included
3. Check spam folder for james@ekaty.com

## Monitoring

Monitor email delivery in the Resend dashboard:
- **Logs**: View all sent emails and their status
- **Analytics**: Track delivery rates, opens, clicks
- **Webhooks**: Set up webhooks for delivery events (optional)

## Rate Limits

Resend Free Tier:
- 100 emails/day
- 3,000 emails/month

For higher volume, upgrade to a paid plan.

## Security Best Practices

1. **Never commit `.env` file** - It's already in `.gitignore`
2. **Rotate API keys regularly** - Generate new keys periodically
3. **Use environment variables** - Never hardcode API keys
4. **Monitor usage** - Watch for unusual activity in Resend dashboard
5. **Validate inputs** - Form validation prevents malicious submissions

## Support

- **Resend Documentation**: https://resend.com/docs
- **Resend Support**: support@resend.com
- **GitHub Issues**: For code-related issues

## Files Modified

- `js/email-config.js` - Updated to use Resend API
- `api/send-email.js` - New serverless function for email sending
- `.env` - Environment variables (not committed)
- `vercel.json` - Deployment configuration
- `package.json` - Added `resend` dependency

## Migration from EmailJS

All EmailJS code has been replaced with Resend. The old configuration is no longer needed:
- Removed EmailJS script tags from HTML files
- Replaced EmailJS functions with Resend API calls
- Updated all form handlers to use new email functions

No changes needed to HTML files - all forms work the same way from the user's perspective.

---

**Setup complete!** All forms now deliver emails reliably to info@zyntrotest.com with BCC to james@ekaty.com.
