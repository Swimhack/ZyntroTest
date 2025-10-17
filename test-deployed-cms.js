const { chromium } = require('playwright');

async function testDeployedCMS() {
    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();
    
    try {
        console.log('Testing deployed CMS at http://zyntrotest.com/admin/cms.html');
        
        // Navigate to the CMS
        await page.goto('http://zyntrotest.com/admin/cms.html');
        await page.waitForLoadState('networkidle');
        
        // Check if the page loads without database connection error
        const errorMessage = await page.locator('text=Database connection not ready').count();
        
        if (errorMessage > 0) {
            console.log('❌ CMS shows database connection error');
            return false;
        }
        
        // Check if we can see CMS content
        const cmsContainer = await page.locator('.cms-container').count();
        if (cmsContainer > 0) {
            console.log('✅ CMS interface loads successfully');
        }
        
        // Check if there's content in the tabs
        const pagesTab = await page.locator('text=Pages').count();
        const servicesTab = await page.locator('text=Services').count();
        const blogTab = await page.locator('text=Blog').count();
        
        if (pagesTab > 0 && servicesTab > 0 && blogTab > 0) {
            console.log('✅ CMS tabs are present');
        }
        
        // Try to check if there's any content loaded
        await page.click('text=Pages');
        await page.waitForTimeout(1000);
        
        // Check if there's content in the pages section
        const pageContent = await page.locator('.page-content').count();
        if (pageContent > 0) {
            console.log('✅ Pages content section is present');
        }
        
        // Check migration tool
        console.log('\nChecking migration tool...');
        await page.goto('https://zyntrotest.com/admin/migrate-content.html');
        await page.waitForLoadState('networkidle');
        
        // Look for migration status or completed indicators
        const migrationStatus = await page.locator('text=Migration completed').count();
        const migrationError = await page.locator('text=Database connection failed').count();
        
        if (migrationStatus > 0) {
            console.log('✅ Migration appears to be completed');
        } else if (migrationError > 0) {
            console.log('❌ Migration shows database connection error');
        } else {
            console.log('⚠️ Migration status unclear - may need to run migration');
        }
        
        return true;
        
    } catch (error) {
        console.error('❌ Error testing deployed CMS:', error.message);
        return false;
    } finally {
        await browser.close();
    }
}

// Run the test
testDeployedCMS().then(success => {
    if (success) {
        console.log('\n🎉 CMS deployment test completed');
    } else {
        console.log('\n💥 CMS deployment test failed');
        process.exit(1);
    }
}).catch(error => {
    console.error('Test failed:', error);
    process.exit(1);
});
