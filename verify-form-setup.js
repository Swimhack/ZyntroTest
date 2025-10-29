// Form Submission Setup Verification Script
// Run with: node verify-form-setup.js

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// ANSI color codes
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkmark() {
    return `${colors.green}✓${colors.reset}`;
}

function crossmark() {
    return `${colors.red}✗${colors.reset}`;
}

async function verifySetup() {
    log('\n=== Form Submission Setup Verification ===\n', 'cyan');
    
    let allPassed = true;
    
    // Check 1: Verify SQL schema file exists
    log('1. Checking SQL schema file...', 'blue');
    const sqlPath = path.join(__dirname, 'admin', 'setup-form-submissions.sql');
    if (fs.existsSync(sqlPath)) {
        log(`   ${checkmark()} SQL schema file found at ${sqlPath}`, 'green');
    } else {
        log(`   ${crossmark()} SQL schema file NOT found at ${sqlPath}`, 'red');
        allPassed = false;
    }
    
    // Check 2: Verify JavaScript files
    log('\n2. Checking JavaScript files...', 'blue');
    const requiredFiles = [
        'js/email-config.js',
        'js/script.js',
        'admin/js/submissions-manager.js'
    ];
    
    requiredFiles.forEach(file => {
        const filePath = path.join(__dirname, file);
        if (fs.existsSync(filePath)) {
            log(`   ${checkmark()} ${file}`, 'green');
        } else {
            log(`   ${crossmark()} ${file} NOT found`, 'red');
            allPassed = false;
        }
    });
    
    // Check 3: Verify contact.html has Supabase initialization
    log('\n3. Checking contact.html configuration...', 'blue');
    const contactPath = path.join(__dirname, 'contact.html');
    if (fs.existsSync(contactPath)) {
        const content = fs.readFileSync(contactPath, 'utf8');
        
        if (content.includes('supabase.createClient')) {
            log(`   ${checkmark()} Supabase client initialization found`, 'green');
        } else {
            log(`   ${crossmark()} Supabase client initialization NOT found`, 'red');
            allPassed = false;
        }
        
        if (content.includes('email-config.js')) {
            log(`   ${checkmark()} email-config.js script included`, 'green');
        } else {
            log(`   ${crossmark()} email-config.js script NOT included`, 'red');
            allPassed = false;
        }
        
        if (content.includes('script.js')) {
            log(`   ${checkmark()} script.js included`, 'green');
        } else {
            log(`   ${crossmark()} script.js NOT included`, 'red');
            allPassed = false;
        }
    } else {
        log(`   ${crossmark()} contact.html NOT found`, 'red');
        allPassed = false;
    }
    
    // Check 4: Verify admin/submissions.html
    log('\n4. Checking admin/submissions.html configuration...', 'blue');
    const adminPath = path.join(__dirname, 'admin', 'submissions.html');
    if (fs.existsSync(adminPath)) {
        const content = fs.readFileSync(adminPath, 'utf8');
        
        if (content.includes('supabaseAdmin')) {
            log(`   ${checkmark()} Admin Supabase client initialization found`, 'green');
        } else {
            log(`   ${crossmark()} Admin Supabase client initialization NOT found`, 'red');
            allPassed = false;
        }
        
        if (content.includes('submissions-manager.js')) {
            log(`   ${checkmark()} submissions-manager.js script included`, 'green');
        } else {
            log(`   ${crossmark()} submissions-manager.js script NOT included`, 'red');
            allPassed = false;
        }
    } else {
        log(`   ${crossmark()} admin/submissions.html NOT found`, 'red');
        allPassed = false;
    }
    
    // Check 5: Database Connection Test (if credentials available)
    log('\n5. Testing database connection...', 'blue');
    
    try {
        // Try to read Supabase URL from contact.html
        const contactContent = fs.readFileSync(contactPath, 'utf8');
        const urlMatch = contactContent.match(/'(https:\/\/[a-z]+\.supabase\.co)'/);
        const keyMatch = contactContent.match(/'eyJ[^']+'/g);
        
        if (urlMatch && keyMatch && keyMatch.length > 0) {
            const supabaseUrl = urlMatch[1];
            const anonKey = keyMatch[0].replace(/'/g, '');
            
            log(`   ${checkmark()} Supabase credentials found`, 'green');
            log(`   Testing connection to: ${supabaseUrl}`, 'cyan');
            
            const supabase = createClient(supabaseUrl, anonKey);
            
            // Test each table
            const tables = ['contact_submissions', 'sample_submissions', 'newsletter_subscriptions'];
            
            for (const table of tables) {
                try {
                    const { data, error } = await supabase
                        .from(table)
                        .select('id')
                        .limit(1);
                    
                    if (error) {
                        if (error.message.includes('does not exist')) {
                            log(`   ${crossmark()} Table "${table}" does not exist - run SQL schema!`, 'red');
                            allPassed = false;
                        } else if (error.message.includes('permission denied')) {
                            log(`   ${crossmark()} Table "${table}" - RLS policy issue`, 'red');
                            allPassed = false;
                        } else {
                            log(`   ${crossmark()} Table "${table}" - Error: ${error.message}`, 'red');
                            allPassed = false;
                        }
                    } else {
                        log(`   ${checkmark()} Table "${table}" accessible`, 'green');
                    }
                } catch (err) {
                    log(`   ${crossmark()} Table "${table}" - ${err.message}`, 'red');
                    allPassed = false;
                }
            }
            
            // Test INSERT permission
            log(`\n   Testing INSERT permission...`, 'cyan');
            const testData = {
                name: 'Test Verification',
                email: 'verify@test.com',
                status: 'unread',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };
            
            const { data: insertData, error: insertError } = await supabase
                .from('contact_submissions')
                .insert([testData])
                .select();
            
            if (insertError) {
                log(`   ${crossmark()} INSERT test failed: ${insertError.message}`, 'red');
                log(`   Make sure RLS policies allow public INSERT`, 'yellow');
                allPassed = false;
            } else {
                log(`   ${checkmark()} INSERT permission working`, 'green');
                
                // Clean up test data
                if (insertData && insertData[0]) {
                    await supabase
                        .from('contact_submissions')
                        .delete()
                        .eq('id', insertData[0].id);
                    log(`   ${checkmark()} Test data cleaned up`, 'green');
                }
            }
            
        } else {
            log(`   ${colors.yellow}⚠${colors.reset} Could not extract Supabase credentials from contact.html`, 'yellow');
            log(`   Skipping database connection test`, 'yellow');
        }
    } catch (error) {
        log(`   ${crossmark()} Database test error: ${error.message}`, 'red');
        allPassed = false;
    }
    
    // Check 6: Playwright test file
    log('\n6. Checking Playwright test...', 'blue');
    const testPath = path.join(__dirname, 'tests', 'contact-form.spec.js');
    if (fs.existsSync(testPath)) {
        const content = fs.readFileSync(testPath, 'utf8');
        
        if (content.includes('.getByText(') && content.includes('serviceLabels')) {
            log(`   ${checkmark()} Test uses correct checkbox interaction method`, 'green');
        } else {
            log(`   ${crossmark()} Test may still use .check() on hidden checkboxes`, 'red');
            log(`   Update test to use .getByText() for labels`, 'yellow');
            allPassed = false;
        }
    } else {
        log(`   ${colors.yellow}⚠${colors.reset} Playwright test file not found`, 'yellow');
    }
    
    // Summary
    log('\n=== Summary ===\n', 'cyan');
    
    if (allPassed) {
        log('✅ All checks passed! Form submission system is properly configured.', 'green');
        log('\nNext steps:', 'blue');
        log('1. Run SQL schema in Supabase (if not done already)', 'cyan');
        log('2. Test form submission manually at contact.html', 'cyan');
        log('3. Verify submission appears in admin/submissions.html', 'cyan');
        log('4. Run Playwright tests: npx playwright test', 'cyan');
    } else {
        log('❌ Some checks failed. Please review the issues above.', 'red');
        log('\nCommon fixes:', 'yellow');
        log('- Run admin/setup-form-submissions.sql in Supabase SQL Editor', 'yellow');
        log('- Verify Supabase keys in contact.html and admin/submissions.html', 'yellow');
        log('- Check RLS policies allow public INSERT and service_role SELECT', 'yellow');
    }
    
    log('');
}

// Run verification
verifySetup().catch(error => {
    log(`\nFatal error: ${error.message}`, 'red');
    process.exit(1);
});
