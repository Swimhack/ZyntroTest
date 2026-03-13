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

const mockContactSubmissions = [
  {
    id: '1', name: 'John Doe', email: 'john@example.com', company: 'Acme Corp',
    phone: '555-0101', service_type: 'Peptide Analysis', status: 'unread',
    message: 'Interested in testing', sample_type: 'peptide',
    created_at: '2025-03-01T10:00:00Z'
  },
  {
    id: '2', name: 'Jane Smith', email: 'jane@biotech.com', company: 'BioTech Inc',
    phone: '555-0202', service_type: 'Supplement Screening', status: 'read',
    message: 'Need supplement testing', sample_type: 'supplement',
    created_at: '2025-03-02T14:30:00Z'
  }
];

const mockSampleSubmissions = [
  {
    id: '10', client_name: 'Bob Wilson', email: 'bob@research.com', company: 'Research Labs',
    phone: '555-0301', sample_type: 'peptide', sample_count: 5,
    analysis_requested: 'Full Analysis', rush_service: true,
    status: 'unread', created_at: '2025-03-03T09:00:00Z'
  }
];

const mockNewsletterSubs = [
  {
    id: '100', email: 'subscriber@test.com', source: 'Website',
    status: 'active', subscribed_at: '2025-02-15T12:00:00Z',
    created_at: '2025-02-15T12:00:00Z'
  }
];

async function mockSubmissionAPIs(page) {
  await page.route('**/api/admin/contact_submissions', async (route) => {
    const method = route.request().method();
    if (method === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: mockContactSubmissions })
      });
    }
  });

  await page.route('**/api/admin/contact_submissions/*', async (route) => {
    const method = route.request().method();
    if (method === 'GET') {
      const url = route.request().url();
      const id = url.split('/').pop();
      const submission = mockContactSubmissions.find(s => s.id === id);
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: submission || mockContactSubmissions[0] })
      });
    } else if (method === 'PUT' || method === 'PATCH') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true })
      });
    } else if (method === 'DELETE') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true })
      });
    }
  });

  await page.route('**/api/admin/sample_submissions', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ data: mockSampleSubmissions })
    });
  });

  await page.route('**/api/admin/sample_submissions/*', async (route) => {
    const method = route.request().method();
    if (method === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: mockSampleSubmissions[0] })
      });
    } else {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true })
      });
    }
  });

  await page.route('**/api/admin/newsletter_subscriptions', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ data: mockNewsletterSubs })
    });
  });

  await page.route('**/api/admin/newsletter_subscriptions/*', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true })
    });
  });
}

