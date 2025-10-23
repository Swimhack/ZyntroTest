# ZyntroTest Component Library

Standard UI components used across ZyntroTest.com with implementation examples.

## Navigation Components

### Header with Fixed Navigation

```html
<header class="header">
    <nav class="nav">
        <div class="container">
            <a href="/" class="nav-brand">ZyntroTest</a>
            <button class="nav-toggle" id="nav-toggle" aria-label="Toggle navigation">
                <span></span>
                <span></span>
                <span></span>
            </button>
            <div class="nav-menu" id="nav-menu">
                <a href="/" class="nav-link">Home</a>
                <a href="/services.html" class="nav-link">Services</a>
                <a href="/search.html" class="nav-link">Search COAs</a>
                <a href="/contact.html" class="nav-link">Contact</a>
            </div>
        </div>
    </nav>
</header>
```

**Features:**
- Fixed position at top
- Mobile hamburger menu
- Backdrop blur effect
- Smooth transitions

## Button Components

### Primary Button (CTA)
```html
<a href="#" class="btn btn-primary">Get Started</a>
```

**Usage:** Main calls-to-action, form submissions, primary actions

### Secondary Button
```html
<a href="#" class="btn btn-secondary">Learn More</a>
```

**Usage:** Secondary actions, alternative options

### Outline Button
```html
<a href="#" class="btn btn-outline">View Details</a>
```

**Usage:** Tertiary actions, less prominent CTAs

### Button Sizes
```html
<button class="btn btn-primary btn-sm">Small</button>
<button class="btn btn-primary">Default</button>
<button class="btn btn-primary btn-lg">Large</button>
```

## Card Components

### Service Card

```html
<div class="service-card">
    <div class="service-icon">🔬</div>
    <h3>Peptide Purity Analysis</h3>
    <p>High-accuracy LCMS testing for research-use peptides with 99.9% precision.</p>
    <ul class="service-features">
        <li>✓ 99.9% accuracy with LCMS-DAD</li>
        <li>✓ 3-5 business day turnaround</li>
        <li>✓ Detailed COA with chromatogram</li>
    </ul>
    <div class="service-price">Starting at $200/sample</div>
    <a href="#" class="btn btn-primary">Request Analysis</a>
</div>
```

**Usage:** Displaying services, pricing packages, features

### Feature Card

```html
<div class="feature-card">
    <div class="feature-icon">📊</div>
    <h3>Feature Title</h3>
    <p>Feature description highlighting the benefit to customers.</p>
</div>
```

**Usage:** Highlighting features, benefits, capabilities

### Testimonial Card

```html
<div class="testimonial">
    <div class="testimonial-content">
        <p>"Excellent service and fast turnaround. The detailed COAs gave us complete confidence in our product quality."</p>
    </div>
    <div class="testimonial-author">
        <strong>Dr. Sarah Johnson</strong>
        <span>CEO, BioVenture Research</span>
    </div>
</div>
```

**Usage:** Customer testimonials, reviews, social proof

## Form Components

### Contact/Inquiry Form

```html
<form class="contact-form" id="contact-form">
    <div class="form-group">
        <label for="name">Full Name *</label>
        <input type="text" id="name" name="name" required>
    </div>

    <div class="form-group">
        <label for="email">Email Address *</label>
        <input type="email" id="email" name="email" required>
    </div>

    <div class="form-group">
        <label for="phone">Phone Number</label>
        <input type="tel" id="phone" name="phone">
    </div>

    <div class="form-group">
        <label for="message">Message *</label>
        <textarea id="message" name="message" rows="5" required></textarea>
    </div>

    <button type="submit" class="btn btn-primary">Send Message</button>
</form>
```

**Features:**
- Proper labels for accessibility
- Required field indicators
- Validation states
- Loading states on submission

### Search Form

```html
<form class="search-form" onsubmit="searchCOA(event)">
    <div class="search-input-group">
        <input type="text" id="coa-number" placeholder="Enter COA Number (e.g., ZT-2024-001)" required>
        <button type="submit" class="btn btn-primary">Search</button>
    </div>
</form>
```

