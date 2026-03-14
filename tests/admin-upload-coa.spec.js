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

async function mockUploadAPIs(page) {
  await page.route('**/api/admin/coas', async (route) => {
    const method = route.request().method();
    if (method === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: [
            {
              id: 'ZT-2025-001', client: 'Test Client', compound: 'BPC-157',
              analysis_type: 'Peptide Analysis', status: 'Complete',
              test_date: '2025-01-15', purity: '99.5%',
              created_at: new Date().toISOString(),
              file_name: 'coa-001.pdf', file_size: 256000, file_url: '/uploads/coa-001.pdf'
            }
          ]
        })
      });
    } else if (method === 'POST') {
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({ data: { id: 'ZT-2025-002' }, success: true })
      });
    }
  });

  await page.route('**/api/admin/coas/*', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        data: {
          id: 'ZT-2025-001', client: 'Test Client', compound: 'BPC-157',
          analysis_type: 'Peptide Analysis', status: 'Complete'
        }
      })
    });
  });

  await page.route('**/api/upload-coa', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        fileUrl: '/uploads/test-coa.pdf',
        fileName: 'test-coa.pdf',
        fileSize: 128000
      })
    });
  });
}

test.describe('Admin Upload COA Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/fonts.googleapis.com/**', route => route.abort());
    await page.route('**/fonts.gstatic.com/**', route => route.abort());
    await mockUploadAPIs(page);
    await page.goto('/admin/index.html', { waitUntil: 'domcontentloaded' });
    await setupAuthSession(page);
    await page.goto('/admin/upload-coa.html', { waitUntil: 'domcontentloaded' });
  });

  test('should display upload page with correct title', async ({ page }) => {
    await expect(page).toHaveTitle(/Upload COA.*ZyntroTest Admin/);
    await expect(page.locator('header.main-header h1')).toHaveText('Upload Certificate of Analysis');
  });

  test('should redirect to login if not authenticated', async ({ page }) => {
    await page.evaluate(() => localStorage.clear());
    await page.goto('/admin/upload-coa.html', { waitUntil: 'domcontentloaded' });
    await page.waitForURL('**/admin/index.html', { timeout: 5000 });
  });

  test('should display upload zone with drag and drop area', async ({ page }) => {
    const uploadZone = page.locator('#upload-zone');
    await expect(uploadZone).toBeVisible();
    await expect(uploadZone).toContainText('Drag & drop your COA PDF here');
    await expect(uploadZone).toContainText('or click to browse files');
    await expect(uploadZone).toContainText('PDF only, max 10MB');
  });

  test('should have hidden file input for PDF selection', async ({ page }) => {
    const fileInput = page.locator('#file-input');
    await expect(fileInput).toBeAttached();
    await expect(fileInput).toHaveAttribute('accept', '.pdf');
    await expect(fileInput).not.toBeVisible();
  });

  test('should display COA details form fields', async ({ page }) => {
    // Required fields
    await expect(page.locator('#coa-id')).toBeVisible();
    await expect(page.locator('#client-name')).toBeVisible();
    await expect(page.locator('#compound-name')).toBeVisible();
    await expect(page.locator('#analysis-type')).toBeVisible();

    // Optional fields
    await expect(page.locator('#test-date')).toBeVisible();
    await expect(page.locator('#status')).toBeVisible();
    await expect(page.locator('#purity')).toBeVisible();
    await expect(page.locator('#result')).toBeVisible();
    await expect(page.locator('#notes')).toBeVisible();
  });

  test('should have correct placeholder text on form fields', async ({ page }) => {
    await expect(page.locator('#coa-id')).toHaveAttribute('placeholder', 'ZT-2024-001');
    await expect(page.locator('#client-name')).toHaveAttribute('placeholder', 'BioVenture Research');
    await expect(page.locator('#compound-name')).toHaveAttribute('placeholder', 'BPC-157');
    await expect(page.locator('#purity')).toHaveAttribute('placeholder', '99.8%');
    await expect(page.locator('#result')).toHaveAttribute('placeholder', 'PASS - No Adulterants');
  });

  test('should have required attributes on mandatory fields', async ({ page }) => {
    await expect(page.locator('#coa-id')).toHaveAttribute('required', '');
    await expect(page.locator('#client-name')).toHaveAttribute('required', '');
    await expect(page.locator('#compound-name')).toHaveAttribute('required', '');
    await expect(page.locator('#analysis-type')).toHaveAttribute('required', '');
  });

  test('should have analysis type dropdown with correct options', async ({ page }) => {
    const select = page.locator('#analysis-type');
    await expect(select).toBeVisible();

    const options = select.locator('option');
    await expect(options.filter({ hasText: 'Select type...' })).toBeAttached();
    await expect(options.filter({ hasText: 'Peptide Analysis' })).toBeAttached();
    await expect(options.filter({ hasText: 'Supplement Screening' })).toBeAttached();
    await expect(options.filter({ hasText: 'Biotech Analysis' })).toBeAttached();
  });

  test('should have status dropdown with correct options', async ({ page }) => {
    const select = page.locator('#status');
    await expect(select).toBeVisible();

    const options = select.locator('option');
    await expect(options.filter({ hasText: 'Complete' })).toBeAttached();
    await expect(options.filter({ hasText: 'Pending' })).toBeAttached();
    await expect(options.filter({ hasText: 'In Progress' })).toBeAttached();
  });

  test('should display form action buttons', async ({ page }) => {
    await expect(page.locator('button', { hasText: 'Generate COA ID' })).toBeVisible();
    await expect(page.locator('button', { hasText: 'Clear Form' })).toBeVisible();
    await expect(page.locator('#submit-btn')).toBeVisible();
    await expect(page.locator('#submit-btn')).toHaveText('Upload COA');
  });

  test('should display recent uploads section', async ({ page }) => {
    await expect(page.locator('.card-title').filter({ hasText: 'Recent Uploads' })).toBeVisible();
    await expect(page.locator('.card-description').filter({ hasText: 'Your last 5 uploaded COAs' })).toBeVisible();

    // Table headers
    const headers = page.locator('.table thead th');
    await expect(headers.filter({ hasText: 'COA ID' })).toBeVisible();
    await expect(headers.filter({ hasText: 'Client' })).toBeVisible();
    await expect(headers.filter({ hasText: 'Compound' })).toBeVisible();
    await expect(headers.filter({ hasText: 'Type' })).toBeVisible();
    await expect(headers.filter({ hasText: 'Upload Time' })).toBeVisible();
  });

  test('should load recent uploads', async ({ page }) => {
    await page.waitForTimeout(1000);

    const tbody = page.locator('#recent-uploads');
    await expect(tbody).toContainText('ZT-2025-001');
    await expect(tbody).toContainText('Test Client');
    await expect(tbody).toContainText('BPC-157');
  });

  test('should display file preview after selecting a file', async ({ page }) => {
    // The file preview is hidden initially
    await expect(page.locator('#file-preview')).not.toBeVisible();

    // Create a mock PDF file and trigger file selection
    const [fileChooser] = await Promise.all([
      page.waitForEvent('filechooser'),
      page.locator('#upload-zone').click()
    ]);

    // Create a minimal valid PDF
    const pdfContent = Buffer.from('%PDF-1.4\n1 0 obj\n<</Type/Catalog/Pages 2 0 R>>\nendobj\n2 0 obj\n<</Type/Pages/Kids[3 0 R]/Count 1>>\nendobj\n3 0 obj\n<</Type/Page/Parent 2 0 R/MediaBox[0 0 612 792]>>\nendobj\nxref\n0 4\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \ntrailer\n<</Size 4/Root 1 0 R>>\nstartxref\n190\n%%EOF');

    await fileChooser.setFiles({
      name: 'test-coa-document.pdf',
      mimeType: 'application/pdf',
      buffer: pdfContent
    });

    // File preview should now be visible
    await expect(page.locator('#file-preview')).toBeVisible();
    await expect(page.locator('#file-name')).toHaveText('test-coa-document.pdf');

    // Upload zone should be hidden
    await expect(page.locator('#upload-zone')).not.toBeVisible();
  });

  test('should remove file when clicking Remove button', async ({ page }) => {
    // Select a file first
    const [fileChooser] = await Promise.all([
      page.waitForEvent('filechooser'),
      page.locator('#upload-zone').click()
    ]);

    const pdfContent = Buffer.from('%PDF-1.4 minimal');
    await fileChooser.setFiles({
      name: 'test.pdf',
      mimeType: 'application/pdf',
      buffer: pdfContent
    });

    await expect(page.locator('#file-preview')).toBeVisible();

    // Click remove button
    await page.click('.remove-file');

    // Upload zone should be back, file preview hidden
    await expect(page.locator('#upload-zone')).toBeVisible();
    await expect(page.locator('#file-preview')).not.toBeVisible();
  });

  test('should display sidebar with Upload COA link active', async ({ page }) => {
    const activeLink = page.locator('.nav-link.active');
    await expect(activeLink).toContainText('Upload COA');
  });

  test('should display user info in header', async ({ page }) => {
    await page.waitForTimeout(500);
    await expect(page.locator('#current-user')).toHaveText('drew');
    await expect(page.locator('.user-role')).toHaveText('Administrator');
  });

  test('should have sidebar navigation with all expected links', async ({ page }) => {
    const sidebar = page.locator('.sidebar');
    await expect(sidebar.locator('a[href="dashboard.html"]')).toBeVisible();
    await expect(sidebar.locator('a[href="upload-coa.html"]')).toBeVisible();
    await expect(sidebar.locator('a[href="manage-coas.html"]')).toBeVisible();
    await expect(sidebar.locator('a[href="cms.html"]')).toBeVisible();
    await expect(sidebar.locator('a[href="submissions.html"]')).toBeVisible();
  });

  test('should have COA ID format hint', async ({ page }) => {
    await expect(page.locator('text=Format: ZT-YYYY-XXX')).toBeVisible();
  });

  test('should have optional field hints', async ({ page }) => {
    await expect(page.locator('text=For peptide analysis (optional)')).toBeVisible();
    await expect(page.locator('text=For supplement screening (optional)')).toBeVisible();
  });
});
