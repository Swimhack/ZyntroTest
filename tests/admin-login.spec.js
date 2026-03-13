const { test, expect } = require('@playwright/test');

test.describe('Admin Login Page', () => {
  test.beforeEach(async ({ page }) => {
    // Block external resources that cause timeouts in CI/testing
    await page.route('**/*.woff2', route => route.abort());
    await page.route('**/fonts.googleapis.com/**', route => route.abort());
    await page.route('**/fonts.gstatic.com/**', route => route.abort());

    // Clear any existing session data before each test
    await page.goto('/admin/index.html', { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => {
      localStorage.clear();
    });
    await page.goto('/admin/index.html', { waitUntil: 'domcontentloaded' });
  });

  test('should display login page with correct elements', async ({ page }) => {
    // Verify page title
    await expect(page).toHaveTitle(/Admin Login.*ZyntroTest/);

    // Verify login form elements exist
    await expect(page.locator('#login-form')).toBeVisible();
    await expect(page.locator('#username')).toBeVisible();
    await expect(page.locator('#password')).toBeVisible();
    await expect(page.locator('#remember')).toBeAttached();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toHaveText('Sign In');
  });

  test('should display login header with logo and title', async ({ page }) => {
    await expect(page.locator('.login-header h1')).toHaveText('COA Dashboard');
    await expect(page.locator('.login-header p')).toHaveText('Admin Access Required');
    await expect(page.locator('.login-logo')).toBeVisible();
  });

  test('should display login footer with security notice', async ({ page }) => {
    const footer = page.locator('.login-footer');
    await expect(footer).toBeVisible();
    await expect(footer).toContainText('Authorized Personnel Only');
    await expect(footer.locator('a.back-link')).toHaveAttribute('href', '../index.html');
  });

  test('should require username and password fields', async ({ page }) => {
    const usernameInput = page.locator('#username');
    const passwordInput = page.locator('#password');

    // Both fields should have the required attribute
    await expect(usernameInput).toHaveAttribute('required', '');
    await expect(passwordInput).toHaveAttribute('required', '');
  });

  test('should show error on failed login', async ({ page }) => {
    // Mock the login API to return failure
    await page.route('**/api/admin/login', async (route) => {
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ success: false, error: 'Invalid username or password' })
      });
    });

    // Fill in form and submit
    await page.fill('#username', 'wronguser');
    await page.fill('#password', 'wrongpassword');
    await page.click('button[type="submit"]');

    // Wait for error message to appear
    const errorDiv = page.locator('#login-error');
    await expect(errorDiv).toBeVisible({ timeout: 5000 });
    await expect(errorDiv).toContainText('Invalid username or password');
  });

  test('should show loading state during login attempt', async ({ page }) => {
    // Mock a slow login API response
    await page.route('**/api/admin/login', async (route) => {
      await new Promise(resolve => setTimeout(resolve, 500));
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ success: false, error: 'Invalid credentials' })
      });
    });

    await page.fill('#username', 'testuser');
    await page.fill('#password', 'testpass');

    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();

    // Button should show loading state
    await expect(submitButton).toHaveText('Signing in...');
    await expect(submitButton).toBeDisabled();

    // After response, button should reset
    await expect(submitButton).toHaveText('Sign In', { timeout: 5000 });
    await expect(submitButton).toBeEnabled();
  });

  test('should redirect to dashboard on successful login', async ({ page }) => {
    // Mock successful login
    await page.route('**/api/admin/login', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, token: 'test-admin-token' })
      });
    });

    await page.fill('#username', 'drew');
    await page.fill('#password', 'testpassword');
    await page.click('button[type="submit"]');

    // Should redirect to dashboard
    await page.waitForURL('**/admin/dashboard.html', { timeout: 5000 });
  });

  test('should store session data on successful login', async ({ page }) => {
    // Mock successful login
    await page.route('**/api/admin/login', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, token: 'test-admin-token' })
      });
    });

    await page.fill('#username', 'drew');
    await page.fill('#password', 'testpassword');

    // Don't wait for navigation, just click and check storage
    await page.click('button[type="submit"]');

    // Wait a moment for localStorage to be set
    await page.waitForTimeout(500);

    const sessionData = await page.evaluate(() => {
      return localStorage.getItem('zyntro_admin_session');
    });

    expect(sessionData).not.toBeNull();
    const session = JSON.parse(sessionData);
    expect(session.username).toBe('drew');
    expect(session.expiresAt).toBeGreaterThan(Date.now());
  });

  test('should store remember me token when checked', async ({ page }) => {
    await page.route('**/api/admin/login', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, token: 'test-admin-token' })
      });
    });

    await page.fill('#username', 'drew');
    await page.fill('#password', 'testpassword');
    await page.check('#remember');
    await page.click('button[type="submit"]');

    await page.waitForTimeout(500);

    const rememberData = await page.evaluate(() => {
      return localStorage.getItem('zyntro_admin_remember');
    });

    expect(rememberData).not.toBeNull();
    const remember = JSON.parse(rememberData);
    expect(remember.username).toBe('drew');
  });

  test('should redirect to dashboard if already logged in', async ({ page }) => {
    // Set up a valid session in localStorage
    await page.evaluate(() => {
      const session = {
        username: 'drew',
        loginTime: Date.now(),
        expiresAt: Date.now() + 8 * 60 * 60 * 1000, // 8 hours
        remember: false
      };
      localStorage.setItem('zyntro_admin_session', JSON.stringify(session));
    });

    // Navigate to login page - should redirect to dashboard
    await page.goto('/admin/index.html', { waitUntil: 'domcontentloaded' });
    await page.waitForURL('**/admin/dashboard.html', { timeout: 5000 });
  });

  test('should have password field with correct input type', async ({ page }) => {
    const passwordInput = page.locator('#password');
    await expect(passwordInput).toHaveAttribute('type', 'password');
  });

  test('should have remember me checkbox', async ({ page }) => {
    const checkbox = page.locator('#remember');
    await expect(checkbox).toBeAttached();
    await expect(checkbox).toHaveAttribute('type', 'checkbox');

    // Label should describe duration
    await expect(page.locator('label.remember-me')).toContainText('Remember me for 30 days');
  });
});
