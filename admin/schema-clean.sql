-- Clean PostgreSQL Schema for ZyntroTest
-- Extracted from Supabase backup, stripped of Supabase-specific roles/extensions
-- For use with Fly.io Postgres

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-----------------------------------------------------------
-- TABLES
-----------------------------------------------------------

CREATE TABLE IF NOT EXISTS blog_posts (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    title varchar(300) NOT NULL,
    slug varchar(300) NOT NULL UNIQUE,
    excerpt text,
    content text,
    featured_image text,
    author varchar(200) DEFAULT 'Zyntro Team',
    published_date date,
    status varchar(20) DEFAULT 'draft',
    updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS cms_media (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    filename varchar(255) NOT NULL,
    original_name varchar(255) NOT NULL,
    file_path text NOT NULL,
    file_url text NOT NULL,
    file_size bigint NOT NULL,
    mime_type varchar(100) NOT NULL,
    title varchar(255),
    alt_text text,
    width integer DEFAULT 0,
    height integer DEFAULT 0,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS coas (
    id text NOT NULL PRIMARY KEY,
    client text NOT NULL,
    compound text NOT NULL,
    analysis_type text NOT NULL,
    test_date date,
    status text DEFAULT 'Complete',
    purity text,
    result text,
    notes text,
    file_name text,
    file_size bigint,
    file_url text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    created_by text,
    CONSTRAINT coas_status_check CHECK (status IN ('Complete', 'Pending', 'In Progress'))
);

CREATE TABLE IF NOT EXISTS consultation_bookings (
    id serial PRIMARY KEY,
    client_name varchar(255) NOT NULL,
    client_email varchar(255) NOT NULL,
    client_phone varchar(50),
    consultation_type varchar(20) NOT NULL,
    duration integer NOT NULL,
    amount numeric(10,2) NOT NULL,
    scheduled_datetime timestamp,
    jotform_submission_id varchar(255),
    stripe_payment_id varchar(255),
    stripe_receipt_url text,
    booking_status varchar(20) DEFAULT 'pending',
    created_at timestamp DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp DEFAULT CURRENT_TIMESTAMP,
    payment_status varchar(20) DEFAULT 'pending',
    calendly_event_id varchar(255),
    calendly_invitee_id varchar(255),
    reminder_sent_24h boolean DEFAULT false,
    reminder_sent_1h boolean DEFAULT false,
    followup_sent boolean DEFAULT false,
    service_type varchar(50) DEFAULT 'general',
    CONSTRAINT consultation_bookings_booking_status_check CHECK (booking_status IN ('pending', 'confirmed', 'completed', 'cancelled')),
    CONSTRAINT consultation_bookings_consultation_type_check CHECK (consultation_type IN ('zoom', 'in-person')),
    CONSTRAINT consultation_bookings_duration_check CHECK (duration IN (30, 60)),
    CONSTRAINT consultation_bookings_payment_status_check CHECK (payment_status IN ('pending', 'completed', 'failed'))
);

CREATE TABLE IF NOT EXISTS contact_submissions (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    name text NOT NULL,
    email text NOT NULL,
    phone text,
    company text,
    service_type text,
    sample_type text,
    message text,
    status text DEFAULT 'unread',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    notes text,
    CONSTRAINT contact_submissions_status_check CHECK (status IN ('unread', 'read', 'responded', 'completed'))
);

CREATE TABLE IF NOT EXISTS hero_sections (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    page varchar(50) NOT NULL UNIQUE,
    title varchar(300),
    subtitle varchar(500),
    description text,
    cta_primary_text varchar(100),
    cta_primary_link varchar(200),
    cta_secondary_text varchar(100),
    cta_secondary_link varchar(200),
    image_url text,
    stats jsonb DEFAULT '[]',
    updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS newsletter_subscriptions (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    email text NOT NULL UNIQUE,
    status text DEFAULT 'active',
    subscribed_at timestamptz DEFAULT now(),
    unsubscribed_at timestamptz,
    source text DEFAULT 'website',
    CONSTRAINT newsletter_subscriptions_status_check CHECK (status IN ('active', 'unsubscribed'))
);

CREATE TABLE IF NOT EXISTS page_content (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    page varchar(50) NOT NULL,
    section_key varchar(100) NOT NULL,
    content_type varchar(20) DEFAULT 'text',
    content_value text,
    display_order integer DEFAULT 0,
    updated_at timestamptz DEFAULT now(),
    UNIQUE(page, section_key)
);

CREATE TABLE IF NOT EXISTS services (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    slug varchar(100) NOT NULL UNIQUE,
    title varchar(200) NOT NULL,
    subtitle text,
    description text,
    icon_svg text,
    base_price varchar(100),
    add_ons jsonb DEFAULT '[]',
    features jsonb DEFAULT '[]',
    specifications jsonb DEFAULT '{}',
    status varchar(20) DEFAULT 'active',
    display_order integer DEFAULT 0,
    updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS pricing_items (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    service_id uuid REFERENCES services(id) ON DELETE CASCADE,
    test_type varchar(200) NOT NULL,
    base_price varchar(100),
    add_ons text,
    display_order integer DEFAULT 0,
    updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS sample_submissions (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    client_name text NOT NULL,
    email text NOT NULL,
    phone text,
    company text,
    sample_type text,
    sample_count integer,
    analysis_requested text,
    rush_service boolean DEFAULT false,
    shipping_method text,
    message text,
    status text DEFAULT 'unread',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    notes text,
    CONSTRAINT sample_submissions_status_check CHECK (status IN ('unread', 'read', 'in_progress', 'completed'))
);

CREATE TABLE IF NOT EXISTS site_settings (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    key varchar(100) NOT NULL UNIQUE,
    value text,
    category varchar(50) DEFAULT 'general',
    updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS testimonials (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    author_name varchar(200) NOT NULL,
    company varchar(200),
    content text NOT NULL,
    rating integer DEFAULT 5,
    display_order integer DEFAULT 0,
    active boolean DEFAULT true,
    updated_at timestamptz DEFAULT now(),
    CONSTRAINT testimonials_rating_check CHECK (rating >= 1 AND rating <= 5)
);

-----------------------------------------------------------
-- VIEW
-----------------------------------------------------------

CREATE OR REPLACE VIEW public_coas AS
SELECT id, client, compound, analysis_type AS type,
       to_char(test_date::timestamptz, 'Month DD, YYYY') AS date,
       status, purity, result, created_at
FROM coas
WHERE status = 'Complete';

-----------------------------------------------------------
-- SEED DATA
-----------------------------------------------------------

-- COAs (3 records - update file_url to local paths)
INSERT INTO coas (id, client, compound, analysis_type, test_date, status, purity, result, notes, file_name, file_size, file_url, created_at, updated_at, created_by) VALUES
('QC-202525043', 'Zyntro', 'MOTS-c', 'Supplement Screening', '2025-10-04', 'Complete', '99.9', NULL, '', 'ZT-2025-002_MOTS-c_COA.pdf', 262622, '/COAs/Zyntro MOTS-c COA.pdf', '2025-10-16 02:01:35.310172+00', '2025-10-17 17:46:51.851373+00', 'admin'),
('QC-2025250405', 'Zyntro', ' PT-141', 'Peptide Analysis', '2025-10-06', 'Complete', '99.8', 'PASS', '', 'QC-2025250405_PT-141_COA.pdf', 261120, '/COAs/Zyntro PT-141 COA.pdf', '2025-10-16 02:02:18.987592+00', '2025-10-17 17:48:00.953493+00', 'admin'),
('QC-2025250435', 'Zyntro', 'BPC-157', 'Peptide Analysis', '2025-10-04', 'Complete', '99.8', NULL, '', 'QC-2025250435_BPC-157_COA.pdf', 265618, '/COAs/Zyntro BPC-157.pdf', '2025-10-16 02:00:40.585973+00', '2025-10-17 19:10:32.467985+00', 'admin')
ON CONFLICT (id) DO NOTHING;

-- Contact Submissions (1 record)
INSERT INTO contact_submissions (id, name, email, phone, company, service_type, sample_type, message, status, created_at, updated_at) VALUES
('0188758f-bb84-4260-aa0a-dfdf5ec8890f', 'James P Strickland', 'james@ekaty.com', '7134446732', 'Strickland Technology', 'Not specified', 'hemp', 'testing', 'completed', '2025-10-29 17:46:15.221+00', '2025-10-29 18:12:33.857141+00')
ON CONFLICT (id) DO NOTHING;

-- Hero Sections
INSERT INTO hero_sections (id, page, title, subtitle, description, cta_primary_text, cta_primary_link, cta_secondary_text, cta_secondary_link, image_url, stats, updated_at) VALUES
('f3b12530-05f2-4868-b605-201a60021c12', 'index', 'Test Hero Title - Updated via CMS', 'Test Hero Subtitle - Updated via CMS', 'Test Hero Description - Updated via CMS', 'Request Analysis', '/contact', 'View Services', '/services', 'https://example.com/test-image.jpg', '[{"label": "Accuracy", "number": "99.8%"}, {"label": "Days TAT.", "number": "3-6"}, {"label": "Tests/Month", "number": "500+"}]', '2025-10-17 15:39:41.213583+00')
ON CONFLICT (page) DO NOTHING;

-- Page Content
INSERT INTO page_content (id, page, section_key, content_type, content_value, display_order, updated_at) VALUES
('ef41114f-1eb0-4a62-b75e-29af9bc1008b', 'sample-submission', 'meta_description', 'text', 'Submit your samples for professional LCMS testing at ZyntroTest. Download submission forms and shipping instructions.', 0, '2025-10-17 14:20:38.241038+00'),
('2f7ebbd5-c15a-4b43-9e8b-cca655bae38a', 'sample-submission', 'hero_title', 'text', 'Submit Your Sample for Testing', 0, '2025-10-17 14:20:38.315282+00'),
('9fae4f81-2c24-40cd-86ea-830f06dbe7fb', 'search', 'page_title', 'text', 'COA Search | ZyntroTest Laboratory', 0, '2025-10-17 14:20:38.610982+00'),
('18a08ced-d358-4101-8ed3-3d0250de5223', 'search', 'meta_description', 'text', 'Search and retrieve your Certificate of Analysis from ZyntroTest''s secure database. Enter your COA number to access detailed testing results and reports.', 0, '2025-10-17 14:20:38.687537+00'),
('90ca797f-396a-44be-b876-77cd47fa2aa8', 'search', 'hero_title', 'text', 'COA Search', 0, '2025-10-17 14:20:38.762933+00'),
('7ccaf617-8b72-455f-98b8-904641eca6e2', 'index', 'page_title', 'text', 'Test Title - Updated via CMS', 0, '2025-10-17 15:39:41.101078+00'),
('381e022d-8864-4d8b-8d43-fa0e73ecc214', 'index', 'meta_description', 'text', 'Test Description - Updated via CMS', 0, '2025-10-17 15:39:41.101078+00'),
('5b6def02-b78f-4439-a2fd-70070bd716f4', 'index', 'hero_title', 'text', 'Test Hero Title - Updated via CMS', 0, '2025-10-17 15:39:41.101078+00'),
('bbc7ae86-7b8f-4e67-8a57-81279d836652', 'services', 'page_title', 'text', 'ZyntroTest Services: LCMS Peptide, Supplement, Hemp Testing', 0, '2025-10-17 14:20:36.963925+00'),
('a84f80ab-92a1-429f-be18-10f8b9b40235', 'services', 'meta_description', 'text', 'Precision LCMS testing for peptides ($200), supplements ($175-275), and hemp ($150-350). Fast COAs with DAD technology.', 0, '2025-10-17 14:20:37.036407+00'),
('620f354d-1751-47a0-99bd-81c182466b02', 'services', 'hero_title', 'text', 'ZyntroTest LCMS Testing Services', 0, '2025-10-17 14:20:37.115041+00'),
('9ae0438e-155b-4553-b23c-cd78f29ba6c1', 'contact', 'page_title', 'text', 'Contact ZyntroTest | Request LCMS Testing Quote', 0, '2025-10-17 14:20:37.408533+00'),
('078276f3-2991-40eb-b793-3fa9eec3183d', 'contact', 'meta_description', 'text', 'Contact ZyntroTest for professional LCMS testing services. Request quotes for peptide purity, supplement screening, and biotech analysis with fast turnaround.', 0, '2025-10-17 14:20:37.485455+00'),
('6f5966fc-8b6b-49cb-b4a2-6d8935a21d2b', 'contact', 'hero_title', 'text', 'Connect with ZyntroTest', 0, '2025-10-17 14:20:37.556273+00'),
('e7ccaa66-c7c8-413e-8a4d-4340e9ff5087', 'blog', 'page_title', 'text', 'Insights on LCMS Testing | ZyntroTest Blog', 0, '2025-10-17 14:20:37.718097+00'),
('e30a6338-b45c-46da-a0ec-7f969a0903a1', 'blog', 'meta_description', 'text', 'Expert insights on LCMS testing, peptide analysis, supplement safety, and biotech applications. Professional guidance from ZyntroTest''s analytical chemistry experts.', 0, '2025-10-17 14:20:37.808285+00'),
('950b4850-aae3-4db7-9aa0-d48102cfc498', 'blog', 'hero_title', 'text', 'Insights on LCMS Testing', 0, '2025-10-17 14:20:37.890976+00'),
('1f6ff03c-87db-43cb-bd3e-a35152852b4d', 'sample-submission', 'page_title', 'text', 'Submit Your Sample for LCMS Testing | ZyntroTest', 0, '2025-10-17 14:20:38.161003+00')
ON CONFLICT (page, section_key) DO NOTHING;

-- Services (3 records)
INSERT INTO services (id, slug, title, subtitle, description, icon_svg, base_price, add_ons, features, specifications, status, display_order, updated_at) VALUES
('0d7424ae-dd0e-496e-9ea5-89755e8fc308', 'peptide-purity-analysis', 'Peptide Purity Analysis', 'Verify research-use peptides with 99.9% accuracy', 'Verify research-use peptides with 99.9% accuracy using LCMS with DAD. Ideal for vendors and researchers needing Certificates of Analysis for e-commerce or compliance. Fast results in days.', NULL, '$200 per sample', '[{"name": "Content Analysis", "price": "$25"}, {"name": "Endotoxin Testing", "price": "$250"}, {"name": "Sterility Testing", "price": "$300"}]', '["Peptide purity percentage (HPLC and MS confirmation)", "Molecular weight confirmation", "Impurity identification", "Detailed Certificate of Analysis", "Results delivered in 3-5 business days"]', '{}', 'active', 1, '2025-10-17 14:20:36.36404+00'),
('f8c64c2e-6904-4540-bd4b-6bd9b9dcf589', 'supplement-adulterant-screening', 'Supplement Adulterant Screening', 'Detect contaminants with advanced LCMS-DAD', 'Detect contaminants like PDE-5 inhibitors or steroids in nutraceuticals with advanced LCMS-DAD. Ensure FDA/USP compliance for brands and retailers with reliable COAs.', NULL, '$175 - $275 per sample', '[{"name": "Content Analysis", "price": "$25"}, {"name": "Endotoxin Testing", "price": "$250"}, {"name": "Sterility Testing", "price": "$300"}]', '["Single Analyte Screening: $175/sample - Target specific contaminant", "Comprehensive Panel: $275/sample - Full adulterant screening"]', '{}', 'active', 2, '2025-10-17 14:20:36.447944+00'),
('cf8e7585-0cfa-4e2b-b071-10e142686bcb', 'cannabis-hemp-testing', 'Cannabis/Hemp Testing', 'Compliance testing pending TDA registration', 'Quantify THC/CBD and screen pesticides or mycotoxins in hemp products using LCMS-DAD. Compliance testing for growers and retailers (available soon, pending TDA registration).', NULL, '$150 - $350 per sample', '[{"name": "Content Analysis", "price": "$25"}, {"name": "Endotoxin Testing", "price": "$250"}, {"name": "Sterility Testing", "price": "$300"}]', '["Potency Testing: $150/sample - THC/CBD quantification", "Contaminant Screening: $200/sample - Pesticides, mycotoxins, heavy metals", "Full Panel Testing: $350/sample - Complete compliance panel"]', '{}', 'active', 3, '2025-10-17 14:20:36.52837+00')
ON CONFLICT (slug) DO NOTHING;

-- Site Settings
INSERT INTO site_settings (id, key, value, category, updated_at) VALUES
('d53db556-e762-4f0d-9a95-1026bbe65477', 'site_name', 'ZyntroTest', 'general', '2025-10-17 03:45:59.670097+00'),
('ca19fa9e-f2cc-491d-8182-a00f497e3eaf', 'site_tagline', 'Precision LCMS Testing Nationwide', 'general', '2025-10-17 03:45:59.670097+00'),
('64a92ae6-958f-4cf1-a5d1-ccd637e49eb9', 'contact_email', 'info@zyntrotest.com', 'contact', '2025-10-17 03:45:59.670097+00'),
('5da96d9d-2145-4ad7-a6bc-614f24eab23a', 'contact_phone', '', 'contact', '2025-10-17 03:45:59.670097+00'),
('64be684b-a01c-4dd5-93d3-c0a9c24cc72b', 'contact_address', '11134 Hopes Creek Road, College Station, TX 77845', 'contact', '2025-10-17 03:45:59.670097+00'),
('122e2592-26c1-4739-b18e-37c672bbc960', 'social_linkedin', '', 'social', '2025-10-17 03:45:59.670097+00'),
('a3543101-4648-47c7-85cf-5faa1e0e09c8', 'social_twitter', '', 'social', '2025-10-17 03:45:59.670097+00'),
('22832744-9d6a-4134-8fd5-74818a449a69', 'social_facebook', '', 'social', '2025-10-17 03:45:59.670097+00'),
('7a2f5ac0-dd9a-4825-8d42-ae691b8e3458', 'footer_text', 'Trusted by leading biotech companies nationwide', 'footer', '2025-10-17 03:45:59.670097+00'),
('b48c5dca-b356-4da2-87bb-7d18c14cbf17', 'logo_url', 'images/zyntrotest-logo.svg', 'branding', '2025-10-17 03:45:59.670097+00')
ON CONFLICT (key) DO NOTHING;

-- Testimonials (deduplicated - only 3 unique)
INSERT INTO testimonials (id, author_name, company, content, rating, display_order, active, updated_at) VALUES
('1efd1702-bf7c-4d35-9487-c90dfacd6d7e', 'Dr. Sarah Chen, BioVenture Research', '', 'ZyntroTest''s LCMS analysis exceeded our expectations. The detailed COA and fast turnaround helped us launch our peptide line with confidence.', 5, 1, true, '2025-10-17 14:20:36.652557+00'),
('6aa36475-666c-4e9d-8d21-dceebdb201bb', 'Mike Rodriguez, NutriPure Supplements', '', 'Professional service and transparent pricing. Their DAD technology caught contaminants that other labs missed.', 5, 2, true, '2025-10-17 14:20:36.728715+00'),
('b431ff45-4459-461d-a806-cf7fa694d0fc', 'Jennifer Walsh, Apex Biotechnology', '', 'The detailed impurity profiling supported our FDA submission. ZyntroTest is our go-to lab for critical testing.', 5, 3, true, '2025-10-17 14:20:36.805807+00')
ON CONFLICT (id) DO NOTHING;
