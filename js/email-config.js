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

// Input sanitization function
function sanitizeInput(input) {
    if (!input || typeof input !== 'string') return '';
    
    return input
        .trim()
        .replace(/[<>]/g, '') // Remove potential HTML tags
        .replace(/javascript:/gi, '') // Remove javascript: protocol
        .replace(/on\w+=/gi, '') // Remove event handlers
        .substring(0, 1000); // Limit length to prevent abuse
}

// Phone number validation
function isValidPhone(phone) {
    if (!phone) return true; // Phone is optional
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
}

// Form validation helper
function validateFormData(formData, requiredFields = []) {
    const errors = [];
    
    // Check required fields
    requiredFields.forEach(field => {
        if (!formData[field] || formData[field].toString().trim() === '') {
            errors.push(`${field} is required`);
        }
    });
    
    // Validate email if present
    if (formData.email && !isValidEmail(formData.email)) {
        errors.push('Invalid email format');
    }
    
    // Validate phone if present
    if (formData.phone && !isValidPhone(formData.phone)) {
        errors.push('Invalid phone number format');
    }
    
    return {
        isValid: errors.length === 0,
        errors
    };
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

// Database save functions with enhanced error handling and validation
async function saveContactSubmission(formData) {
    try {
        // Validate required fields
        if (!formData.name || !formData.email) {
            throw new Error('Name and email are required fields');
        }
        
        // Validate email format
        if (!isValidEmail(formData.email)) {
            throw new Error('Invalid email format');
        }
        
        if (!window.supabaseClient) {
            throw new Error('Database connection not available. Please refresh the page and try again.');
        }
        
        // Sanitize and prepare data
        const sanitizedData = {
            name: sanitizeInput(formData.name),
            email: sanitizeInput(formData.email).toLowerCase(),
            phone: sanitizeInput(formData.phone) || null,
            company: sanitizeInput(formData.company) || null,
            service_type: sanitizeInput(formData.serviceType) || null,
            sample_type: sanitizeInput(formData.sampleType) || null,
            message: sanitizeInput(formData.message) || null,
            status: 'unread',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        
        console.log('Saving contact submission:', sanitizedData);
        
        const { data, error } = await window.supabaseClient
            .from('contact_submissions')
            .insert([sanitizedData])
            .select()
            .single();
        
        if (error) {
            console.error('Database error:', error);
            throw new Error(`Database error: ${error.message}`);
        }
        
        console.log('Contact submission saved successfully:', data);
        return { success: true, data };
        
    } catch (error) {
        console.error('Error saving contact submission:', error);
        throw error;
    }
}

async function saveSampleSubmission(formData) {
    try {
        // Validate required fields
        if (!formData.client_name || !formData.email) {
            throw new Error('Client name and email are required fields');
        }
        
        // Validate email format
        if (!isValidEmail(formData.email)) {
            throw new Error('Invalid email format');
        }
        
        if (!window.supabaseClient) {
            throw new Error('Database connection not available. Please refresh the page and try again.');
        }
        
        // Sanitize and prepare data
        const sanitizedData = {
            client_name: sanitizeInput(formData.client_name),
            email: sanitizeInput(formData.email).toLowerCase(),
            phone: sanitizeInput(formData.phone) || null,
            company: sanitizeInput(formData.company) || null,
            sample_type: sanitizeInput(formData.sample_type) || null,
            sample_count: parseInt(formData.sample_count) || 0,
            analysis_requested: sanitizeInput(formData.analysis_requested) || null,
            rush_service: Boolean(formData.rush_service),
            shipping_method: sanitizeInput(formData.shipping_method) || null,
            message: sanitizeInput(formData.message) || null,
            status: 'unread',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        
        console.log('Saving sample submission:', sanitizedData);
        
        const { data, error } = await window.supabaseClient
            .from('sample_submissions')
            .insert([sanitizedData])
            .select()
            .single();
        
        if (error) {
            console.error('Database error:', error);
            throw new Error(`Database error: ${error.message}`);
        }
        
        console.log('Sample submission saved successfully:', data);
        return { success: true, data };
        
    } catch (error) {
        console.error('Error saving sample submission:', error);
        throw error;
    }
}

async function saveNewsletterSubscription(email) {
    try {
        // Validate email format
        if (!isValidEmail(email)) {
            throw new Error('Invalid email format');
        }
        
        if (!window.supabaseClient) {
            throw new Error('Database connection not available. Please refresh the page and try again.');
        }
        
        // Sanitize email
        const sanitizedEmail = sanitizeInput(email).toLowerCase();
        
        console.log('Saving newsletter subscription:', sanitizedEmail);
        
        const { data, error } = await window.supabaseClient
            .from('newsletter_subscriptions')
            .insert([{ 
                email: sanitizedEmail, 
                status: 'active', 
                source: 'website',
                subscribed_at: new Date().toISOString()
            }])
            .select()
            .single();
        
        if (error) {
            if (error.code === '23505') { // Duplicate email
                console.log('Email already subscribed:', sanitizedEmail);
                return { already_subscribed: true };
            }
            console.error('Database error:', error);
            throw new Error(`Database error: ${error.message}`);
        }
        
        console.log('Newsletter subscription saved successfully:', data);
        return { success: true, data };
        
    } catch (error) {
        console.error('Error saving newsletter subscription:', error);
        throw error;
    }
}

// Make functions globally available
window.EMAIL_CONFIG = EMAIL_CONFIG;
window.isValidEmail = isValidEmail;
window.isValidPhone = isValidPhone;
window.sanitizeInput = sanitizeInput;
window.validateFormData = validateFormData;
window.sendNewsletterEmail = sendNewsletterEmail;
window.sendContactEmail = sendContactEmail;
window.sendSampleSubmissionEmail = sendSampleSubmissionEmail;
window.saveContactSubmission = saveContactSubmission;
window.saveSampleSubmission = saveSampleSubmission;
window.saveNewsletterSubscription = saveNewsletterSubscription;
