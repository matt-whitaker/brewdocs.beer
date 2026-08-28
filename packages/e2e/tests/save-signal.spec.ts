import {expect, Page, test} from "@playwright/test";
import {seedBatch} from "./seedBatch";

/**
 * Guards the contract `settleSave` rests on: `pendingWrites` must not return to
 * zero between an edit and the write it schedules. It dipped through zero for
 * ~6ms on every save (#1378) because `useJsonEdit`'s save callbacks returned
 * `void`, so the hook released its token a microtask after scheduling the write
 * rather than when the write landed. `settleSave` then reported the app quiet
 * with the write still queued, and a reload arriving in that window lost the
 * edit.
 *
 * ⚠️ Asserting a reload outcome instead would NOT catch this — the whole suite
 * already does that and stayed green throughout, because whether the reload
 * lands inside a 6ms window is a property of the machine. The signal is the
 * only deterministic witness, so these tests read it directly rather than
 * through `settleSave`, which is the thing under test and would pass vacuously.
 */

declare global {
    interface Window {
        __saveSignal?: {transitions: number[]; puts: {key: string; seen: number}[]};
    }
}

async function recordSaveSignal(page: Page) {
    await page.addInitScript(() => {
        window.__saveSignal = {transitions: [], puts: []};

        const put = IDBObjectStore.prototype.put;
        IDBObjectStore.prototype.put = function (this: IDBObjectStore, value: unknown, key?: IDBValidKey) {
            window.__saveSignal!.puts.push({key: String(key), seen: window.__saveSignal!.transitions.length});
            return put.call(this, value, key as IDBValidKey);
        } as typeof IDBObjectStore.prototype.put;

        const tick = setInterval(() => {
            if (!window.__e2e) return;
            clearInterval(tick);
            window.__e2e.pendingWrites.subscribe(v => window.__saveSignal!.transitions.push(v));
        }, 1);
    });
}

const resetSaveSignal = (page: Page) =>
    page.evaluate(() => { window.__saveSignal = {transitions: [], puts: []}; });

/**
 * Resolves with the pending-write transitions recorded **as of the instant** the
 * first write to `keyPrefix` was issued — the `seen` watermark each put records,
 * not the transitions that exist by the time this poll notices, which is after
 * the write has already settled. Bounded by the write itself rather than by a
 * sleep or by `settleSave`.
 */
const transitionsBeforeWrite = (page: Page, keyPrefix: string) =>
    page.evaluate((prefix) => new Promise<number[]>((resolve, reject) => {
        const started = performance.now();
        const poll = setInterval(() => {
            const {transitions, puts} = window.__saveSignal!;
            const write = puts.find(({key}) => key.startsWith(prefix));
            if (write) {
                clearInterval(poll);
                resolve(transitions.slice(0, write.seen));
            } else if (performance.now() - started > 5000) {
                clearInterval(poll);
                reject(new Error(`no write to ${prefix} within 5000ms (transitions: ${transitions})`));
            }
        }, 1);
    }), keyPrefix);

function expectNoDipThroughZero(transitions: number[]) {
    expect(transitions.length, `the save took no pending-write token (transitions: ${transitions})`).toBeGreaterThan(0);
    expect(transitions.indexOf(0), `pendingWrites returned to zero before the write was issued (transitions: ${transitions})`).toBe(-1);
}

test("an immediate save holds its pending-write token until the write is issued", async ({page}) => {
    await recordSaveSignal(page);
    await seedBatch(page, {name: "E2E Save Signal Immediate"});

    await page.getByRole("tab", {name: "Shopping", exact: true}).click();
    await expect(page.getByRole("tab", {name: "Shopping", exact: true})).toHaveAttribute("aria-selected", "true");

    await resetSaveSignal(page);
    await page.getByLabel(/^Crystal Malt 40L(?: - .*)?$/).check();

    expectNoDipThroughZero(await transitionsBeforeWrite(page, "batches#"));
});

test("a debounced save holds its pending-write token until the write is issued", async ({page}) => {
    await recordSaveSignal(page);
    await seedBatch(page, {name: "E2E Save Signal Debounced"});

    await page.getByRole("tab", {name: "Shopping", exact: true}).click();
    await expect(page.getByRole("tab", {name: "Shopping", exact: true})).toHaveAttribute("aria-selected", "true");

    await resetSaveSignal(page);
    await page.getByLabel("Crystal Malt 40L cost").fill("12.50");

    expectNoDipThroughZero(await transitionsBeforeWrite(page, "batches#"));
});
