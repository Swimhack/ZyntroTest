// Resend Email API Handler
// This handles all email sending through Resend
const { Resend } = require('resend');

// Initialize Resend with API key from environment
const resend = new Resend(process.env.RESEND_API_KEY);

// Email configuration
const EMAIL_CONFIG = {
    from: process.env.FROM_EMAIL || 'noreply@zyntrotest.com',
    to: process.env.TO_EMAIL || 'info@zyntrotest.com',
    bcc: process.env.BCC_EMAIL || 'james@ekaty.com'
};

/**
 * Send contact form email
 */
async function sendContactEmail(formData) {
    const emailContent = `
        <h2>New Contact Form Submission</h2>
        <p><strong>From:</strong> ${formData.name}</p>
        <p><strong>Email:</strong> ${formData.email}</p>
        <p><strong>Phone:</strong> ${formData.phone || 'Not provided'}</p>
        <p><strong>Company:</strong> ${formData.company || 'Not provided'}</p>
        <p><strong>Service Type:</strong> ${formData.serviceType || 'Not specified'}</p>
        <p><strong>Sample Type:</strong> ${formData.sampleType || 'Not specified'}</p>
        <p><strong>Message:</strong></p>
        <p>${formData.message || 'No additional message'}</p>
        <hr>
        <p><small>Submitted from: zyntrotest.com/contact.html</small></p>
        <p><small>Timestamp: ${new Date().toISOString()}</small></p>
    `;

    try {
        const data = await resend.emails.send({
            from: EMAIL_CONFIG.from,
            to: EMAIL_CONFIG.to,
            bcc: EMAIL_CONFIG.bcc,
            subject: `[ZyntroTest Contact] ${formData.name} - ${formData.sampleType || 'General Inquiry'}`,
            html: emailContent,
            replyTo: formData.email
        });

        return { success: true, data };
    } catch (error) {
        console.error('Failed to send contact email:', error);
        throw error;
    }
}

/**
 * Send newsletter subscription email
 */
async function sendNewsletterEmail(email) {
    const emailContent = `
        <h2>New Newsletter Subscription</h2>
        <p><strong>Subscriber Email:</strong> ${email}</p>
        <p>New subscriber has requested to receive LCMS testing insights and technical updates.</p>
        <hr>
        <p><small>Timestamp: ${new Date().toISOString()}</small></p>
    `;

    try {
        const data = await resend.emails.send({
            from: EMAIL_CONFIG.from,
            to: EMAIL_CONFIG.to,
            bcc: EMAIL_CONFIG.bcc,
            subject: '[ZyntroTest Newsletter] New Subscription',
            html: emailContent
        });

        return { success: true, data };
    } catch (error) {
        console.error('Failed to send newsletter email:', error);
        throw error;
    }
}

/**
 * Send sample submission email
 */
async function sendSampleSubmissionEmail(formData) {
    const emailContent = `
        <h2>New Sample Submission Request</h2>
        <p><strong>Client Name:</strong> ${formData.client_name}</p>
        <p><strong>Email:</strong> ${formData.email}</p>
        <p><strong>Phone:</strong> ${formData.phone || 'Not provided'}</p>
        <p><strong>Company:</strong> ${formData.company || 'Not provided'}</p>
        <p><strong>Sample Type:</strong> ${formData.sample_type}</p>
        <p><strong>Sample Count:</strong> ${formData.sample_count}</p>
        <p><strong>Analysis Requested:</strong> ${formData.analysis_requested}</p>
        <p><strong>Rush Service:</strong> ${formData.rush_service ? 'Yes' : 'No'}</p>
        <p><strong>Shipping Method:</strong> ${formData.shipping_method || 'Not specified'}</p>
        <p><strong>Sample Description:</strong></p>
        <p>${formData.sample_description || 'Not provided'}</p>
        <p><strong>Special Requirements:</strong></p>
        <p>${formData.special_requirements || 'None'}</p>
        <hr>
        <p><small>Submitted from: zyntrotest.com/sample-submission.html</small></p>
        <p><small>Timestamp: ${new Date().toISOString()}</small></p>
    `;

    try {
        const data = await resend.emails.send({
            from: EMAIL_CONFIG.from,
            to: EMAIL_CONFIG.to,
            bcc: EMAIL_CONFIG.bcc,
            subject: `[ZyntroTest Sample] ${formData.client_name} - ${formData.sample_type}`,
            html: emailContent,
            replyTo: formData.email
        });

        return { success: true, data };
    } catch (error) {
        console.error('Failed to send sample submission email:', error);
        throw error;
    }
}

// Export the API handler
module.exports = async (req, res) => {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { type, data } = req.body;

        let result;
        switch (type) {
            case 'contact':
                result = await sendContactEmail(data);
                break;
            case 'newsletter':
                result = await sendNewsletterEmail(data.email);
                break;
            case 'sample':
                result = await sendSampleSubmissionEmail(data);
                break;
            default:
                return res.status(400).json({ error: 'Invalid email type' });
        }

        res.status(200).json(result);
    } catch (error) {
        console.error('Email API error:', error);
        res.status(500).json({ 
            error: 'Failed to send email',
            message: error.message 
        });
    }
};
