import type { Page, Locator, TestInfo } from '@playwright/test';
import fs from 'fs';
import path from 'path';

// Detects a validation error by checking common UI signals (heuristic)
export async function hasRedOutline(pageOrElement: Page | Locator, fieldName?: string): Promise<boolean> {
  // Distinguish Page vs Locator: Page has `goto` while Locator does not.
  const maybePage = pageOrElement as Page;
  if (maybePage && typeof maybePage.goto === 'function') {
    // Treat as Page and find field by name using non-waiting DOM handle (page.$)
    const page = maybePage as Page;
    if (!fieldName) return false;
  // find any form control with the name (input/select/textarea)
  const handle = await page.$(`[name="${fieldName}"]`);
    if (!handle) return false; // element not present -> no red outline
    // Read aria-invalid without causing locator waiting
    const ariaInvalid = (await handle.evaluate((el) => el.getAttribute('aria-invalid'))) || '';
    if (ariaInvalid === 'true') return true;
    // Check element and ancestor class names for common validation markers
    const cls = (await handle.evaluate((el) => el.getAttribute('class'))) || '';
    const ancestorClasses = await handle.evaluate((el) => {
      const p = el.parentElement; const gp = p?.parentElement;
      return [el.className || '', p?.className || '', gp?.className || ''].join(' ');
    });
    const combinedClasses = (cls + ' ' + (ancestorClasses || '')).toLowerCase();
    if (combinedClasses.includes('failed') || combinedClasses.includes('is-invalid') || combinedClasses.includes('invalid') || combinedClasses.includes('error') || combinedClasses.includes('has-error')) return true;
    // Check computed styles: border, outline and box-shadow commonly show red validation
    const styleHints = await handle.evaluate((el) => {
      const computed = window.getComputedStyle(el as Element) as any;
      return [computed.borderColor || '', computed.borderTopColor || '', computed.outlineColor || '', computed.boxShadow || '', computed.outlineStyle || ''].join('|');
    });
    if (typeof styleHints === 'string') {
      const s = styleHints.toLowerCase();
      if (s.includes('255, 0, 0') || s.includes('220, 53, 69') || s.includes('rgb(255, 0, 0)') || s.includes('#dc3545') || s.includes('red')) return true;
    }
    return false;
  }

  // Otherwise caller passed a Locator directly
  const el = pageOrElement as Locator;
  const outline = await el.evaluate((node: HTMLElement) => {
    const cs = window.getComputedStyle(node as Element) as any;
    const p = node.parentElement; const gp = p?.parentElement;
    const classes = [node.className || '', p?.className || '', gp?.className || ''].join(' ');
    const style = [cs.outlineColor || '', cs.borderColor || '', cs.borderTopColor || '', cs.boxShadow || '', cs.outlineStyle || ''].join('|');
    return { classes, style };
  });
  if (outline) {
    const classes = (outline.classes || '').toLowerCase();
    if (classes.includes('failed') || classes.includes('is-invalid') || classes.includes('invalid') || classes.includes('error') || classes.includes('has-error')) return true;
    const s = (outline.style || '').toLowerCase();
    if (s.includes('255, 0, 0') || s.includes('220, 53, 69') || s.includes('rgb(255, 0, 0)') || s.includes('#dc3545') || s.includes('red')) return true;
  }
  return false;
}

// Simulate typing by pressing keys sequentially (simple helper used across tests)
export async function pressSequentially(
  target: Locator,
  text: string,
  options?: { chunkSize?: number; delayMs?: number }
) {
  // If Playwright already has pressSequentially on Locator and caller didn't request chunking, prefer it
  // @ts-ignore
  if (!options?.chunkSize && typeof target.pressSequentially === 'function') {
    // @ts-ignore
    return target.pressSequentially(text);
  }

  // Decide chunking strategy: default chunk for long strings to reduce evaluate calls.
  const defaultChunk = text.length > 100 ? 10 : text.length > 30 ? 5 : 1;
  const chunkSize = options?.chunkSize ?? defaultChunk;
  const delayMs = typeof options?.delayMs === 'number' ? options!.delayMs : 40;

  if (chunkSize <= 1) {
    // Per-character behavior (preserves validators that need char-by-char input)
    for (const ch of text) {
      await target.evaluate((el: HTMLInputElement, c: string) => {
        const prev = (el.value as string) || '';
        el.value = prev + c;
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
      }, ch);
      // small pause to mimic human typing
      if (delayMs > 0) await new Promise((r) => setTimeout(r, delayMs));
    }
    return;
  }

  // Chunked append for performance: append chunks and dispatch events for each chunk
  for (let i = 0; i < text.length; i += chunkSize) {
    const chunk = text.slice(i, i + chunkSize);
    await target.evaluate((el: HTMLInputElement, chunkStr: string) => {
      const prev = (el.value as string) || '';
      el.value = prev + chunkStr;
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
    }, chunk);
    if (delayMs > 0) await new Promise((r) => setTimeout(r, delayMs));
  }
}

// Fill an input's value via the page DOM to avoid client-side truncation or masking
export async function fillByJs(target: Locator, value: string) {
  await target.evaluate((el, v) => {
    (el as HTMLInputElement).value = v as any;
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
  }, value);
}

// Centralized afterEach screenshot helper
export async function screenshotAfterEach(page: Page, testInfo: TestInfo, folder: string) {
  await page.waitForLoadState('networkidle');
  // Wait 2s to allow animations/async UI updates to settle before screenshot
  await page.waitForTimeout(2000);
  const scenario = testInfo.title.replace(/[^a-z0-9]+/gi, '_');
  const status = testInfo.status || 'unknown';
  // Allow overriding the base screenshots directory via env var.
  // If SCREENSHOT_BASE_DIR is set it may be absolute or repo-relative. Otherwise default to repo/screenshots.
  const envBase = process.env.SCREENSHOT_BASE_DIR;
  const baseDir = envBase
    ? (path.isAbsolute(envBase) ? envBase : path.join(process.cwd(), envBase))
    : path.join(process.cwd(), 'screenshots');

  const targetDir = path.join(baseDir, folder);
  try {
    if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });
  } catch (e) {
    // ignore creation errors — Playwright may still write files
  }

  const screenshotPath = path.join(targetDir, `${status}-${scenario}-${testInfo.project.name}.png`);
  await page.screenshot({ path: screenshotPath, fullPage: true });
  // Log saved path for visibility in test output
  try {
    // eslint-disable-next-line no-console
    console.log('Saved screenshot:', screenshotPath);
  } catch (e) {
    // ignore logging errors
  }
}
