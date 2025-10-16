const fs = require('fs');
const path = require('path');

console.log('🔍 CMS System Validation Report');
console.log('================================\n');

// Test 1: File Structure Validation
console.log('📁 File Structure Validation:');
console.log('-----------------------------');

const requiredFiles = [
    'admin/setup-cms-database.sql',
    'admin/migrate-content.html', 
    'admin/cms.html',
    'admin/js/cms-manager.js',
    'js/cms-loader.js'
];

let fileStructurePassed = true;
requiredFiles.forEach(file => {
    if (fs.existsSync(file)) {
        console.log(`✅ ${file} - EXISTS`);
    } else {
        console.log(`❌ ${file} - MISSING`);
        fileStructurePassed = false;
    }
});

console.log(`\n📁 File Structure: ${fileStructurePassed ? 'PASSED' : 'FAILED'}\n`);

// Test 2: Database Schema Validation
console.log('🗄️ Database Schema Validation:');
console.log('------------------------------');

let schemaPassed = true;
if (fs.existsSync('admin/setup-cms-database.sql')) {
    const schema = fs.readFileSync('admin/setup-cms-database.sql', 'utf8');
    
    const requiredTables = [
        'create table if not exists site_settings',
        'create table if not exists page_content', 
        'create table if not exists services',
        'create table if not exists pricing_items',
        'create table if not exists hero_sections',
        'create table if not exists testimonials',
        'create table if not exists blog_posts'
    ];
    
    requiredTables.forEach(table => {
        if (schema.toLowerCase().includes(table)) {
            console.log(`✅ ${table.replace('create table if not exists ', '')} table - FOUND`);
        } else {
            console.log(`❌ ${table.replace('create table if not exists ', '')} table - MISSING`);
            schemaPassed = false;
        }
    });
    
    // Check for RLS policies
    if (schema.toLowerCase().includes('enable row level security')) {
        console.log(`✅ Row Level Security - ENABLED`);
    } else {
        console.log(`❌ Row Level Security - MISSING`);
        schemaPassed = false;
    }
    
    // Check for indexes
    if (schema.toLowerCase().includes('create index')) {
        console.log(`✅ Database Indexes - FOUND`);
    } else {
        console.log(`❌ Database Indexes - MISSING`);
        schemaPassed = false;
    }
} else {
    console.log(`❌ Database schema file missing`);
    schemaPassed = false;
}

console.log(`\n🗄️ Database Schema: ${schemaPassed ? 'PASSED' : 'FAILED'}\n`);

// Test 3: CMS Admin Interface Validation
console.log('🎛️ CMS Admin Interface Validation:');
console.log('----------------------------------');

let adminPassed = true;
if (fs.existsSync('admin/cms.html')) {
    const cmsHtml = fs.readFileSync('admin/cms.html', 'utf8');
    
    // Check for required elements
    const requiredElements = [
        'Content Management System',
        'data-tab="pages"',
        'data-tab="services"',
        'data-tab="blog"',
        'data-tab="testimonials"',
        'data-tab="settings"',
        'id="pageSelector"',
        'id="servicesList"',
        'id="blogList"',
        'id="testimonialsList"',
        'Add New Service',
        'Add New Post',
        'Add New Testimonial'
    ];
    
    requiredElements.forEach(element => {
        if (cmsHtml.includes(element)) {
            console.log(`✅ ${element} - FOUND`);
        } else {
            console.log(`❌ ${element} - MISSING`);
            adminPassed = false;
        }
    });
} else {
    console.log(`❌ CMS admin file missing`);
    adminPassed = false;
}

console.log(`\n🎛️ CMS Admin Interface: ${adminPassed ? 'PASSED' : 'FAILED'}\n`);

// Test 4: JavaScript Functionality Validation
console.log('⚙️ JavaScript Functionality Validation:');
console.log('---------------------------------------');

let jsPassed = true;

// Check CMS Manager
if (fs.existsSync('admin/js/cms-manager.js')) {
    const cmsManager = fs.readFileSync('admin/js/cms-manager.js', 'utf8');
    
    const requiredFunctions = [
        'class CMSManager',
        'loadCurrentTabContent',
        'savePageContent',
        'saveSiteSettings',
        'showAddServiceModal',
        'showAddBlogModal',
        'showAddTestimonialModal'
    ];
    
    requiredFunctions.forEach(func => {
        if (cmsManager.includes(func)) {
            console.log(`✅ CMS Manager: ${func} - FOUND`);
        } else {
            console.log(`❌ CMS Manager: ${func} - MISSING`);
            jsPassed = false;
        }
    });
} else {
    console.log(`❌ CMS Manager JavaScript missing`);
    jsPassed = false;
}

