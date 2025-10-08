# ZyntroTest Website

A professional LCMS testing laboratory website built with modern web technologies.

## 🚀 Quick Content Editing

### Easy Content Updates
Most website content can be easily updated by editing the configuration file:

**File to edit:** `js/config.js`

This file contains all the main content including:
- Company information (name, contact details)
- Hero section content (titles, descriptions, stats)
- Service descriptions and pricing
- Trust badges and accreditation info
- Footer links and social media
- Blog configuration
- COA database entries

### Common Editing Tasks

#### 1. Update Company Information
```javascript
company: {
    name: "ZyntroTest",
    tagline: "Precision LCMS",
    email: "info@zyntrotest.com",
    phone: "(555) 123-4567",
    location: "Texas, USA"
}
```

#### 2. Change Hero Section
```javascript
hero: {
    title: "Precision LCMS Testing Nationwide",
    subtitle: "Fast, Reliable COAs for Peptides, Supplements, and Biotech Research",
    stats: {
        accuracy: "99.8%",
        turnaround: "3-5",
        volume: "500+"
    }
}
```

#### 3. Update Service Pricing
```javascript
services: {
    peptide: {
        name: "Peptide Purity Testing",
        priceRange: "$50 - $150 per sample"
    }
}
```

#### 4. Add COA to Search Database
```javascript
coaDatabase: {
    'ZT-2024-XXX': {
        id: 'ZT-2024-XXX',
        client: 'Client Name',
        compound: 'Compound Name',
        date: 'Date',
        type: 'Analysis Type'
    }
}
```

## 📱 Mobile Responsiveness

The website is fully responsive with:
- Mobile-first design approach
- Touch-friendly interface
- Optimized typography and spacing
- Collapsible navigation menu
- Responsive images and layouts

## 🔍 COA Search Functionality

### How it Works
1. Users enter COA number in search form
2. JavaScript searches the `coaDatabase` in config.js
3. Displays full COA if found
4. Shows error message if not found

### Adding New COAs
Add entries to the `coaDatabase` object in `js/config.js`

## 🎨 Design Features

### Logo
- Modern LCMS-themed logo with gradient background
- "LC" and "MS" text indicators
- Hover animations
- Responsive sizing

### Styling
- Professional biotech color scheme
- Clean, minimal design
- Smooth animations and transitions
- Consistent spacing and typography

## 📄 Page Structure

- **index.html** - Homepage with hero, services, testimonials
- **services.html** - Detailed service offerings and pricing
- **sample-submission.html** - Sample submission process and forms
- **coa-samples.html** - COA search functionality
- **blog.html** - Expert insights and LCMS content
- **contact.html** - Contact forms and information

---

**Last Updated:** October 2024  
**Version:** 1.0  
**Built for:** ZyntroTest Laboratory
