const { test, expect } = require('@playwright/test');

test.describe('Contact Form Submission and Admin Verification', () => {
  // Generate unique test data for each run
  const timestamp = Date.now();
  const testData = {
    name: `Test User ${timestamp}`,
    email: `test${timestamp}@playwright-test.com`,
    company: 'Playwright Test Co',
    phone: '555-0123',
    sampleType: 'peptide',
    services: ['peptide', 'supplement'],
    addons: ['content'],
    quantity: '3',
    timeline: 'standard',
    message: `This is an automated test submission created at ${new Date().toLocaleString()}`
  };

  test('should submit contact form and verify in admin panel', async ({ page, context }) => {
    // Step 1: Navigate to contact page
    await test.step('Navigate to contact page', async () => {
      await page.goto('https://zyntrotest.com/contact.html');
      await expect(page).toHaveTitle(/Contact ZyntroTest/);
      await expect(page.locator('h1')).toContainText('Connect with ZyntroTest');
    });

    // Step 2: Fill out the contact form
    await test.step('Fill out contact form', async () => {
      // Fill text inputs
      await page.fill('#name', testData.name);
      await page.fill('#email', testData.email);
      await page.fill('#company', testData.company);
      await page.fill('#phone', testData.phone);
      
      // Select sample type
      await page.selectOption('#sample-type', testData.sampleType);
      
      // Check testing services - click visible labels instead of hidden checkboxes
      const serviceLabels = {
        'peptide': 'Peptide Purity Analysis',
        'supplement': 'Supplement Adulterant Screening',
        'cannabis': 'Cannabis/Hemp Testing (Waitlist)',
        'custom': 'Custom Analysis'
      };
      
      for (const service of testData.services) {
        await page.getByText(serviceLabels[service], { exact: true }).click();
      }
      
      // Check add-on services - click visible labels instead of hidden checkboxes
      const addonLabels = {
        'content': 'Content Analysis (+$25)',
        'endotoxin': 'Endotoxin Testing (+$250)',
        'sterility': 'Sterility Testing (+$300)'
      };
      
      for (const addon of testData.addons) {
        await page.getByText(addonLabels[addon], { exact: true }).click();
      }
      
      // Fill quantity
      await page.fill('#quantity', testData.quantity);
      
      // Select timeline
      await page.selectOption('#timeline', testData.timeline);
      
      // Fill message
      await page.fill('#message', testData.message);
    });

    // Step 3: Submit the form
    await test.step('Submit the form', async () => {
      // Wait for form submission and success response
      const responsePromise = page.waitForResponse(
        response => response.url().includes('supabase') && response.status() === 201,
        { timeout: 10000 }
      );
      
      await page.click('button[type="submit"]');
      
      try {
        await responsePromise;
      } catch (error) {
        console.log('Supabase response not captured, proceeding with verification');
      }
      
      // Wait for success indication (adjust based on your app's behavior)
      // This might be a success message, redirect, or other indication
      await page.waitForTimeout(2000);
    });

    // Step 4: Navigate to admin panel
    await test.step('Navigate to admin submissions page', async () => {
      await page.goto('https://zyntrotest.com/admin/submissions.html');
      await expect(page).toHaveTitle(/Form Submissions/);
      await expect(page.locator('h1')).toContainText('Form Submissions');
    });

    // Step 5: Wait for submissions to load
    await test.step('Wait for contact submissions to load', async () => {
      // Wait for the loading indicator to disappear
      await page.waitForSelector('.loading', { state: 'hidden', timeout: 10000 });
      
      // Wait for the table to appear
      await page.waitForSelector('.submissions-table', { timeout: 10000 });
    });

    // Step 6: Verify the submission appears in the admin panel
    await test.step('Verify submission appears in admin panel', async () => {
      // Check if the table has data
      const table = page.locator('.submissions-table');
      await expect(table).toBeVisible();
      
      // Look for our test submission by email
      const submissionRow = page.locator('tr', { 
        has: page.locator('td', { hasText: testData.email }) 
      });
      
      // Verify the row exists
      await expect(submissionRow).toBeVisible({ timeout: 5000 });
      
      // Verify specific fields in the row
      await expect(submissionRow.locator('td').nth(0)).toContainText(testData.name);
      await expect(submissionRow.locator('td').nth(1)).toContainText(testData.email);
      await expect(submissionRow.locator('td').nth(2)).toContainText(testData.company);
      
      // Verify status badge exists
      const statusBadge = submissionRow.locator('.status-badge');
      await expect(statusBadge).toBeVisible();
      await expect(statusBadge).toContainText(/unread|read/i);
    });

    // Step 7: Click "View" button to see full details
    await test.step('View submission details', async () => {
      const submissionRow = page.locator('tr', { 
        has: page.locator('td', { hasText: testData.email }) 
      });
      
      // Click the "View" button
      await submissionRow.locator('button.btn-primary').click();
      
      // Wait for modal to appear
      const modal = page.locator('#submission-modal');
      await expect(modal).toHaveClass(/active/);
      
      // Verify modal content
      await expect(page.locator('#modal-title')).toContainText('Contact Form Submission');
      
      // Verify all submitted data is displayed
      const modalBody = page.locator('#modal-body');
      await expect(modalBody).toContainText(testData.name);
      await expect(modalBody).toContainText(testData.email);
      await expect(modalBody).toContainText(testData.company);
      await expect(modalBody).toContainText(testData.phone);
      await expect(modalBody).toContainText(testData.message);
      
      // Close modal
      await page.click('.close-modal');
      await expect(modal).not.toHaveClass(/active/);
    });

    // Step 8: Clean up - Delete the test submission
    await test.step('Delete test submission', async () => {
      const submissionRow = page.locator('tr', { 
        has: page.locator('td', { hasText: testData.email }) 
      });
      
      // Set up dialog handler to accept the confirmation
      page.on('dialog', async dialog => {
        expect(dialog.type()).toBe('confirm');
        await dialog.accept();
      });
      
      // Click delete button
      await submissionRow.locator('button', { hasText: 'Delete' }).click();
      
      // Wait for deletion to complete
      await page.waitForTimeout(1000);
      
      // Verify the submission is no longer visible
      const deletedRow = page.locator('tr', { 
        has: page.locator('td', { hasText: testData.email }) 
      });
      await expect(deletedRow).not.toBeVisible({ timeout: 5000 });
    });
  });

  test('should validate required fields', async ({ page }) => {
    await test.step('Navigate to contact page', async () => {
      await page.goto('https://zyntrotest.com/contact.html');
    });

    await test.step('Attempt to submit empty form', async () => {
      await page.click('button[type="submit"]');
      
      // Check that name field shows validation error (HTML5 validation)
      const nameInput = page.locator('#name');
      const isValid = await nameInput.evaluate(el => el.checkValidity());
      expect(isValid).toBe(false);
    });

    await test.step('Fill only name and attempt submit', async () => {
      await page.fill('#name', 'Test User');
      await page.click('button[type="submit"]');
      
      // Email should now be invalid
      const emailInput = page.locator('#email');
      const isValid = await emailInput.evaluate(el => el.checkValidity());
      expect(isValid).toBe(false);
    });
  });

  test('should handle form with minimal required fields', async ({ page }) => {
    const minimalData = {
      name: `Minimal Test ${Date.now()}`,
      email: `minimal${Date.now()}@test.com`,
      sampleType: 'other'
    };

    await test.step('Navigate and fill minimal form', async () => {
      await page.goto('https://zyntrotest.com/contact.html');
      
      await page.fill('#name', minimalData.name);
      await page.fill('#email', minimalData.email);
      await page.selectOption('#sample-type', minimalData.sampleType);
      
      // Check at least one service (required) - click visible label
      await page.getByText('Custom Analysis', { exact: true }).click();
    });

    await test.step('Submit minimal form', async () => {
      await page.click('button[type="submit"]');
      await page.waitForTimeout(2000);
    });

    await test.step('Verify in admin panel', async () => {
      await page.goto('https://zyntrotest.com/admin/submissions.html');
      await page.waitForSelector('.submissions-table', { timeout: 10000 });
      
      const submissionRow = page.locator('tr', { 
        has: page.locator('td', { hasText: minimalData.email }) 
      });
      
      await expect(submissionRow).toBeVisible({ timeout: 5000 });
    });
  });
});
