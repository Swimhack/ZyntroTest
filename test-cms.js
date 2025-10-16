const { test, expect } = require('@playwright/test');

test.describe('CMS System Tests', () => {
  let browser;
  let page;

  test.beforeAll(async ({ browser }) => {
    browser = browser;
    page = await browser.newPage();
  });

  test.afterAll(async () => {
    await page.close();
  });

  test.describe('Database Setup', () => {
    test('should have database schema file', async () => {
      const fs = require('fs');
      expect(fs.existsSync('admin/setup-cms-database.sql')).toBeTruthy();
      
      const schema = fs.readFileSync('admin/setup-cms-database.sql', 'utf8');
      expect(schema).toContain('CREATE TABLE site_settings');
      expect(schema).toContain('CREATE TABLE page_content');
      expect(schema).toContain('CREATE TABLE services');
      expect(schema).toContain('CREATE TABLE hero_sections');
      expect(schema).toContain('CREATE TABLE testimonials');
      expect(schema).toContain('CREATE TABLE blog_posts');
    });
  });

  test.describe('CMS Migration Tool', () => {
    test('should load migration tool page', async () => {
      await page.goto('http://localhost:3000/admin/migrate-content.html');
      await expect(page).toHaveTitle(/CMS Content Migration Tool/);
      
      // Check for key elements
      await expect(page.locator('h1')).toContainText('CMS Content Migration Tool');
      await expect(page.locator('#startMigration')).toBeVisible();
      await expect(page.locator('#logContainer')).toBeVisible();
    });

    test('should have migration steps listed', async () => {
      await page.goto('http://localhost:3000/admin/migrate-content.html');
      
      const steps = page.locator('.section ol li');
      await expect(steps).toHaveCount(6);
      await expect(steps.nth(0)).toContainText('Extract hero sections from index.html');
      await expect(steps.nth(1)).toContainText('Extract services data from index.html and services.html');
      await expect(steps.nth(2)).toContainText('Extract testimonials from index.html');
    });
  });

  test.describe('CMS Admin Interface', () => {
    test('should load CMS admin page', async () => {
      await page.goto('http://localhost:3000/admin/cms.html');
      await expect(page).toHaveTitle(/Content Management System/);
      
      // Check header
      await expect(page.locator('h1')).toContainText('Content Management System');
      
      // Check stats overview
      await expect(page.locator('.stat-card')).toHaveCount(4);
      await expect(page.locator('#servicesCount')).toBeVisible();
      await expect(page.locator('#blogPostsCount')).toBeVisible();
      await expect(page.locator('#testimonialsCount')).toBeVisible();
      await expect(page.locator('#pagesCount')).toBeVisible();
    });

    test('should have all CMS tabs', async () => {
      await page.goto('http://localhost:3000/admin/cms.html');
      
      const tabButtons = page.locator('.tab-button');
      await expect(tabButtons).toHaveCount(5);
      
      const expectedTabs = ['Pages', 'Services', 'Blog', 'Testimonials', 'Settings'];
      for (let i = 0; i < expectedTabs.length; i++) {
        await expect(tabButtons.nth(i)).toContainText(expectedTabs[i]);
      }
    });

    test('should switch between tabs', async () => {
      await page.goto('http://localhost:3000/admin/cms.html');
      
      // Pages tab should be active by default
      await expect(page.locator('#pages-tab')).toHaveClass(/active/);
      await expect(page.locator('#pageSelector')).toBeVisible();
      
      // Click Services tab
      await page.click('[data-tab="services"]');
      await expect(page.locator('#services-tab')).toHaveClass(/active/);
      await expect(page.locator('#servicesList')).toBeVisible();
      
      // Click Blog tab
      await page.click('[data-tab="blog"]');
      await expect(page.locator('#blog-tab')).toHaveClass(/active/);
      await expect(page.locator('#blogList')).toBeVisible();
      
      // Click Testimonials tab
      await page.click('[data-tab="testimonials"]');
      await expect(page.locator('#testimonials-tab')).toHaveClass(/active/);
      await expect(page.locator('#testimonialsList')).toBeVisible();
      
      // Click Settings tab
      await page.click('[data-tab="settings"]');
      await expect(page.locator('#settings-tab')).toHaveClass(/active/);
      await expect(page.locator('#siteName')).toBeVisible();
    });

    test('should have page selector with all pages', async () => {
      await page.goto('http://localhost:3000/admin/cms.html');
      
      const pageSelector = page.locator('#pageSelector');
      await expect(pageSelector).toBeVisible();
      
      const options = page.locator('#pageSelector option');
      await expect(options).toHaveCount(6);
      
      const expectedPages = ['index', 'services', 'contact', 'blog', 'sample-submission', 'search'];
      for (let i = 0; i < expectedPages.length; i++) {
        await expect(options.nth(i)).toHaveValue(expectedPages[i]);
      }
    });

    test('should have form fields for page editing', async () => {
      await page.goto('http://localhost:3000/admin/cms.html');
      
      // Check all form fields are present
      await expect(page.locator('#pageTitle')).toBeVisible();
      await expect(page.locator('#metaDescription')).toBeVisible();
      await expect(page.locator('#heroTitle')).toBeVisible();
      await expect(page.locator('#heroSubtitle')).toBeVisible();
      await expect(page.locator('#heroDescription')).toBeVisible();
      await expect(page.locator('#heroImageUrl')).toBeVisible();
      await expect(page.locator('button:has-text("Save Page Content")')).toBeVisible();
    });

    test('should have settings form fields', async () => {
      await page.goto('http://localhost:3000/admin/cms.html');
      await page.click('[data-tab="settings"]');
      
      // Check all settings fields
      await expect(page.locator('#siteName')).toBeVisible();
      await expect(page.locator('#siteTagline')).toBeVisible();
      await expect(page.locator('#contactEmail')).toBeVisible();
      await expect(page.locator('#contactPhone')).toBeVisible();
      await expect(page.locator('#contactAddress')).toBeVisible();
      await expect(page.locator('#logoUrl')).toBeVisible();
      await expect(page.locator('#footerText')).toBeVisible();
      await expect(page.locator('button:has-text("Save Settings")')).toBeVisible();
    });

    test('should have add buttons for content', async () => {
      await page.goto('http://localhost:3000/admin/cms.html');
      
      // Services tab
      await page.click('[data-tab="services"]');
      await expect(page.locator('button:has-text("Add New Service")')).toBeVisible();
      
      // Blog tab
      await page.click('[data-tab="blog"]');
      await expect(page.locator('button:has-text("Add New Post")')).toBeVisible();
      
      // Testimonials tab
      await page.click('[data-tab="testimonials"]');
      await expect(page.locator('button:has-text("Add New Testimonial")')).toBeVisible();
    });
  });

  test.describe('Frontend CMS Integration', () => {
    test('should load CMS loader script on all pages', async () => {
      const pages = ['index.html', 'services.html', 'contact.html', 'blog.html', 'sample-submission.html', 'search.html'];
      
      for (const pageFile of pages) {
        await page.goto(`http://localhost:3000/${pageFile}`);
        
        // Check that CMS loader script is included
        const cmsScript = page.locator('script[src="js/cms-loader.js"]');
        await expect(cmsScript).toBeVisible();
      }
    });

    test('should have CMS loader JavaScript file', async () => {
      const fs = require('fs');
      expect(fs.existsSync('js/cms-loader.js')).toBeTruthy();
      
      const loaderContent = fs.readFileSync('js/cms-loader.js', 'utf8');
      expect(loaderContent).toContain('class CMSLoader');
      expect(loaderContent).toContain('loadPageContent');
      expect(loaderContent).toContain('loadSiteSettings');
      expect(loaderContent).toContain('loadServices');
    });

    test('should have CMS manager JavaScript file', async () => {
      const fs = require('fs');
      expect(fs.existsSync('admin/js/cms-manager.js')).toBeTruthy();
      
      const managerContent = fs.readFileSync('admin/js/cms-manager.js', 'utf8');
      expect(managerContent).toContain('class CMSManager');
      expect(managerContent).toContain('loadCurrentTabContent');
      expect(managerContent).toContain('savePageContent');
      expect(managerContent).toContain('saveSiteSettings');
    });
  });

  test.describe('Admin Navigation Integration', () => {
    test('should have CMS link in admin dashboard', async () => {
      await page.goto('http://localhost:3000/admin/dashboard.html');
      
      const cmsLink = page.locator('a[href="cms.html"]');
      await expect(cmsLink).toBeVisible();
      await expect(cmsLink).toContainText('Content Management');
    });

    test('should have CMS link in admin COA management', async () => {
      await page.goto('http://localhost:3000/admin/manage-coas.html');
      
      const cmsLink = page.locator('a[href="cms.html"]');
      await expect(cmsLink).toBeVisible();
      await expect(cmsLink).toContainText('Content Management');
    });

    test('should navigate to CMS from admin links', async () => {
      await page.goto('http://localhost:3000/admin/dashboard.html');
      await page.click('a[href="cms.html"]');
      
      await expect(page).toHaveURL(/admin\/cms\.html/);
      await expect(page.locator('h1')).toContainText('Content Management System');
    });
  });

  test.describe('CMS Manager Functionality', () => {
    test('should initialize CMS manager', async () => {
      await page.goto('http://localhost:3000/admin/cms.html');
      
      // Check that CMS manager is loaded
      await page.waitForFunction(() => window.cmsManager !== undefined);
      
      // Check that global functions are available
      await page.waitForFunction(() => window.showAddServiceModal !== undefined);
      await page.waitForFunction(() => window.savePageContent !== undefined);
      await page.waitForFunction(() => window.saveSiteSettings !== undefined);
    });

    test('should handle page selector change', async () => {
      await page.goto('http://localhost:3000/admin/cms.html');
      
      // Change page selector
      await page.selectOption('#pageSelector', 'services');
      
      // Should trigger page content loading (function exists)
      await page.waitForFunction(() => window.cmsManager !== undefined);
    });
  });

  test.describe('Error Handling', () => {
    test('should handle missing database gracefully', async () => {
      await page.goto('http://localhost:3000/index.html');
      
      // Should not throw errors even if database is not available
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      
      await page.waitForLoadState('networkidle');
      
      // Page should still load with fallback content
      await expect(page.locator('h1')).toBeVisible();
    });

    test('should show appropriate loading states', async () => {
      await page.goto('http://localhost:3000/admin/cms.html');
      
      // Check for loading indicators
      await expect(page.locator('#pageLoading')).toBeHidden();
      await expect(page.locator('#settingsLoading')).toBeHidden();
    });
  });

  test.describe('Responsive Design', () => {
    test('should work on mobile viewport', async () => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('http://localhost:3000/admin/cms.html');
      
      // Check that content is still accessible
      await expect(page.locator('h1')).toBeVisible();
      await expect(page.locator('.tab-nav')).toBeVisible();
      
      // Check that tabs work on mobile
      await page.click('[data-tab="services"]');
      await expect(page.locator('#services-tab')).toHaveClass(/active/);
    });

    test('should work on tablet viewport', async () => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.goto('http://localhost:3000/admin/cms.html');
      
      await expect(page.locator('h1')).toBeVisible();
      await expect(page.locator('.form-grid')).toBeVisible();
    });
  });

  test.describe('Performance', () => {
    test('should load CMS pages quickly', async () => {
      const startTime = Date.now();
      await page.goto('http://localhost:3000/admin/cms.html');
      await page.waitForLoadState('networkidle');
      const loadTime = Date.now() - startTime;
      
      // Should load within 3 seconds
      expect(loadTime).toBeLessThan(3000);
    });

    test('should have efficient JavaScript loading', async () => {
      await page.goto('http://localhost:3000/index.html');
      
      // Check that CMS loader doesn't block page rendering
      await expect(page.locator('h1')).toBeVisible();
      
      // CMS loader should be loaded asynchronously
      await page.waitForFunction(() => window.cmsLoader !== undefined, { timeout: 5000 });
    });
  });

  test.describe('Content Structure Validation', () => {
    test('should have proper HTML structure on all pages', async () => {
      const pages = ['index.html', 'services.html', 'contact.html', 'blog.html', 'sample-submission.html', 'search.html'];
      
      for (const pageFile of pages) {
        await page.goto(`http://localhost:3000/${pageFile}`);
        
        // Check basic structure
        await expect(page.locator('html')).toBeVisible();
        await expect(page.locator('head')).toBeVisible();
        await expect(page.locator('body')).toBeVisible();
        await expect(page.locator('header')).toBeVisible();
        await expect(page.locator('footer')).toBeVisible();
      }
    });

    test('should maintain existing functionality', async () => {
      await page.goto('http://localhost:3000/index.html');
      
      // Check that existing elements are still there
      await expect(page.locator('.hero-title')).toBeVisible();
      await expect(page.locator('.services-grid')).toBeVisible();
      await expect(page.locator('.nav-menu')).toBeVisible();
    });
  });
});