**Usage:** COA search, database lookups

## Section Components

### Hero Section

```html
<section class="hero">
    <div class="container">
        <h1>Precision LCMS Testing Nationwide</h1>
        <p class="hero-subtitle">Advanced analytical testing for peptides, supplements, and biotech research.</p>
        <div class="hero-cta">
            <a href="/services.html" class="btn btn-primary">View Services</a>
            <a href="/contact.html" class="btn btn-outline">Contact Us</a>
        </div>
    </div>
</section>
```

**Usage:** Homepage hero, landing page headers

### Content Section

```html
<section class="content-section">
    <div class="container">
        <h2 class="section-title">Section Title</h2>
        <p class="section-subtitle">Optional subtitle or description</p>

        <!-- Section content here -->
    </div>
</section>
```

**Usage:** General content sections throughout the site

### Feature Grid Section

```html
<section class="features-section">
    <div class="container">
        <h2 class="section-title">Why Choose ZyntroTest</h2>
        <div class="features-grid">
            <div class="feature-card">
                <div class="feature-icon">⚡</div>
                <h3>Fast Turnaround</h3>
                <p>Get results in 3-5 business days</p>
            </div>
            <!-- More feature cards -->
        </div>
    </div>
</section>
```

**Usage:** Feature highlights, benefits, USPs

## Trust & Credibility Components

### Trust Badges

```html
<div class="trust-badges">
    <div class="trust-badge">
        <div class="badge-icon">✅</div>
        <span>ISO Certified</span>
    </div>
    <div class="trust-badge">
        <div class="badge-icon">🔬</div>
        <span>Agilent LCMS</span>
    </div>
    <div class="trust-badge">
        <div class="badge-icon">🔒</div>
        <span>Secure Results</span>
    </div>
</div>
```

**Usage:** Building credibility, displaying certifications

### Stats Section

```html
<section class="stats-section">
    <div class="container">
        <div class="stats-grid">
            <div class="stat-item">
                <div class="stat-number">99.9%</div>
                <div class="stat-label">Accuracy</div>
            </div>
            <div class="stat-item">
                <div class="stat-number">3-5</div>
                <div class="stat-label">Day Turnaround</div>
            </div>
            <!-- More stats -->
        </div>
    </div>
</section>
```

**Usage:** Displaying metrics, achievements, capabilities

## Data Display Components

### COA Preview Card

```html
<div class="coa-preview">
    <div class="coa-header">
        <h3>Certificate of Analysis</h3>
        <span class="coa-id">ZT-2024-001</span>
    </div>
    <div class="data-grid">
        <div class="data-item">
            <strong>Client:</strong>
            <span>BioVenture Research</span>
        </div>
        <div class="data-item">
            <strong>Compound:</strong>
            <span>BPC-157</span>
        </div>
        <div class="data-item">
            <strong>Purity:</strong>
            <span>99.8%</span>
        </div>
    </div>
    <a href="#" class="btn btn-outline">View Full COA</a>
</div>
```

**Usage:** Displaying COA summaries, search results

### PDF Viewer Component

```html
<div class="pdf-preview-section">
    <div class="pdf-header">
        <h3>PDF Preview</h3>
        <a href="#" class="btn btn-primary" download>Download PDF</a>
    </div>
    <div class="pdf-preview-container">
        <iframe id="pdf-viewer" class="pdf-iframe"></iframe>
        <div id="pdf-error-message" style="display: none;">
            <p>Unable to load PDF preview.</p>
            <a href="#" target="_blank">Open in new tab</a>
        </div>
    </div>
</div>
```

**Usage:** Displaying PDF documents, COAs

## Notification Components

### Success Notification

```html
<div class="notification notification-success">
    <div class="notification-content">
        <span class="notification-message">Form submitted successfully!</span>
        <button class="notification-close">×</button>
    </div>
</div>
```

### Error Notification

```html
<div class="notification notification-error">
    <div class="notification-content">
        <span class="notification-message">An error occurred. Please try again.</span>
        <button class="notification-close">×</button>
    </div>
</div>
```

