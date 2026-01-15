<!-- .github/copilot-instructions.md - concise, repo-specific guidance for AI coding agents -->
# AI agent quick guide — github-demo

Purpose: make an AI coding agent immediately productive with the repo's two E2E stacks (Playwright TypeScript and Java Selenium/TestNG).

- Primary stacks
  - Playwright (TypeScript): tests under `tests/`, config in `playwright.config.ts`, global setup at `global-setup.ts` which produces `storageState.json`.
  - Java Selenium/TestNG: tests under `src/test/java/...`, built with Maven via the wrapper (`mvnw`, `mvnw.cmd`).

- Essential commands (PowerShell on Windows)
  - Install deps & browsers: `npm ci` then `npx playwright install`
  - Run all Playwright tests: `npm run test:playwright` (alias for `npx playwright test`)
  - Run a single Playwright file: `npx playwright test tests/happy-path.spec.ts`
  - Run Playwright headed / debug: `$env:PWDEBUG=1; npx playwright test --debug`
  - Run Playwright targeted suite: `npm run test:playwright:e2eproduction`
  - Run Java tests: `./mvnw.cmd test` (Windows) or `./mvnw test` (POSIX)
  - Run a single Java TestNG class: `./mvnw.cmd -Dtest=com.githubdemo.academia.UserLoginTest test`

- Key files and patterns to reference
  - `playwright.config.ts`: globalSetup, `storageState: 'storageState.json'`, `trace: 'on-first-retry'`, `reporter: 'html'`, and CI-driven `retries`/`workers` via `process.env.CI`.
  - `global-setup.ts`: canonical login flow that writes `storageState.json` (contains hard-coded creds — prefer env vars when changing).
  - `tests/helpers/`: shared Playwright helpers (use these rather than duplicating logic). Example helper: login/ensureLoggedIn.
  - `package.json` scripts: `test:playwright`, `test:playwright:headed`, `test:playwright:ci`, `test:playwright:allbrowsers`, and `test:playwright:e2eproduction`.
  - Java artifacts & reports: screenshots in `screenshots/`, Surefire reports in `target/surefire-reports/`.

- Conventions and micro-patterns (follow these exactly)
  - Reuse `global-setup.ts` / `storageState.json` for authenticated tests; add a new setup file for different roles.
  - Prefer `page.getByRole(...)` and `locator()` for selectors — existing tests use these consistently.
  - Use helpers in `tests/helpers/` for cross-test behavior (login, navigation, CSV verification).
  - Use the Maven wrapper in scripts and CI — do not assume system `mvn`.

- Safety & secrets
  - `global-setup.ts` contains plain credentials (`EMAIL`/`PASSWORD`). Do not copy them into PR descriptions or new files. When modifying, switch to `process.env` and document required env vars.

- Failure debugging and artifacts
  - Playwright HTML report: `playwright-report/index.html`.
  - Playwright traces/reports: `playwright-results.json` and `playwright-report/`.
  - Java test results: `target/surefire-reports/` and `test-output/`.

- Suggested first tasks for an AI agent (ranked)
  1. Run `npm ci && npx playwright install` locally and run a single spec (`tests/happy-path.spec.ts`) to validate environment.
  2. Open `global-setup.ts` and replace hard-coded credentials with env-driven values if asked.
  3. Use existing helpers in `tests/helpers/` when editing tests; update helpers if functionality is duplicated.

If you want, I can (pick one): add CI workflow snippets after inspecting `.github/workflows/`, or open a PR converting `global-setup.ts` to use env vars and `.env` scaffolding.

---
Feedback request: tell me which part feels unclear or what additional CI/PR conventions to include.
