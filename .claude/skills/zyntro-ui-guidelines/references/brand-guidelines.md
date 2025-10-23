# ZyntroTest Brand Guidelines

Complete design system and brand guidelines for ZyntroTest.com - a biotech LCMS testing laboratory website.

## Brand Identity

**Brand Name:** ZyntroTest / Zyntro
**Industry:** Biotech / Laboratory Testing / LCMS Analysis
**Tone:** Professional, Scientific, Trustworthy, Modern
**Target Audience:** Biotech companies, research labs, peptide manufacturers, supplement companies

## Color Palette

### Primary Colors
- **Primary Blue:** `#2563eb` - Main brand color, used for CTAs, links, emphasis
- **Primary Dark:** `#1d4ed8` - Hover states, darker emphasis
- **Primary Light:** `#3b82f6` - Light accents, backgrounds

### Secondary Colors
- **Secondary Blue:** `#2563eb` - Secondary actions
- **Secondary Dark:** `#059669` - Success states, positive actions
- **Secondary Light:** `#34d399` - Success backgrounds, highlights

### Accent Colors
- **Accent Teal:** `#06b6d4` - Technical elements, data visualization
- **Accent Cyan:** `#0891b2` - Supporting accents

### Neutral Colors (Gray Scale)
- **White:** `#ffffff`
- **Gray 50:** `#f8fafc` - Lightest background
- **Gray 100:** `#f1f5f9` - Light background
- **Gray 200:** `#e2e8f0` - Borders, dividers
- **Gray 300:** `#cbd5e1` - Disabled states
- **Gray 400:** `#94a3b8` - Placeholder text
- **Gray 500:** `#64748b` - Secondary text
- **Gray 600:** `#475569` - Body text
- **Gray 700:** `#334155` - Primary text
- **Gray 800:** `#1e293b` - Headings
- **Gray 900:** `#0f172a` - Darkest text

### CSS Variable Usage
```css
var(--primary-blue)
var(--gray-900)
var(--white)
```

## Typography

### Font Families
- **Primary Font (Body):** `'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif`
- **Display Font (Headings):** `'Montserrat', Georgia, serif`

### Font Sizes (Mobile-First)

#### Mobile Scale (Default)
- **XS:** `0.75rem` (12px) - Captions, fine print
- **SM:** `0.875rem` (14px) - Small text, labels
- **Base:** `1rem` (16px) - Body text, paragraphs
- **LG:** `1.125rem` (18px) - Large body text
- **XL:** `1.25rem` (20px) - H4, subheadings
- **2XL:** `1.5rem` (24px) - H2, section titles
- **3XL:** `1.875rem` (30px) - H1, page titles (mobile)
- **4XL:** `2.25rem` (36px) - Hero headings (mobile)

#### Tablet Scale (768px+)
- **3XL:** `2.5rem` (40px) - H1
- **4XL:** `3rem` (48px) - Hero headings

#### Desktop Scale (1024px+)
- **3XL:** `3rem` (48px) - H1
- **4XL:** `3.75rem` (60px) - Hero headings

### Heading Styles
```css
h1: font-size: var(--text-3xl), color: var(--gray-900), font-weight: 600
h2: font-size: var(--text-2xl), color: var(--gray-900), font-weight: 600
h3: font-size: var(--text-xl), color: var(--gray-800), font-weight: 600
h4: font-size: var(--text-lg), color: var(--gray-800), font-weight: 600
h5, h6: font-size: var(--text-base), color: var(--gray-700), font-weight: 600
```

### Body Text
```css
p: font-size: var(--text-base), line-height: 1.6, color: var(--gray-600)
```

### Font Weights
- **Regular:** 400
- **Medium:** 500
- **Semibold:** 600
- **Bold:** 700

## Spacing System

### Mobile-First Spacing
- **XS:** `0.5rem` (8px) - Tight spacing, inline elements
- **SM:** `1rem` (16px) - Default spacing, list items
- **MD:** `1.5rem` (24px) - Between related elements
- **LG:** `2rem` (32px) - Between sections (mobile)
- **XL:** `3rem` (48px) - Large section gaps
- **2XL:** `4rem` (64px) - Major section breaks
- **3XL:** `6rem` (96px) - Hero padding, large sections

### Container Padding
- **Mobile:** `1rem` (16px)
- **Tablet:** `2rem` (32px)
- **Desktop:** `2.5rem` (40px)

### CSS Variable Usage
```css
padding: var(--space-md);
margin-bottom: var(--space-lg);
gap: var(--space-sm);
```

## Shadows

Use shadows to create depth hierarchy:

- **SM:** `0 1px 2px 0 rgb(0 0 0 / 0.05)` - Subtle elevation
- **MD:** `0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)` - Cards
- **LG:** `0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)` - Dropdowns
- **XL:** `0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)` - Modals
- **2XL:** `0 25px 50px -12px rgb(0 0 0 / 0.25)` - Large elevated elements

```css
box-shadow: var(--shadow-md);
```

## Border Radius

- **SM:** `0.375rem` (6px) - Small elements, buttons
- **MD:** `0.5rem` (8px) - Default for most elements
- **LG:** `0.75rem` (12px) - Cards, larger components
- **XL:** `1rem` (16px) - Featured cards
- **2XL:** `1.5rem` (24px) - Hero sections
- **Full:** `9999px` - Pills, circular elements

```css
border-radius: var(--radius-md);
```

## Transitions

Use consistent timing for animations:

- **Base:** `all 0.2s cubic-bezier(0.4, 0, 0.2, 1)` - Default for most interactions
- **Slow:** `all 0.3s cubic-bezier(0.4, 0, 0.2, 1)` - Larger movements, complex animations

```css
transition: var(--transition-base);
```

## Layout Guidelines

