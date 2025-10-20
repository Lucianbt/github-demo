import { chromium, FullConfig } from '@playwright/test';

const FORM_URL = 'https://ver3.academiatestarii.ro/index.php/formular/';
const EMAIL = 'e2e_numeprenume@example.com';
const PASSWORD = 'Test1234!';

async function globalSetup(config: FullConfig) {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    await page.goto(FORM_URL, { waitUntil: 'domcontentloaded' });

    const numeField = page.locator('input[name="nume"]');
    const numeVisible = await numeField.isVisible().catch(() => false);

    if (!numeVisible) {
      // On login page, perform login
      const username = page.locator('input[name="username"]');
      const password = page.locator('input#password, input[type="password"]');
      await username.waitFor({ state: 'visible', timeout: 15000 });
      await username.fill(EMAIL);
      await password.first().fill(PASSWORD);
      await Promise.all([
        page.getByRole('button', { name: /login|autentificare/i }).click(),
        page.waitForLoadState('domcontentloaded')
      ]);
      // Best-effort confirmation of being logged-in
      await page.getByRole('link', { name: /logout|delogare/i }).waitFor({ timeout: 15000 }).catch(() => {});
    }
  } finally {
    // Always persist storage state even if already logged in
    await context.storageState({ path: 'storageState.json' });
    await context.close();
    await browser.close();
  }
}

export default globalSetup;
