// ZyntroTest Website JavaScript
// Enhanced functionality for mobile navigation, form handling, and user interactions

// Footer include functionality
async function loadFooter() {
    try {
        const response = await fetch('includes/footer.html');
        if (response.ok) {
            const footerHTML = await response.text();
            const footerElement = document.querySelector('footer');
            if (footerElement) {
                footerElement.outerHTML = footerHTML;
            }
        }
    } catch (error) {
        console.log('Footer include not available, using static footer');
    }
}

document.addEventListener('DOMContentLoaded', function() {
    // Load footer include
    loadFooter();
    
    // Update copyright year automatically
    const currentYearElements = document.querySelectorAll('#current-year');
    currentYearElements.forEach(element => {
        element.textContent = new Date().getFullYear();
    });
    // Mobile menu toggle functionality
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');
    
    function openMenu() {
        navMenu.classList.add('active');
        navToggle.classList.add('active');
        document.body.classList.add('nav-menu-open');
    }
    
    function closeMenu() {
        navMenu.classList.remove('active');
        navToggle.classList.remove('active');
        document.body.classList.remove('nav-menu-open');
    }
    
    if (navToggle && navMenu) {
        // Toggle menu when hamburger is clicked
        navToggle.addEventListener('click', function() {
            if (navMenu.classList.contains('active')) {
                closeMenu();
            } else {
                openMenu();
            }
        });
        
        // Close menu when clicking on nav links
        const navLinks = navMenu.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                closeMenu();
            });
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', function(e) {
            if (!navToggle.contains(e.target) && !navMenu.contains(e.target)) {
                closeMenu();
            }
        });
        
        // Close menu on escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && navMenu.classList.contains('active')) {
                closeMenu();
            }
        });
    }
    
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const headerOffset = 80;
                const elementPosition = target.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                
                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Header scroll effect
    const header = document.querySelector('.header');
    if (header) {
        window.addEventListener('scroll', function() {
            if (window.scrollY > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        });
    }
    
    // Intersection Observer for animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);
    
    // Observe elements for animation
    const animatedElements = document.querySelectorAll('.service-card, .trust-badge, .testimonial, .coa-preview');
    animatedElements.forEach(el => {
        observer.observe(el);
    });
    
    // Form validation and submission
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        // Skip forms that have their own custom handlers (like COA search)
        if (form.classList.contains('search-form') || form.hasAttribute('onsubmit')) {
            return;
        }
        
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Basic form validation
            const requiredFields = form.querySelectorAll('[required]');
            let isValid = true;
            const errors = [];
            
            requiredFields.forEach(field => {
                const value = field.value.trim();
                const fieldName = field.getAttribute('name') || field.getAttribute('id');
                
                // Remove previous error styling
                field.classList.remove('error');
                
                if (!value) {
                    isValid = false;
                    field.classList.add('error');
                    errors.push(`${fieldName} is required`);
                    return;
                }
                
                // Email validation
                if (field.type === 'email') {
                    if (!isValidEmail(value)) {
                        isValid = false;
                        field.classList.add('error');
                        errors.push('Please enter a valid email address');
                    }
                }
                
                // Phone validation (basic)
                if (field.type === 'tel') {
                    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
                    if (!phoneRegex.test(value.replace(/[\s\-\(\)]/g, ''))) {
                        isValid = false;
                        field.classList.add('error');
                        errors.push('Please enter a valid phone number');
                    }
                }
            });
            
            if (isValid) {
                // Show loading state
                const submitBtn = form.querySelector('button[type="submit"], input[type="submit"]');
                const originalText = submitBtn.textContent;
                submitBtn.disabled = true;
                submitBtn.textContent = 'Submitting...';
                
                try {
                    // Check if this is a contact form
                    if (form.classList.contains('contact-form') || form.classList.contains('inquiry-form')) {
                        // Collect form data
                        const formData = {
                            name: form.querySelector('[name="name"]')?.value || '',
                            email: form.querySelector('[name="email"]')?.value || '',
                            phone: form.querySelector('[name="phone"]')?.value || '',
                            company: form.querySelector('[name="company"]')?.value || '',
                            serviceType: form.querySelector('[name="serviceType"]')?.value || '',
                            sampleType: form.querySelector('[name="sampleType"]')?.value || '',
                            message: form.querySelector('[name="message"]')?.value || ''
                        };
                        
                        // Save to database first
                        console.log('Saving contact submission to database:', formData);
                        try {
                            await saveContactSubmission(formData);
                            console.log('Contact submission saved successfully');
                        } catch (dbError) {
                            console.error('Database save failed, continuing with email:', dbError);
                        }
                        
                        // Then send email
                        await sendContactEmail(formData);
                        showNotification('Thank you! Your inquiry has been saved and sent. We\'ll review your requirements and send you a detailed quote within 24 hours.', 'success');
                    } else {
                        // Generic form submission
                        showNotification('Thank you! Your information has been received. A team member will reach out to you shortly.', 'success');
                    }
                    
                    form.reset();
                } catch (error) {
                    console.error('Form submission error:', error);
                    showNotification('Thank you! Your information has been received. We\'ll contact you soon.', 'success');
                    form.reset();
                } finally {
                    // Reset button state
                    submitBtn.disabled = false;
                    submitBtn.textContent = originalText;
                }
            } else {
                showNotification(errors[0], 'error');
            }
        });
    });
    
    // Newsletter subscription
    const newsletterForms = document.querySelectorAll('.newsletter-form');
    newsletterForms.forEach(form => {
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            const email = form.querySelector('input[type="email"]').value.trim();
            
            // Validate email format
            if (!email || !isValidEmail(email)) {
                showNotification('Please enter a valid email address.', 'error');
                return;
            }
            
            // Show loading state
            const submitBtn = form.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Subscribing...';
            submitBtn.disabled = true;
            
            try {
                // Save to database first
                console.log('Saving newsletter subscription to database:', email);
                let result;
                try {
                    result = await saveNewsletterSubscription(email);
                    console.log('Newsletter subscription saved successfully');
                } catch (dbError) {
                    console.error('Database save failed, continuing with email:', dbError);
                    result = { already_subscribed: false };
                }
                
                if (result.already_subscribed) {
                    showNotification('You are already subscribed!', 'info');
                    return;
                }
                
                // Then send email
                await sendNewsletterEmail(email);
                showNotification('Thank you for subscribing! You\'ll receive LCMS insights and technical updates.', 'success');
                form.reset();
            } catch (error) {
                console.error('Newsletter subscription error:', error);
                showNotification('Error saving subscription. Please try again.', 'error');
            } finally {
                // Reset button state
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        });
    });
    
    // Sample submission form handler
    const sampleForms = document.querySelectorAll('#sample-submission-form');
    sampleForms.forEach(form => {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const submitBtn = form.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.disabled = true;
            submitBtn.textContent = 'Submitting...';
            
            try {
                // Collect form data
                const formData = {
                    client_name: form.querySelector('[name="client-name"]')?.value || '',
                    email: form.querySelector('[name="email"]')?.value || '',
                    phone: form.querySelector('[name="phone"]')?.value || '',
                    company: form.querySelector('[name="company"]')?.value || '',
                    sample_type: form.querySelector('[name="sample-type"]')?.value || '',
                    sample_count: parseInt(form.querySelector('[name="sample-count"]')?.value) || 0,
                    analysis_requested: form.querySelector('[name="analysis-requested"]')?.value || '',
                    rush_service: form.querySelector('[name="rush-service"]')?.checked || false,
                    shipping_method: form.querySelector('[name="shipping-method"]')?.value || '',
                    message: form.querySelector('[name="message"]')?.value || ''
                };
                
                // Save to database first
                console.log('Saving sample submission to database:', formData);
                try {
                    await saveSampleSubmission(formData);
                    console.log('Sample submission saved successfully');
                } catch (dbError) {
                    console.error('Database save failed, continuing with email:', dbError);
                }
                
                // Then send email (reuse contact email function)
                await sendContactEmail({
                    name: formData.client_name,
                    email: formData.email,
                    phone: formData.phone,
                    company: formData.company,
                    serviceType: 'Sample Submission',
                    sampleType: formData.sample_type,
                    message: `Sample Submission Details:\n\nSample Type: ${formData.sample_type}\nSample Count: ${formData.sample_count}\nAnalysis Requested: ${formData.analysis_requested}\nRush Service: ${formData.rush_service ? 'Yes' : 'No'}\nShipping Method: ${formData.shipping_method}\n\nAdditional Message: ${formData.message}`
                });
                
                showNotification('Sample submission received! We\'ll review your requirements and send you a detailed quote within 24 hours.', 'success');
                form.reset();
            } catch (error) {
                console.error('Sample submission error:', error);
                showNotification('Error submitting form. Please try again.', 'error');
            } finally {
                // Reset button state
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
            }
        });
    });
    
    // Contact form handling with enhanced validation
    const contactForms = document.querySelectorAll('.contact-form, .inquiry-form');
    contactForms.forEach(form => {
        const fields = form.querySelectorAll('input, select, textarea');
        
        fields.forEach(field => {
            // Real-time validation feedback
            field.addEventListener('blur', function() {
                validateField(this);
            });
            
            field.addEventListener('input', function() {
                if (this.classList.contains('error')) {
                    validateField(this);
                }
            });
        });
    });
    
    // Sample quantity calculator
    const quantityInputs = document.querySelectorAll('input[name="quantity"]');
    quantityInputs.forEach(input => {
        input.addEventListener('input', function() {
            calculateEstimate();
        });
    });
    
    // Service selection handler
    const serviceCheckboxes = document.querySelectorAll('input[name="services"]');
    serviceCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            calculateEstimate();
            updateServiceDetails();
        });
    });
    
    // Add-on selection handler
    const addonCheckboxes = document.querySelectorAll('input[name="addons"]');
    addonCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            calculateEstimate();
        });
    });
});

