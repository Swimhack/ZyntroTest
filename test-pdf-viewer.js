const { chromium } = require('playwright');

async function testPDFViewer() {
    console.log('🚀 Starting PDF Viewer Tests...\n');

    const browser = await chromium.launch({
        headless: false, // Show browser for visual verification
        slowMo: 1000 // Slow down actions for visibility
    });

    const context = await browser.newContext({
        viewport: { width: 1920, height: 1080 }
    });

    const page = await context.newPage();

    // Enable console logging from the browser
    page.on('console', msg => {
        const type = msg.type();
        const text = msg.text();
        if (type === 'error') {
            console.log(`❌ Browser Error: ${text}`);
        } else if (type === 'warning') {
            console.log(`⚠️  Browser Warning: ${text}`);
        } else if (text.includes('PDF') || text.includes('COA')) {
            console.log(`   Browser: ${text}`);
        }
    });

    // Track errors
    page.on('pageerror', error => {
        console.log(`❌ Page Error: ${error.message}`);
    });

    let allTestsPassed = true;

    try {
        // =====================================================
        // TEST 1: Index Page - Default PDF Loading
        // =====================================================
        console.log('📄 TEST 1: Index Page - Default PDF Loading');
        console.log('═'.repeat(60));

        await page.goto('http://127.0.0.1:8080/index.html', {
            waitUntil: 'networkidle',
            timeout: 30000
        });

        console.log('✓ Page loaded successfully');

        // Wait for PDF viewer to initialize
        await page.waitForTimeout(3000);

        // Check if PDFViewer class is available
        const pdfViewerAvailable = await page.evaluate(() => {
            return typeof window.PDFViewer !== 'undefined';
        });

        if (!pdfViewerAvailable) {
            console.log('❌ FAIL: PDFViewer class not available on index page');
            allTestsPassed = false;
        } else {
            console.log('✓ PDFViewer class is available');
        }

        // Check if PDF section is visible
        const pdfSectionVisible = await page.isVisible('#pdf-preview-section');
        if (!pdfSectionVisible) {
            console.log('❌ FAIL: PDF preview section not visible on index page');
            allTestsPassed = false;
        } else {
            console.log('✓ PDF preview section is visible');
        }

        // Check if iframe has a source
        const iframeSrc = await page.evaluate(() => {
            const iframe = document.querySelector('#pdf-viewer');
            return iframe ? iframe.src : null;
        });

        if (!iframeSrc || iframeSrc === '') {
            console.log('❌ FAIL: PDF iframe has no source on index page');
            allTestsPassed = false;
        } else {
            console.log(`✓ PDF iframe has source: ${iframeSrc}`);
        }

        // Check if download button is visible
        const downloadBtnVisible = await page.isVisible('#pdf-download-btn');
        if (downloadBtnVisible) {
            console.log('✓ Download button is visible');
        } else {
            console.log('⚠️  Download button not visible (may be expected)');
        }

        // Take screenshot
        await page.screenshot({
            path: 'test-screenshots/index-pdf-viewer.png',
            fullPage: true
        });
        console.log('✓ Screenshot saved: test-screenshots/index-pdf-viewer.png');

        console.log('');

        // =====================================================
        // TEST 2: Search Page - PDF Loading After Search
        // =====================================================
        console.log('🔍 TEST 2: Search Page - PDF Loading After Search');
        console.log('═'.repeat(60));

        await page.goto('http://127.0.0.1:8080/search.html', {
            waitUntil: 'networkidle',
            timeout: 30000
        });

        console.log('✓ Search page loaded successfully');

        // Wait for page to initialize
        await page.waitForTimeout(2000);

        // Check if PDFViewer class is available
        const pdfViewerAvailableSearch = await page.evaluate(() => {
            return typeof window.PDFViewer !== 'undefined';
        });

        if (!pdfViewerAvailableSearch) {
            console.log('❌ FAIL: PDFViewer class not available on search page');
            allTestsPassed = false;
        } else {
            console.log('✓ PDFViewer class is available');
        }

        // Enter COA number and search
        await page.fill('#coa-number', 'ZT-2024-001');
        console.log('✓ Entered COA number: ZT-2024-001');

        await page.click('button[type="submit"]');
        console.log('✓ Clicked search button');

        // Wait for results to load
        await page.waitForTimeout(3000);

        // Check if results section is visible
        const resultsVisible = await page.isVisible('#search-results');
        if (!resultsVisible) {
            console.log('❌ FAIL: Search results not visible');
            allTestsPassed = false;
        } else {
            console.log('✓ Search results section is visible');
        }

        // Check if PDF section is visible
        const pdfSectionVisibleSearch = await page.isVisible('#pdf-preview-section');
        if (!pdfSectionVisibleSearch) {
            console.log('❌ FAIL: PDF preview section not visible after search');
            allTestsPassed = false;
        } else {
            console.log('✓ PDF preview section is visible after search');
        }

        // Check if iframe has a source
        const iframeSrcSearch = await page.evaluate(() => {
            const iframe = document.querySelector('#pdf-viewer');
            return iframe ? iframe.src : null;
        });

        if (!iframeSrcSearch || iframeSrcSearch === '') {
            console.log('❌ FAIL: PDF iframe has no source on search page');
            allTestsPassed = false;
        } else {
            console.log(`✓ PDF iframe has source: ${iframeSrcSearch}`);
        }

        // Check if COA data is displayed
        const coaDataDisplayed = await page.isVisible('.coa-data-display');
        if (!coaDataDisplayed) {
            console.log('⚠️  COA data display not found (may use different selector)');
        } else {
            console.log('✓ COA data is displayed');
        }

        // Take screenshot
        await page.screenshot({
            path: 'test-screenshots/search-pdf-viewer.png',
            fullPage: true
        });
        console.log('✓ Screenshot saved: test-screenshots/search-pdf-viewer.png');

        console.log('');

        // =====================================================
        // TEST 3: PDF Viewer Instance Verification
        // =====================================================
        console.log('🔬 TEST 3: PDF Viewer Instance Verification');
        console.log('═'.repeat(60));

        // Check on index page
        await page.goto('http://127.0.0.1:8080/index.html', {
            waitUntil: 'networkidle'
        });
        await page.waitForTimeout(3000);

        const indexPDFInfo = await page.evaluate(() => {
            const iframe = document.querySelector('#pdf-viewer');
            return {
                iframeExists: !!iframe,
                iframeSrc: iframe ? iframe.src : null,
                pdfViewerClass: typeof window.PDFViewer !== 'undefined',
                containerExists: !!document.querySelector('#pdf-preview-section')
            };
        });

        console.log('Index Page PDF Info:');
        console.log(`  - Iframe exists: ${indexPDFInfo.iframeExists}`);
        console.log(`  - Iframe src: ${indexPDFInfo.iframeSrc || 'empty'}`);
        console.log(`  - PDFViewer class available: ${indexPDFInfo.pdfViewerClass}`);
        console.log(`  - Container exists: ${indexPDFInfo.containerExists}`);

        if (!indexPDFInfo.iframeExists || !indexPDFInfo.iframeSrc) {
            console.log('❌ FAIL: Index page PDF viewer not properly initialized');
            allTestsPassed = false;
        } else {
            console.log('✓ Index page PDF viewer properly initialized');
        }

    } catch (error) {
        console.log(`❌ TEST ERROR: ${error.message}`);
        console.log(error.stack);
        allTestsPassed = false;
    } finally {
        await browser.close();
    }

    // =====================================================
    // FINAL RESULTS
    // =====================================================
    console.log('');
    console.log('═'.repeat(60));
    if (allTestsPassed) {
        console.log('✅ ALL TESTS PASSED');
        console.log('═'.repeat(60));
        process.exit(0);
    } else {
        console.log('❌ SOME TESTS FAILED');
        console.log('═'.repeat(60));
        process.exit(1);
    }
}

// Create screenshots directory if it doesn't exist
const fs = require('fs');
if (!fs.existsSync('test-screenshots')) {
    fs.mkdirSync('test-screenshots');
}

testPDFViewer();
