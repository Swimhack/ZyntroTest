-- Fix RLS policies for public form submissions
-- The anon role needs INSERT permission on submission tables
-- so the public-facing contact/sample/newsletter forms can save data.
--
-- Run this in Supabase SQL Editor:
-- https://supabase.com/dashboard/project/hctdzwmlkgnuxcuhjooe/sql/new

-- =============================================
-- 1. Ensure tables exist
-- =============================================

CREATE TABLE IF NOT EXISTS contact_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    company TEXT,
    service_type TEXT,
    sample_type TEXT,
    message TEXT,
    status TEXT DEFAULT 'unread' CHECK (status IN ('unread', 'read', 'responded', 'completed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    notes TEXT
);

CREATE TABLE IF NOT EXISTS sample_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    company TEXT,
    sample_type TEXT,
    sample_count INTEGER,
    analysis_requested TEXT,
    rush_service BOOLEAN DEFAULT false,
    shipping_method TEXT,
    message TEXT,
    status TEXT DEFAULT 'unread' CHECK (status IN ('unread', 'read', 'in_progress', 'completed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    notes TEXT
);

CREATE TABLE IF NOT EXISTS newsletter_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL UNIQUE,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'unsubscribed')),
    subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    unsubscribed_at TIMESTAMP WITH TIME ZONE,
    source TEXT DEFAULT 'website'
);

-- =============================================
-- 2. Enable RLS
-- =============================================

ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE sample_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscriptions ENABLE ROW LEVEL SECURITY;

-- =============================================
-- 3. Drop all existing policies (clean slate)
-- =============================================

DROP POLICY IF EXISTS "Allow service role to manage contact submissions" ON contact_submissions;
DROP POLICY IF EXISTS "Service role can do everything on contact_submissions" ON contact_submissions;
DROP POLICY IF EXISTS "Allow authenticated to read contact submissions" ON contact_submissions;
DROP POLICY IF EXISTS "Anyone can insert contact submissions" ON contact_submissions;
DROP POLICY IF EXISTS "Allow anonymous contact form submissions" ON contact_submissions;

DROP POLICY IF EXISTS "Allow service role to manage sample submissions" ON sample_submissions;
DROP POLICY IF EXISTS "Service role can do everything on sample_submissions" ON sample_submissions;
DROP POLICY IF EXISTS "Allow authenticated to read sample submissions" ON sample_submissions;
DROP POLICY IF EXISTS "Anyone can insert sample submissions" ON sample_submissions;
DROP POLICY IF EXISTS "Allow anonymous sample submissions" ON sample_submissions;

DROP POLICY IF EXISTS "Allow service role to manage newsletter subscriptions" ON newsletter_subscriptions;
DROP POLICY IF EXISTS "Service role can do everything on newsletter_subscriptions" ON newsletter_subscriptions;
DROP POLICY IF EXISTS "Allow authenticated to read newsletter subscriptions" ON newsletter_subscriptions;
DROP POLICY IF EXISTS "Anyone can insert newsletter subscriptions" ON newsletter_subscriptions;
DROP POLICY IF EXISTS "Allow anonymous newsletter subscriptions" ON newsletter_subscriptions;
DROP POLICY IF EXISTS "Allow public read newsletter subscriptions" ON newsletter_subscriptions;

-- =============================================
-- 4. Create correct policies
-- =============================================

-- Service role: full access to everything (admin dashboard)
CREATE POLICY "service_role_contact_all" ON contact_submissions
    FOR ALL TO service_role
    USING (true) WITH CHECK (true);

CREATE POLICY "service_role_sample_all" ON sample_submissions
    FOR ALL TO service_role
    USING (true) WITH CHECK (true);

CREATE POLICY "service_role_newsletter_all" ON newsletter_subscriptions
    FOR ALL TO service_role
    USING (true) WITH CHECK (true);

-- Anon role: INSERT only (public form submissions)
CREATE POLICY "anon_contact_insert" ON contact_submissions
    FOR INSERT TO anon
    WITH CHECK (true);

CREATE POLICY "anon_sample_insert" ON sample_submissions
    FOR INSERT TO anon
    WITH CHECK (true);

CREATE POLICY "anon_newsletter_insert" ON newsletter_subscriptions
    FOR INSERT TO anon
    WITH CHECK (true);

-- Authenticated role: read access (for admin dashboard if using auth)
CREATE POLICY "authenticated_contact_select" ON contact_submissions
    FOR SELECT TO authenticated
    USING (true);

CREATE POLICY "authenticated_sample_select" ON sample_submissions
    FOR SELECT TO authenticated
    USING (true);

CREATE POLICY "authenticated_newsletter_select" ON newsletter_subscriptions
    FOR SELECT TO authenticated
    USING (true);

-- =============================================
-- 5. Grant table permissions
-- =============================================

GRANT ALL ON contact_submissions TO service_role;
GRANT ALL ON sample_submissions TO service_role;
GRANT ALL ON newsletter_subscriptions TO service_role;
GRANT INSERT ON contact_submissions TO anon;
GRANT INSERT ON sample_submissions TO anon;
GRANT INSERT ON newsletter_subscriptions TO anon;
GRANT SELECT ON contact_submissions TO authenticated;
GRANT SELECT ON sample_submissions TO authenticated;
GRANT SELECT ON newsletter_subscriptions TO authenticated;

-- =============================================
-- 6. Create indexes (if not exist)
-- =============================================

CREATE INDEX IF NOT EXISTS idx_contact_submissions_email ON contact_submissions(email);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_status ON contact_submissions(status);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_created_at ON contact_submissions(created_at);
CREATE INDEX IF NOT EXISTS idx_sample_submissions_email ON sample_submissions(email);
CREATE INDEX IF NOT EXISTS idx_sample_submissions_status ON sample_submissions(status);
CREATE INDEX IF NOT EXISTS idx_sample_submissions_created_at ON sample_submissions(created_at);
CREATE INDEX IF NOT EXISTS idx_newsletter_email ON newsletter_subscriptions(email);
CREATE INDEX IF NOT EXISTS idx_newsletter_status ON newsletter_subscriptions(status);