### Container Max Widths
- **Mobile:** 100% width with padding
- **Tablet (768px+):** `768px` max-width
- **Desktop (1024px+):** `1024px` max-width
- **Large Desktop (1280px+):** `1280px` max-width

### Grid Systems
- **Two-column grid:** Use for features, services
- **Three-column grid:** Use for testimonials, team members
- **Four-column grid:** Use for small cards, icons

### Responsive Breakpoints
```css
/* Mobile: 320px - 767px (default) */
/* Tablet: 768px - 1023px */
@media (min-width: 768px) { ... }

/* Desktop: 1024px - 1279px */
@media (min-width: 1024px) { ... }

/* Large Desktop: 1280px+ */
@media (min-width: 1280px) { ... }
```

## Component Design Patterns

### Buttons

#### Primary Button
```css
.btn-primary {
    background: var(--primary-blue);
    color: white;
    padding: 0.75rem 1.5rem;
    border-radius: var(--radius-md);
    font-weight: 600;
    transition: var(--transition-base);
}
.btn-primary:hover {
    background: var(--primary-dark);
    transform: translateY(-2px);
    box-shadow: var(--shadow-lg);
}
```

#### Secondary Button
```css
.btn-secondary {
    background: var(--secondary-dark);
    color: white;
    /* Same styling as primary */
}
```

#### Outline Button
```css
.btn-outline {
    background: transparent;
    color: var(--primary-blue);
    border: 2px solid var(--primary-blue);
}
.btn-outline:hover {
    background: var(--primary-blue);
    color: white;
}
```

### Cards

```css
.card {
    background: white;
    border-radius: var(--radius-lg);
    padding: var(--space-lg);
    box-shadow: var(--shadow-md);
    transition: var(--transition-base);
}
.card:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-xl);
}
```

### Forms

#### Input Fields
```css
input, textarea, select {
    width: 100%;
    padding: 0.75rem 1rem;
    border: 1px solid var(--gray-300);
    border-radius: var(--radius-md);
    font-size: var(--text-base);
    transition: var(--transition-base);
}
input:focus {
    outline: none;
    border-color: var(--primary-blue);
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}
```

### Sections

```css
section {
    padding: var(--space-2xl) 0; /* Mobile */
}

@media (min-width: 768px) {
    section {
        padding: var(--space-3xl) 0; /* Tablet/Desktop */
    }
}
```

### Header/Navigation

- Fixed position at top
- Semi-transparent white background with backdrop blur
- Mobile: Hamburger menu
- Desktop: Horizontal navigation
- Sticky behavior on scroll

## Accessibility Guidelines

### Color Contrast
- Ensure all text meets WCAG AA standards (4.5:1 for normal text)
- Primary blue on white: ✅ Passes
- Gray-600 on white: ✅ Passes
- Never use gray-400 or lighter for body text

### Focus States
- All interactive elements must have visible focus states
- Use `box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1)` for focus rings

### Text Sizing
- Minimum font size: 14px (0.875rem)
- Body text default: 16px (1rem)
- Line height: 1.6 for body text, 1.2 for headings

## Brand Voice & Messaging

### Key Brand Attributes
- **Precise:** We deliver accurate, reliable results
- **Scientific:** Data-driven, evidence-based approach
- **Trustworthy:** Professional, transparent, compliant
- **Modern:** Cutting-edge technology, contemporary design

### Messaging Guidelines
- Use clear, jargon-free language when possible
- Include technical terms when appropriate for credibility
- Emphasize accuracy, speed, and reliability
- Highlight certifications and compliance
- Focus on customer success and satisfaction

### Call-to-Action Language
- "Get Your COA"
- "Request Analysis"
- "Submit Sample"
- "View Results"
- "Contact Lab"

## Common Patterns

### Hero Section
```html
<section class="hero">
    <div class="container">
        <h1>Large Heading (var(--text-4xl))</h1>
        <p>Subheading (var(--text-lg), color: gray-600)</p>
        <div class="hero-cta">
            <a href="#" class="btn btn-primary">Primary CTA</a>
            <a href="#" class="btn btn-outline">Secondary CTA</a>
        </div>
    </div>
</section>
```

### Feature Grid
```html
<div class="features-grid">
    <div class="feature-card">
        <div class="feature-icon">📊</div>
        <h3>Feature Title</h3>
        <p>Feature description...</p>
    </div>
    <!-- Repeat for more features -->
</div>
```

### Service Card
```html
<div class="service-card">
    <h3>Service Name</h3>
    <p class="service-price">$Price Range</p>
    <ul class="service-features">
        <li>Feature 1</li>
        <li>Feature 2</li>
    </ul>
    <a href="#" class="btn btn-primary">Learn More</a>
</div>
```

## Icon Usage

### Standard Icons (Emoji-based for simplicity)
- Science/Testing: 🔬
- Document/COA: 📄
- Success/Check: ✅
- Data/Charts: 📊
- Speed/Fast: ⚡
- Security/Lock: 🔒
- Location: 📍
- Email: ✉️
- Phone: 📞

## Do's and Don'ts

### Do's
✅ Use CSS variables for all colors and spacing
✅ Follow mobile-first approach
✅ Maintain consistent spacing with the spacing system
✅ Use semantic HTML elements
✅ Include hover states for interactive elements
✅ Test on mobile devices
✅ Ensure proper contrast ratios
✅ Use Roboto for body text, Montserrat for headings

### Don'ts
❌ Don't use arbitrary color values - use variables
❌ Don't use inline styles - use classes
❌ Don't skip mobile testing
❌ Don't forget hover/focus states
❌ Don't use colors with poor contrast
❌ Don't break the visual hierarchy
❌ Don't use overly complex animations
❌ Don't ignore loading states