test.describe('Admin Submissions Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/fonts.googleapis.com/**', route => route.abort());
    await page.route('**/fonts.gstatic.com/**', route => route.abort());
    await mockSubmissionAPIs(page);
    await page.goto('/admin/index.html', { waitUntil: 'domcontentloaded' });
    await setupAuthSession(page);
    await page.goto('/admin/submissions.html', { waitUntil: 'domcontentloaded' });
  });

  test('should display submissions page with correct title', async ({ page }) => {
    await expect(page).toHaveTitle(/Form Submissions.*ZyntroTest Admin/);
    await expect(page.locator('header.main-header h1')).toHaveText('Form Submissions');
  });

  test('should redirect to login if not authenticated', async ({ page }) => {
    await page.evaluate(() => localStorage.clear());
    await page.goto('/admin/submissions.html', { waitUntil: 'domcontentloaded' });
    await page.waitForURL('**/admin/index.html', { timeout: 5000 });
  });

  test('should display three tabs for submission types', async ({ page }) => {
    const tabs = page.locator('.tab');
    await expect(tabs).toHaveCount(3);

    await expect(tabs.nth(0)).toHaveText('Contact Forms');
    await expect(tabs.nth(1)).toHaveText('Sample Submissions');
    await expect(tabs.nth(2)).toHaveText('Newsletter Subscriptions');

    // First tab should be active by default
    await expect(tabs.nth(0)).toHaveClass(/active/);
  });

  test('should load and display contact submissions', async ({ page }) => {
    // Wait for loading to complete
    await page.waitForSelector('#contact-loading', { state: 'hidden', timeout: 5000 });

    // Table should be visible
    const table = page.locator('#contact-table');
    await expect(table).toBeVisible();

    // Check table headers
    const headers = table.locator('th');
    await expect(headers.filter({ hasText: 'Date' })).toBeVisible();
    await expect(headers.filter({ hasText: 'Name' })).toBeVisible();
    await expect(headers.filter({ hasText: 'Email' })).toBeVisible();
    await expect(headers.filter({ hasText: 'Company' })).toBeVisible();

    // Check that submissions data is rendered
    const tbody = page.locator('#contact-tbody');
    await expect(tbody.locator('tr')).toHaveCount(2);
    await expect(tbody).toContainText('John Doe');
    await expect(tbody).toContainText('john@example.com');
    await expect(tbody).toContainText('Acme Corp');
    await expect(tbody).toContainText('Jane Smith');
  });

  test('should display status badges for submissions', async ({ page }) => {
    await page.waitForSelector('#contact-loading', { state: 'hidden', timeout: 5000 });

    const badges = page.locator('#contact-tbody .status-badge');
    await expect(badges).toHaveCount(2);
  });

  test('should have search functionality for contact submissions', async ({ page }) => {
    const searchInput = page.locator('#contact-search');
    await expect(searchInput).toBeVisible();
    await expect(searchInput).toHaveAttribute('placeholder', /Search by name, email/);
  });

  test('should have status filter dropdown', async ({ page }) => {
    const filter = page.locator('#contact-status-filter');
    await expect(filter).toBeVisible();

    // Check filter options
    const options = filter.locator('option');
    await expect(options.filter({ hasText: 'All Status' })).toBeAttached();
    await expect(options.filter({ hasText: /^Unread$/ })).toBeAttached();
    await expect(options.filter({ hasText: /^Read$/ })).toBeAttached();
    await expect(options.filter({ hasText: /^Responded$/ })).toBeAttached();
    await expect(options.filter({ hasText: /^Completed$/ })).toBeAttached();
  });

  test('should switch between tabs', async ({ page }) => {
    // Click on Sample Submissions tab
    await page.click('.tab[data-tab="sample"]');

    const sampleTab = page.locator('#sample-tab');
    await expect(sampleTab).toHaveClass(/active/);

    // Contact tab should no longer be active
    await expect(page.locator('#contact-tab')).not.toHaveClass(/active/);

    // Wait for sample data to load
    await page.waitForSelector('#sample-loading', { state: 'hidden', timeout: 5000 });

    // Sample submissions should display
    const sampleTable = page.locator('#sample-table');
    await expect(sampleTable).toBeVisible();
    await expect(page.locator('#sample-tbody')).toContainText('Bob Wilson');
  });

  test('should switch to newsletter tab', async ({ page }) => {
    await page.click('.tab[data-tab="newsletter"]');

    const newsletterTab = page.locator('#newsletter-tab');
    await expect(newsletterTab).toHaveClass(/active/);

    await page.waitForSelector('#newsletter-loading', { state: 'hidden', timeout: 5000 });

    const newsletterTable = page.locator('#newsletter-table');
    await expect(newsletterTable).toBeVisible();
    await expect(page.locator('#newsletter-tbody')).toContainText('subscriber@test.com');
  });

  test('should have view button on each submission row', async ({ page }) => {
    await page.waitForSelector('#contact-loading', { state: 'hidden', timeout: 5000 });

    const viewButtons = page.locator('#contact-tbody button', { hasText: 'View' });
    await expect(viewButtons).toHaveCount(2);
  });

  test('should open detail modal when clicking View', async ({ page }) => {
    await page.waitForSelector('#contact-loading', { state: 'hidden', timeout: 5000 });

    // Click the first View button
    await page.locator('#contact-tbody button', { hasText: 'View' }).first().click();

    // Modal should become active
    const modal = page.locator('#detail-modal');
    await expect(modal).toHaveClass(/active/, { timeout: 5000 });

    // Modal title should show submission type
    await expect(page.locator('#modal-title')).toContainText('Contact Form Submission');

    // Modal body should contain submission details
    const modalBody = page.locator('#modal-body');
    await expect(modalBody).toContainText('John Doe');
    await expect(modalBody).toContainText('john@example.com');
  });

  test('should close modal when clicking close button', async ({ page }) => {
    await page.waitForSelector('#contact-loading', { state: 'hidden', timeout: 5000 });

    // Open modal
    await page.locator('#contact-tbody button', { hasText: 'View' }).first().click();
    await expect(page.locator('#detail-modal')).toHaveClass(/active/, { timeout: 5000 });

    // Close modal
    await page.click('#detail-modal .modal-footer button');
    await expect(page.locator('#detail-modal')).not.toHaveClass(/active/);
  });

  test('should display export CSV and refresh buttons', async ({ page }) => {
    const exportBtn = page.locator('#contact-tab button', { hasText: 'Export CSV' });
    await expect(exportBtn).toBeVisible();

    const refreshBtn = page.locator('#contact-tab button', { hasText: 'Refresh' });
    await expect(refreshBtn).toBeVisible();
  });

  test('should show empty state when no submissions', async ({ page }) => {
    // Re-mock with empty data
    await page.route('**/api/admin/contact_submissions', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: [] })
      });
    });

    await page.goto('/admin/submissions.html', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('#contact-loading', { state: 'hidden', timeout: 5000 });

    const emptyState = page.locator('#contact-empty');
    await expect(emptyState).toBeVisible();
    await expect(emptyState).toContainText('No Contact Submissions');
  });

  test('should display sidebar with correct active link', async ({ page }) => {
    const activeLink = page.locator('.nav-link.active');
    await expect(activeLink).toContainText('Form Submissions');
  });

  test('should display user info in header', async ({ page }) => {
    await page.waitForTimeout(500);
    await expect(page.locator('#current-user')).toHaveText('drew');
    await expect(page.locator('.user-role')).toHaveText('Administrator');
  });

  test('should have modal with status update buttons', async ({ page }) => {
    await page.waitForSelector('#contact-loading', { state: 'hidden', timeout: 5000 });

    // Open modal
    await page.locator('#contact-tbody button', { hasText: 'View' }).first().click();
    await expect(page.locator('#detail-modal')).toHaveClass(/active/, { timeout: 5000 });

    // Check for status action buttons in modal
    const modalBody = page.locator('#modal-body');
    await expect(modalBody.locator('button', { hasText: 'Mark as Read' })).toBeVisible();
    await expect(modalBody.locator('button', { hasText: 'Mark as Responded' })).toBeVisible();
    await expect(modalBody.locator('button', { hasText: 'Mark as Completed' })).toBeVisible();
    await expect(modalBody.locator('button', { hasText: 'Delete' })).toBeVisible();
  });
});
