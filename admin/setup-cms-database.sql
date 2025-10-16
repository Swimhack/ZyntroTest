-- ZyntroTest CMS Database Schema
-- Run this script in your Supabase SQL editor to set up the CMS tables

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Site Settings Table
CREATE TABLE IF NOT EXISTS site_settings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    key VARCHAR(100) NOT NULL UNIQUE,
    value TEXT,
    category VARCHAR(50) DEFAULT 'general',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Page Content Table
CREATE TABLE IF NOT EXISTS page_content (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    page VARCHAR(50) NOT NULL, -- index, services, contact, blog, sample-submission, search
    section_key VARCHAR(100) NOT NULL, -- hero_title, hero_subtitle, overview_text, etc.
    content_type VARCHAR(20) DEFAULT 'text', -- text, html, image, json
    content_value TEXT,
    display_order INTEGER DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(page, section_key)
);

-- 3. Services Table
CREATE TABLE IF NOT EXISTS services (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    slug VARCHAR(100) NOT NULL UNIQUE,
    title VARCHAR(200) NOT NULL,
    subtitle TEXT,
    description TEXT,
    icon_svg TEXT,
    base_price VARCHAR(100),
    add_ons JSONB DEFAULT '[]',
    features JSONB DEFAULT '[]',
    specifications JSONB DEFAULT '{}',
    status VARCHAR(20) DEFAULT 'active',
    display_order INTEGER DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Pricing Items Table
CREATE TABLE IF NOT EXISTS pricing_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    service_id UUID REFERENCES services(id) ON DELETE CASCADE,
    test_type VARCHAR(200) NOT NULL,
    base_price VARCHAR(100),
    add_ons TEXT,
    display_order INTEGER DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Hero Sections Table
CREATE TABLE IF NOT EXISTS hero_sections (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    page VARCHAR(50) NOT NULL UNIQUE,
    title VARCHAR(300),
    subtitle VARCHAR(500),
    description TEXT,
    cta_primary_text VARCHAR(100),
    cta_primary_link VARCHAR(200),
    cta_secondary_text VARCHAR(100),
    cta_secondary_link VARCHAR(200),
    image_url TEXT,
    stats JSONB DEFAULT '[]',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Testimonials Table
CREATE TABLE IF NOT EXISTS testimonials (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    author_name VARCHAR(200) NOT NULL,
    company VARCHAR(200),
    content TEXT NOT NULL,
    rating INTEGER DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
    display_order INTEGER DEFAULT 0,
    active BOOLEAN DEFAULT true,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Blog Posts Table
CREATE TABLE IF NOT EXISTS blog_posts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title VARCHAR(300) NOT NULL,
    slug VARCHAR(300) NOT NULL UNIQUE,
    excerpt TEXT,
    content TEXT,
    featured_image TEXT,
    author VARCHAR(200) DEFAULT 'Zyntro Team',
    published_date DATE,
    status VARCHAR(20) DEFAULT 'draft', -- draft, published
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_page_content_page ON page_content(page);
CREATE INDEX IF NOT EXISTS idx_page_content_section ON page_content(section_key);
CREATE INDEX IF NOT EXISTS idx_services_slug ON services(slug);
CREATE INDEX IF NOT EXISTS idx_services_status ON services(status);
CREATE INDEX IF NOT EXISTS idx_services_display_order ON services(display_order);
CREATE INDEX IF NOT EXISTS idx_pricing_items_service_id ON pricing_items(service_id);
CREATE INDEX IF NOT EXISTS idx_hero_sections_page ON hero_sections(page);
CREATE INDEX IF NOT EXISTS idx_testimonials_active ON testimonials(active);
CREATE INDEX IF NOT EXISTS idx_testimonials_display_order ON testimonials(display_order);
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON blog_posts(status);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published_date ON blog_posts(published_date);

-- Set up Row Level Security (RLS)
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE pricing_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE hero_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

-- Create policies for admin access (authenticated users can do everything)
CREATE POLICY "Admin full access to site_settings" ON site_settings
    FOR ALL TO authenticated USING (true);

CREATE POLICY "Admin full access to page_content" ON page_content
    FOR ALL TO authenticated USING (true);

CREATE POLICY "Admin full access to services" ON services
    FOR ALL TO authenticated USING (true);

CREATE POLICY "Admin full access to pricing_items" ON pricing_items
    FOR ALL TO authenticated USING (true);

CREATE POLICY "Admin full access to hero_sections" ON hero_sections
    FOR ALL TO authenticated USING (true);

CREATE POLICY "Admin full access to testimonials" ON testimonials
    FOR ALL TO authenticated USING (true);

CREATE POLICY "Admin full access to blog_posts" ON blog_posts
    FOR ALL TO authenticated USING (true);

-- Create policies for public read access
CREATE POLICY "Public read access to site_settings" ON site_settings
    FOR SELECT TO anon USING (true);

CREATE POLICY "Public read access to page_content" ON page_content
    FOR SELECT TO anon USING (true);

CREATE POLICY "Public read access to services" ON services
    FOR SELECT TO anon USING (status = 'active');

CREATE POLICY "Public read access to pricing_items" ON pricing_items
    FOR SELECT TO anon USING (true);

CREATE POLICY "Public read access to hero_sections" ON hero_sections
    FOR SELECT TO anon USING (true);

CREATE POLICY "Public read access to testimonials" ON testimonials
    FOR SELECT TO anon USING (active = true);

CREATE POLICY "Public read access to blog_posts" ON blog_posts
    FOR SELECT TO anon USING (status = 'published');

-- Insert default site settings
INSERT INTO site_settings (key, value, category) VALUES
    ('site_name', 'ZyntroTest', 'general'),
    ('site_tagline', 'Precision LCMS Testing Nationwide', 'general'),
    ('contact_email', 'info@zyntrotest.com', 'contact'),
    ('contact_phone', '', 'contact'),
    ('contact_address', '11134 Hopes Creek Road, College Station, TX 77845', 'contact'),
    ('social_linkedin', '', 'social'),
    ('social_twitter', '', 'social'),
    ('social_facebook', '', 'social'),
    ('footer_text', 'Trusted by leading biotech companies nationwide', 'footer'),
    ('logo_url', 'images/zyntrotest-logo.svg', 'branding')
ON CONFLICT (key) DO NOTHING;

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_site_settings_updated_at BEFORE UPDATE ON site_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_page_content_updated_at BEFORE UPDATE ON page_content FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON services FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_pricing_items_updated_at BEFORE UPDATE ON pricing_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_hero_sections_updated_at BEFORE UPDATE ON hero_sections FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_testimonials_updated_at BEFORE UPDATE ON testimonials FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_blog_posts_updated_at BEFORE UPDATE ON blog_posts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Success message
SELECT 'CMS Database Schema created successfully! You can now run the content migration tool.' as status;