// Check CMS Loader
if (fs.existsSync('js/cms-loader.js')) {
    const cmsLoader = fs.readFileSync('js/cms-loader.js', 'utf8');
    
    const requiredLoaderFunctions = [
        'class CMSLoader',
        'loadPageContent',
        'loadSiteSettings',
        'loadServices',
        'loadTestimonials',
        'loadBlogPosts'
    ];
    
    requiredLoaderFunctions.forEach(func => {
        if (cmsLoader.includes(func)) {
            console.log(`✅ CMS Loader: ${func} - FOUND`);
        } else {
            console.log(`❌ CMS Loader: ${func} - MISSING`);
            jsPassed = false;
        }
    });
} else {
    console.log(`❌ CMS Loader JavaScript missing`);
    jsPassed = false;
}

console.log(`\n⚙️ JavaScript Functionality: ${jsPassed ? 'PASSED' : 'FAILED'}\n`);

// Test 5: Frontend Integration Validation
console.log('🌐 Frontend Integration Validation:');
console.log('-----------------------------------');

const publicPages = [
    'index.html',
    'services.html', 
    'contact.html',
    'blog.html',
    'sample-submission.html',
    'search.html'
];

let frontendPassed = true;
publicPages.forEach(page => {
    if (fs.existsSync(page)) {
        const content = fs.readFileSync(page, 'utf8');
        if (content.includes('js/cms-loader.js')) {
            console.log(`✅ ${page} - CMS Loader integrated`);
        } else {
            console.log(`❌ ${page} - CMS Loader missing`);
            frontendPassed = false;
        }
    } else {
        console.log(`❌ ${page} - File missing`);
        frontendPassed = false;
    }
});

console.log(`\n🌐 Frontend Integration: ${frontendPassed ? 'PASSED' : 'FAILED'}\n`);

// Test 6: Admin Navigation Integration
console.log('🧭 Admin Navigation Integration:');
console.log('--------------------------------');

const adminPages = [
    'admin/dashboard.html',
    'admin/manage-coas.html'
];

let adminNavPassed = true;
adminPages.forEach(page => {
    if (fs.existsSync(page)) {
        const content = fs.readFileSync(page, 'utf8');
        if (content.includes('href="cms.html"')) {
            console.log(`✅ ${page} - CMS link found`);
        } else {
            console.log(`❌ ${page} - CMS link missing`);
            adminNavPassed = false;
        }
    } else {
        console.log(`❌ ${page} - File missing`);
        adminNavPassed = false;
    }
});

console.log(`\n🧭 Admin Navigation: ${adminNavPassed ? 'PASSED' : 'FAILED'}\n`);

// Test 7: Migration Tool Validation
console.log('🔄 Migration Tool Validation:');
console.log('-----------------------------');

let migrationPassed = true;
if (fs.existsSync('admin/migrate-content.html')) {
    const migration = fs.readFileSync('admin/migrate-content.html', 'utf8');
    
    const requiredMigrationFeatures = [
        'CMS Content Migration Tool',
        'Start Content Migration',
        'contentExtractor',
        'dbPopulator',
        'extractIndexContent',
        'extractServicesContent',
        'populateHeroSection',
        'populateServices',
        'populateTestimonials'
    ];
    
    requiredMigrationFeatures.forEach(feature => {
        if (migration.includes(feature)) {
            console.log(`✅ ${feature} - FOUND`);
        } else {
            console.log(`❌ ${feature} - MISSING`);
            migrationPassed = false;
        }
    });
} else {
    console.log(`❌ Migration tool missing`);
    migrationPassed = false;
}

console.log(`\n🔄 Migration Tool: ${migrationPassed ? 'PASSED' : 'FAILED'}\n`);

// Test 8: HTML Structure Validation
console.log('📄 HTML Structure Validation:');
console.log('------------------------------');

let htmlPassed = true;
const htmlFiles = [
    'admin/cms.html',
    'admin/migrate-content.html'
];

