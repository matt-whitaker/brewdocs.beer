import {Page} from "@playwright/test";
import "./bridge";

export async function advanceClock(page: Page, ms: number) {
    await page.evaluate((ms) => window.__e2e!.clock.advance(ms), ms);
}

export async function resetClock(page: Page) {
    await page.evaluate(() => window.__e2e!.clock.reset());
}
