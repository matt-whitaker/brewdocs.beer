import {expect, test} from "@playwright/test";
import {pendingWritesTimeline, recordPendingWritesTimeline, resetPendingWritesTimeline} from "./pendingWritesTimeline";
import {seedBatch} from "./seedBatch";
import {settleSave} from "./settleSave";

/**
 * Regression guard for #1378: `pendingWrites` (packages/app/src/signals.ts)
 * is documented (packages/app/CLAUDE.md, "Signals and the clock") to never
 * dip through zero mid-pipeline — a write counts from useJsonEdit's `commit`
 * and releases only when the settled write lands. #1382 fixed a bug where
 * every onChange returned undefined, so the token released on the next
 * microtask instead of waiting on the real write.
 *
 * A reload-outcome test can't reliably catch a regression here: the window
 * measured in #1378's investigation is ~1-8ms, well under this container's
 * Playwright round trip, so `batch-shopping.spec.ts` passes 6/6 against the
 * unpatched code. This asserts the signal's own transition sequence instead.
 *
 * `pendingWrites` is a single app-wide counter, so the recording is reset
 * once the tab switch's own save (PanelSwitcher persists the active tab
 * through the same signal) has settled — the timeline below holds only the
 * checkbox save under test. The token is taken at commit (0 -> 1, possibly
 * nested higher when the underlying storage write takes its own token) and
 * must stay at or above 1 until the single final release: [1, 0] and
 * [1, 2, 1, 0] both pass, while the bug's own signature, [1, 0, 1, 0], fails
 * because 0 reappears before the last element.
 */

test("pendingWrites never reads 0 between a commit and its write landing", async ({page}) => {
    await recordPendingWritesTimeline(page);
    await seedBatch(page, {name: "E2E Save Durability Batch"});

    await page.getByRole("tab", {name: "Shopping", exact: true}).click();
    await expect(page.getByRole("tab", {name: "Shopping", exact: true})).toHaveAttribute("aria-selected", "true");

    await settleSave(page);
    await resetPendingWritesTimeline(page);

    const purchased = page.getByLabel(/^Crystal Malt 40L(?: - .*)?$/);
    await expect(purchased).not.toBeChecked();
    await purchased.check();

    await settleSave(page);

    const timeline = await pendingWritesTimeline(page);

    expect(timeline.length).toBeGreaterThan(0);
    expect(timeline[timeline.length - 1]).toBe(0);
    expect(timeline.slice(0, -1).every((value) => value >= 1)).toBe(true);
});
