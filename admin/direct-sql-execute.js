#!/usr/bin/env node
/**
 * Direct SQL Execution via Supabase Management API
 * This script executes SQL statements directly in the database
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// Supabase configuration
const SUPABASE_PROJECT_REF = 'hctdzwmlkgnuxcuhjooe';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhjdGR6d21sa2dudXhjdWhqb29lIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDEyMTY2MCwiZXhwIjoyMDc1Njk3NjYwfQ.V4Xr2nGmXO4Y9TJe51X1wAILIIAVL5ha61JoW9XmeV0';

console.log('╔══════════════════════════════════════════════════════╗');
console.log('║   Database Setup via Supabase Web Interface          ║');
console.log('╚══════════════════════════════════════════════════════╝\n');

console.log('⚠️  Direct SQL execution via API requires additional authentication.');
console.log('The tables need to be created using the Supabase SQL Editor.\n');

console.log('📋 Follow these steps:\n');
console.log('1. Go to: https://supabase.com/dashboard/project/' + SUPABASE_PROJECT_REF + '/sql/new');
console.log('2. Copy the SQL schema from: admin/setup-form-submissions.sql');
console.log('3. Paste it into the SQL Editor');
console.log('4. Click "Run" to execute');
console.log('5. Run the test script again: node admin/test-forms.js\n');

console.log('Alternative: Open admin/setup-database.html in a browser');
console.log('  - It will check table status automatically');
console.log('  - Copy SQL if tables are missing');
console.log('  - Run in Supabase SQL Editor\n');

// Read and display the SQL schema
const sqlFilePath = path.join(__dirname, 'setup-form-submissions.sql');
const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');

console.log('─'.repeat(60));
console.log('SQL Schema Preview (first 1000 characters):');
console.log('─'.repeat(60));
console.log(sqlContent.substring(0, 1000) + '\n...\n');
console.log('─'.repeat(60));
console.log(`\nFull schema file: ${sqlFilePath}`);
console.log(`Schema size: ${sqlContent.length} bytes`);
console.log(`Statements: ~${sqlContent.split(';').filter(s => s.trim()).length}\n`);
