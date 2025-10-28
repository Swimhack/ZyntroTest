// Resend Email Configuration
// This file contains the email service configuration for ZyntroTest using Resend

// Email Configuration
const EMAIL_CONFIG = {
    // API endpoint for email sending
    apiEndpoint: '/api/send-email',
    
    // Email addresses
    emails: {
        primary: 'info@zyntrotest.com',
        from: 'noreply@zyntrotest.com',
        bcc: 'james@ekaty.com'
    }
};

// Send email via Resend API
async function sendEmailViaAPI(type, data) {
    const response = await fetch(EMAIL_CONFIG.apiEndpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ type, data })
    });
    
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to send email');
    }
    
    return await response.json();
}

// Email validation function
function isValidEmail(email) {
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    return emailRegex.test(email);
}

// Send newsletter subscription email
async function sendNewsletterEmail(email) {
    try {
        const response = await sendEmailViaAPI('newsletter', { email });
        console.log('Newsletter email sent successfully:', response);
        return { success: true, response };
    } catch (error) {
        console.error('Failed to send newsletter email:', error);
        throw error;
    }
}

// Send contact form email
async function sendContactEmail(formData) {
    try {
        const response = await sendEmailViaAPI('contact', formData);
        console.log('Contact email sent successfully:', response);
        return { success: true, response };
    } catch (error) {
        console.error('Failed to send contact email:', error);
        throw error;
    }
}

// Send sample submission email
async function sendSampleSubmissionEmail(formData) {
    try {
        const response = await sendEmailViaAPI('sample', formData);
        console.log('Sample submission email sent successfully:', response);
        return { success: true, response };
    } catch (error) {
        console.error('Failed to send sample submission email:', error);
        throw error;
    }
}

// Database save functions
async function saveContactSubmission(formData) {
    if (!window.supabaseClient) {
        throw new Error('Supabase client not initialized');
    }
    
    const { data, error } = await window.supabaseClient
        .from('contact_submissions')
        .insert([{
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            company: formData.company,
            service_type: formData.serviceType,
            sample_type: formData.sampleType,
            message: formData.message,
            status: 'unread'
        }]);
    
    if (error) throw error;
    return data;
}

async function saveSampleSubmission(formData) {
    if (!window.supabaseClient) {
        throw new Error('Supabase client not initialized');
    }
    
    const { data, error } = await window.supabaseClient
        .from('sample_submissions')
        .insert([{
            client_name: formData.client_name,
            email: formData.email,
            phone: formData.phone,
            company: formData.company,
            sample_type: formData.sample_type,
            sample_count: formData.sample_count,
            analysis_requested: formData.analysis_requested,
            rush_service: formData.rush_service,
            shipping_method: formData.shipping_method,
            message: formData.message,
            status: 'unread'
        }]);
    
    if (error) throw error;
    return data;
}

async function saveNewsletterSubscription(email) {
    if (!window.supabaseClient) {
        throw new Error('Supabase client not initialized');
    }
    
    const { data, error } = await window.supabaseClient
        .from('newsletter_subscriptions')
        .insert([{ email, status: 'active', source: 'website' }])
        .select();
    
    if (error) {
        if (error.code === '23505') { // Duplicate email
            return { already_subscribed: true };
        }
        throw error;
    }
    return data;
}

// Make functions globally available
window.EMAIL_CONFIG = EMAIL_CONFIG;
window.isValidEmail = isValidEmail;
window.sendNewsletterEmail = sendNewsletterEmail;
window.sendContactEmail = sendContactEmail;
window.sendSampleSubmissionEmail = sendSampleSubmissionEmail;
window.saveContactSubmission = saveContactSubmission;
window.saveSampleSubmission = saveSampleSubmission;
window.saveNewsletterSubscription = saveNewsletterSubscription;
