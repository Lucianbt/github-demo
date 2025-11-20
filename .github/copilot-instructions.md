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

<!-- .github/copilot-instructions.md - guidance for AI coding agents working in this repo -->
# AI agent guide — github-demo (concise)

Purpose: get an AI coding agent productive quickly in this repo (end-to-end test suites in TypeScript + Java).

- Primary stacks:
  - Playwright (TypeScript): tests in `tests/`, config in `playwright.config.ts`, global setup at `global-setup.ts` which writes `storageState.json`.
  - Java Selenium/TestNG: tests under `src/test/java/com/githubdemo/academia`, build via Maven (`mvnw` / `mvnw.cmd`).

- Quick, copy-paste commands (PowerShell):
  - Install node deps & Playwright browsers:
    - `npm ci`
    - `npx playwright install`
  - Run Playwright tests (all): `npx playwright test` or `npm run test:playwright`
  - Run Playwright chromium only: `npx playwright test -p chromium`
  - Run a single Playwright file: `npx playwright test tests/happy-path.spec.ts`
  - Run Playwright headed (debug): `$env:PWDEBUG=1; npx playwright test --debug`
  - Lint TypeScript tests: `npm run lint`
  - Run Java tests (Windows): `./mvnw.cmd test` (CI uses `mvn`/`mvnw` semantics)
  - Run a single Java TestNG class: `./mvnw.cmd -Dtest=com.githubdemo.academia.UserLoginTest test`

- Important repo patterns (copy these examples):
  - Use `tests/helpers/*` for shared Playwright helpers. Example: `ensureLoggedIn(page,email,password)` in `tests/helpers/auth.ts` — prefer calling this rather than reimplementing login.
  - `global-setup.ts` is the canonical place to create `storageState.json`. New tests that require a different authenticated role should add a new setup file or fixture, not overwrite the existing global setup.
  - Playwright config: `trace: 'on-first-retry'`, `reporter: 'html'`, and `storageState: 'storageState.json'` (see `playwright.config.ts`). CI adjusts retries/workers via `process.env.CI`.
  - Java tests persist screenshots under `screenshots/` and rely on `@AfterMethod` screenshot capture. Follow the existing naming/timestamp pattern.

- Concrete selectors & helper conventions:
  - Prefer `getByRole(...)` and `locator()` as seen in `tests/helpers/auth.ts`.
  - When login requires specific selectors, use the repository's existing selectors: `input[name="username"]`, `input#password`, and `a[href*="logout"]` for detection.

- Integration & external resources:
  - Tests target live sites (e.g., `https://ver3.academiatestarii.ro`). Be cautious when running tests that mutate data.
  - Node deps in `package.json` (Playwright, TypeScript, ESLint); Maven deps in `pom.xml` (Selenium, TestNG, WebDriverManager).

- Secrets & safety:
  - The repo currently contains plain credentials in `global-setup.ts` and some Java tests. Do not expose these in PR text or new files. If adding credentials, prefer env vars and update code to read from `process.env` / system env.

- When you change tests or helpers:
  - Update `tests/helpers/` for cross-test reuse.
  - Run local short reproductions: single spec or single Java class before broad CI runs.
  - Use the Maven wrapper (`mvnw` / `mvnw.cmd`) in scripts and CI to ensure consistent builds.

- Where to look for failures & artifacts:
  - Playwright HTML report: `playwright-report/index.html`.
  - Playwright artifacts/traces: generated under `playwright-report/` and `playwright-results.json` (CI).
  - Java Surefire reports: `target/surefire-reports/`.

- If CI or credentials are relevant, ask for the CI workflow files (GitHub Actions) and credential handling preferences so the guide can be extended.

- If you'd like, I can also:
  - add short CI commands to this file after inspecting `.github/workflows/` (if present), or
  - convert inline credentials to env-driven patterns and open a PR scaffolding `dotenv` usage in `global-setup.ts`.

---
Please tell me any missing specifics you'd like added (CI commands, preferred test prefixes, or commit/PR conventions).
