import {Page} from "@playwright/test";
import "./bridge";

export async function settleSave(page: Page) {
    await page.evaluate(() =>
        window.__e2e!.pendingWrites.when((value) => value === 0, {timeout: 5000})
    );
}
