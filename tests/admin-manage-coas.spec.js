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

const mockCOAs = [
  {
    id: 'ZT-2025-001', client: 'BioVenture Research', compound: 'BPC-157',
    analysis_type: 'Peptide Analysis', status: 'Complete', test_date: '2025-01-15',
    purity: '99.5%', result: null, notes: 'High purity sample',
    file_name: 'coa-001.pdf', file_size: 256000, file_url: '/uploads/coa-001.pdf',
    created_at: '2025-01-15T10:00:00Z', updated_at: '2025-01-15T10:00:00Z'
  },
  {
    id: 'ZT-2025-002', client: 'PharmaTech Labs', compound: 'TB-500',
    analysis_type: 'Peptide Analysis', status: 'Pending', test_date: '2025-02-01',
    purity: '98.2%', result: null, notes: '',
    file_name: null, file_size: null, file_url: null,
    created_at: '2025-02-01T14:00:00Z', updated_at: '2025-02-01T14:00:00Z'
  },
  {
    id: 'ZT-2025-003', client: 'NutriTest Co', compound: 'Vitamin D3',
    analysis_type: 'Supplement Screening', status: 'Complete', test_date: '2025-02-15',
    purity: null, result: 'PASS - No Adulterants', notes: 'Clean sample',
    file_name: 'coa-003.pdf', file_size: 180000, file_url: '/uploads/coa-003.pdf',
    created_at: '2025-02-15T09:00:00Z', updated_at: '2025-02-15T09:00:00Z'
  }
];

async function mockCOAAPIs(page) {
  await page.route('**/api/admin/coas', async (route) => {
    const method = route.request().method();
    if (method === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: mockCOAs })
      });
    } else if (method === 'POST') {
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({ data: { id: 'ZT-2025-004' }, success: true })
      });
    }
  });

  await page.route('**/api/admin/coas/*', async (route) => {
    const method = route.request().method();
    const url = route.request().url();
    const id = url.split('/').pop().split('?')[0];

    if (method === 'GET') {
      const coa = mockCOAs.find(c => c.id === id) || mockCOAs[0];
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: coa })
      });
    } else if (method === 'PUT' || method === 'PATCH') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: { id }, success: true })
      });
    } else if (method === 'DELETE') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true })
      });
    }
  });
}

