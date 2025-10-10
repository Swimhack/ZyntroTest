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
        
        // Test connection by checking if we can access Supabase at all
        try {
            const client = SupabaseUtils.getClient();
            // Try to list storage buckets as a connectivity test
            const { error } = await client.storage.listBuckets();
            // Any response (even permission denied) means we're connected
            if (error && error.message.includes('network') || error.message.includes('connection')) {
                throw new Error(`Supabase connection failed: ${error.message}`);
            }
            // If we get here, Supabase is reachable
        } catch (error) {
            if (error.message.includes('network') || error.message.includes('connection')) {
                throw new Error(`Supabase connection failed: ${error.message}`);
            }
            // Other errors are fine - just means we're connected but have permission issues, which is normal
        }
    },
    
    /**
     * Check and setup database tables
     */
    async checkAndSetupTables() {
        const result = { success: false, errors: [] };
        
        try {
            const admin = SupabaseUtils.getAdminClient();
            
            // Check if coas table exists by trying to query it
            const { data, error } = await admin.from('coas').select('id').limit(1);
            
            if (error) {
                if (error.code === '42P01' || error.message.includes('does not exist')) {
                    // Table doesn't exist, but since you already ran the SQL, let's report this as an issue
                    result.errors.push('COAs table not found. Please verify the SQL script was executed correctly in Supabase dashboard.');
                } else if (error.code === '42501' || error.message.includes('permission denied')) {
                    // Permission denied - this might be a policy issue, but table exists
                    console.log('⚠️ COAs table exists but access restricted by RLS policy');
                    result.success = true; // Table exists, just policy restricted
                } else {
                    result.errors.push(`Database table check failed: ${error.message}`);
                }
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
     * Create the COAs table (removed - database should be set up manually)
     */
    async createCoasTable() {
        // Since the database is already set up via SQL script, we don't auto-create tables
        return { success: false, error: 'Table creation disabled. Please run setup-database.sql manually.' };
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
            
            // Try to check if any COAs exist (sample data check)
            const { data, error } = await admin.from('coas').select('id').limit(5);
            
            if (error) {
                // If there's an error accessing the table, report it but don't fail the whole setup
                result.errors.push(`Cannot check sample data: ${error.message}`);
                result.success = false;
                return result;
            }
            
            if (data && data.length > 0) {
                result.success = true;
                console.log(`✅ Found ${data.length} COA(s) in database`);
            } else {
                // No data found, but that's okay - maybe they haven't added any yet
                result.success = true;
                console.log('ℹ️ No COAs found in database (this is normal for new installations)');
            }
            
        } catch (error) {
            result.errors.push(`Sample data check error: ${error.message}`);
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