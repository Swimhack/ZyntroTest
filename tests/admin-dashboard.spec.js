const { test, expect } = require('@playwright/test');

// Helper to set up authenticated session
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

// Helper to mock common API routes for dashboard
async function mockDashboardAPIs(page) {
  // Mock COA list for dashboard stats
  await page.route('**/api/admin/coas', async (route) => {
    if (route.request().method() === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: [
            {
              id: 'ZT-2025-001', client: 'Test Client A', compound: 'BPC-157',
              analysis_type: 'Peptide Analysis', status: 'Complete', test_date: '2025-01-15',
              created_at: new Date().toISOString(), purity: '99.5%'
            },
            {
              id: 'ZT-2025-002', client: 'Test Client B', compound: 'TB-500',
              analysis_type: 'Peptide Analysis', status: 'Pending', test_date: '2025-01-20',
              created_at: new Date().toISOString(), purity: '98.2%'
            },
            {
              id: 'ZT-2025-003', client: 'Test Client C', compound: 'Vitamin D3',
              analysis_type: 'Supplement Screening', status: 'Complete', test_date: '2025-02-01',
              created_at: new Date().toISOString(), result: 'PASS'
            }
          ]
        })
      });
    }
  });

  // Mock health check
  await page.route('**/api/health', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ status: 'ok' })
    });
  });
}

test.describe('Admin Dashboard Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/fonts.googleapis.com/**', route => route.abort());
    await page.route('**/fonts.gstatic.com/**', route => route.abort());
    await mockDashboardAPIs(page);
    // Navigate to login page first to set session without auth redirect
    await page.goto('/admin/index.html', { waitUntil: 'domcontentloaded' });
    await setupAuthSession(page);
    await page.goto('/admin/dashboard.html', { waitUntil: 'domcontentloaded' });
  });

  test('should display dashboard with correct title', async ({ page }) => {
    await expect(page).toHaveTitle(/COA Dashboard.*ZyntroTest Admin/);
    await expect(page.locator('header.main-header h1')).toHaveText('COA Dashboard');
  });

  test('should redirect to login if not authenticated', async ({ page }) => {
    // Clear the session
    await page.evaluate(() => localStorage.clear());
    await page.goto('/admin/dashboard.html', { waitUntil: 'domcontentloaded' });

    // Should redirect to login
    await page.waitForURL('**/admin/index.html', { timeout: 5000 });
  });

  test('should display sidebar navigation with correct links', async ({ page }) => {
    const sidebar = page.locator('.sidebar');
    await expect(sidebar).toBeVisible();

    // Check sidebar header
    await expect(sidebar.locator('.sidebar-header h2')).toHaveText('COA Dashboard');
    await expect(sidebar.locator('.sidebar-header p')).toHaveText('Admin Panel');

    // Check navigation links
    const navLinks = sidebar.locator('.nav-link');
    const expectedLinks = [
      { text: 'Admin Home', href: 'dashboard.html' },
      { text: 'COAs', href: 'manage-coas.html' },
      { text: 'Content Management', href: 'cms.html' },
      { text: 'Form Submissions', href: 'submissions.html' }
    ];

    for (const expected of expectedLinks) {
      const link = navLinks.filter({ hasText: expected.text });
      await expect(link).toBeVisible();
      await expect(link).toHaveAttribute('href', expected.href);
    }

    // Dashboard link should be active
    const dashboardLink = navLinks.filter({ hasText: 'Admin Home' });
    await expect(dashboardLink).toHaveClass(/active/);
  });

  test('should display statistics cards', async ({ page }) => {
    const statsGrid = page.locator('.stats-grid').first();
    await expect(statsGrid).toBeVisible();

    // Check stat card elements exist
    await expect(page.locator('#total-coas')).toBeVisible();
    await expect(page.locator('#pending-coas')).toBeVisible();
    await expect(page.locator('#recent-uploads')).toBeVisible();
    await expect(page.locator('#storage-used')).toBeVisible();

    // Stat labels should be present
    await expect(page.locator('.stat-label').filter({ hasText: 'Total COAs' })).toBeVisible();
    await expect(page.locator('.stat-label').filter({ hasText: 'Pending Upload' })).toBeVisible();
    await expect(page.locator('.stat-label').filter({ hasText: 'Uploaded Today' })).toBeVisible();
    await expect(page.locator('.stat-label').filter({ hasText: 'Storage Used' })).toBeVisible();
  });

  test('should load and display COA statistics', async ({ page }) => {
    // Wait for stats to load
    await page.waitForTimeout(1000);

    const totalCoas = page.locator('#total-coas');
    await expect(totalCoas).toHaveText('3');
  });

  test('should display quick action buttons', async ({ page }) => {
    // Check quick action section
    await expect(page.locator('.card-title').filter({ hasText: 'Quick Actions' })).toBeVisible();

    // Check action links/buttons
    const uploadLink = page.locator('a[href="upload-coa.html"]');
    await expect(uploadLink).toBeVisible();
    await expect(uploadLink).toContainText('Upload New COA');

    const manageLink = page.locator('.main-content a[href="manage-coas.html"]');
    await expect(manageLink).toBeVisible();
    await expect(manageLink).toContainText('Manage COAs');
  });

  test('should display recent activity table', async ({ page }) => {
    await expect(page.locator('.card-title').filter({ hasText: 'Recent Activity' })).toBeVisible();

    // Table should have correct headers
    const headers = page.locator('.table thead th');
    const expectedHeaders = ['COA ID', 'Client', 'Compound', 'Type', 'Date Added', 'Status', 'Actions'];
    for (const header of expectedHeaders) {
      await expect(headers.filter({ hasText: header })).toBeVisible();
    }

    // Wait for data to load
    await page.waitForTimeout(1000);

    // Should display the mocked COA data
    const tbody = page.locator('#recent-activity');
    await expect(tbody.locator('tr')).toHaveCount(3);
    await expect(tbody).toContainText('ZT-2025-001');
    await expect(tbody).toContainText('Test Client A');
  });

  test('should display current user name', async ({ page }) => {
    await page.waitForTimeout(500);
    const userName = page.locator('#current-user');
    await expect(userName).toHaveText('drew');
  });

  test('should have a working logout button', async ({ page }) => {
    const logoutBtn = page.locator('.logout-btn');
    await expect(logoutBtn).toBeVisible();
    await expect(logoutBtn).toHaveText('Logout');
  });

  test('should display system status section', async ({ page }) => {
    await expect(page.locator('.card-title').filter({ hasText: 'System Status' })).toBeVisible();
    await expect(page.locator('#db-status')).toBeVisible();
    await expect(page.locator('#bucket-status')).toBeVisible();

    // Wait for health check
    await page.waitForTimeout(2000);

    // Status should show connected after health check succeeds
    await expect(page.locator('#db-status')).toContainText('Connected');
  });

  test('should have an export backup button', async ({ page }) => {
    const exportBtn = page.locator('button', { hasText: 'Export Backup' });
    await expect(exportBtn).toBeVisible();
  });

  test('should display admin footer with links', async ({ page }) => {
    const footer = page.locator('.admin-footer');
    await expect(footer).toBeVisible();
    await expect(footer).toContainText('ZyntroTest');
    await expect(footer.locator('a[href="../privacy.html"]')).toBeVisible();
    await expect(footer.locator('a[href="../terms.html"]')).toBeVisible();
  });

  test('should have mobile menu toggle button', async ({ page }) => {
    const mobileToggle = page.locator('#mobile-menu-toggle');
    await expect(mobileToggle).toBeAttached();
  });
});
