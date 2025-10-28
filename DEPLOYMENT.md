# Deployment Guide for ZyntroTest with Resend

## Quick Deployment to Vercel

### Step 1: Get Resend API Key

1. Go to [https://resend.com](https://resend.com) and sign up/login
2. Navigate to **API Keys** section
3. Click **Create API Key**
4. Name it "ZyntroTest Production"
5. Copy the API key (starts with `re_`)

### Step 2: Verify Domain in Resend

1. In Resend dashboard, go to **Domains**
2. Click **Add Domain** and enter `zyntrotest.com`
3. Add the DNS records provided by Resend to your domain registrar:
   - SPF Record (TXT)
   - DKIM Records (3 CNAME records)
   - DMARC Record (TXT)
4. Wait for verification (15-30 minutes)

### Step 3: Deploy to Vercel

#### Option A: Using Vercel Dashboard (Easiest)

1. Go to [https://vercel.com](https://vercel.com)
2. Click **Add New** → **Project**
3. Import your GitHub repository (or upload files)
4. Before deploying, add environment variables:
   - `RESEND_API_KEY`: Your Resend API key
   - `FROM_EMAIL`: `noreply@zyntrotest.com`
   - `TO_EMAIL`: `info@zyntrotest.com`
   - `BCC_EMAIL`: `james@ekaty.com`
5. Click **Deploy**

#### Option B: Using Vercel CLI

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Deploy:
   ```bash
   npm run deploy
   ```

4. Add environment variables via CLI:
   ```bash
   vercel env add RESEND_API_KEY production
   vercel env add FROM_EMAIL production
   vercel env add TO_EMAIL production
   vercel env add BCC_EMAIL production
   ```

### Step 4: Test the Deployment

1. **Test Contact Form:**
   - Visit `https://your-domain.vercel.app/contact.html`
   - Submit a test inquiry
   - Check info@zyntrotest.com for the email
   - Verify james@ekaty.com received BCC

2. **Test Newsletter:**
   - Visit `https://your-domain.vercel.app/blog.html`
   - Subscribe with a test email
   - Verify email delivery

3. **Test Sample Submission:**
   - Visit `https://your-domain.vercel.app/sample-submission.html`
   - Submit a test sample request
   - Verify email delivery

### Step 5: Configure Custom Domain (Optional)

1. In Vercel dashboard, go to your project
2. Click **Settings** → **Domains**
3. Add `zyntrotest.com` and `www.zyntrotest.com`
4. Update DNS records as instructed by Vercel

## Alternative: Deploy to Netlify

### Netlify Configuration

1. Create `netlify.toml` in project root:
   ```toml
   [build]
     functions = "api"
   
   [functions]
     node_bundler = "esbuild"
   ```

2. Deploy to Netlify:
   ```bash
   npm i -g netlify-cli
   netlify login
   netlify deploy --prod
   ```

3. Add environment variables in Netlify dashboard

## Monitoring

After deployment, monitor:
- Resend dashboard for email logs
- Vercel/Netlify logs for function errors
- Test forms regularly to ensure functionality

## Rollback

If issues occur:
```bash
vercel rollback
```

Or use Vercel dashboard to rollback to a previous deployment.

## Support

- **Resend Issues**: Check [https://resend.com/docs](https://resend.com/docs)
- **Vercel Issues**: Check [https://vercel.com/docs](https://vercel.com/docs)
- **Form Issues**: Check browser console and network tab

---

**Deployment complete!** Your contact forms now send emails via Resend to info@zyntrotest.com with BCC to james@ekaty.com.