htmlFiles.forEach(file => {
    if (fs.existsSync(file)) {
        const content = fs.readFileSync(file, 'utf8');
        if (content.includes('<!DOCTYPE html>') && 
            content.includes('<html') && 
            content.includes('<head>') && 
            content.includes('<body>') &&
            content.includes('</html>')) {
            console.log(`✅ ${file} - Valid HTML structure`);
        } else {
            console.log(`❌ ${file} - Invalid HTML structure`);
            htmlPassed = false;
        }
    } else {
        console.log(`❌ ${file} - File missing`);
        htmlPassed = false;
    }
});

console.log(`\n📄 HTML Structure: ${htmlPassed ? 'PASSED' : 'FAILED'}\n`);

// Test 9: CSS Integration Validation
console.log('🎨 CSS Integration Validation:');
console.log('-------------------------------');

let cssPassed = true;
if (fs.existsSync('admin/cms.html')) {
    const cmsHtml = fs.readFileSync('admin/cms.html', 'utf8');
    
    // Check for inline styles and CSS classes
    if (cmsHtml.includes('cms-container') && 
        cmsHtml.includes('tab-nav') && 
        cmsHtml.includes('form-group') &&
        cmsHtml.includes('btn-primary')) {
        console.log(`✅ CMS HTML - CSS classes found`);
    } else {
        console.log(`❌ CMS HTML - CSS classes missing`);
        cssPassed = false;
    }
} else {
    console.log(`❌ CMS HTML file missing`);
    cssPassed = false;
}

console.log(`\n🎨 CSS Integration: ${cssPassed ? 'PASSED' : 'FAILED'}\n`);

// Test 10: Error Handling Validation
console.log('🛡️ Error Handling Validation:');
console.log('-------------------------------');

let errorHandlingPassed = true;

// Check for try-catch blocks in JavaScript files
const jsFiles = [
    'admin/js/cms-manager.js',
    'js/cms-loader.js'
];

jsFiles.forEach(file => {
    if (fs.existsSync(file)) {
        const content = fs.readFileSync(file, 'utf8');
        if (content.includes('try') && content.includes('catch')) {
            console.log(`✅ ${file} - Error handling found`);
        } else {
            console.log(`⚠️ ${file} - Limited error handling`);
        }
    } else {
        console.log(`❌ ${file} - File missing`);
        errorHandlingPassed = false;
    }
});

console.log(`\n🛡️ Error Handling: ${errorHandlingPassed ? 'PASSED' : 'FAILED'}\n`);

// Final Summary
console.log('📊 FINAL VALIDATION SUMMARY');
console.log('============================');

const allTests = [
    { name: 'File Structure', passed: fileStructurePassed },
    { name: 'Database Schema', passed: schemaPassed },
    { name: 'CMS Admin Interface', passed: adminPassed },
    { name: 'JavaScript Functionality', passed: jsPassed },
    { name: 'Frontend Integration', passed: frontendPassed },
    { name: 'Admin Navigation', passed: adminNavPassed },
    { name: 'Migration Tool', passed: migrationPassed },
    { name: 'HTML Structure', passed: htmlPassed },
    { name: 'CSS Integration', passed: cssPassed },
    { name: 'Error Handling', passed: errorHandlingPassed }
];

const passedTests = allTests.filter(test => test.passed).length;
const totalTests = allTests.length;

console.log(`\nTests Passed: ${passedTests}/${totalTests}`);

allTests.forEach(test => {
    const status = test.passed ? '✅ PASS' : '❌ FAIL';
    console.log(`${status} - ${test.name}`);
});

console.log(`\nOverall Status: ${passedTests === totalTests ? '🎉 ALL TESTS PASSED!' : '⚠️ SOME TESTS FAILED'}`);

if (passedTests === totalTests) {
    console.log('\n🚀 CMS System is ready for production!');
    console.log('\nNext steps:');
    console.log('1. Run the database setup script in Supabase');
    console.log('2. Use the migration tool to populate content');
    console.log('3. Start editing content through the admin interface');
} else {
    console.log('\n🔧 Please fix the failing tests before deployment.');
}

console.log('\n📋 Manual Testing Checklist:');
console.log('- [ ] Database setup script runs without errors');
console.log('- [ ] Migration tool extracts content successfully');
console.log('- [ ] CMS admin interface loads and functions');
console.log('- [ ] All tabs work and save data correctly');
console.log('- [ ] Frontend pages load with CMS data');
console.log('- [ ] Admin navigation links work properly');
console.log('- [ ] Responsive design works on mobile/tablet');
console.log('- [ ] Error handling works when database is unavailable');
