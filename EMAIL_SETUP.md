# Email Setup Guide for ZyntroTest

This guide explains how to set up email functionality for the ZyntroTest website using EmailJS.

## EmailJS Setup Steps

### 1. Create EmailJS Account
1. Go to [https://www.emailjs.com/](https://www.emailjs.com/)
2. Sign up for a free account
3. Verify your email address

### 2. Create Email Service
1. In EmailJS dashboard, go to "Email Services"
2. Click "Add New Service"
3. Choose your email provider (Gmail, Outlook, etc.)
4. Follow the setup instructions for your provider
5. Note down the **Service ID**

### 3. Create Email Templates

#### Newsletter Template
1. Go to "Email Templates" in EmailJS dashboard
2. Click "Create New Template"
3. Use this template ID: `template_newsletter`
4. Template content:
```
Subject: New Newsletter Subscription - ZyntroTest

To: {{to_email}}
BCC: {{bcc_email}}

New newsletter subscription from: {{subscriber_email}}

Subscriber has requested to receive LCMS testing insights and technical updates.

Best regards,
ZyntroTest Website
```

#### Contact Form Template
1. Create another template with ID: `template_contact`
2. Template content:
```
Subject: Contact Form Submission - {{from_name}}

To: {{to_email}}
BCC: {{bcc_email}}

Contact Form Submission Details:
Name: {{from_name}}
Email: {{from_email}}
Message: {{message}}

Best regards,
ZyntroTest Website
```

### 4. Get Public Key
1. Go to "Account" in EmailJS dashboard
2. Find your **Public Key** in the API Keys section

### 5. Update Configuration
1. Open `js/email-config.js`
2. Replace the placeholder values:
   - `serviceId: 'service_zyntrotest'` → Your actual service ID
   - `publicKey: 'your_emailjs_public_key_here'` → Your actual public key

### 6. Test Email Functionality
1. Deploy the website
2. Test newsletter subscription on the blog page
3. Test contact form submission on the contact page
4. Check that emails are received at info@zyntrotest.com
5. Verify BCC emails are sent to james@ekaty.com

## Email Addresses Configured
- **Primary**: info@zyntrotest.com
- **BCC**: james@ekaty.com

## Features Implemented
- ✅ Newsletter subscription with email validation
- ✅ Contact form submission with all fields
- ✅ Proper email validation (no false error messages)
- ✅ Loading states during submission
- ✅ Error handling with graceful fallbacks
- ✅ BCC functionality for all emails

## Troubleshooting
- If emails aren't being sent, check the browser console for errors
- Verify EmailJS service and template IDs are correct
- Ensure email service is properly connected in EmailJS dashboard
- Check spam folders for test emails
