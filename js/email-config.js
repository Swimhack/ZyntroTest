// EmailJS Configuration
// This file contains the email service configuration for ZyntroTest

// EmailJS Service Configuration
const EMAIL_CONFIG = {
    // EmailJS Service ID (you'll need to replace this with your actual service ID)
    serviceId: 'service_zyntrotest',
    
    // EmailJS Template IDs
    templates: {
        newsletter: 'template_newsletter',
        contact: 'template_contact'
    },
    
    // EmailJS Public Key (you'll need to replace this with your actual public key)
    publicKey: 'your_emailjs_public_key_here',
    
    // Email addresses
    emails: {
        primary: 'info@zyntrotest.com',
        bcc: 'james@ekaty.com'
    }
};

// Initialize EmailJS
function initEmailJS() {
    if (typeof emailjs !== 'undefined') {
        emailjs.init(EMAIL_CONFIG.publicKey);
        console.log('EmailJS initialized successfully');
        return true;
    } else {
        console.warn('EmailJS not loaded');
        return false;
    }
}

// Email validation function
function isValidEmail(email) {
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    return emailRegex.test(email);
}

// Send newsletter subscription email
async function sendNewsletterEmail(email) {
    if (!initEmailJS()) {
        throw new Error('Email service not available');
    }

    const templateParams = {
        to_email: EMAIL_CONFIG.emails.primary,
        bcc_email: EMAIL_CONFIG.emails.bcc,
        subscriber_email: email,
        subject: 'New Newsletter Subscription - ZyntroTest',
        message: `New newsletter subscription from: ${email}\n\nSubscriber has requested to receive LCMS testing insights and technical updates.`
    };

    try {
        const response = await emailjs.send(
            EMAIL_CONFIG.serviceId,
            EMAIL_CONFIG.templates.newsletter,
            templateParams
        );
        console.log('Newsletter email sent successfully:', response);
        return { success: true, response };
    } catch (error) {
        console.error('Failed to send newsletter email:', error);
        throw error;
    }
}

// Send contact form email
async function sendContactEmail(formData) {
    if (!initEmailJS()) {
        throw new Error('Email service not available');
    }

    const templateParams = {
        to_email: EMAIL_CONFIG.emails.primary,
        bcc_email: EMAIL_CONFIG.emails.bcc,
        from_name: formData.name,
        from_email: formData.email,
        subject: `Contact Form Submission - ${formData.name}`,
        message: `
Name: ${formData.name}
Email: ${formData.email}
Phone: ${formData.phone || 'Not provided'}
Company: ${formData.company || 'Not provided'}
Service Type: ${formData.serviceType || 'Not specified'}
Sample Type: ${formData.sampleType || 'Not specified'}
Message: ${formData.message || 'No additional message'}
        `.trim()
    };

    try {
        const response = await emailjs.send(
            EMAIL_CONFIG.serviceId,
            EMAIL_CONFIG.templates.contact,
            templateParams
        );
        console.log('Contact email sent successfully:', response);
        return { success: true, response };
    } catch (error) {
        console.error('Failed to send contact email:', error);
        throw error;
    }
}

// Make functions globally available
window.EMAIL_CONFIG = EMAIL_CONFIG;
window.initEmailJS = initEmailJS;
window.isValidEmail = isValidEmail;
window.sendNewsletterEmail = sendNewsletterEmail;
window.sendContactEmail = sendContactEmail;
