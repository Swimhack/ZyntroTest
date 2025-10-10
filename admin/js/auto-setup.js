// Automated Supabase Setup Verification and Configuration
// This script automatically checks and sets up the database if needed

const AutoSetup = {
    // Setup status
    isSetupComplete: false,
    setupErrors: [],
    setupWarnings: [],
    
    /**
     * Main setup verification function
     * @returns {Promise<Object>} Setup status and results
     */
    async verifyAndSetup() {
        console.log('🔍 Starting automated Supabase setup verification...');
        
        const results = {
            success: false,
            message: '',
            details: {
                supabaseConnection: false,
                databaseTables: false,
                storageBucket: false,
                sampleData: false,
                publicFunction: false
            },
            errors: [],
            warnings: []
        };
        
        try {
            // Step 1: Initialize Supabase
            await this.initializeSupabase();
            results.details.supabaseConnection = true;
            console.log('✅ Supabase connection established');
            
            // Step 2: Check and create database tables
            const tablesResult = await this.checkAndSetupTables();
            results.details.databaseTables = tablesResult.success;
            if (tablesResult.errors.length > 0) {
                results.errors.push(...tablesResult.errors);
            }
            
            // Step 3: Check and create storage bucket
            const storageResult = await this.checkAndSetupStorage();
            results.details.storageBucket = storageResult.success;
            if (storageResult.errors.length > 0) {
                results.errors.push(...storageResult.errors);
            }
            
            // Step 4: Check and insert sample data
            const dataResult = await this.checkAndSetupSampleData();
            results.details.sampleData = dataResult.success;
            if (dataResult.errors.length > 0) {
                results.warnings.push(...dataResult.errors); // Sample data failures are warnings
            }
            
            // Step 5: Check public search function
            const functionResult = await this.checkPublicFunction();
            results.details.publicFunction = functionResult.success;
            if (functionResult.errors.length > 0) {
                results.errors.push(...functionResult.errors);
            }
            
            // Determine overall success
            const criticalComponents = [
                results.details.supabaseConnection,
                results.details.databaseTables,
                results.details.storageBucket
            ];
            
            results.success = criticalComponents.every(component => component === true);
            results.errors = results.errors;
            results.warnings = results.warnings;
            
            if (results.success) {
                results.message = '✅ Supabase setup verification completed successfully!';
                console.log('🎉 All critical components are working correctly');
            } else {
                results.message = '❌ Supabase setup verification failed. Check errors for details.';
                console.error('❌ Setup verification failed:', results.errors);
            }
            
            this.isSetupComplete = results.success;
            this.setupErrors = results.errors;
            this.setupWarnings = results.warnings;
            
            // Display results to user
            this.displayResults(results);
            
            return results;
            
        } catch (error) {
            console.error('❌ Setup verification crashed:', error);
            results.success = false;
            results.message = `Setup verification failed: ${error.message}`;
            results.errors.push(error.message);
            
            this.displayResults(results);
            return results;
        }
    },
    
    /**
     * Initialize Supabase client
     */
    async initializeSupabase() {
        if (!window.supabaseClient || !window.supabaseAdmin) {
            if (typeof window.initSupabase === 'function') {
                await window.initSupabase();
            } else {
                throw new Error('Supabase initialization function not available');
            }
        }
        
        // Test connection
        const client = SupabaseUtils.getClient();
        const { error } = await client.from('_temp_connection_test').select('*').limit(1);
        // This will fail, but we're just testing if Supabase responds
        if (error && !error.message.includes('does not exist')) {
            throw new Error(`Supabase connection failed: ${error.message}`);
        }
    },
    
    /**
     * Check and setup database tables
     */
    async checkAndSetupTables() {
        const result = { success: false, errors: [] };
        
        try {
            const admin = SupabaseUtils.getAdminClient();
            
            // Check if coas table exists
            const { data, error } = await admin.from('coas').select('id').limit(1);
            
            if (error && error.code === '42P01') {
                // Table doesn't exist, try to create it
                console.log('📝 COAs table not found, attempting to create...');
                
                const createTableResult = await this.createCoasTable();
                if (createTableResult.success) {
                    result.success = true;
                    console.log('✅ COAs table created successfully');
                } else {
                    result.errors.push('Failed to create COAs table: ' + createTableResult.error);
                }
            } else if (error) {
                result.errors.push(`Database table check failed: ${error.message}`);
            } else {
                // Table exists and accessible
                result.success = true;
                console.log('✅ COAs table exists and accessible');
            }
            
        } catch (error) {
            result.errors.push(`Table setup error: ${error.message}`);
        }
        
        return result;
    },
    
    /**
     * Create the COAs table
     */
    async createCoasTable() {
        const result = { success: false, error: null };
        
        try {
            const admin = SupabaseUtils.getAdminClient();
            
            // Create table using SQL
            const { error } = await admin.rpc('exec_sql', {
                sql: `
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
                    
                    ALTER TABLE coas ENABLE ROW LEVEL SECURITY;
                    
                    CREATE POLICY "Allow all operations for service role" ON coas FOR ALL USING (true);
                    
                    CREATE INDEX IF NOT EXISTS idx_coas_client ON coas(client);
                    CREATE INDEX IF NOT EXISTS idx_coas_compound ON coas(compound);
                    CREATE INDEX IF NOT EXISTS idx_coas_analysis_type ON coas(analysis_type);
                    CREATE INDEX IF NOT EXISTS idx_coas_status ON coas(status);
                    CREATE INDEX IF NOT EXISTS idx_coas_created_at ON coas(created_at);
                `
            });
            
            if (error) {
                result.error = error.message;
            } else {
                result.success = true;
            }
            
        } catch (error) {
            result.error = error.message;
        }
        
        return result;
    },
    
    /**
     * Check and setup storage bucket
     */
    async checkAndSetupStorage() {
        const result = { success: false, errors: [] };
        
        try {
            const client = SupabaseUtils.getClient();
            
            // Check if bucket exists
            const { data: buckets, error: bucketsError } = await client.storage.listBuckets();
            
            if (bucketsError) {
                result.errors.push(`Storage check failed: ${bucketsError.message}`);
                return result;
            }
            
            const coaBucket = buckets.find(bucket => bucket.id === 'coa-files');
            
            if (!coaBucket) {
                console.log('📁 COA files bucket not found, attempting to create...');
                
                const { error: createError } = await client.storage.createBucket('coa-files', {
                    public: false,
                    fileSizeLimit: 10485760, // 10MB
                    allowedMimeTypes: ['application/pdf']
                });
                
                if (createError) {
                    result.errors.push(`Failed to create storage bucket: ${createError.message}`);
                } else {
                    result.success = true;
                    console.log('✅ COA files bucket created successfully');
                }
            } else {
                result.success = true;
                console.log('✅ COA files bucket exists');
            }
            
        } catch (error) {
            result.errors.push(`Storage setup error: ${error.message}`);
        }
        
        return result;
    },
    
    /**
     * Check and setup sample data
     */
    async checkAndSetupSampleData() {
        const result = { success: false, errors: [] };
        
        try {
            const admin = SupabaseUtils.getAdminClient();
            
            // Check if sample data exists
            const { data, error } = await admin.from('coas').select('id').in('id', ['ZT-2024-001', 'ZT-2024-025', 'ZT-2024-050']);
            
            if (error) {
                result.errors.push(`Sample data check failed: ${error.message}`);
                return result;
            }
            
            const existingIds = data.map(row => row.id);
            const sampleCOAs = [
                {
                    id: 'ZT-2024-001',
                    client: 'BioVenture Research',
                    compound: 'BPC-157',
                    analysis_type: 'Peptide Analysis',
                    test_date: '2024-10-01',
                    status: 'Complete',
                    purity: '99.8%',
                    created_by: 'system'
                },
                {
                    id: 'ZT-2024-025',
                    client: 'NutriPure Supplements',
                    compound: 'Pre-Workout Formula',
                    analysis_type: 'Supplement Screening',
                    test_date: '2024-10-05',
                    status: 'Complete',
                    result: 'PASS - No Adulterants',
                    created_by: 'system'
                },
                {
                    id: 'ZT-2024-050',
                    client: 'Apex Biotechnology',
                    compound: 'API Intermediate X-47B',
                    analysis_type: 'Biotech Analysis',
                    test_date: '2024-10-03',
                    status: 'Complete',
                    purity: '98.2%',
                    created_by: 'system'
                }
            ];
            
            const toInsert = sampleCOAs.filter(coa => !existingIds.includes(coa.id));
            
            if (toInsert.length > 0) {
                console.log(`📝 Inserting ${toInsert.length} sample COAs...`);
                
                const { error: insertError } = await admin.from('coas').insert(toInsert);
                
                if (insertError) {
                    result.errors.push(`Failed to insert sample data: ${insertError.message}`);
                } else {
                    result.success = true;
                    console.log(`✅ ${toInsert.length} sample COAs inserted successfully`);
                }
            } else {
                result.success = true;
                console.log('✅ Sample data already exists');
            }
            
        } catch (error) {
            result.errors.push(`Sample data setup error: ${error.message}`);
        }
        
        return result;
    },
    
    /**
     * Check public search function
     */
    async checkPublicFunction() {
        const result = { success: false, errors: [] };
        
        try {
            const client = SupabaseUtils.getClient();
            
            // Test the public function
            const { data, error } = await client.rpc('get_coa_by_id', { coa_id: 'ZT-2024-001' });
            
            if (error) {
                if (error.message.includes('does not exist')) {
                    result.errors.push('Public search function not found. Manual setup required in Supabase dashboard.');
                } else {
                    result.errors.push(`Public function error: ${error.message}`);
                }
            } else {
                result.success = true;
                console.log('✅ Public search function working correctly');
            }
            
        } catch (error) {
            result.errors.push(`Function check error: ${error.message}`);
        }
        
        return result;
    },
    
    /**
     * Display results to user
     */
    displayResults(results) {
        const container = this.getOrCreateResultsContainer();
        
        let statusClass = results.success ? 'setup-success' : 'setup-error';
        let statusIcon = results.success ? '✅' : '❌';
        
        const html = `
            <div class="setup-results ${statusClass}">
                <h3>${statusIcon} Database Setup Verification</h3>
                <p><strong>${results.message}</strong></p>
                
                <div class="setup-details">
                    <h4>Component Status:</h4>
                    <ul>
                        <li>Supabase Connection: ${results.details.supabaseConnection ? '✅' : '❌'}</li>
                        <li>Database Tables: ${results.details.databaseTables ? '✅' : '❌'}</li>
                        <li>Storage Bucket: ${results.details.storageBucket ? '✅' : '❌'}</li>
                        <li>Sample Data: ${results.details.sampleData ? '✅' : '⚠️'}</li>
                        <li>Public Function: ${results.details.publicFunction ? '✅' : '⚠️'}</li>
                    </ul>
                </div>
                
                ${results.errors.length > 0 ? `
                    <div class="setup-errors">
                        <h4>❌ Errors:</h4>
                        <ul>${results.errors.map(error => `<li>${error}</li>`).join('')}</ul>
                    </div>
                ` : ''}
                
                ${results.warnings.length > 0 ? `
                    <div class="setup-warnings">
                        <h4>⚠️ Warnings:</h4>
                        <ul>${results.warnings.map(warning => `<li>${warning}</li>`).join('')}</ul>
                    </div>
                ` : ''}
                
                ${!results.success ? `
                    <div class="setup-manual">
                        <h4>Manual Setup Required:</h4>
                        <p>Some components couldn't be set up automatically. Please:</p>
                        <ol>
                            <li>Go to your Supabase dashboard: <a href="https://app.supabase.com" target="_blank">https://app.supabase.com</a></li>
                            <li>Open the SQL Editor</li>
                            <li>Copy and paste the contents of <code>admin/setup-database.sql</code></li>
                            <li>Click Run to execute the SQL</li>
                            <li>Refresh this page to verify setup</li>
                        </ol>
                    </div>
                ` : ''}
                
                <button onclick="AutoSetup.verifyAndSetup()" class="btn btn-primary setup-recheck">
                    🔄 Recheck Setup
                </button>
            </div>
        `;
        
        container.innerHTML = html;
        container.style.display = 'block';
    },
    
    /**
     * Get or create results container
     */
    getOrCreateResultsContainer() {
        let container = document.getElementById('setup-results-container');
        
        if (!container) {
            container = document.createElement('div');
            container.id = 'setup-results-container';
            container.className = 'setup-results-container';
            
            // Add styles
            this.addSetupStyles();
            
            // Insert at the top of main content
            const mainContent = document.querySelector('.main-content') || document.body;
            const firstChild = mainContent.firstChild;
            mainContent.insertBefore(container, firstChild);
        }
        
        return container;
    },
    
    /**
     * Add setup styles
     */
    addSetupStyles() {
        if (document.getElementById('setup-styles')) return;
        
        const styles = document.createElement('style');
        styles.id = 'setup-styles';
        styles.textContent = `
            .setup-results-container {
                margin-bottom: 2rem;
                position: relative;
                z-index: 1000;
            }
            
            .setup-results {
                background: white;
                border-radius: 8px;
                padding: 1.5rem;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                border-left: 4px solid #10b981;
            }
            
            .setup-results.setup-error {
                border-left-color: #ef4444;
            }
            
            .setup-results h3 {
                margin: 0 0 1rem 0;
                font-size: 1.25rem;
                color: #1f2937;
            }
            
            .setup-details ul, .setup-errors ul, .setup-warnings ul {
                margin: 0.5rem 0;
                padding-left: 1.5rem;
            }
            
            .setup-details li {
                margin-bottom: 0.25rem;
                font-family: monospace;
            }
            
            .setup-errors {
                background: #fef2f2;
                border: 1px solid #fecaca;
                border-radius: 4px;
                padding: 1rem;
                margin: 1rem 0;
            }
            
            .setup-warnings {
                background: #fffbeb;
                border: 1px solid #fed7aa;
                border-radius: 4px;
                padding: 1rem;
                margin: 1rem 0;
            }
            
            .setup-manual {
                background: #f0f9ff;
                border: 1px solid #bae6fd;
                border-radius: 4px;
                padding: 1rem;
                margin: 1rem 0;
            }
            
            .setup-manual code {
                background: #e5e7eb;
                padding: 2px 4px;
                border-radius: 2px;
                font-family: monospace;
            }
            
            .setup-recheck {
                margin-top: 1rem;
            }
        `;
        
        document.head.appendChild(styles);
    }
};

// Auto-run setup verification when script loads
document.addEventListener('DOMContentLoaded', async () => {
    // Wait a moment for other scripts to load
    setTimeout(async () => {
        try {
            await AutoSetup.verifyAndSetup();
        } catch (error) {
            console.error('Auto-setup failed:', error);
        }
    }, 2000);
});

// Export for global access
window.AutoSetup = AutoSetup;