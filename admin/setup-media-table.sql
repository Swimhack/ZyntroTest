-- Create CMS Media table for image management
CREATE TABLE IF NOT EXISTS public.cms_media (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    filename VARCHAR(255) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_size BIGINT NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    title VARCHAR(255),
    alt_text TEXT,
    width INTEGER DEFAULT 0,
    height INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_cms_media_created_at ON public.cms_media(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_cms_media_mime_type ON public.cms_media(mime_type);

-- Enable RLS
ALTER TABLE public.cms_media ENABLE ROW LEVEL SECURITY;

-- Create policies for anonymous access (for public viewing)
CREATE POLICY "Allow anonymous read access" ON public.cms_media
    FOR SELECT TO anon USING (true);

-- Create policies for authenticated users (for admin management)
CREATE POLICY "Allow authenticated users full access" ON public.cms_media
    FOR ALL TO authenticated USING (true);

-- Create policies for service role (for admin operations)
CREATE POLICY "Allow service role full access" ON public.cms_media
    FOR ALL TO service_role USING (true);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_cms_media_updated_at 
    BEFORE UPDATE ON public.cms_media 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
