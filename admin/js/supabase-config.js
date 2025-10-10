// Supabase Configuration and Client Setup
// Handles connection to Supabase database and storage

// Supabase configuration
const SUPABASE_CONFIG = {
    url: 'https://hctdzwmlkgnuxcuhjooe.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhjdGR6d21sa2dudXhjdWhqb29lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAxMjE2NjAsImV4cCI6MjA3NTY5NzY2MH0.EzxFceWzutTtlJvKpzI5UbWug3B8o2e5hFWi0yaXHog',
    serviceRoleKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhjdGR6d21sa2dudXhjdWhqb29lIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDEyMTY2MCwiZXhwIjoyMDc1Njk3NjYwfQ.V4Xr2nGmXO4Y9TJe51X1wAILIIAVL5ha61JoW9XmeV0'
};

// Initialize Supabase client
let supabaseClient = null;
let supabaseAdmin = null;

// Load Supabase library from CDN
const loadSupabase = () => {
    return new Promise((resolve, reject) => {
        if (window.supabase) {
            resolve(window.supabase);
            return;
        }
        
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/@supabase/supabase-js@2.39.3/dist/umd/supabase.js';
        script.onload = () => {
            if (window.supabase) {
                resolve(window.supabase);
            } else {
                reject(new Error('Supabase library failed to load'));
            }
        };
        script.onerror = () => reject(new Error('Failed to load Supabase library'));
        document.head.appendChild(script);
    });
};

// Initialize Supabase clients
const initSupabase = async () => {
    try {
        const supabase = await loadSupabase();
        
        // Initialize regular client (for user operations)
        supabaseClient = supabase.createClient(
            SUPABASE_CONFIG.url,
            SUPABASE_CONFIG.anonKey
        );
        
        // Initialize admin client (for admin operations)
        supabaseAdmin = supabase.createClient(
            SUPABASE_CONFIG.url,
            SUPABASE_CONFIG.serviceRoleKey
        );
        
        console.log('Supabase clients initialized successfully');
        return { client: supabaseClient, admin: supabaseAdmin };
    } catch (error) {
        console.error('Failed to initialize Supabase:', error);
        throw error;
    }
};

// Supabase utilities
const SupabaseUtils = {
    /**
     * Get the initialized Supabase client
     * @returns {Object} Supabase client
     */
    getClient() {
        if (!supabaseClient) {
            throw new Error('Supabase client not initialized. Call initSupabase() first.');
        }
        return supabaseClient;
    },
    
    /**
     * Get the initialized Supabase admin client
     * @returns {Object} Supabase admin client
     */
    getAdminClient() {
        if (!supabaseAdmin) {
            throw new Error('Supabase admin client not initialized. Call initSupabase() first.');
        }
        return supabaseAdmin;
    },
    
    /**
     * Handle Supabase errors
     * @param {Object} error Supabase error object
     * @returns {string} User-friendly error message
     */
    handleError(error) {
        console.error('Supabase Error:', error);
        
        if (error.code) {
            switch (error.code) {
                case '23505':
                    return 'This record already exists';
                case '23503':
                    return 'Referenced record not found';
                case '42P01':
                    return 'Database table not found';
                case '42703':
                    return 'Database column not found';
                default:
                    return error.message || 'Database operation failed';
            }
        }
        
        return error.message || 'An unexpected error occurred';
    },
    
    /**
     * Check if Supabase is connected
     * @returns {Promise<boolean>}
     */
    async isConnected() {
        try {
            const client = this.getClient();
            const { data, error } = await client.from('coas').select('count').limit(1);
            return !error;
        } catch (error) {
            console.warn('Supabase connection check failed:', error);
            return false;
        }
    },
    
    /**
     * Create database tables if they don't exist
     * @returns {Promise<boolean>}
     */
    async setupDatabase() {
        try {
            const admin = this.getAdminClient();
            
            // Check if tables exist by trying a simple query
            const { error: coasError } = await admin.from('coas').select('id').limit(1);
            
            if (coasError && coasError.code === '42P01') {
                console.log('Database tables not found. Please create them in Supabase dashboard.');
                return false;
            }
            
            console.log('Database tables verified');
            return true;
        } catch (error) {
            console.error('Database setup error:', error);
            return false;
        }
    }
};

// Database schema documentation
const DATABASE_SCHEMA = `
-- COAs table
CREATE TABLE IF NOT EXISTS coas (
    id TEXT PRIMARY KEY,
    client TEXT NOT NULL,
    compound TEXT NOT NULL,
    analysis_type TEXT NOT NULL,
    test_date DATE,
    status TEXT DEFAULT 'Complete',
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

-- Create policy for authenticated users
CREATE POLICY "Allow authenticated users to manage COAs" ON coas
    FOR ALL USING (auth.role() = 'authenticated');

-- Create storage bucket for COA files
INSERT INTO storage.buckets (id, name, public) 
VALUES ('coa-files', 'coa-files', false);

-- Storage policy for COA files
CREATE POLICY "Allow authenticated users to upload COA files" ON storage.objects
    FOR ALL USING (bucket_id = 'coa-files' AND auth.role() = 'authenticated');
`;

// Export for use in other modules
window.SUPABASE_CONFIG = SUPABASE_CONFIG;
window.SupabaseUtils = SupabaseUtils;
window.initSupabase = initSupabase;
window.DATABASE_SCHEMA = DATABASE_SCHEMA;

// Auto-initialize when script loads
document.addEventListener('DOMContentLoaded', async () => {
    try {
        await initSupabase();
        console.log('Supabase auto-initialization complete');
    } catch (error) {
        console.error('Supabase auto-initialization failed:', error);
    }
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { SUPABASE_CONFIG, SupabaseUtils, initSupabase };
}