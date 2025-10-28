/**
 * iPhone 16 Safari Testing Script for ZyntroTest.com
 * Tests SSL, Safari-specific behavior, and PDF preview on iPhone 16
 */

const { webkit } = require('playwright');

const BASE_URL = 'https://zyntrotest.com';

async function testIPhone16Safari() {
    console.log('🧪 Testing ZyntroTest.com on iPhone 16 Safari (WebKit)...\n');
    
    // Launch Safari browser (WebKit) with iPhone 16 dimensions
    const browser = await webkit.launch({ 
        headless: false,
        slowMo: 1000 // Slow down for visual inspection
    });
    
    // iPhone 16 Pro dimensions and user agent
    const context = await browser.newContext({
        viewport: {
            width: 393,
            height: 852
        },
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1',
        deviceScaleFactor: 3,
        isMobile: true,
        hasTouch: true
    });
    
    const page = await context.newPage();
    
    const results = {
        ssl: [],
        pdfPreview: [],
        safariSpecific: [],
        errors: []
    };
    
    try {
        console.log('📱 Testing on iPhone 16 Safari viewport...\n');
        
        // Test 1: SSL Certificate Check
        console.log('Test 1: SSL Certificate Check...');
        try {
            await page.goto(BASE_URL, { waitUntil: 'networkidle' });
            
            // Check if there's any SSL warning in console
            page.on('console', msg => {
                if (msg.type() === 'error') {
                    console.log('Console Error:', msg.text());
                    results.safariSpecific.push(`❌ Console Error: ${msg.text()}`);
                }
            });
            
            // Check for mixed content warnings
            page.on('request', request => {
                if (request.url().startsWith('http://') && request.url() !== BASE_URL) {
                    results.ssl.push(`⚠️  Mixed Content Warning: ${request.url()}`);
                }
            });
            
            await page.waitForTimeout(2000);
            
            const url = page.url();
            if (url.startsWith('https://')) {
                results.ssl.push('✅ HTTPS connection successful');
            } else {
                results.ssl.push('❌ Not using HTTPS');
            }
            
            // Check for certificate errors in title or content
            const title = await page.title();
            if (title.includes('Certificate') || title.includes('Secure')) {
                results.ssl.push('⚠️  Potential SSL warning in page');
            } else {
                results.ssl.push('✅ No SSL warnings detected');
            }
            
        } catch (error) {
            results.errors.push(`❌ SSL Test Error: ${error.message}`);
        }
        
        // Test 2: PDF Preview on Home Page
        console.log('\nTest 2: PDF Preview Display...');
        
        // Wait for PDF section to load
        await page.waitForTimeout(3000);
        
        try {
            const pdfSection = await page.$('#pdf-preview-section');
            if (pdfSection) {
                const isVisible = await pdfSection.isVisible();
                if (isVisible) {
                    results.pdfPreview.push('✅ PDF preview section visible');
                    
                    // Check if iframe exists
                    const pdfViewer = await page.$('#pdf-viewer');
                    if (pdfViewer) {
                        results.pdfPreview.push('✅ PDF iframe exists');
                        
                        // Get iframe dimensions
                        const box = await pdfViewer.boundingBox();
                        if (box) {
                            results.pdfPreview.push(`ℹ️  PDF viewer dimensions: ${Math.round(box.width)}x${Math.round(box.height)}px`);
                        }
                        
                        // Check if iframe has src
                        const iframeSrc = await pdfViewer.getAttribute('src');
                        if (iframeSrc) {
                            results.pdfPreview.push(`✅ PDF iframe has source: ${iframeSrc.substring(0, 100)}...`);
                            
                            // Check if it's using Google Docs viewer
                            if (iframeSrc.includes('docs.google.com')) {
                                results.pdfPreview.push('✅ Using Google Docs viewer (recommended)');
                            } else {
                                results.pdfPreview.push('⚠️  Not using Google Docs viewer');
                            }
                        } else {
                            results.pdfPreview.push('❌ PDF iframe has no source');
                        }
                    } else {
                        results.pdfPreview.push('❌ PDF iframe not found');
                    }
                    
                    // Check for error display
                    const errorDisplay = await page.$('#pdf-error-display');
                    if (errorDisplay) {
                        const isErrorVisible = await errorDisplay.isVisible();
                        if (isErrorVisible) {
                            results.pdfPreview.push('❌ Error display is visible (PDF failed to load)');
                        } else {
                            results.pdfPreview.push('✅ No error display shown');
                        }
                    }
                    
                } else {
                    results.pdfPreview.push('❌ PDF preview section not visible');
                }
            } else {
                results.pdfPreview.push('❌ PDF preview section not found');
            }
        } catch (error) {
            results.errors.push(`❌ PDF Test Error: ${error.message}`);
        }
        
        // Test 3: Safari-specific behaviors
        console.log('\nTest 3: Safari-Specific Behaviors...');
        
        try {
            // Check for iOS-safe-area issues
            const css = await page.evaluate(() => {
                return {
                    viewportWidth: window.innerWidth,
                    viewportHeight: window.innerHeight,
                    devicePixelRatio: window.devicePixelRatio,
                    userAgent: navigator.userAgent,
                    isSafari: navigator.userAgent.includes('Safari') && !navigator.userAgent.includes('Chrome'),
                    isIOS: navigator.userAgent.includes('iPhone'),
                    supportWebP: document.createElement('canvas').toDataURL('image/webp').indexOf('data:image/webp') === 0
                };
            });
            
            results.safariSpecific.push(`ℹ️  User Agent: ${css.userAgent}`);
            results.safariSpecific.push(`ℹ️  Viewport: ${css.viewportWidth}x${css.viewportHeight}`);
            results.safariSpecific.push(`ℹ️  Device Pixel Ratio: ${css.devicePixelRatio}`);
            
            if (css.isSafari) {
                results.safariSpecific.push('✅ Detected as Safari browser');
            }
            
            if (css.isIOS) {
                results.safariSpecific.push('✅ Detected as iOS device');
            }
            
            // Check for touch event support
            const touchSupport = await page.evaluate(() => 'ontouchstart' in window);
            if (touchSupport) {
                results.safariSpecific.push('✅ Touch events supported');
            }
            
        } catch (error) {
            results.errors.push(`❌ Safari Test Error: ${error.message}`);
        }
        
        // Test 4: Responsive Layout Check
        console.log('\nTest 4: Responsive Layout...');
        
        try {
            const logo = await page.$('.logo img');
            if (logo) {
                const logoVisible = await logo.isVisible();
                if (logoVisible) {
                    results.safariSpecific.push('✅ Logo visible');
                }
            }
            
            // Check navigation menu
            const navToggle = await page.$('#nav-toggle');
            if (navToggle) {
                const isVisible = await navToggle.isVisible();
                if (isVisible) {
                    results.safariSpecific.push('✅ Mobile nav toggle visible');
                }
            }
            
        } catch (error) {
            results.errors.push(`❌ Layout Test Error: ${error.message}`);
        }
        
        // Take a screenshot
        console.log('\nCapturing screenshot...');
        await page.screenshot({ path: 'test-results/iphone16-safari.png', fullPage: true });
        results.safariSpecific.push('✅ Screenshot saved to test-results/iphone16-safari.png');
        
    } catch (error) {
        results.errors.push(`❌ Fatal Error: ${error.message}`);
    } finally {
        console.log('\n\n⏳ Waiting 3 seconds before closing...\n');
        await page.waitForTimeout(3000);
        await browser.close();
    }
    
    // Print Results
    console.log('\n' + '='.repeat(60));
    console.log('📊 iPhone 16 Safari Test Results');
    console.log('='.repeat(60) + '\n');
    
    if (results.ssl.length > 0) {
        console.log('🔒 SSL & Security:');
        results.ssl.forEach(r => console.log('  ' + r));
        console.log('');
    }
    
    if (results.pdfPreview.length > 0) {
        console.log('📄 PDF Preview:');
        results.pdfPreview.forEach(r => console.log('  ' + r));
        console.log('');
    }
    
    if (results.safariSpecific.length > 0) {
        console.log('📱 Safari-Specific:');
        results.safariSpecific.forEach(r => console.log('  ' + r));
        console.log('');
    }
    
    if (results.errors.length > 0) {
        console.log('❌ Errors:');
        results.errors.forEach(r => console.log('  ' + r));
        console.log('');
    }
    
    console.log('='.repeat(60));
    console.log(`Total: ${results.ssl.length + results.pdfPreview.length + results.safariSpecific.length} checks, ${results.errors.length} errors`);
    console.log('='.repeat(60) + '\n');
}

// Run tests
testIPhone16Safari()
    .then(() => process.exit(0))
    .catch(error => {
        console.error('Fatal error:', error);
        process.exit(1);
    });


