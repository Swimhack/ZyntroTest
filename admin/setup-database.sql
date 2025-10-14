-- ZyntroTest COA Database Schema
-- Run this SQL in your Supabase SQL Editor to set up the database

-- Create COAs table
CREATE TABLE IF NOT EXISTS coas (
    id TEXT PRIMARY KEY,
    client TEXT NOT NULL,
    compound TEXT NOT NULL,
    analysis_type TEXT NOT NULL,
    test_date DATE,
    status TEXT DEFAULT 'Complete' CHECK (status IN ('Complete', 'Pending', 'In Progress')),
    purity TEXT,
    result TEXT,
    notes TEXT,
    file_name TEXT,
    file_size BIGINT,
    file_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by TEXT
);

-- Enable Row Level Security
ALTER TABLE coas ENABLE ROW LEVEL SECURITY;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_coas_client ON coas(client);
CREATE INDEX IF NOT EXISTS idx_coas_compound ON coas(compound);
CREATE INDEX IF NOT EXISTS idx_coas_analysis_type ON coas(analysis_type);
CREATE INDEX IF NOT EXISTS idx_coas_status ON coas(status);
CREATE INDEX IF NOT EXISTS idx_coas_created_at ON coas(created_at);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_coas_updated_at ON coas;
CREATE TRIGGER update_coas_updated_at
    BEFORE UPDATE ON coas
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create RLS policies
CREATE POLICY "Allow all operations for service role" ON coas
    FOR ALL USING (true);

-- Alternative policy for authenticated users (uncomment if you want to use Supabase Auth)
-- CREATE POLICY "Allow authenticated users to manage COAs" ON coas
--     FOR ALL USING (auth.role() = 'authenticated');

-- Create storage bucket for COA files (public for downloads)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) 
VALUES ('coa-files', 'coa-files', true, 10485760, ARRAY['application/pdf'])
ON CONFLICT (id) DO UPDATE SET public = true;

-- Storage policies for COA files
CREATE POLICY "Allow service role to manage COA files" ON storage.objects
    FOR ALL USING (bucket_id = 'coa-files');

-- Allow public downloads of COA files
CREATE POLICY "Allow public download of COA files" ON storage.objects
    FOR SELECT USING (bucket_id = 'coa-files');

-- Alternative storage policy for authenticated users (uncomment if you want to use Supabase Auth)
-- CREATE POLICY "Allow authenticated users to upload COA files" ON storage.objects
--     FOR ALL USING (bucket_id = 'coa-files' AND auth.role() = 'authenticated');

-- Insert sample data (optional)
INSERT INTO coas (id, client, compound, analysis_type, test_date, status, purity, created_by) VALUES
('ZT-2024-001', 'BioVenture Research', 'BPC-157', 'Peptide Analysis', '2024-10-01', 'Complete', '99.8%', 'system'),
('ZT-2024-025', 'NutriPure Supplements', 'Pre-Workout Formula', 'Supplement Screening', '2024-10-05', 'Complete', NULL, 'system'),
('ZT-2024-050', 'Apex Biotechnology', 'API Intermediate X-47B', 'Biotech Analysis', '2024-10-03', 'Complete', '98.2%', 'system')
ON CONFLICT (id) DO NOTHING;

-- Create a view for public COA access (matches the existing frontend structure)
CREATE OR REPLACE VIEW public_coas AS
SELECT 
    id,
    client,
    compound,
    analysis_type as type,
    to_char(test_date, 'Month DD, YYYY') as date,
    status,
    purity,
    result,
    created_at
FROM coas
WHERE status = 'Complete';

-- Grant access to the view
GRANT SELECT ON public_coas TO anon, authenticated;

-- Function to get COA by ID (for the public search)
CREATE OR REPLACE FUNCTION get_coa_by_id(coa_id TEXT)
RETURNS TABLE (
    id TEXT,
    client TEXT,
    compound TEXT,
    type TEXT,
    date TEXT,
    status TEXT,
    purity TEXT,
    result TEXT,
    notes TEXT,
    file_url TEXT,
    file_name TEXT
) 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.id,
        c.client,
        c.compound,
        c.analysis_type as type,
        to_char(c.test_date, 'Month DD, YYYY') as date,
        c.status,
        c.purity,
        c.result,
        c.notes,
        c.file_url,
        c.file_name
    FROM coas c
    WHERE c.id = UPPER(coa_id) AND c.status = 'Complete';
END;
$$ LANGUAGE plpgsql;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION get_coa_by_id(TEXT) TO anon, authenticated;