// Utility Functions

function validateField(field) {
    const value = field.value.trim();
    const fieldType = field.type;
    const fieldName = field.getAttribute('name') || field.getAttribute('id');
    
    // Remove previous error state
    field.classList.remove('error', 'valid');
    removeFieldError(field);
    
    if (!value && field.hasAttribute('required')) {
        showFieldError(field, `${fieldName} is required`);
        return false;
    }
    
    switch (fieldType) {
        case 'email':
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (value && !emailRegex.test(value)) {
                showFieldError(field, 'Please enter a valid email address');
                return false;
            }
            break;
            
        case 'tel':
            const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
            if (value && !phoneRegex.test(value.replace(/[\s\-\(\)]/g, ''))) {
                showFieldError(field, 'Please enter a valid phone number');
                return false;
            }
            break;
            
        case 'url':
            const urlRegex = /^https?:\/\/.+\..+/;
            if (value && !urlRegex.test(value)) {
                showFieldError(field, 'Please enter a valid URL');
                return false;
            }
            break;
    }
    
    if (value) {
        field.classList.add('valid');
    }
    return true;
}

function showFieldError(field, message) {
    field.classList.add('error');
    
    // Remove existing error message
    removeFieldError(field);
    
    // Create and show error message
    const errorDiv = document.createElement('div');
    errorDiv.className = 'field-error';
    errorDiv.textContent = message;
    
    field.parentNode.appendChild(errorDiv);
}

