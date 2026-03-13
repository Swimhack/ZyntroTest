const { test, expect } = require('@playwright/test');

async function setupAuthSession(page) {
  await page.evaluate(() => {
    const session = {
      username: 'drew',
      loginTime: Date.now(),
      expiresAt: Date.now() + 8 * 60 * 60 * 1000,
      remember: false
    };
    localStorage.setItem('zyntro_admin_session', JSON.stringify(session));
    localStorage.setItem('zyntro_admin_token', 'test-admin-token');
  });
}

async function mockCMSAPIs(page) {
  // Mock page content - ApiClient.getPageContent() → /api/cms/page/{page}
  await page.route('**/api/cms/page/**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        data: {
          content: {
            page_title: 'ZyntroTest - Analytical Testing',
            meta_description: 'Leading analytical testing services',
            hero_title: 'Trusted Analytical Testing'
          },
          hero: {
            title: 'Trusted Analytical Testing',
            subtitle: 'Precision results you can trust',
            description: 'Leading testing services for peptides and supplements',
            image_url: '/images/hero.jpg',
            stats: [
              { label: 'Tests Completed', number: '5000+' },
              { label: 'Clients', number: '200+' },
              { label: 'Accuracy', number: '99.9%' }
            ]
          }
        }
      })
    });
  });

  // Mock site settings - ApiClient.getSiteSettings() → /api/cms/settings
  await page.route('**/api/cms/settings', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        data: {
          site_name: 'ZyntroTest',
          site_tagline: 'Analytical Testing Services',
          contact_email: 'info@zyntrotest.com',
          contact_phone: '(555) 123-4567',
          contact_address: '123 Lab Drive, Science City, SC 12345',
          logo_url: '/images/logo.svg',
          footer_text: 'ZyntroTest 2025'
        }
      })
    });
  });

  // Mock services list
  await page.route('**/api/admin/services', async (route) => {
    const method = route.request().method();
    if (method === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: [
            {
              id: '1', title: 'Peptide Analysis', subtitle: 'Comprehensive purity testing',
              description: 'Full peptide analysis', base_price: '$200', status: 'active',
              features: '["HPLC Analysis","Mass Spectrometry"]'
            },
            {
              id: '2', title: 'Supplement Screening', subtitle: 'Adulterant detection',
              description: 'Full supplement screening', base_price: '$150', status: 'active',
              features: '["Adulterant Screening","Label Verification"]'
            }
          ]
        })
      });
    } else if (method === 'POST') {
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({ data: { id: '3' }, success: true })
      });
    }
  });

  // Mock individual service endpoints - check for /count path first
  await page.route('**/api/admin/services/*', async (route) => {
    const url = route.request().url();
    if (url.endsWith('/count')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ count: 3 })
      });
      return;
    }
    const method = route.request().method();
    if (method === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            id: '1', title: 'Peptide Analysis', subtitle: 'Comprehensive purity testing',
            description: 'Full peptide analysis', base_price: '$200', status: 'active',
            features: '["HPLC Analysis","Mass Spectrometry"]'
          }
        })
      });
    } else {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true })
      });
    }
  });

  // Mock blog posts
  await page.route('**/api/admin/blog_posts', async (route) => {
    const method = route.request().method();
    if (method === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: [
            {
              id: '1', title: 'Understanding Peptide Purity', slug: 'understanding-peptide-purity',
              excerpt: 'A guide to peptide testing', content: 'Full article content...',
              author: 'Zyntro Team', status: 'published', published_date: '2025-02-01'
            }
          ]
        })
      });
    } else if (method === 'POST') {
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({ data: { id: '2' }, success: true })
      });
    }
  });

  // Mock individual blog post endpoints - check for /count path first
  await page.route('**/api/admin/blog_posts/*', async (route) => {
    const url = route.request().url();
    if (url.endsWith('/count')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ count: 5 })
      });
      return;
    }
    const method = route.request().method();
    if (method === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            id: '1', title: 'Understanding Peptide Purity',
            excerpt: 'A guide to peptide testing', content: 'Full article content...',
            author: 'Zyntro Team', status: 'published'
          }
        })
      });
    } else {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true })
      });
    }
  });

  // Mock testimonials
  await page.route('**/api/admin/testimonials', async (route) => {
    const method = route.request().method();
    if (method === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: [
            {
              id: '1', author_name: 'Dr. Sarah Chen', company: 'BioResearch Inc',
              content: 'Excellent testing services with fast turnaround.',
              rating: 5, active: true
            }
          ]
        })
      });
    } else if (method === 'POST') {
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({ data: { id: '2' }, success: true })
      });
    }
  });

  // Mock individual testimonial endpoints - check for /count path first
  await page.route('**/api/admin/testimonials/*', async (route) => {
    const url = route.request().url();
    if (url.endsWith('/count')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ count: 8 })
      });
      return;
    }
    const method = route.request().method();
    if (method === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            id: '1', author_name: 'Dr. Sarah Chen', company: 'BioResearch Inc',
            content: 'Excellent testing services', rating: 5, active: true
          }
        })
      });
    } else {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true })
      });
    }
  });

  // Mock page_content count endpoint
  await page.route('**/api/admin/page_content/count', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ count: 4 })
    });
  });

  // Mock payment settings - ApiClient.getPaymentSettings() → /api/admin/payment/settings
  await page.route('**/api/admin/payment/settings', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        data: {
          authnet_api_login_id: '5K2B***',
          authnet_transaction_key: '****masked',
          authnet_client_key: '9gH***',
          authnet_environment: 'sandbox'
        },
        status: {
          configured: true,
          hasLoginId: true,
          hasTransactionKey: true,
          hasClientKey: true,
          environment: 'sandbox'
        }
      })
    });
  });

  // Mock payment test connection - ApiClient.testPaymentConnection() → /api/admin/payment/test
  await page.route('**/api/admin/payment/test', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true, message: 'Connection successful', environment: 'sandbox' })
    });
  });

  // Mock upsert endpoints
  await page.route('**/api/admin/site_settings/**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true })
    });
  });

  await page.route('**/api/admin/page_content', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true })
    });
  });

  await page.route('**/api/admin/hero_sections/**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true })
    });
  });

  // Mock media endpoints - ApiClient.getMedia() → /api/cms/media
  await page.route('**/api/cms/media', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ data: [] })
    });
  });

  await page.route('**/api/cms/media/*', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ data: [] })
    });
  });
}

