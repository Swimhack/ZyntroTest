#!/usr/bin/env node
/**
 * Run Supabase SQL Schema
 * This script executes the setup-form-submissions.sql schema in Supabase
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// Supabase configuration
const SUPABASE_URL = 'https://hctdzwmlkgnuxcuhjooe.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhjdGR6d21sa2dudXhjdWhqb29lIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDEyMTY2MCwiZXhwIjoyMDc1Njk3NjYwfQ.V4Xr2nGmXO4Y9TJe51X1wAILIIAVL5ha61JoW9XmeV0';

// Read SQL file
const sqlFilePath = path.join(__dirname, 'setup-form-submissions.sql');
const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');

// Split SQL into individual statements (excluding comments and empty lines)
const statements = sqlContent
  .split(';')
  .map(s => s.trim())
  .filter(s => s && !s.startsWith('--'));

console.log(`Found ${statements.length} SQL statements to execute`);
console.log('Executing SQL schema...\n');

// Execute each SQL statement via Supabase REST API
async function executeSql(sql) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({ query: sql });

    const options = {
      hostname: 'hctdzwmlkgnuxcuhjooe.supabase.co',
      path: '/rest/v1/rpc/exec_sql',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'Content-Length': postData.length
      }
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve({ success: true, data });
        } else {
          reject({ success: false, status: res.statusCode, data });
        }
      });
    });

    req.on('error', (error) => {
      reject({ success: false, error: error.message });
    });

    req.write(postData);
    req.end();
  });
}

// Alternative approach: Use pg_query endpoint
async function executeViaPostgREST(sql) {
  return new Promise((resolve, reject) => {
    // For Supabase, we need to use their SQL editor API or directly connect
    // Since we can't use the SQL editor API directly, let's try a direct approach

    const { Client } = require('pg');

    const client = new Client({
      host: 'db.hctdzwmlkgnuxcuhjooe.supabase.co',
      port: 5432,
      database: 'postgres',
      user: 'postgres',
      password: 'your-password-here', // We don't have this
      ssl: { rejectUnauthorized: false }
    });

    client.connect()
      .then(() => client.query(sql))
      .then(result => {
        client.end();
        resolve({ success: true, result });
      })
      .catch(error => {
        client.end();
        reject({ success: false, error: error.message });
      });
  });
}

// Main execution
console.log('╔══════════════════════════════════════════════════════╗');
console.log('║   Supabase Schema Setup - Form Submissions          ║');
console.log('╚══════════════════════════════════════════════════════╝\n');

console.log('NOTE: This script requires direct database access.');
console.log('Please run the SQL manually in the Supabase SQL Editor:\n');
console.log(`1. Go to: ${SUPABASE_URL.replace('https://', 'https://supabase.com/dashboard/project/')}/sql/new`);
console.log('2. Copy the contents of: admin/setup-form-submissions.sql');
console.log('3. Paste into the SQL Editor');
console.log('4. Click "Run" to execute\n');

console.log('Alternatively, you can use the Supabase CLI:');
console.log('  supabase db push --db-url "postgresql://postgres:[YOUR-PASSWORD]@db.hctdzwmlkgnuxcuhjooe.supabase.co:5432/postgres"\n');

console.log('Schema preview:');
console.log('─'.repeat(60));
console.log(sqlContent.substring(0, 500) + '...');
console.log('─'.repeat(60));

console.log('\nTotal SQL file size:', sqlContent.length, 'bytes');
console.log('Number of statements:', statements.length);
