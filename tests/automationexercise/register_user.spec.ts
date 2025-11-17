import { test, expect } from '@playwright/test';

function randString(len = 6) {
  return Math.random().toString(36).substring(2, 2 + len);
}

test('register user - randomized name/email and resilient flow', async ({ page }) => {
  const firstName = `User${randString(4)}`;
  const lastName = `Auto${randString(4)}`;
  const fullName = `${firstName} ${lastName}`;
  const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}.${Date.now()}@example.com`;

  await page.goto('https://automationexercise.com/');
  // dismiss consent/banner if present
  const consentBtn = page.getByRole('button', { name: 'Consent' });
  if (await consentBtn.count()) {
    try {
      if (await consentBtn.isVisible()) await consentBtn.click();
    } catch (e) {
      // ignore if not clickable
    }
  }

  // ensure homepage loaded
  await expect(page.getByRole('link', { name: ' Signup / Login' })).toBeVisible({ timeout: 10000 });
  await page.getByRole('link', { name: ' Signup / Login' }).click();

  await expect(page.getByText('New User Signup! Signup')).toBeVisible({ timeout: 5000 });

  // fill signup name and randomized email
  const nameField = page.getByRole('textbox', { name: 'Name' });
  await nameField.fill(fullName);
  const emailSignup = page.locator('form').filter({ hasText: 'Signup' }).getByPlaceholder('Email Address');
  await emailSignup.fill(email);
  await page.getByRole('button', { name: 'Signup' }).click();

  // close any overlay if present
  const grippy = page.locator('.grippy-host');
  if (await grippy.count()) {
    try {
      if (await grippy.isVisible()) await grippy.click();
    } catch (e) {
      // best-effort
    }
  }

  await expect(page.getByText('Enter Account Information')).toBeVisible({ timeout: 10000 });

  await page.getByRole('radio', { name: 'Mr.' }).check();
  await page.getByRole('textbox', { name: 'Password *' }).fill('vexedzxc47');
  await page.locator('#days').selectOption('17');
  await page.locator('#months').selectOption('5');
  await page.locator('#years').selectOption('2005');
  await page.getByRole('checkbox', { name: 'Sign up for our newsletter!' }).check();
  await page.getByRole('checkbox', { name: 'Receive special offers from' }).check();

  await page.getByRole('textbox', { name: 'First name *' }).fill(firstName);
  await page.getByRole('textbox', { name: 'Last name *' }).fill(lastName);
  await page.getByRole('textbox', { name: 'Company', exact: true }).fill('Company');
  await page.getByRole('textbox', { name: 'Address * (Street address, P.' }).fill('Sfantul Ilie');
  await page.getByLabel('Country *').selectOption('United States');
  await page.getByRole('textbox', { name: 'State *' }).fill('Florida');
  await page.getByRole('textbox', { name: 'City * Zipcode *' }).fill('Miami');
  await page.locator('#zipcode').fill('707040');
  await page.getByRole('textbox', { name: 'Mobile Number *' }).fill('+40742131131');

  await page.getByRole('button', { name: 'Create Account' }).click();
  await expect(page.getByText('Account Created!')).toBeVisible({ timeout: 10000 });
  await page.getByRole('link', { name: 'Continue' }).click();

  // close overlays if any
  if (await grippy.count()) {
    try {
      if (await grippy.isVisible()) await grippy.click();
    } catch (e) {
      // ignore
    }
  }

  // page shows "Logged in as <FirstName>" — assert using our randomized firstName
  await expect(page.getByText(`Logged in as ${firstName}`)).toBeVisible({ timeout: 10000 });

  await page.getByRole('link', { name: ' Delete Account' }).click();
  await expect(page.getByText('Account Deleted!')).toBeVisible({ timeout: 10000 });
  await page.getByRole('link', { name: 'Continue' }).click();
});