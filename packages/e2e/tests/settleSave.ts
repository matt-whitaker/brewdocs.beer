import {expect, Page} from "@playwright/test";

declare global {
    interface Window {
        __brewdocsPendingWrites?: number;
    }
}

export async function settleSave(page: Page) {
    await page.waitForTimeout(400);
    await expect.poll(() => page.evaluate(() => window.__brewdocsPendingWrites ?? 0), {
        timeout: 5000,
        intervals: [50]
    }).toBe(0);
}
