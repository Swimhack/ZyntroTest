-- Form Submissions Database Schema
-- Run this SQL in your Supabase SQL Editor to set up form submission tables

-- Contact form submissions table
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

-- Sample submission form table
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

-- Newsletter subscriptions table
CREATE TABLE IF NOT EXISTS newsletter_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL UNIQUE,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'unsubscribed')),
    subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    unsubscribed_at TIMESTAMP WITH TIME ZONE,
    source TEXT DEFAULT 'website'
);

-- Enable Row Level Security
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE sample_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscriptions ENABLE ROW LEVEL SECURITY;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_contact_submissions_email ON contact_submissions(email);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_status ON contact_submissions(status);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_created_at ON contact_submissions(created_at);

CREATE INDEX IF NOT EXISTS idx_sample_submissions_email ON sample_submissions(email);
CREATE INDEX IF NOT EXISTS idx_sample_submissions_status ON sample_submissions(status);
CREATE INDEX IF NOT EXISTS idx_sample_submissions_created_at ON sample_submissions(created_at);

CREATE INDEX IF NOT EXISTS idx_newsletter_email ON newsletter_subscriptions(email);
CREATE INDEX IF NOT EXISTS idx_newsletter_status ON newsletter_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribed_at ON newsletter_subscriptions(subscribed_at);

-- Create updated_at trigger function (reuse existing if available)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_contact_submissions_updated_at ON contact_submissions;
CREATE TRIGGER update_contact_submissions_updated_at
    BEFORE UPDATE ON contact_submissions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_sample_submissions_updated_at ON sample_submissions;
CREATE TRIGGER update_sample_submissions_updated_at
    BEFORE UPDATE ON sample_submissions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create RLS policies for service role access
CREATE POLICY "Allow service role to manage contact submissions" ON contact_submissions
    FOR ALL USING (true);

CREATE POLICY "Allow service role to manage sample submissions" ON sample_submissions
    FOR ALL USING (true);

CREATE POLICY "Allow service role to manage newsletter subscriptions" ON newsletter_subscriptions
    FOR ALL USING (true);

-- Allow public read access for newsletter subscriptions (for unsubscribe functionality)
CREATE POLICY "Allow public read newsletter subscriptions" ON newsletter_subscriptions
    FOR SELECT USING (true);

-- Grant permissions
GRANT ALL ON contact_submissions TO service_role;
GRANT ALL ON sample_submissions TO service_role;
GRANT ALL ON newsletter_subscriptions TO service_role;

-- Grant select permissions to anon for newsletter (unsubscribe)
GRANT SELECT ON newsletter_subscriptions TO anon;

-- RLS policies to allow public (anon) INSERTs from website forms
-- NOTE: These allow unauthenticated inserts only; reads remain restricted.
CREATE POLICY IF NOT EXISTS "Allow public insert contact submissions" ON contact_submissions
    FOR INSERT
    WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "Allow public insert sample submissions" ON sample_submissions
    FOR INSERT
    WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "Allow public insert newsletter subscriptions" ON newsletter_subscriptions
    FOR INSERT
    WITH CHECK (true);