function removeFieldError(field) {
    const existingError = field.parentNode.querySelector('.field-error');
    if (existingError) {
        existingError.remove();
    }
}

function showNotification(message, type = 'info') {
    // Remove existing notification
    const existing = document.querySelector('.notification');
    if (existing) {
        existing.remove();
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-message">${message}</span>
            <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
        </div>
    `;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 5000);
    
    // Animate in
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
}

function calculateEstimate() {
    const quantityInputs = document.querySelectorAll('input[name="quantity"]');
    const serviceCheckboxes = document.querySelectorAll('input[name="services"]:checked');
    const addonCheckboxes = document.querySelectorAll('input[name="addons"]:checked');
    const estimateDisplay = document.getElementById('cost-estimate');
    
    if (!estimateDisplay) return;
    
    let totalQuantity = 0;
    quantityInputs.forEach(input => {
        totalQuantity += parseInt(input.value) || 0;
    });
    
    // Default to 1 if no quantity specified
    if (totalQuantity === 0) totalQuantity = 1;
    
    let basePrice = 0;
    serviceCheckboxes.forEach(checkbox => {
        const service = checkbox.value;
        switch (service) {
            case 'peptide':
                basePrice += 200;
                break;
            case 'supplement':
                basePrice += 225; // Average of $175-275
                break;
            case 'hemp':
                basePrice += 225; // Average of $150-350
                break;
        }
    });
    
    // Calculate add-ons
    let addonPrice = 0;
    addonCheckboxes.forEach(checkbox => {
        const addon = checkbox.value;
        switch (addon) {
            case 'content':
                addonPrice += 25;
                break;
            case 'endotoxin':
                addonPrice += 250;
                break;
            case 'sterility':
                addonPrice += 300;
                break;
        }
    });
    
    const totalEstimate = (basePrice + addonPrice) * totalQuantity;
    const discountedPrice = totalQuantity >= 5 ? totalEstimate * 0.9 : totalEstimate;
    
    if (basePrice > 0) {
        estimateDisplay.innerHTML = `
            <div class="estimate-breakdown">
                <p><strong>Estimated Cost: $${discountedPrice.toFixed(2)}</strong></p>
                ${totalQuantity >= 5 ? '<p class="discount-note">10% bulk discount applied!</p>' : ''}
                ${addonPrice > 0 ? `<p class="addon-note">Includes $${addonPrice} in add-on services per sample</p>` : ''}
                <p class="estimate-note">*Final pricing subject to sample complexity and additional requirements</p>
            </div>
        `;
    } else {
        estimateDisplay.innerHTML = '';
    }
}

function updateServiceDetails() {
    const serviceCheckboxes = document.querySelectorAll('input[name="services"]:checked');
    const detailsContainer = document.getElementById('service-details');
    
    if (!detailsContainer) return;
    
    const serviceInfo = {
        'peptide': {
            title: 'Peptide Purity Analysis',
            description: 'Verify research-use peptides with 99.9% accuracy using LCMS with DAD.',
            turnaround: '3-5 business days',
            deliverables: ['Purity percentage', 'Mass spectrometry data', 'Chromatogram', 'COA document']
        },
        'supplement': {
            title: 'Supplement Adulterant Screening',
            description: 'Detect contaminants like PDE-5 inhibitors or steroids with advanced LCMS-DAD.',
            turnaround: '5-7 business days',
            deliverables: ['Adulterant screening report', 'Contaminant analysis', 'Safety assessment', 'Regulatory compliance data']
        },
        'hemp': {
            title: 'Cannabis/Hemp Testing (Coming Soon)',
            description: 'Quantify THC/CBD and screen pesticides or mycotoxins in hemp products using LCMS-DAD. Pending TDA registration.',
            turnaround: '5-7 business days (estimated)',
            deliverables: ['Cannabinoid potency profile', 'Pesticide screening', 'Mycotoxin detection', 'State-compliant COA']
        }
    };
    
    let detailsHTML = '';
    serviceCheckboxes.forEach(checkbox => {
        const service = serviceInfo[checkbox.value];
        if (service) {
            detailsHTML += `
                <div class="service-detail">
                    <h4>${service.title}</h4>
                    <p>${service.description}</p>
                    <div class="service-specs">
                        <span class="turnaround"><strong>Turnaround:</strong> ${service.turnaround}</span>
                        <div class="deliverables">
                            <strong>Deliverables:</strong>
                            <ul>
                                ${service.deliverables.map(item => `<li>${item}</li>`).join('')}
                            </ul>
                        </div>
                    </div>
                </div>
            `;
        }
    });
    
    detailsContainer.innerHTML = detailsHTML || '<p>Select services above to see detailed information.</p>';
}

// Enhanced Analytics and Tracking
function trackEvent(action, category = 'User Interaction', label = '') {
    // Google Analytics 4 event tracking
    if (typeof gtag !== 'undefined') {
        gtag('event', action, {
            event_category: category,
            event_label: label,
            value: 1
        });
    }
    
    // Console log for development
    console.log(`Event Tracked: ${category} - ${action} - ${label}`);
}

// Track button clicks
document.addEventListener('click', function(e) {
    const target = e.target;
    
    if (target.classList.contains('btn-primary')) {
        trackEvent('Primary Button Click', 'CTA', target.textContent.trim());
    }
    
    if (target.classList.contains('service-link')) {
        trackEvent('Service Link Click', 'Navigation', target.textContent.trim());
    }
    
    if (target.classList.contains('social-link')) {
        trackEvent('Social Link Click', 'Social Media', target.href);
    }
});

// Performance monitoring
window.addEventListener('load', function() {
    // Track page load time
    const loadTime = window.performance.timing.loadEventEnd - window.performance.timing.navigationStart;
    trackEvent('Page Load Time', 'Performance', `${loadTime}ms`);
    
    // Track largest contentful paint
    if ('LargestContentfulPaint' in window) {
        new PerformanceObserver((entryList) => {
            const entries = entryList.getEntries();
            const lastEntry = entries[entries.length - 1];
            trackEvent('LCP', 'Performance', `${lastEntry.startTime}ms`);
        }).observe({entryTypes: ['largest-contentful-paint']});
    }
});

// Add CSS for notifications and form validation
const style = document.createElement('style');
style.textContent = `
    .notification {
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 10000;
        max-width: 400px;
        background: white;
        border-radius: 8px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
        transform: translateX(100%);
        transition: transform 0.3s ease;
    }
    
    .notification.show {
        transform: translateX(0);
    }
    
    .notification-content {
        padding: 16px 20px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
    }
    
    .notification-success {
        border-left: 4px solid #10b981;
    }
    
    .notification-error {
        border-left: 4px solid #ef4444;
    }
    
    .notification-info {
        border-left: 4px solid #3b82f6;
    }
    
    .notification-message {
        flex: 1;
        font-size: 14px;
        line-height: 1.4;
    }
    
    .notification-close {
        background: none;
        border: none;
        font-size: 20px;
        cursor: pointer;
        color: #6b7280;
        padding: 0;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    
    .notification-close:hover {
        color: #374151;
    }
    
    .field-error {
        color: #ef4444;
        font-size: 12px;
        margin-top: 4px;
        display: block;
    }
    
    .error {
        border-color: #ef4444 !important;
        box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1) !important;
    }
    
    .valid {
        border-color: #10b981 !important;
        box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1) !important;
    }
    
    .animate-in {
        animation: slideInUp 0.6s ease-out forwards;
    }
    
    @keyframes slideInUp {
        from {
            opacity: 0;
            transform: translateY(30px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    .header.scrolled {
        background: rgba(255, 255, 255, 0.98);
        box-shadow: 0 2px 20px rgba(0, 0, 0, 0.1);
    }
    
    .estimate-breakdown {
        background: #f8fafc;
        padding: 16px;
        border-radius: 8px;
        margin-top: 16px;
        border: 1px solid #e2e8f0;
    }
    
    .discount-note {
        color: #10b981;
        font-weight: 600;
        margin: 8px 0;
    }
    
    .addon-note {
        color: #2563eb;
        font-weight: 500;
        margin: 8px 0;
        font-size: 14px;
    }
    
    .estimate-note {
        font-size: 12px;
        color: #6b7280;
        margin: 8px 0 0 0;
    }
    
    .service-detail {
        background: white;
        padding: 20px;
        border-radius: 8px;
        border: 1px solid #e2e8f0;
        margin-bottom: 16px;
    }
    
    .service-detail h4 {
        color: #1f2937;
        margin-bottom: 8px;
    }
    
    .service-specs {
        margin-top: 12px;
        padding-top: 12px;
        border-top: 1px solid #f3f4f6;
    }
    
    .turnaround {
        display: block;
        margin-bottom: 8px;
        font-size: 14px;
    }
    
    .deliverables ul {
        margin: 8px 0 0 20px;
        font-size: 14px;
    }
    
    .deliverables li {
        margin-bottom: 4px;
        color: #6b7280;
    }
    
    /* Body scroll lock for mobile menu */
    body.nav-menu-open {
        overflow: hidden;
        position: fixed;
        width: 100%;
    }
    
    /* Improved hamburger animation */
    .nav-toggle span {
        transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        transform-origin: center;
    }
`;
document.head.appendChild(style);

// PDF Preview Toggle Function for Homepage (removed - now using search page structure)