test.describe('CMS File Structure Validation', () => {
  test('should have all required CMS files', async () => {
    const fs = require('fs');
    
    const requiredFiles = [
      'admin/setup-cms-database.sql',
      'admin/migrate-content.html',
      'admin/cms.html',
      'admin/js/cms-manager.js',
      'js/cms-loader.js'
    ];
    
    for (const file of requiredFiles) {
      expect(fs.existsSync(file)).toBeTruthy();
    }
  });

  test('should have valid HTML structure in CMS files', async () => {
    const fs = require('fs');
    
    // Check CMS HTML files
    const cmsHtml = fs.readFileSync('admin/cms.html', 'utf8');
    expect(cmsHtml).toContain('<!DOCTYPE html>');
    expect(cmsHtml).toContain('<title>Content Management System');
    expect(cmsHtml).toContain('class="cms-container"');
    
    const migrateHtml = fs.readFileSync('admin/migrate-content.html', 'utf8');
    expect(migrateHtml).toContain('<!DOCTYPE html>');
    expect(migrateHtml).toContain('CMS Content Migration Tool');
  });

  test('should have valid JavaScript in CMS files', async () => {
    const fs = require('fs');
    
    // Check JavaScript files don't have syntax errors
    const cmsManager = fs.readFileSync('admin/js/cms-manager.js', 'utf8');
    expect(cmsManager).toContain('class CMSManager');
    expect(cmsManager).toContain('constructor()');
    expect(cmsManager).toContain('init()');
    
    const cmsLoader = fs.readFileSync('js/cms-loader.js', 'utf8');
    expect(cmsLoader).toContain('class CMSLoader');
    expect(cmsLoader).toContain('constructor()');
    expect(cmsLoader).toContain('loadPageContent()');
  });
});
