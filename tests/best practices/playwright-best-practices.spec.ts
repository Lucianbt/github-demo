import { test, expect } from '@playwright/test';
import {
  ApiSection,
  DocsSection,
  NavigationService,
  PlaywrightHomePage,
} from './siteModels';

// Test suite intentionally uses Playwright defaults for isolation (fresh context per test).
test.describe('Playwright best practices with OOP', () => {
  // Demonstrates locator-first API + auto-waiting with no manual sleeps.
  test('uses locator-first API and auto-waiting for Get started flow', async ({ page }) => {
    const homePage = new PlaywrightHomePage(page);

    await homePage.open();
    await expect(page.getByRole('link', { name: 'Get started' })).toBeVisible();
    await homePage.goToGetStarted();
    await expect(page.getByRole('heading', { name: 'Installation' })).toBeVisible();
  });

  // Demonstrates polymorphism: one service drives multiple section implementations.
  test('demonstrates polymorphism through section navigation', async ({ page }) => {
    const navigationService = new NavigationService();
    const docsSection = new DocsSection(page);
    const apiSection = new ApiSection(page);

    await navigationService.visitSection(docsSection);
    await navigationService.visitSection(apiSection);

    await expect(page.getByRole('heading', { name: 'Playwright Library' })).toBeVisible();
  });
});
