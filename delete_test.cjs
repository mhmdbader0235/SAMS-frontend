const { chromium } = require('playwright');

const TOKEN = process.argv[2];
const BASE = 'http://localhost:9080';

(async () => {
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();

  const consoleMessages = [];
  page.on('console', msg => {
    consoleMessages.push(`[${msg.type()}] ${msg.text()}`);
  });
  page.on('pageerror', err => {
    consoleMessages.push(`[pageerror] ${err.message}`);
  });

  let dialogFired = false;
  let dialogMessage = '';
  page.on('dialog', async (dialog) => {
    dialogFired = true;
    dialogMessage = dialog.message();
    await dialog.accept();
  });

  const requests = [];
  page.on('request', req => {
    if (req.url().includes('/auth/users/') && req.method() === 'DELETE') {
      requests.push({ url: req.url(), method: req.method(), headers: req.headers() });
    }
  });
  const responses = [];
  page.on('response', async (res) => {
    if (res.url().includes('/auth/users/') && res.request().method() === 'DELETE') {
      let body = null;
      try { body = await res.text(); } catch (e) { body = '<unreadable>'; }
      responses.push({ url: res.url(), status: res.status(), body });
    }
  });

  // Set localStorage BEFORE navigating to app (need to visit a page on that origin first)
  await page.goto(BASE + '/auth', { waitUntil: 'domcontentloaded' });
  await page.evaluate((tok) => {
    localStorage.setItem('sd_token', tok);
    localStorage.setItem('sd_active_tenant', 'tenant_a');
  }, TOKEN);

  await page.goto(BASE + '/manage/permissions', { waitUntil: 'networkidle' });

  // Wait for table to render
  try {
    await page.waitForSelector('text=admin@schoola.com', { timeout: 15000 });
  } catch (e) {
    consoleMessages.push('[test] Timed out waiting for admin@schoola.com text');
  }

  await page.screenshot({ path: 'C:\\Users\\mb883\\AppData\\Local\\Temp\\claude\\c--Users-mb883-OneDrive-Desktop-tests-TestAiDoumind-main-1\\ce1ff51a-583d-4d64-8364-d78799889cf7\\scratchpad\\before.png', fullPage: true });

  // Find the row containing a teacher target, e.g. ali.hassan@schoola.com
  const targetEmail = 'ali.hassan@schoola.com';
  const rowLocator = page.locator('tr', { hasText: targetEmail });
  const rowCount = await rowLocator.count();

  let buttonExists = false;
  let buttonVisible = false;
  let buttonDisabled = null;
  let buttonOuterHTML = null;

  if (rowCount > 0) {
    const deleteBtn = rowLocator.first().locator('button[title="Permanently delete this user"]');
    buttonExists = (await deleteBtn.count()) > 0;
    if (buttonExists) {
      buttonVisible = await deleteBtn.first().isVisible();
      buttonDisabled = await deleteBtn.first().isDisabled();
      buttonOuterHTML = await deleteBtn.first().evaluate(el => el.outerHTML);
    }
  }

  let clickError = null;
  if (buttonExists && buttonVisible) {
    try {
      await rowLocator.first().locator('button[title="Permanently delete this user"]').first().click();
      // give time for confirm dialog + request to fire
      await page.waitForTimeout(2000);
    } catch (e) {
      clickError = e.message;
    }
  }

  await page.screenshot({ path: 'C:\\Users\\mb883\\AppData\\Local\\Temp\\claude\\c--Users-mb883-OneDrive-Desktop-tests-TestAiDoumind-main-1\\ce1ff51a-583d-4d64-8364-d78799889cf7\\scratchpad\\after.png', fullPage: true });

  const rowStillPresent = (await page.locator('tr', { hasText: targetEmail }).count()) > 0;

  const result = {
    rowCount,
    buttonExists,
    buttonVisible,
    buttonDisabled,
    buttonOuterHTML,
    clickError,
    dialogFired,
    dialogMessage,
    requests,
    responses,
    rowStillPresent,
    consoleMessages,
  };

  console.log('===RESULT_JSON_START===');
  console.log(JSON.stringify(result, null, 2));
  console.log('===RESULT_JSON_END===');

  await browser.close();
})();