test.describe('Admin CMS Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/fonts.googleapis.com/**', route => route.abort());
    await page.route('**/fonts.gstatic.com/**', route => route.abort());
    await mockCMSAPIs(page);
    await page.goto('/admin/index.html', { waitUntil: 'domcontentloaded' });
    await setupAuthSession(page);
    await page.goto('/admin/cms.html', { waitUntil: 'domcontentloaded' });
  });

  test('should display CMS page with correct title', async ({ page }) => {
    await expect(page).toHaveTitle(/Content Management System.*ZyntroTest Admin/);
  });

  test('should load auth.js script', async ({ page }) => {
    // CMS page includes auth.js for session management
    const authScript = page.locator('script[src="js/auth.js"]');
    await expect(authScript).toBeAttached();
  });

  test('should display CMS header', async ({ page }) => {
    await expect(page.locator('.cms-header h1')).toContainText('Content Management');
  });

  test('should display tab navigation with all tabs', async ({ page }) => {
    const tabNav = page.locator('.tab-nav');
    await expect(tabNav).toBeVisible();

    const tabButtons = page.locator('.tab-button');
    await expect(tabButtons.filter({ hasText: 'Pages' })).toBeVisible();
    await expect(tabButtons.filter({ hasText: 'Services' })).toBeVisible();
    await expect(tabButtons.filter({ hasText: 'Blog' })).toBeVisible();
    await expect(tabButtons.filter({ hasText: 'Testimonials' })).toBeVisible();
    await expect(tabButtons.filter({ hasText: 'Settings' })).toBeVisible();
    await expect(tabButtons.filter({ hasText: 'Payment' })).toBeVisible();
  });

  test('should have Pages tab active by default', async ({ page }) => {
    const pagesTab = page.locator('.tab-button[data-tab="pages"]');
    await expect(pagesTab).toHaveClass(/active/);
  });

  test('should load page content in Pages tab', async ({ page }) => {
    // Wait for content to load
    await page.waitForTimeout(1000);

    // Check page content form fields
    await expect(page.locator('#pageTitle')).toBeVisible();
    await expect(page.locator('#metaDescription')).toBeVisible();
    await expect(page.locator('#heroTitle')).toBeVisible();
    await expect(page.locator('#heroSubtitle')).toBeVisible();
    await expect(page.locator('#heroDescription')).toBeVisible();

    // Check that content was loaded
    await expect(page.locator('#heroTitle')).toHaveValue('Trusted Analytical Testing');
  });

  test('should have page selector dropdown', async ({ page }) => {
    const pageSelector = page.locator('#pageSelector');
    await expect(pageSelector).toBeVisible();
  });

  test('should switch to Services tab', async ({ page }) => {
    await page.click('.tab-button[data-tab="services"]');

    // Services tab should be active
    await expect(page.locator('.tab-button[data-tab="services"]')).toHaveClass(/active/);
    await expect(page.locator('#services-tab')).toHaveClass(/active/);

    // Wait for services to load
    await page.waitForTimeout(1000);

    // Services should be displayed
    const servicesList = page.locator('#servicesList');
    await expect(servicesList).toContainText('Peptide Analysis');
    await expect(servicesList).toContainText('Supplement Screening');
  });

  test('should display service items with edit and delete buttons', async ({ page }) => {
    await page.click('.tab-button[data-tab="services"]');
    await page.waitForTimeout(1000);

    const serviceItems = page.locator('#servicesList .content-item');
    await expect(serviceItems).toHaveCount(2);

    // Each item should have edit and delete buttons
    const firstItem = serviceItems.first();
    await expect(firstItem.locator('button', { hasText: 'Edit' })).toBeVisible();
    await expect(firstItem.locator('button', { hasText: 'Delete' })).toBeVisible();
  });

  test('should switch to Blog tab and display posts', async ({ page }) => {
    await page.click('.tab-button[data-tab="blog"]');

    await expect(page.locator('#blog-tab')).toHaveClass(/active/);
    await page.waitForTimeout(1000);

    const blogList = page.locator('#blogList');
    await expect(blogList).toContainText('Understanding Peptide Purity');
    await expect(blogList).toContainText('Zyntro Team');
  });

  test('should switch to Testimonials tab and display testimonials', async ({ page }) => {
    await page.click('.tab-button[data-tab="testimonials"]');

    await expect(page.locator('#testimonials-tab')).toHaveClass(/active/);
    await page.waitForTimeout(1000);

    const testimonialsList = page.locator('#testimonialsList');
    await expect(testimonialsList).toContainText('Dr. Sarah Chen');
    await expect(testimonialsList).toContainText('BioResearch Inc');
  });

  test('should display star ratings for testimonials', async ({ page }) => {
    await page.click('.tab-button[data-tab="testimonials"]');
    await page.waitForTimeout(1000);

    const testimonialsList = page.locator('#testimonialsList');
    // 5-star rating should show 5 filled stars
    await expect(testimonialsList).toContainText('\u2605\u2605\u2605\u2605\u2605');
  });

  test('should switch to Settings tab and display site settings', async ({ page }) => {
    await page.click('.tab-button[data-tab="settings"]');

    await expect(page.locator('#settings-tab')).toHaveClass(/active/);
    await page.waitForTimeout(1000);

    // Check settings form fields are populated
    await expect(page.locator('#siteName')).toHaveValue('ZyntroTest');
    await expect(page.locator('#siteTagline')).toHaveValue('Analytical Testing Services');
    await expect(page.locator('#contactEmail')).toHaveValue('info@zyntrotest.com');
    await expect(page.locator('#contactPhone')).toHaveValue('(555) 123-4567');
  });

  test('should switch to Payment tab and display payment settings', async ({ page }) => {
    await page.click('.tab-button[data-tab="payment"]');

    await expect(page.locator('#payment-tab')).toHaveClass(/active/);
    await page.waitForTimeout(1000);

    // Check payment form fields exist
    await expect(page.locator('#authnetApiLoginId')).toBeVisible();
    await expect(page.locator('#authnetTransactionKey')).toBeVisible();
    await expect(page.locator('#authnetClientKey')).toBeVisible();
    await expect(page.locator('#authnetEnvironment')).toBeVisible();
  });

  test('should display CMS stats in header area', async ({ page }) => {
    await page.waitForTimeout(1000);

    // Stats should be loaded
    await expect(page.locator('#servicesCount')).toHaveText('3');
    await expect(page.locator('#blogPostsCount')).toHaveText('5');
    await expect(page.locator('#testimonialsCount')).toHaveText('8');
    await expect(page.locator('#pagesCount')).toHaveText('4');
  });

  test('should have notification element', async ({ page }) => {
    const notification = page.locator('#notification');
    await expect(notification).toBeAttached();
  });

  test('should have modals container for dynamic modals', async ({ page }) => {
    const modalsContainer = page.locator('#modalsContainer');
    await expect(modalsContainer).toBeAttached();
  });

  test('should display hero image fields in Pages tab', async ({ page }) => {
    await page.waitForTimeout(1000);

    await expect(page.locator('#heroImageUrl')).toBeAttached();
  });

  test('should display hero stat fields in Pages tab', async ({ page }) => {
    await page.waitForTimeout(1000);

    // Check hero stat fields
    await expect(page.locator('#heroStatLabel1')).toBeVisible();
    await expect(page.locator('#heroStatValue1')).toBeVisible();

    // Values should be populated from mock data
    await expect(page.locator('#heroStatLabel1')).toHaveValue('Tests Completed');
    await expect(page.locator('#heroStatValue1')).toHaveValue('5000+');
  });

  test('should have payment environment selector', async ({ page }) => {
    await page.click('.tab-button[data-tab="payment"]');
    await page.waitForTimeout(1000);

    const envSelect = page.locator('#authnetEnvironment');
    await expect(envSelect).toBeVisible();

    const options = envSelect.locator('option');
    await expect(options.filter({ hasText: 'sandbox' })).toBeAttached();
    await expect(options.filter({ hasText: 'production' })).toBeAttached();
  });
});
