// Quick script to verify CMS migration was successful
const fs = require('fs');

console.log('🔍 CMS Migration Verification');
console.log('=============================\n');

// Check if key files exist
const requiredFiles = [
    'admin/setup-cms-database.sql',
    'admin/migrate-content.html',
    'admin/cms.html',
    'admin/js/cms-manager.js',
    'js/cms-loader.js'
];

console.log('📁 Checking Required Files:');
let allFilesExist = true;
requiredFiles.forEach(file => {
    if (fs.existsSync(file)) {
        console.log(`✅ ${file}`);
    } else {
        console.log(`❌ ${file} - MISSING`);
        allFilesExist = false;
    }
});

console.log(`\n📁 File Check: ${allFilesExist ? 'PASSED' : 'FAILED'}\n`);

console.log('🔧 Migration Instructions:');
console.log('1. Go to: https://zyntrotest.com/admin/migrate-content.html');
console.log('2. Wait for "✅ Database connection successful!"');
console.log('3. Click "Start Content Migration"');
console.log('4. Monitor the progress and logs');
console.log('5. Verify success message appears');
console.log('6. Test CMS at: https://zyntrotest.com/admin/cms.html\n');

console.log('📋 Post-Migration Checklist:');
console.log('- [ ] Migration completed without errors');
console.log('- [ ] CMS interface loads at /admin/cms.html');
console.log('- [ ] All tabs work (Pages, Services, Blog, Testimonials, Settings)');
console.log('- [ ] Frontend pages load with CMS data');
console.log('- [ ] Content can be edited through CMS interface');
console.log('- [ ] Changes appear on frontend immediately');

if (allFilesExist) {
    console.log('\n✅ All files are in place. Ready for migration!');
} else {
    console.log('\n❌ Some files are missing. Please check the deployment.');
}
