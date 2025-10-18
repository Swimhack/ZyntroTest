-- Insert default hero section data for homepage
-- This will set up the hero with the current stats: 99.8% Accuracy, 3-5 Days TAT, 500+ Tests/Month

INSERT INTO hero_sections (page, title, subtitle, description, image_url, stats, cta_primary_text, cta_primary_link, cta_secondary_text, cta_secondary_link) 
VALUES (
    'index',
    'Precision LCMS Testing Nationwide',
    'Fast, Reliable COAs for Peptides, Supplements, and Biotech Research',
    'Advanced Agilent LCMS with diode array detection delivers precise results in days, not weeks. Trusted by researchers and e-commerce businesses across the United States.',
    'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2940&q=80',
    '[
        {"number": "99.8%", "label": "Accuracy"},
        {"number": "3-5", "label": "Days TAT"},
        {"number": "500+", "label": "Tests/Month"}
    ]'::jsonb,
    'Request Analysis',
    'contact.html',
    'View Services',
    'services.html'
)
ON CONFLICT (page) DO UPDATE SET
    title = EXCLUDED.title,
    subtitle = EXCLUDED.subtitle,
    description = EXCLUDED.description,
    image_url = EXCLUDED.image_url,
    stats = EXCLUDED.stats,
    cta_primary_text = EXCLUDED.cta_primary_text,
    cta_primary_link = EXCLUDED.cta_primary_link,
    cta_secondary_text = EXCLUDED.cta_secondary_text,
    cta_secondary_link = EXCLUDED.cta_secondary_link;

-- Success message
SELECT 'Hero section data inserted successfully! The homepage stats will now load from the database.' as status;