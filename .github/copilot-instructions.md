<!-- .github/copilot-instructions.md - guidance for AI coding agents working in this repo -->
# Copilot / AI Agent Instructions for github-demo

Summary
- This repo contains two parallel end-to-end testing stacks: a Playwright (TypeScript) suite under `tests/` and a Java Selenium/TestNG suite under `src/test/java/...`.
- Playwright uses `playwright.config.ts`, `global-setup.ts` and `storageState.json` to reuse authenticated state.
- Java tests use Maven (`pom.xml`), TestNG and WebDriverManager; screenshots and surefire reports are produced under `screenshots/` and `target/surefire-reports/`.

Quick commands (Windows PowerShell)
- Install Playwright browsers: `npx playwright install`
- Run all Playwright tests: `npx playwright test`
- Run Playwright tests for chromium: `npx playwright test -p chromium`
- Run a single Playwright file: `npx playwright test tests/happy-path.spec.ts`
- Run Playwright in interactive debug mode (PowerShell): `$env:PWDEBUG=1; npx playwright test --debug`
- Lint TypeScript tests: `npm run lint`
- Verify CSVs: `npm run verify-csvs`
- Run Java tests (Windows): `./mvnw.cmd test` (or `mvn test` if Maven installed)
- Run a single Java TestNG class: `./mvnw.cmd -Dtest=com.githubdemo.academia.UserLoginTest test`

Big-picture architecture & flows
- Playwright stack
  - Tests are in `tests/` (e.g., `happy-path.spec.ts`, `numeprenume.spec.ts`).
  - Shared helpers live in `tests/helpers/` and are exported via `tests/helpers/index.ts` (notably `ensureLoggedIn` in `auth.ts` and UI utilities in `ui.ts`).
  - `playwright.config.ts` configures `globalSetup` (root `global-setup.ts`) which produces `storageState.json` used by most tests to skip repeated logins.
  - The config sets `trace: 'on-first-retry'` and `reporter: 'html'` — expect traces on failures and an HTML report in `playwright-report/`.

- Java/TestNG stack
  - Tests are under `src/test/java/com/githubdemo/academia` (example: `UserLoginTest.java`).
  - Uses `WebDriverManager` to manage browser driver binaries and TestNG as the test runner.
  - Tests capture screenshots in `screenshots/` and use explicit waits (`WebDriverWait`) rather than purely implicit waits.

Project-specific conventions & patterns
- Playwright
  - Use `tests/helpers` utilities instead of re-implementing auth or common selectors; `ensureLoggedIn(page,email,password)` demonstrates preferred login detection + fallback.
  - Prefer `getByRole` and `locator()` when available; helper files show mixed use of role and CSS selectors—follow existing helper patterns.
  - `global-setup.ts` is the canonical place for preparing `storageState.json` — do not bypass it unless adding a new explicit auth flow.

- Java
  - Tests tend to use explicit XPath/CSS combos and include resilient click fallbacks (JS click when intercepted). Follow that pattern for reliability.
  - Screenshot capturing is done in `@AfterMethod` and saved under `screenshots/<TestName>`. Keep that pattern when adding Java tests.

Integration points & external dependencies
- External test target: `https://academiatestarii.ro` (used by Java) and `FORM_URL` referenced in `global-setup.ts` for Playwright. Tests interact with live URLs — be cautious.
- Playwright browsers must be installed (`npx playwright install`).
- Node devDependencies are in `package.json` (Playwright, TypeScript, ESLint). Maven dependencies are in `pom.xml` (Selenium, TestNG, WebDriverManager).

Security & secrets
- This repo currently contains credentials in `global-setup.ts` and `src/test/java/com/githubdemo/academia/UserLoginTest.java` (emails/passwords). Treat these as secrets: do not echo them in PR text or expose them in new files.
- If you need to add credentials for testing, prefer using environment variables or a secure secret store; update `global-setup.ts` and tests to read from env when applicable.

When editing code
- For Playwright TypeScript changes:
  - Update helpers in `tests/helpers/` for cross-test reuse.
  - Run `npx playwright test` locally after `npx playwright install` and `npm i`.
  - Keep `storageState.json` usage in mind — if you add tests that require different roles or sessions, add a dedicated `global-setup-<role>.ts` or create context in test fixtures instead of modifying the existing global setup.

- For Java changes:
  - Keep TestNG annotations, maintain `@AfterMethod` screenshot behavior, and continue using `WebDriverManager` to avoid manual driver installs.
  - Use Maven wrapper `mvnw` for consistent CI runs.

Reports, outputs & where to look
- Playwright HTML report: `playwright-report/index.html`.
- Playwright raw artifacts: `playwright-results.json` (if produced by CI) and `screenshots/` under `playwright-report` depending on failures.
- Java Surefire reports: `target/surefire-reports/` and `target/test-classes/` for compiled tests.

Small examples to copy from repo
- Use `ensureLoggedIn(page, email, password)` from `tests/helpers/auth.ts` to avoid duplicate login code.
- Follow the screenshot pattern from `UserLoginTest.java` (create `screenshots/<TestName>` and save with timestamp/status) when adding Java tests.

If you are unsure
- Run tests locally in short mode (single browser or single class) to reproduce failures quickly.
- Ask for clarification when a proposed change touches test credentials or global auth flows.

Feedback request
- If anything important is missing or you want this file expanded with CI-specific commands (GitHub Actions), tell me which CI files to inspect and I will extend this guide.
