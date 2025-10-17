const fs = require('fs');
const path = require('path');

// List of pages to update
const pages = [
    'services.html',
    'contact.html', 
    'blog.html',
    'sample-submission.html',
    'search.html'
];

// Function to update CMS loader in a file
function updateCMSLoader(filePath) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        
        // Replace module script with regular script
        content = content.replace(
            '<script type="module" src="js/cms-loader.js"></script>',
            '<script src="js/cms-loader.js"></script>'
        );
        
        // Add CMS loader if it doesn't exist
        if (!content.includes('cms-loader.js')) {
            // Find the closing body tag and add CMS loader before it
            content = content.replace(
                '</body>',
                '    <!-- CMS Content Loader -->\n    <script src="js/cms-loader.js"></script>\n</body>'
            );
        }
        
        // Write back to file
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✅ Updated CMS loader in ${filePath}`);
    } catch (error) {
        console.error(`❌ Error updating ${filePath}:`, error.message);
    }
}

// Update all pages
console.log('🔧 Updating CMS loader in all pages...\n');

pages.forEach(page => {
    if (fs.existsSync(page)) {
        updateCMSLoader(page);
    } else {
        console.log(`⚠️ File not found: ${page}`);
    }
});

console.log('\n🎉 CMS loader update completed!');
