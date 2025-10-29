# ZyntroTest.com Playwright Tests

This directory contains end-to-end tests for the ZyntroTest.com website using Playwright.

## Test Files

### contact-form.spec.js
Tests the complete flow of:
1. Filling out the contact form on `zyntrotest.com/contact.html`
2. Submitting the form
3. Verifying the submission appears in the admin panel at `zyntrotest.com/admin/submissions.html`
4. Viewing submission details in the modal
5. Cleaning up by deleting the test submission

The test includes three scenarios:
- **Full form submission**: Tests all form fields and verifies data in admin panel
- **Field validation**: Tests HTML5 form validation for required fields
- **Minimal submission**: Tests form with only required fields

## Running Tests

### Prerequisites
Make sure you have installed dependencies:
```bash
npm install
```

### Run All Tests
```bash
npm run test:playwright
```

### Run Contact Form Tests Only
```bash
# Headless mode (default)
npm run test:contact

# Headed mode (see browser)
npm run test:contact:headed

# Debug mode (step through test)
npm run test:contact:debug
```

### Run Specific Test
```bash
npx playwright test tests/contact-form.spec.js --grep "should submit contact form"
```

### Run in Different Browsers
```bash
# Chromium only
npx playwright test tests/contact-form.spec.js --project=chromium

# Firefox only
npx playwright test tests/contact-form.spec.js --project=firefox

# WebKit (Safari) only
npx playwright test tests/contact-form.spec.js --project=webkit
```

## Test Configuration

The tests are configured in `playwright.config.js`:
- **Base URL**: Points to production site `https://zyntrotest.com`
- **Browsers**: Chromium, Firefox, WebKit, Mobile Chrome, Mobile Safari
- **Timeouts**: Default 30s, can be adjusted per test
- **Screenshots**: Taken on failure
- **Videos**: Recorded on first retry

## Viewing Test Results

After running tests, view the HTML report:
```bash
npx playwright show-report
```

## Test Data

The tests generate unique test data for each run using timestamps to avoid conflicts:
- Email: `test{timestamp}@playwright-test.com`
- Name: `Test User {timestamp}`

This ensures each test run is independent and doesn't interfere with previous submissions.

## Important Notes

1. **Live Site Testing**: These tests run against the live production site at `https://zyntrotest.com`
2. **Database Impact**: Tests create and delete real database entries in Supabase
3. **Cleanup**: Each test cleans up after itself by deleting test submissions
4. **Admin Access**: Tests access the admin panel without authentication (ensure proper security in production)

## Troubleshooting

### Test Fails at Form Submission
- Check that the Supabase connection is working
- Verify that the contact form JavaScript is loading correctly
- Check browser console for errors using headed mode

### Test Fails at Admin Panel
- Ensure the admin panel is accessible
- Check that Supabase admin client is initialized
- Verify the submissions table is loading properly

### Timeout Errors
- Increase timeout in test using `{ timeout: 30000 }`
- Check network speed and site responsiveness
- Run in headed mode to see what's happening

### Form Submission Not Appearing
- Check that the submission actually succeeded (look for success message)
- Refresh the admin panel and wait for loading to complete
- Verify the Supabase table has the new entry

## CI/CD Integration

To run these tests in CI/CD:

```yaml
- name: Install Playwright
  run: npx playwright install --with-deps

- name: Run Tests
  run: npm run test:contact

- name: Upload Test Results
  if: always()
  uses: actions/upload-artifact@v3
  with:
    name: playwright-report
    path: playwright-report/
```

## Writing New Tests

To add new tests, follow this pattern:

```javascript
const { test, expect } = require('@playwright/test');

test.describe('Your Test Suite', () => {
  test('should do something', async ({ page }) => {
    await test.step('Step description', async () => {
      // Your test code
      await page.goto('https://zyntrotest.com/your-page.html');
      // ... more actions and assertions
    });
  });
});
```

## Additional Resources

- [Playwright Documentation](https://playwright.dev)
- [Playwright Test API](https://playwright.dev/docs/api/class-test)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
