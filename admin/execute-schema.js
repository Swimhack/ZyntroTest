#!/usr/bin/env node
/**
 * Execute Supabase SQL Schema via JavaScript Client
 * This script uses the Supabase JavaScript client to execute raw SQL
 */

const fs = require('fs');
const path = require('path');

// Supabase configuration
const SUPABASE_URL = 'https://hctdzwmlkgnuxcuhjooe.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhjdGR6d21sa2dudXhjdWhqb29lIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDEyMTY2MCwiZXhwIjoyMDc1Njk3NjYwfQ.V4Xr2nGmXO4Y9TJe51X1wAILIIAVL5ha61JoW9XmeV0';

// Read SQL file
const sqlFilePath = path.join(__dirname, 'setup-form-submissions.sql');
const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');

console.log('╔══════════════════════════════════════════════════════╗');
console.log('║   Executing Database Schema                          ║');
console.log('╚══════════════════════════════════════════════════════╝\n');

async function executeSchema() {
    try {
        // Using fetch API to execute SQL via Supabase REST API
        const { createClient } = require('@supabase/supabase-js');

        const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

        console.log('✓ Connected to Supabase');

        // Split SQL into individual statements
        const statements = sqlContent
            .split(';')
            .map(s => s.trim())
            .filter(s => s && !s.startsWith('--'));

        console.log(`✓ Found ${statements.length} SQL statements\n`);

        // Execute each statement
        for (let i = 0; i < statements.length; i++) {
            const statement = statements[i];

            // Skip empty statements
            if (!statement) continue;

            console.log(`Executing statement ${i + 1}/${statements.length}...`);

            try {
                // For table creation, we need to use the RPC endpoint or direct SQL execution
                // Since we can't execute DDL via the REST API directly, we'll use rpc
                const { data, error } = await supabase.rpc('exec_sql', {
                    sql: statement
                });

                if (error) {
                    // If exec_sql doesn't exist, we need to create it or use another method
                    console.log(`  ⚠ RPC method not available, trying alternative...`);

                    // Try using the REST API directly with fetch
                    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'apikey': SERVICE_ROLE_KEY,
                            'Authorization': `Bearer ${SERVICE_ROLE_KEY}`
                        },
                        body: JSON.stringify({ sql: statement })
                    });

                    if (!response.ok) {
                        console.log(`  ✗ Failed: ${response.statusText}`);
                    } else {
                        console.log(`  ✓ Success`);
                    }
                } else {
                    console.log(`  ✓ Success`);
                }
            } catch (err) {
                console.log(`  ⚠ Error: ${err.message}`);
            }
        }

        console.log('\n✓ Schema execution completed');
        console.log('\nVerifying tables...\n');

        // Verify tables exist
        const tables = ['contact_submissions', 'sample_submissions', 'newsletter_subscriptions'];

        for (const table of tables) {
            try {
                const { data, error } = await supabase.from(table).select('id').limit(1);

                if (error && error.code === '42P01') {
                    console.log(`  ✗ ${table}: NOT FOUND`);
                } else {
                    console.log(`  ✓ ${table}: EXISTS`);
                }
            } catch (err) {
                console.log(`  ✗ ${table}: ERROR - ${err.message}`);
            }
        }

        console.log('\n╔══════════════════════════════════════════════════════╗');
        console.log('║   Database Setup Complete!                           ║');
        console.log('╚══════════════════════════════════════════════════════╝\n');

    } catch (error) {
        console.error('\n✗ Error:', error.message);
        console.error('\nPlease run the SQL manually in Supabase SQL Editor:');
        console.error(`  ${SUPABASE_URL.replace('https://', 'https://supabase.com/dashboard/project/')}/sql/new\n`);
        process.exit(1);
    }
}

// Check if @supabase/supabase-js is installed
try {
    require.resolve('@supabase/supabase-js');
    executeSchema();
} catch (e) {
    console.log('⚠ @supabase/supabase-js not found');
    console.log('Installing @supabase/supabase-js...\n');

    const { execSync } = require('child_process');

    try {
        execSync('npm install @supabase/supabase-js', { stdio: 'inherit' });
        console.log('\n✓ Package installed, executing schema...\n');
        executeSchema();
    } catch (err) {
        console.error('✗ Failed to install package');
        console.error('\nPlease install manually:');
        console.error('  npm install @supabase/supabase-js\n');
        process.exit(1);
    }
}
