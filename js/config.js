// ZyntroTest Website Content Configuration
// Edit this file to easily update website content without touching HTML

const SITE_CONFIG = {
    // Company Information
    company: {
        name: "Zyntro",
        tagline: "Precision LCMS",
        fullName: "Zyntro Laboratory",
        description: "Advanced LCMS testing for peptides, supplements, and biotech research. Delivering precision results nationwide.",
        email: "info@zyntro.com",
        phone: "(555) 123-4567",
        location: "Texas, USA"
    },

    // Hero Section Content
    hero: {
        title: "Precision LCMS Testing Nationwide",
        subtitle: "Fast, Reliable COAs for Peptides, Supplements, and Biotech Research",
        description: "Advanced Agilent LCMS with diode array detection delivers precise results in days, not weeks. Trusted by researchers and e-commerce businesses across the United States.",
        stats: {
            accuracy: "99.8%",
            turnaround: "3-5",
            volume: "500+"
        },
        primaryCTA: "Request Analysis",
        secondaryCTA: "View Services"
    },

    // Services Configuration
    services: {
        peptide: {
            name: "Peptide Purity Testing",
            description: "High-precision analysis for research peptides with detailed COAs for e-commerce and compliance.",
            priceRange: "$50 - $150 per sample",
            features: [
                "HPLC-MS with DAD Detection",
                "Molecular Weight Confirmation", 
                "Impurity Profiling",
                "Water Content Analysis",
                "Professional COA with Chromatograms"
            ]
        },
        supplement: {
            name: "Supplement Adulterant Screening",
            description: "Detect contaminants and adulterants in nutraceuticals using advanced LCMS with DAD technology.",
            priceRange: "$75 - $200 per sample",
            features: [
                "PDE-5 Inhibitor Screening",
                "Stimulant Detection Panel",
                "Pharmaceutical Compound Analysis",
                "Heavy Metal Testing",
                "Microbiological Analysis"
            ]
        },
        biotech: {
            name: "Biotech R&D Profiling",
            description: "Comprehensive impurity and stability analysis for small molecules and biosimilar research.",
            priceRange: "$100 - $300 per sample",
            features: [
                "Impurity Identification & Quantification",
                "Forced Degradation Studies", 
                "Method Development & Validation",
                "Stability Testing Programs",
                "Regulatory Compliance Support"
            ]
        }
    },

    // Trust Signals
    trust: {
        accreditation: "ISO 17025 in Progress",
        shipping: "Nationwide Results in Days",
        technology: "Advanced DAD Technology",
        badges: [
            "ISO 17025",
            "Nationwide", 
            "Fast Results"
        ]
    },

    // Contact Information
    contact: {
        responseTime: "24 hours",
        businessHours: "Monday - Friday: 8:00 AM - 6:00 PM CST",
        emergencyContact: "Emergency testing available upon request",
        supportEmail: "support@zyntrotest.com",
        salesEmail: "sales@zyntrotest.com"
    },

    // Blog Configuration
    blog: {
        title: "Insights on LCMS Testing",
        description: "Expert guidance and analytical chemistry insights from ZyntroTest's professional team. Discover the latest techniques, best practices, and industry trends in LCMS testing for peptides, supplements, and biotech applications.",
        newsletterText: "Subscribe to receive expert analysis, industry trends, and technical insights directly in your inbox."
    },

    // Footer Links
    footer: {
        services: [
            { name: "Peptide Purity Testing", url: "services.html#peptide" },
            { name: "Supplement Screening", url: "services.html#supplement" },
            { name: "Biotech R&D Profiling", url: "services.html#biotech" },
            { name: "COA Search", url: "coa-samples.html" }
        ],
        resources: [
            { name: "Blog & Insights", url: "blog.html" },
            { name: "Submit Sample", url: "sample-submission.html" },
            { name: "Contact", url: "contact.html" }
        ],
        legal: [
            { name: "Privacy Policy", url: "#privacy" },
            { name: "Terms of Service", url: "#terms" }
        ],
        social: [
            { name: "LinkedIn", url: "#linkedin" },
            { name: "X (Twitter)", url: "#twitter" }
        ]
    },

    // Sample COA Database (for COA Search functionality)
    coaDatabase: {
        'ZT-2024-001': {
            id: 'ZT-2024-001',
            client: 'BioVenture Research',
            compound: 'BPC-157',
            date: 'October 1, 2024',
            purity: '99.8%',
            type: 'Peptide Analysis',
            status: 'Complete'
        },
        'ZT-2024-025': {
            id: 'ZT-2024-025',
            client: 'NutriPure Supplements',
            compound: 'Pre-Workout Formula',
            date: 'October 5, 2024',
            result: 'PASS - No Adulterants',
            type: 'Supplement Screening',
            status: 'Complete'
        },
        'ZT-2024-050': {
            id: 'ZT-2024-050',
            client: 'Apex Biotechnology',
            compound: 'API Intermediate X-47B',
            date: 'October 3, 2024',
            purity: '98.2%',
            type: 'Biotech Analysis',
            status: 'Complete'
        }
    },

    // Pricing Configuration
    pricing: {
        peptides: {
            basic: { price: 50, name: "Basic Purity Analysis" },
            standard: { price: 100, name: "Standard COA Package" },
            premium: { price: 150, name: "Premium Analysis Suite" }
        },
        supplements: {
            screening: { price: 75, name: "Basic Adulterant Screen" },
            comprehensive: { price: 125, name: "Comprehensive Panel" },
            custom: { price: 200, name: "Custom Testing Panel" }
        },
        biotech: {
            profiling: { price: 100, name: "Impurity Profiling" },
            development: { price: 200, name: "Method Development" },
            validation: { price: 300, name: "Full Validation Package" }
        }
    }
};

// Export for use in other JavaScript files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SITE_CONFIG;
}