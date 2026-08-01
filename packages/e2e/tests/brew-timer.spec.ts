import {expect, Page, test} from "@playwright/test";

// A fresh context has no batches, so each test brews its own (mirrors
// batch-edit.spec.ts). Tests stay independent at the cost of a few seconds each.
async function brewBatchFromKbRecipe(page: Page, batchName: string) {
    await page.goto("/kb/recipe/anchor-steam-beer-clone");
    await page.getByRole("button", {name: "Brew"}).click();

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await dialog.getByLabel(/Batch name/).fill(batchName);
    await dialog.getByRole("button", {name: "Confirm"}).click();

    await expect(page).toHaveURL(/\/batch\//);
}

// See batch-edit.spec.ts for why this is a fixed wait, not a flake patch: saves
// are fire-and-forget, so reloading immediately after an edit races the write.
async function settleSave(page: Page) {
    await page.waitForTimeout(1000);
}

async function openSchedulePhase(page: Page, phase: string) {
    await page.getByRole("tab", {name: "Brewing", exact: true}).click();
    await page.getByRole("tab", {name: phase, exact: true}).click();
    await expect(page.getByRole("tab", {name: phase, exact: true})).toHaveAttribute("aria-selected", "true");
}

test("keeps the timer running across a reload", async ({page}) => {
    await brewBatchFromKbRecipe(page, "E2E Timer Running Batch");
    await page.getByRole("tab", {name: "Brewing", exact: true}).click();

    await expect(page.getByRole("timer", {name: "Elapsed time"})).toHaveText("00:00:00");
    await page.getByRole("button", {name: "Start timer"}).click();
    await expect(page.getByRole("button", {name: "Pause timer"})).toBeVisible();

    // let real wall-clock time pass — elapsedSeconds is derived from the stored
    // absolute start timestamp, not an in-memory counter, so this is what proves
    // a reload (which wipes all in-memory state) still reports real elapsed time
    await page.waitForTimeout(3000);
    await settleSave(page);
    await page.reload();
    await page.getByRole("tab", {name: "Brewing", exact: true}).click();

    // still running, and reads at least the ~3s that passed — never assert
    // equality on a ticking counter
    await expect(page.getByRole("button", {name: "Pause timer"})).toBeVisible();
    await expect(page.getByRole("timer", {name: "Elapsed time"})).not.toHaveText("00:00:00");
});

test("freezes the counter on pause, and a reload keeps it frozen", async ({page}) => {
    await brewBatchFromKbRecipe(page, "E2E Timer Paused Batch");
    await page.getByRole("tab", {name: "Brewing", exact: true}).click();

    await page.getByRole("button", {name: "Start timer"}).click();
    await page.waitForTimeout(2000);
    await page.getByRole("button", {name: "Pause timer"}).click();
    await expect(page.getByRole("button", {name: "Start timer"})).toBeVisible();

    const frozenValue = await page.getByRole("timer", {name: "Elapsed time"}).textContent();
    expect(frozenValue).not.toBe("00:00:00");

    await settleSave(page);
    await page.reload();
    await page.getByRole("tab", {name: "Brewing", exact: true}).click();

    // paused time is a fixed pair of stored timestamps, so unlike the running
    // case this is expected to be exact, not just monotonic
    await expect(page.getByRole("button", {name: "Start timer"})).toBeVisible();
    await expect(page.getByRole("timer", {name: "Elapsed time"})).toHaveText(frozenValue ?? "");
});

test("logs a quick milestone that lands on the timeline and in the phase's reading grid", async ({page}) => {
    await brewBatchFromKbRecipe(page, "E2E Timer Milestone Batch");
    await page.getByRole("tab", {name: "Brewing", exact: true}).click();

    // a marker only places once there's a running session with elapsed > 0
    await page.getByRole("button", {name: "Start timer"}).click();
    await page.waitForTimeout(1000);

    // defaults (first kind "Gravity", first phase "1. Mash") match the reading
    // grid's own "Add reading" default label, so no need to touch the selects
    await page.getByRole("button", {name: "Log milestone"}).click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await dialog.getByRole("button", {name: "Confirm"}).click();
    await expect(dialog).not.toBeVisible();

    await expect(page.getByRole("button", {name: /^Reading at \d{2}:\d{2}:\d{2}$/})).toBeVisible();
    await openSchedulePhase(page, "1. Mash");
    await expect(page.getByLabel("Reading reading")).toBeVisible();

    await settleSave(page);
    await page.reload();
    await page.getByRole("tab", {name: "Brewing", exact: true}).click();

    // both writes (the milestone on the phase, and the timer's marker derived
    // from it) are fire-and-forget saves — the reload is what proves neither
    // was silently lost
    await expect(page.getByRole("button", {name: /^Reading at \d{2}:\d{2}:\d{2}$/})).toBeVisible();
    await openSchedulePhase(page, "1. Mash");
    await expect(page.getByLabel("Reading reading")).toBeVisible();
});

// A marker's offsetSeconds and the timer's elapsedSeconds must round the same
// way (both floor), because elapsedSeconds only advances on its 1s
// setInterval tick — `elapsed` can lag up to just under a second behind real
// "now" between ticks. A wait-then-assert test can't pin down that gap: it's
// racing real wall-clock time, and Playwright's own auto-retrying `expect`
// absorbs a temporary mismatch regardless (a settleSave-style wait would hide
// it outright). Freezing the page clock mid-gap makes the race deterministic
// instead: run it to 5.6s (letting the real 1s, 2s, 3s, 4s, 5s ticks fire, so
// `elapsed` lands on a real production snapshot of 5, not a synthetic one),
// then log a milestone at that exact frozen instant with no further clock
// advance — offsetSeconds must already satisfy elapsed on its own.
test("places a freshly logged milestone marker without waiting for a tick to catch up", async ({page}) => {
    await page.clock.install();
    await brewBatchFromKbRecipe(page, "E2E Marker Clock Batch");
    await page.getByRole("tab", {name: "Brewing", exact: true}).click();

    // pauseAt's target must be in the fake clock's future by the time the
    // command reaches the browser, or it throws "Cannot fast-forward to the
    // past" — a fixed lead covers the round-trip
    await page.clock.pauseAt(Date.now() + 1000);
    await page.getByRole("button", {name: "Start timer"}).click();
    await expect(page.getByRole("button", {name: "Pause timer"})).toBeVisible();

    // real (unfaked) settle: the interval that drives elapsedSeconds is
    // registered by a passive effect after this commit, not within it — give
    // it a moment to actually register before jumping the frozen clock, or
    // the jump can start before there's any interval for it to fire
    await page.waitForTimeout(100);
    await page.clock.runFor(5600);

    await page.getByRole("button", {name: "Log milestone"}).click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await dialog.getByRole("button", {name: "Confirm"}).click();
    await expect(dialog).not.toBeVisible();

    // no further clock advance past this point — a marker that only shows up
    // once the next tick fires would time out here, not eventually pass
    await expect(page.getByRole("button", {name: /at \d{2}:\d{2}:\d{2}$/})).toBeVisible();
});
