import { defineConfig, devices } from '@playwright/test';

// Dedicated config for the best-practices examples.
export default defineConfig({
  // Scope execution to the folder created for best-practice demos.
  testDir: './tests/best practices',
  // Run tests in files in parallel to improve execution speed.
  fullyParallel: true,
  // Use multiple workers locally, smaller count in CI.
  workers: process.env.CI ? 2 : 4,
  retries: 0,
  reporter: 'html',
  use: {
    // Base URL enables short navigation paths where needed.
    baseURL: 'https://playwright.dev',
    // Keep traces on failure for easier debugging.
    trace: 'retain-on-failure',
    // Keep videos on failure for visual diagnostics.
    video: 'retain-on-failure',
  },
  projects: [
    {
      // Keep one browser project for fast, stable examples.
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      // Add Firefox coverage alongside Chromium.
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
  ],
});
