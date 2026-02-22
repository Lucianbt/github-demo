import { expect, type Page } from '@playwright/test';

// Abstraction: shared base contract for all page objects.
export abstract class BasePage {
  // Encapsulation: keep direct page access private to the class.
  private readonly page: Page;

  // Constructor initializes shared state for derived page objects.
  public constructor(page: Page) {
    this.page = page;
  }

  // Encapsulation with controlled access for child classes.
  protected get browserPage(): Page {
    return this.page;
  }

  // Abstraction: each concrete page defines its own destination path.
  abstract readonly path: string;

  // Shared navigation helper, leveraging Playwright auto-wait on navigation.
  async open(): Promise<void> {
    await this.page.goto(this.path);
  }
}

// Polymorphism contract: different sections provide their own navigation behavior.
export interface SectionNavigator {
  navigate(): Promise<void>;
}

// Inheritance: concrete page object extends the abstract base page.
export class PlaywrightHomePage extends BasePage {
  readonly path = 'https://playwright.dev/';

  // Locator-first API: uses getByRole for resilient interaction.
  async goToGetStarted(): Promise<void> {
    await this.browserPage.getByRole('link', { name: 'Get started' }).click();
    await expect(this.browserPage).toHaveURL(/.*docs\/intro/);
  }
}

// Inheritance + polymorphism implementation for docs section navigation.
export class DocsSection extends BasePage implements SectionNavigator {
  readonly path = 'https://playwright.dev/docs/intro';

  // Auto-waiting: toBeVisible waits for heading without manual sleeps.
  async navigate(): Promise<void> {
    await this.open();
    await expect(this.browserPage.getByRole('heading', { name: 'Installation' })).toBeVisible();
  }
}

// Inheritance + polymorphism implementation for API section navigation.
export class ApiSection extends BasePage implements SectionNavigator {
  readonly path = 'https://playwright.dev/docs/api/class-playwright';

  // Locator-first API: role-based heading assertion for stability.
  async navigate(): Promise<void> {
    await this.open();
    await expect(this.browserPage.getByRole('heading', { name: 'Playwright Library' })).toBeVisible();
  }
}

// Polymorphism consumer: works with any object implementing SectionNavigator.
export class NavigationService {
  // Function accepts the interface type, not concrete classes.
  async visitSection(section: SectionNavigator): Promise<void> {
    await section.navigate();
  }
}
