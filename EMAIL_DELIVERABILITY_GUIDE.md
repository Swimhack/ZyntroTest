# Email Deliverability Guide for ZyntroTest Contact Forms

## Current Configuration
✅ **Primary Email:** info@zyntrotest.com  
✅ **BCC Email:** james@ekaty.com  
✅ **All contact forms configured to send to these addresses**

---

## Essential Steps for Email Deliverability

### 1. **Domain Authentication (CRITICAL)**
Set up these DNS records for zyntrotest.com:

#### SPF Record
Add TXT record:
```
v=spf1 include:_spf.google.com include:emailjs.com ~all
```
This authorizes EmailJS and Google to send emails on behalf of your domain.

#### DKIM Record
- Configure in EmailJS dashboard under your email service settings
- Also configure in your email provider (Gmail/Google Workspace)

#### DMARC Record
Add TXT record for `_dmarc.zyntrotest.com`:
```
v=DMARC1; p=quarantine; rua=mailto:dmarc-reports@zyntrotest.com; pct=100
```

### 2. **EmailJS Configuration**
Complete these steps in your EmailJS dashboard:

1. **Add Email Service:**
   - Go to Email Services → Add New Service
   - Connect to info@zyntrotest.com (Gmail/Google Workspace)
   - Verify the connection
   - Note the Service ID (replace `service_zyntrotest` in email-config.js)

2. **Update Templates:**
   
   **Contact Template (`template_contact`):**
   ```
   Subject: {{subject}}
   
   To: {{to_email}}
   BCC: {{bcc_email}}
   Reply-To: {{reply_to}}
   
   {{message}}
   ```

   **Newsletter Template (`template_newsletter`):**
   ```
   Subject: {{subject}}
   
   To: {{to_email}}
   BCC: {{bcc_email}}
   
   {{message}}
   ```

3. **Get Public Key:**
   - Go to Account → API Keys
   - Copy your Public Key
   - Update `publicKey` in js/email-config.js

### 3. **Email Provider Setup**

#### If using Gmail/Google Workspace:
1. **Enable "Less Secure App Access"** OR use **App Passwords**
2. **Whitelist EmailJS:** Add EmailJS IPs to trusted senders
3. **Set up Email Forwarding Rules** if needed
4. **Check Gmail Filters** - ensure nothing is auto-filtering

#### If using Microsoft 365/Outlook:
1. Add EmailJS to Safe Senders list
2. Configure SPF to include EmailJS
3. Enable SMTP relay if needed

### 4. **Testing Checklist**

Run these tests after configuration:

- [ ] Submit contact form → Check info@zyntrotest.com inbox
- [ ] Verify BCC arrives at james@ekaty.com
- [ ] Test newsletter signup → Check both inboxes
- [ ] Check spam folders in both accounts
- [ ] Verify Reply-To works (reply to contact form email)
- [ ] Test from different email providers (Gmail, Outlook, Yahoo)
- [ ] Submit test from mobile device

### 5. **Email Deliverability Best Practices**

#### Content Best Practices:
- ✅ Use clear, descriptive subject lines with [ZyntroTest] prefix
- ✅ Include timestamp and source URL in email body
- ✅ Use proper email headers (Reply-To, From, etc.)
- ✅ Avoid spam trigger words in subject/body
- ✅ Keep email size under 100KB

#### Technical Best Practices:
- ✅ Use authenticated domain email (info@zyntrotest.com)
- ✅ Set proper Reply-To headers
- ✅ Include unsubscribe links for newsletters
- ✅ Monitor bounce rates
- ✅ Keep sending frequency consistent

#### Monitoring:
- Check EmailJS dashboard for delivery status
- Monitor bounce rates (should be <5%)
- Set up Google Postmaster Tools for reputation monitoring
- Review spam folder regularly

### 6. **Troubleshooting Common Issues**

#### Emails not arriving:
1. Check EmailJS dashboard for send status
2. Verify Supabase database has the submission
3. Check spam folders
4. Verify DNS records are propagated (use mxtoolbox.com)
5. Check email quotas (EmailJS free tier: 200/month)

#### Emails going to spam:
1. Set up SPF, DKIM, DMARC records
2. Warm up your sending domain gradually
3. Ask recipients to whitelist info@zyntrotest.com
4. Reduce spam trigger words
5. Ensure consistent sending patterns

#### BCC not working:
1. Verify EmailJS template includes `{{bcc_email}}` variable
2. Check email provider allows BCC
3. Test with direct email first, then add BCC

### 7. **Required Updates**

Update these files with your actual EmailJS credentials:

**js/email-config.js:**
```javascript
serviceId: 'YOUR_ACTUAL_SERVICE_ID',
publicKey: 'YOUR_ACTUAL_PUBLIC_KEY',
```

**Environment Variables (if using):**
```
EMAILJS_SERVICE_ID=your_service_id
EMAILJS_PUBLIC_KEY=your_public_key
```

---

## Current Email Flow

```
User submits form
    ↓
1. Save to Supabase database
    ↓
2. Send email via EmailJS
    ↓
   To: info@zyntrotest.com
   BCC: james@ekaty.com
    ↓
3. Show success message
```

---

## Backup Strategy

If EmailJS fails, form data is still saved to Supabase. You can:
1. Access submissions in admin panel (admin/submissions.html)
2. Set up email notifications from Supabase directly
3. Export submissions as CSV

---

## Email Quota Management

**EmailJS Free Tier:**
- 200 emails/month
- 2 email services
- Basic templates

**Upgrade if:**
- Receiving >200 submissions/month
- Need dedicated IP
- Require advanced analytics

---

## Support Contacts

- **EmailJS Support:** https://www.emailjs.com/docs/
- **DNS Management:** Contact your domain registrar
- **Email Provider:** Contact Google Workspace / Microsoft support

---

## Quick DNS Check

Test your email authentication:
```bash
# Check SPF
nslookup -type=txt zyntrotest.com

# Check DMARC
nslookup -type=txt _dmarc.zyntrotest.com

# Check MX records
nslookup -type=mx zyntrotest.com
```

Or use online tools:
- https://mxtoolbox.com/spf.aspx
- https://mxtoolbox.com/dmarc.aspx
- https://www.mail-tester.com/