test.describe('Admin Manage COAs Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/fonts.googleapis.com/**', route => route.abort());
    await page.route('**/fonts.gstatic.com/**', route => route.abort());
    await mockCOAAPIs(page);
    await page.goto('/admin/index.html', { waitUntil: 'domcontentloaded' });
    await setupAuthSession(page);
    await page.goto('/admin/manage-coas.html', { waitUntil: 'domcontentloaded' });
  });

  test('should display manage COAs page with correct title', async ({ page }) => {
    await expect(page).toHaveTitle(/Manage COAs.*ZyntroTest Admin/);
    await expect(page.locator('header.main-header h1')).toHaveText('Manage COAs');
  });

  test('should redirect to login if not authenticated', async ({ page }) => {
    await page.evaluate(() => localStorage.clear());
    await page.goto('/admin/manage-coas.html', { waitUntil: 'domcontentloaded' });
    await page.waitForURL('**/admin/index.html', { timeout: 5000 });
  });

  test('should display COA table with correct headers', async ({ page }) => {
    const headers = page.locator('.table thead th');
    const expectedHeaders = ['COA ID', 'Client', 'Compound', 'Type', 'Date', 'Status', 'Added', 'Actions'];
    for (const header of expectedHeaders) {
      await expect(headers.filter({ hasText: header })).toBeVisible();
    }
  });

  test('should load and display COA data in table', async ({ page }) => {
    // Wait for data to load
    await page.waitForTimeout(1000);

    const tbody = page.locator('#coa-table-body');
    await expect(tbody.locator('tr')).toHaveCount(3);

    // Check first COA data
    await expect(tbody).toContainText('ZT-2025-001');
    await expect(tbody).toContainText('BioVenture Research');
    await expect(tbody).toContainText('BPC-157');
    await expect(tbody).toContainText('Peptide Analysis');
  });

  test('should display status badges with correct styling', async ({ page }) => {
    await page.waitForTimeout(1000);

    // Complete status should have success badge
    const successBadge = page.locator('.status-badge.success').first();
    await expect(successBadge).toBeVisible();
    await expect(successBadge).toHaveText('Complete');
  });

  test('should display search input field', async ({ page }) => {
    const searchInput = page.locator('#search-input');
    await expect(searchInput).toBeVisible();
    await expect(searchInput).toHaveAttribute('placeholder', /Search by COA ID, client, or compound/);
  });

  test('should have type filter dropdown', async ({ page }) => {
    const typeFilter = page.locator('#type-filter');
    await expect(typeFilter).toBeVisible();

    const options = typeFilter.locator('option');
    await expect(options.filter({ hasText: 'All Types' })).toBeAttached();
    await expect(options.filter({ hasText: 'Peptide Analysis' })).toBeAttached();
    await expect(options.filter({ hasText: 'Supplement Screening' })).toBeAttached();
    await expect(options.filter({ hasText: 'Biotech Analysis' })).toBeAttached();
  });

  test('should have status filter dropdown', async ({ page }) => {
    const statusFilter = page.locator('#status-filter');
    await expect(statusFilter).toBeVisible();

    const options = statusFilter.locator('option');
    await expect(options.filter({ hasText: 'All Status' })).toBeAttached();
    await expect(options.filter({ hasText: 'Complete' })).toBeAttached();
    await expect(options.filter({ hasText: 'Pending' })).toBeAttached();
    await expect(options.filter({ hasText: 'In Progress' })).toBeAttached();
  });

  test('should have clear filters button', async ({ page }) => {
    const clearBtn = page.locator('button', { hasText: 'Clear Filters' });
    await expect(clearBtn).toBeVisible();
  });

  test('should have Add COA button', async ({ page }) => {
    const addBtn = page.locator('button', { hasText: '+ Add COA' });
    await expect(addBtn).toBeVisible();
  });

  test('should open add COA modal when clicking Add button', async ({ page }) => {
    await page.click('button:has-text("+ Add COA")');

    const modal = page.locator('#edit-modal');
    await expect(modal).toHaveClass(/show/);

    // Modal should have "Add New COA" title
    await expect(modal.locator('h3')).toHaveText('Add New COA');

    // Form fields should be empty
    await expect(page.locator('#edit-coa-id')).toHaveValue('');
    await expect(page.locator('#edit-client')).toHaveValue('');
    await expect(page.locator('#edit-compound')).toHaveValue('');
  });

  test('should display edit modal with correct form fields', async ({ page }) => {
    await page.click('button:has-text("+ Add COA")');

    const modal = page.locator('#edit-modal');
    await expect(modal).toHaveClass(/show/);

    // Check all form fields exist
    await expect(page.locator('#edit-coa-id')).toBeVisible();
    await expect(page.locator('#edit-client')).toBeVisible();
    await expect(page.locator('#edit-compound')).toBeVisible();
    await expect(page.locator('#edit-type')).toBeVisible();
    await expect(page.locator('#edit-status')).toBeVisible();
    await expect(page.locator('#edit-date')).toBeVisible();
    await expect(page.locator('#edit-purity')).toBeVisible();
    await expect(page.locator('#edit-result')).toBeVisible();
    await expect(page.locator('#edit-notes')).toBeVisible();
    await expect(page.locator('#edit-pdf-file')).toBeAttached();
  });

  test('should close edit modal when clicking Cancel', async ({ page }) => {
    await page.click('button:has-text("+ Add COA")');
    await expect(page.locator('#edit-modal')).toHaveClass(/show/);

    await page.click('#edit-modal button:has-text("Cancel")');
    await expect(page.locator('#edit-modal')).not.toHaveClass(/show/);
  });

  test('should close edit modal when clicking X button', async ({ page }) => {
    await page.click('button:has-text("+ Add COA")');
    await expect(page.locator('#edit-modal')).toHaveClass(/show/);

    await page.click('#edit-modal .modal-close');
    await expect(page.locator('#edit-modal')).not.toHaveClass(/show/);
  });

  test('should have action buttons for each COA row', async ({ page }) => {
    await page.waitForTimeout(1000);

    const firstRow = page.locator('#coa-table-body tr').first();
    await expect(firstRow.locator('button', { hasText: 'Edit' })).toBeVisible();
    await expect(firstRow.locator('button', { hasText: 'View' })).toBeVisible();
    await expect(firstRow.locator('button', { hasText: 'Delete' })).toBeVisible();
  });

  test('should open view modal when clicking View', async ({ page }) => {
    await page.waitForTimeout(1000);

    await page.locator('#coa-table-body button', { hasText: 'View' }).first().click();

    const viewModal = page.locator('#view-modal');
    await expect(viewModal).toHaveClass(/show/, { timeout: 5000 });

    // Should display COA details (sorted by date, most recent first)
    const content = page.locator('#view-coa-content');
    await expect(content).toContainText('COA ID:');
    await expect(content).toContainText('Client:');
    await expect(content).toContainText('Compound:');
    await expect(content).toContainText('Status:');
  });

  test('should close view modal', async ({ page }) => {
    await page.waitForTimeout(1000);

    await page.locator('#coa-table-body button', { hasText: 'View' }).first().click();
    await expect(page.locator('#view-modal')).toHaveClass(/show/, { timeout: 5000 });

    await page.locator('#view-modal .modal-close').click();
    await expect(page.locator('#view-modal')).not.toHaveClass(/show/);
  });

  test('should display Quick Stats section', async ({ page }) => {
    await expect(page.locator('.card-title').filter({ hasText: 'Quick Stats' })).toBeVisible();

    await page.waitForTimeout(1000);

    // Check stat cards
    await expect(page.locator('#total-count')).toHaveText('3');
    await expect(page.locator('#peptide-count')).toHaveText('2');
    await expect(page.locator('#supplement-count')).toHaveText('1');
    await expect(page.locator('#biotech-count')).toHaveText('0');
  });

  test('should display correct stat labels', async ({ page }) => {
    await expect(page.locator('.stat-label').filter({ hasText: 'Total COAs' })).toBeVisible();
    await expect(page.locator('.stat-label').filter({ hasText: 'Peptide Analysis' })).toBeVisible();
    await expect(page.locator('.stat-label').filter({ hasText: 'Supplement Screening' })).toBeVisible();
    await expect(page.locator('.stat-label').filter({ hasText: 'Biotech Analysis' })).toBeVisible();
  });

  test('should display Download button for COAs with files', async ({ page }) => {
    await page.waitForTimeout(1000);

    // First COA has a file, should show Download button
    const firstRow = page.locator('#coa-table-body tr').first();
    await expect(firstRow.locator('button', { hasText: 'Download' })).toBeVisible();
  });

  test('should display sidebar with COAs link active', async ({ page }) => {
    const activeLink = page.locator('.nav-link.active');
    await expect(activeLink).toContainText('COAs');
  });

  test('should display user info', async ({ page }) => {
    await page.waitForTimeout(500);
    await expect(page.locator('#current-user')).toHaveText('drew');
  });

  test('should have PDF file upload in edit modal', async ({ page }) => {
    await page.click('button:has-text("+ Add COA")');

    const fileInput = page.locator('#edit-pdf-file');
    await expect(fileInput).toBeAttached();
    await expect(fileInput).toHaveAttribute('accept', 'application/pdf');
  });

  test('should have footer with policy links', async ({ page }) => {
    const footer = page.locator('.admin-footer');
    await expect(footer).toBeVisible();
    await expect(footer.locator('a[href="../privacy.html"]')).toBeVisible();
    await expect(footer.locator('a[href="../terms.html"]')).toBeVisible();
    await expect(footer.locator('a[href="../refund.html"]')).toBeVisible();
  });
});