**Usage:** Form feedback, system messages, alerts

## Footer Component

```html
<footer class="footer">
    <div class="container">
        <div class="footer-grid">
            <div class="footer-section">
                <h4>ZyntroTest</h4>
                <p>Precision LCMS testing for biotech and research.</p>
            </div>
            <div class="footer-section">
                <h4>Quick Links</h4>
                <ul class="footer-links">
                    <li><a href="/services.html">Services</a></li>
                    <li><a href="/search.html">Search COAs</a></li>
                    <li><a href="/contact.html">Contact</a></li>
                </ul>
            </div>
            <div class="footer-section">
                <h4>Contact</h4>
                <ul class="contact-info">
                    <li>📧 info@zyntrotest.com</li>
                    <li>📞 (555) 123-4567</li>
                    <li>📍 Texas, USA</li>
                </ul>
            </div>
        </div>
        <div class="footer-bottom">
            <p>&copy; <span id="current-year">2024</span> ZyntroTest. All rights reserved.</p>
        </div>
    </div>
</footer>
```

**Usage:** Site-wide footer with links and contact info

## Loading States

### Button Loading State

```html
<button class="btn btn-primary" disabled>
    <span class="spinner"></span>
    Submitting...
</button>
```

### Content Loading

```html
<div class="loading-state">
    <div class="spinner"></div>
    <p>Loading...</p>
</div>
```

**Usage:** Async operations, form submissions, data loading

## Responsive Patterns

### Mobile-First Grid

```html
<!-- Mobile: 1 column, Tablet: 2 columns, Desktop: 3 columns -->
<div class="responsive-grid">
    <div class="grid-item">Item 1</div>
    <div class="grid-item">Item 2</div>
    <div class="grid-item">Item 3</div>
</div>
```

### Stack to Row

```html
<!-- Mobile: Stacked, Desktop: Side-by-side -->
<div class="flex-container">
    <div class="flex-item">Content 1</div>
    <div class="flex-item">Content 2</div>
</div>
```

## Accessibility Patterns

### Skip Navigation

```html
<a href="#main-content" class="skip-nav">Skip to main content</a>
```

### ARIA Labels

```html
<button aria-label="Close modal" class="close-btn">×</button>
<nav aria-label="Main navigation">...</nav>
<form aria-labelledby="form-title">...</form>
```

### Focus Management

```css
.btn:focus,
input:focus,
a:focus {
    outline: 2px solid var(--primary-blue);
    outline-offset: 2px;
}
```

## Component Composition Examples

### Service Page Layout

```html
<section class="services-section">
    <div class="container">
        <h1 class="page-title">Our Services</h1>
        <p class="page-subtitle">Professional LCMS testing for all your analytical needs</p>

        <div class="services-grid">
            <div class="service-card">
                <!-- Service card content -->
            </div>
            <!-- More service cards -->
        </div>
    </div>
</section>
```

### Contact Page Layout

```html
<section class="contact-section">
    <div class="container">
        <div class="contact-grid">
            <div class="contact-info">
                <h2>Get in Touch</h2>
                <p>Contact our team for quotes and inquiries.</p>
                <!-- Contact details -->
            </div>
            <div class="contact-form-container">
                <form class="contact-form">
                    <!-- Form fields -->
                </form>
            </div>
        </div>
    </div>
</section>
```

## Best Practices

### Component Usage

1. **Consistent Structure:** Always use the same HTML structure for each component type
2. **CSS Variables:** Use design system variables for all styling
3. **Semantic HTML:** Use appropriate HTML5 elements (`<section>`, `<nav>`, `<header>`, etc.)
4. **Accessibility:** Include ARIA labels, alt text, and keyboard navigation support
5. **Mobile-First:** Design components for mobile first, enhance for larger screens
6. **Performance:** Lazy load images, minimize DOM elements, optimize assets

### Component Naming

- Use BEM methodology where appropriate: `.component__element--modifier`
- Keep class names descriptive and semantic
- Avoid overly specific selectors
- Maintain consistency across similar components
