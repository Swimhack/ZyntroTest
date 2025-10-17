const fs = require('fs');
const path = require('path');

// List of pages to update
const pages = [
    'services.html',
    'contact.html', 
    'blog.html',
    'sample-submission.html',
    'search.html',
    'coa-samples.html'
];

// New footer HTML
const newFooter = `    <!-- Footer will be loaded by JavaScript include -->
    <footer class="footer">
        <div class="container">
            <div class="footer-content">
                <div class="footer-brand">
                    <div class="footer-logo">
                        <img src="images/zyntrotest-logo.svg" alt="ZyntroTest" width="120" height="40">
                    </div>
                    <p>Precision LCMS testing for peptides, supplements, and hemp products. Fast, accurate, and reliable analytical services.</p>
                </div>
                
                <div class="footer-links">
                    <div class="footer-section">
                        <h4>Services</h4>
                        <ul>
                            <li><a href="services.html#peptide">Peptide Testing</a></li>
                            <li><a href="services.html#supplement">Supplement Testing</a></li>
                            <li><a href="services.html#hemp">Hemp Testing</a></li>
                            <li><a href="services.html#pricing">Pricing</a></li>
                        </ul>
                    </div>
                    
                    <div class="footer-section">
                        <h4>Resources</h4>
                        <ul>
                            <li><a href="search.html">Search COAs</a></li>
                            <li><a href="sample-submission.html">Submit Sample</a></li>
                            <li><a href="blog.html">Blog</a></li>
                            <li><a href="coa-samples.html">Sample COAs</a></li>
                        </ul>
                    </div>
                    
                    <div class="footer-section">
                        <h4>Company</h4>
                        <ul>
                            <li><a href="contact.html">Contact Us</a></li>
                            <li><a href="contact.html">Get in Touch</a></li>
                            <li><a href="contact.html">Location: College Station, Texas</a></li>
                        </ul>
                    </div>
                </div>
            </div>
            
            <div class="footer-bottom">
                <div class="footer-bottom-content">
                    <p>&copy; <span id="current-year">2025</span> ZyntroTest. All rights reserved.</p>
                    <div class="footer-legal">
                        <a href="privacy.html">Privacy Policy</a>
                        <a href="terms.html">Terms of Service</a>
                    </div>
                </div>
            </div>
        </div>
    </footer>`;

// Function to update footer in a file
function updateFooterInFile(filePath) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        
        // Find the footer section (from <footer to </footer>)
        const footerRegex = /<footer class="footer">[\s\S]*?<\/footer>/g;
        
        if (footerRegex.test(content)) {
            // Replace the footer
            content = content.replace(footerRegex, newFooter);
            
            // Write back to file
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`✅ Updated footer in ${filePath}`);
        } else {
            console.log(`⚠️ No footer found in ${filePath}`);
        }
    } catch (error) {
        console.error(`❌ Error updating ${filePath}:`, error.message);
    }
}

// Update all pages
console.log('🔧 Updating footers in all pages...\n');

pages.forEach(page => {
    if (fs.existsSync(page)) {
        updateFooterInFile(page);
    } else {
        console.log(`⚠️ File not found: ${page}`);
    }
});

console.log('\n🎉 Footer update completed!');
