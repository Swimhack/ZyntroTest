-- Fix Admin Access to Form Submissions
-- This grants the service_role full SELECT access to read submissions

-- Drop and recreate service role policies with SELECT permission
DROP POLICY IF EXISTS "Allow service role to manage contact submissions" ON contact_submissions;
CREATE POLICY "Allow service role to manage contact submissions" ON contact_submissions
    FOR ALL 
    TO service_role
    USING (true)
    WITH CHECK (true);

DROP POLICY IF EXISTS "Allow service role to manage sample submissions" ON sample_submissions;
CREATE POLICY "Allow service role to manage sample submissions" ON sample_submissions
    FOR ALL 
    TO service_role
    USING (true)
    WITH CHECK (true);

DROP POLICY IF EXISTS "Allow service role to manage newsletter subscriptions" ON newsletter_subscriptions;
CREATE POLICY "Allow service role to manage newsletter subscriptions" ON newsletter_subscriptions
    FOR ALL 
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Also allow authenticated role to read (for admin dashboard)
DROP POLICY IF EXISTS "Allow authenticated to read contact submissions" ON contact_submissions;
CREATE POLICY "Allow authenticated to read contact submissions" ON contact_submissions
    FOR SELECT
    TO authenticated
    USING (true);

DROP POLICY IF EXISTS "Allow authenticated to read sample submissions" ON sample_submissions;
CREATE POLICY "Allow authenticated to read sample submissions" ON sample_submissions
    FOR SELECT
    TO authenticated
    USING (true);

DROP POLICY IF EXISTS "Allow authenticated to read newsletter subscriptions" ON newsletter_subscriptions;
CREATE POLICY "Allow authenticated to read newsletter subscriptions" ON newsletter_subscriptions
    FOR SELECT
    TO authenticated
    USING (true);
