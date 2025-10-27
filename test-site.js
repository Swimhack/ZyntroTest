/**
 * ZyntroTest.com Automated Testing Script
 * Run with: node test-site.js
 * 
 * Prerequisites:
 * npm install playwright
 * npx playwright install chromium
 */

const { chromium } = require('playwright');

const BASE = process.env.TEST_BASE_URL || 'http://127.0.0.1:8080';

async function testZyntroTestSite() {
    const browser = await chromium.launch({ headless: process.env.CI === 'true' });
    const context = await browser.newContext();
    const page = await context.newPage();
    
    const results = {
        passed: [],
        failed: [],
        warnings: []
    };

    try {
        console.log('🧪 Starting ZyntroTest.com Automated Tests...\n');

        // Test 1: Homepage Loads
        console.log('Test 1: Homepage loads...');
        await page.goto(`${BASE}/`);
        await page.waitForLoadState('networkidle');
        const title = await page.title();
        if (title.includes('ZyntroTest')) {
            results.passed.push('✅ Homepage loads successfully');
        } else {
            results.failed.push('❌ Homepage title incorrect');
        }

        // Test 2: Navigation Links Work
        console.log('Test 2: Navigation links...');
        const navLinks = await page.$$('nav a');
        if (navLinks.length >= 6) {
            results.passed.push('✅ Navigation has all links');
        } else {
            results.failed.push('❌ Missing navigation links');
        }

        // Test 3: Blog Page Layout
        console.log('Test 3: Blog page layout...');
        await page.goto(`${BASE}/blog.html`);
        await page.waitForLoadState('networkidle');
        
        const featuredArticle = await page.$('.featured-article');
        const featuredImage = await page.$('.featured-image');
        const featuredContent = await page.$('.featured-content');
        
        if (featuredArticle && featuredImage && featuredContent) {
            results.passed.push('✅ Blog featured article structure exists');
            
            // Check if image is above content (proper order)
            const imageBox = await featuredImage.boundingBox();
            const contentBox = await featuredContent.boundingBox();
            
            if (imageBox && contentBox && imageBox.y < contentBox.y) {
                results.passed.push('✅ Blog layout: Image above content (correct)');
            } else {
                results.failed.push('❌ Blog layout: Image not above content');
            }
        } else {
            results.failed.push('❌ Blog featured article structure missing');
        }

        // Test 4: Sample Submission Dropdown
        console.log('Test 4: Sample submission dropdown...');
        await page.goto(`${BASE}/sample-submission.html`);
        await page.waitForLoadState('networkidle');
        
        const sampleTypeSelect = await page.$('#sample-type');
        if (sampleTypeSelect) {
            const options = await page.$$('#sample-type option');
            const optionTexts = await Promise.all(
                options.map(opt => opt.textContent())
            );
            
            const hasCorrectOptions = 
                optionTexts.some(t => t.includes('Peptide Purity Analysis')) &&
                optionTexts.some(t => t.includes('Supplement Adulterant Screening')) &&
                optionTexts.some(t => t.includes('Cannabis/Hemp Testing'));
            
            if (hasCorrectOptions) {
                results.passed.push('✅ Sample type dropdown has correct options');
            } else {
                results.failed.push('❌ Sample type dropdown missing options');
                results.warnings.push(`Found options: ${optionTexts.join(', ')}`);
            }
        } else {
            results.failed.push('❌ Sample type dropdown not found');
        }

        // Test 5: COA Search Page
        console.log('Test 5: COA search page...');
        await page.goto(`${BASE}/search.html`);
        await page.waitForLoadState('networkidle');
        
        const searchInput = await page.$('#coa-number');
        const searchButton = await page.$('button[type="submit"]');
        
        if (searchInput && searchButton) {
            results.passed.push('✅ COA search form exists');
            
            // Test search functionality
            await searchInput.fill('ZT-2024-001');
            await searchButton.click();
            
            // Wait for results
            await page.waitForTimeout(2000);
            
            const resultsSection = await page.$('#search-results');
            const isVisible = await resultsSection?.isVisible();
            
            if (isVisible) {
                results.passed.push('✅ COA search returns results');
                
                // Check for PDF iframe viewer
                const pdfViewer = await page.$('#pdf-viewer');
                if (pdfViewer) {
                    const isIframeVisible = await pdfViewer.isVisible();
                    if (isIframeVisible) {
                        results.passed.push('✅ PDF iframe viewer displayed');
                    } else {
                        results.failed.push('❌ PDF iframe viewer not visible');
                    }
                } else {
                    results.failed.push('❌ PDF iframe viewer not found');
                }
                
                // Check for bucket errors
                const pageContent = await page.content();
                if (pageContent.includes('Bucket not found')) {
                    results.failed.push('❌ Still getting "Bucket not found" error');
                } else {
                    results.passed.push('✅ No "Bucket not found" errors');
                }
            } else {
                results.failed.push('❌ COA search results not displayed');
            }
        } else {
            results.failed.push('❌ COA search form not found');
        }

        // Test 6: Footer Consistency
        console.log('Test 6: Footer consistency...');
        const footerText = await page.textContent('footer');
        if (footerText.includes('College Station, Texas')) {
            results.passed.push('✅ Footer has correct location');
        } else {
            results.failed.push('❌ Footer location incorrect');
        }

        if (footerText.includes('info@zyntrotest.com')) {
            results.passed.push('✅ Footer has correct email');
        } else {
            results.warnings.push('⚠️  Footer may be missing email');
        }

        // Test 7: Contact form submission (UI)
        console.log('Test 7: Contact form submission...');
        await page.goto(`${BASE}/contact.html#form`);
        await page.waitForLoadState('networkidle');
        try {
            await page.fill('#name', 'Test User');
            await page.fill('#email', 'test.user+e2e@example.com');
            await page.fill('#company', 'E2E Testing Inc');
            await page.fill('#phone', '1234567890');
            await page.selectOption('#sample-type', 'peptide');
            await page.click('button[type="submit"]');
            const notification = await page.waitForSelector('.notification', { timeout: 5000 });
            const noteText = await notification.textContent();
            if (noteText && noteText.includes('Thank you')) {
                results.passed.push('✅ Contact form submits and shows confirmation');
            } else {
                results.failed.push('❌ Contact form did not show confirmation');
            }
        } catch (e) {
            results.failed.push('❌ Contact form submission test errored');
        }

        // Test 8: Sample submission form (UI)
        console.log('Test 8: Sample submission form...');
        await page.goto(`${BASE}/sample-submission.html`);
        await page.waitForLoadState('networkidle');
        try {
            await page.fill('#client-name', 'Test Client');
            await page.fill('#client-email', 'test.client+e2e@example.com');
            await page.fill('#sample-description', 'Automated test submission');
            await page.selectOption('#sample-type', 'peptide');
            await page.fill('#num-samples', '1');
            await page.click('#sample-submission-form button[type="submit"]');
            const notification = await page.waitForSelector('.notification', { timeout: 5000 });
            const noteText = await notification.textContent();
            if (noteText && (noteText.includes('received') || noteText.includes('Thank you'))) {
                results.passed.push('✅ Sample submission form shows confirmation');
            } else {
                results.failed.push('❌ Sample submission form did not show confirmation');
            }
        } catch (e) {
            results.failed.push('❌ Sample submission form test errored');
        }

        // Test 9: Newsletter subscribe (UI)
        console.log('Test 9: Newsletter subscribe...');
        await page.goto(`${BASE}/blog.html`);
        await page.waitForLoadState('networkidle');
        try {
            const emailInput = await page.$('.newsletter-form input[type="email"]');
            const subscribeBtn = await page.$('.newsletter-form button[type="submit"]');
            if (emailInput && subscribeBtn) {
                await emailInput.fill('test.subscribe+e2e@example.com');
                await subscribeBtn.click();
                const notification = await page.waitForSelector('.notification', { timeout: 5000 });
                const noteText = await notification.textContent();
                if (noteText && (noteText.includes('subscrib') || noteText.includes('Error'))) {
                    results.passed.push('✅ Newsletter form triggers feedback');
                } else {
                    results.failed.push('❌ Newsletter form did not trigger feedback');
                }
            } else {
                results.failed.push('❌ Newsletter form elements not found');
            }
        } catch (e) {
            results.failed.push('❌ Newsletter subscription test errored');
        }

    } catch (error) {
        results.failed.push(`❌ Error during testing: ${error.message}`);
    } finally {
        await browser.close();
    }

    // Print Results
    console.log('\n' + '='.repeat(60));
    console.log('📊 TEST RESULTS');
    console.log('='.repeat(60) + '\n');

    if (results.passed.length > 0) {
        console.log('✅ PASSED TESTS:');
        results.passed.forEach(r => console.log('  ' + r));
        console.log('');
    }

    if (results.failed.length > 0) {
        console.log('❌ FAILED TESTS:');
        results.failed.forEach(r => console.log('  ' + r));
        console.log('');
    }

    if (results.warnings.length > 0) {
        console.log('⚠️  WARNINGS:');
        results.warnings.forEach(r => console.log('  ' + r));
        console.log('');
    }

    console.log('='.repeat(60));
    console.log(`Total: ${results.passed.length} passed, ${results.failed.length} failed, ${results.warnings.length} warnings`);
    console.log('='.repeat(60));

    return results;
}

// Run tests
testZyntroTestSite()
    .then(() => process.exit(0))
    .catch(error => {
        console.error('Fatal error:', error);
        process.exit(1);
    });

