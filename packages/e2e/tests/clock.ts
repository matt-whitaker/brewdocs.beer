import {Page} from "@playwright/test";

interface ClockControl {
    set(ms: number): void;
    advance(ms: number): void;
    reset(): void;
}

declare global {
    interface Window {
        __clock?: ClockControl;
    }
}

export async function advanceClock(page: Page, ms: number) {
    await page.evaluate((ms) => window.__clock!.advance(ms), ms);
}

export async function resetClock(page: Page) {
    await page.evaluate(() => window.__clock!.reset());
}
