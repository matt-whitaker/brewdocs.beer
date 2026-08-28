import {Page} from "@playwright/test";
import "./bridge";

declare global {
    interface Window {
        __pendingWritesTimeline?: number[];
    }
}

// bridge.ts only types window.__e2e.pendingWrites as a SignalLike (`when`
// alone) — the app's real Signal also carries `subscribe`, which is what this
// needs to record every transition rather than just await the final one.
interface SubscribableSignal {
    subscribe(handler: (value: number) => void): () => void;
}

export async function recordPendingWritesTimeline(page: Page) {
    await page.addInitScript(() => {
        window.__pendingWritesTimeline = [];
        const attach = setInterval(() => {
            if (!window.__e2e) return;
            clearInterval(attach);
            (window.__e2e.pendingWrites as unknown as SubscribableSignal).subscribe((value) => {
                window.__pendingWritesTimeline!.push(value);
            });
        }, 1);
    });
}

// pendingWrites is a single app-wide counter — PanelSwitcher's own active-tab
// persistence (a `Forage`-backed write to the query-params store) takes and
// releases the same token a moment before a test's own save does. Reset the
// recording once the page is quiet so the timeline holds only the save under
// test, not an unrelated one that happened to run first.
export async function resetPendingWritesTimeline(page: Page) {
    await page.evaluate(() => { window.__pendingWritesTimeline = []; });
}

export async function pendingWritesTimeline(page: Page): Promise<number[]> {
    return page.evaluate(() => window.__pendingWritesTimeline ?? []);
}
