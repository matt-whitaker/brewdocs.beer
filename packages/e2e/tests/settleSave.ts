import {Page} from "@playwright/test";

interface SignalLike<T> {
    when(predicate: (value: T) => boolean, options?: {timeout?: number}): Promise<T>;
}

declare global {
    interface Window {
        __signals?: {pendingWrites: SignalLike<number>};
    }
}

export async function settleSave(page: Page) {
    await page.evaluate(() =>
        window.__signals!.pendingWrites.when((value) => value === 0, {timeout: 5000})
    );
}
