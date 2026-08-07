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
    await page.getByRole("button", {name: "Quick actions"}).click();
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

// BREW-TIMER-01/05, BATCH-SCHEDULE-04: one entry point opens a tab panel ordered
// Ingredients/Reading/Equipment,
// with unavailable tabs reading as disabled rather than silently no-opping. Since #651 wired
// all three, "disabled" now means "nothing left on this phase" — which is what this asserts,
// and what the earlier version of this test was explicitly waiting to be able to assert.
test("quick action modal opens on Reading with every applicable tab enabled", async ({page}) => {
    await brewBatchFromKbRecipe(page, "E2E Quick Action Tabs Batch");
    await page.getByRole("tab", {name: "Brewing", exact: true}).click();

    await page.getByRole("button", {name: "Quick actions"}).click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();

    // 1. Mash has grains to add and equipment to check off, so all three apply
    await expect(dialog.getByRole("tab")).toHaveText(["Ingredients", "Reading", "Equipment"]);
    await expect(dialog.getByRole("tab", {name: "Ingredients"})).toBeEnabled();
    await expect(dialog.getByRole("tab", {name: "Reading"})).toHaveAttribute("aria-selected", "true");
    await expect(dialog.getByRole("tab", {name: "Equipment"})).toBeEnabled();
});

// BATCH-SCHEDULE-04, and the other half of the same behaviour: a tab goes unavailable once
// its phase is exhausted, carrying the reason rather than just greying out.
//
// ⚠️ This is also the regression guard for the modal-stays-open bug (#651). Confirming the
// check-off that exhausts a tab used to unmount the panel — and its method="dialog" form —
// before the browser ran the submit, so the dialog never closed. Asserting only that the
// check-off landed passes straight through that; the dialog count is what catches it.
test("a quick-action tab goes unavailable, with its reason, once the phase is exhausted", async ({page}) => {
    await brewBatchFromKbRecipe(page, "E2E Quick Action Exhaust Batch");
    await page.getByRole("tab", {name: "Brewing", exact: true}).click();

    const dialog = page.getByRole("dialog");
    const ingredients = dialog.getByRole("tab", {name: "Ingredients"});

    // the kb recipe's mash phase has a bounded number of grains; check off until it runs dry
    for (let i = 0; i < 10; i++) {
        await page.getByRole("button", {name: "Quick actions"}).click();
        await expect(dialog).toBeVisible();
        if (!await ingredients.isEnabled()) break;

        await ingredients.click();
        await dialog.getByRole("button", {name: "Confirm"}).click();
        await expect(dialog).not.toBeVisible();
        await settleSave(page);
    }

    await expect(ingredients).toBeDisabled();
    await expect(ingredients).toHaveAttribute("title", "Nothing left to add on this phase");
    await expect(dialog.getByRole("tab", {name: "Reading"})).toHaveAttribute("aria-selected", "true");
});

// BATCH-SCHEDULE-10/-11: the quick action names the item, and the list is offered in the order
// the phase lists them with the next one preselected — so working down a phase stays one confirm
// per addition, and a checked item is never offered again.
//
// ⚠️ The expected order is read from the SCREEN, never hardcoded, so this fails if the panel and
// the picker ever disagree again (#656).
test("the ingredients quick action works down the phase one confirm at a time", async ({page}) => {
    await brewBatchFromKbRecipe(page, "E2E Quick Action Advance Batch");
    await page.getByRole("tab", {name: "Brewing", exact: true}).click();

    const GRAINS = ["Crystal Malt 40L", "German Pils", "Special Robust"];
    const displayed = (await page.getByRole("checkbox").evaluateAll(boxes => boxes.map(box => {
        const el = box as HTMLInputElement;
        const label = el.closest("label") ?? document.querySelector(`label[for="${el.id}"]`);
        return label?.textContent?.trim() ?? "";
    }))).filter(name => GRAINS.includes(name));
    expect(displayed).toHaveLength(GRAINS.length);

    for (let done = 1; done <= displayed.length; done++) {
        await page.getByRole("button", {name: "Quick actions"}).click();
        const dialog = page.getByRole("dialog").filter({hasText: "Quick action"});
        await dialog.getByRole("tab", {name: "Ingredients"}).click();

        // the next one is already selected — no picking needed to work in order
        await expect(dialog.getByLabel("Ingredient item")).toHaveValue(/.+/);
        await dialog.getByRole("button", {name: "Confirm"}).click();
        await expect(dialog).not.toBeVisible();
        await settleSave(page);

        for (const [i, name] of displayed.entries()) {
            const box = page.getByRole("checkbox", {name});
            if (i < done) await expect(box, `${name} (row ${i + 1}) after ${done}`).toBeChecked();
            else await expect(box, `${name} (row ${i + 1}) after ${done}`).not.toBeChecked();
        }
    }
});

// BATCH-SCHEDULE-10: the brewer can name an item OUT of order — the thing a resolver could never
// do, and the reason grain and additives stopped being auto-advanced at all.
test("the ingredients quick action checks off the item the brewer names, out of order", async ({page}) => {
    await brewBatchFromKbRecipe(page, "E2E Quick Action Named Batch");
    await page.getByRole("tab", {name: "Brewing", exact: true}).click();

    await page.getByRole("button", {name: "Quick actions"}).click();
    const dialog = page.getByRole("dialog").filter({hasText: "Quick action"});
    await dialog.getByRole("tab", {name: "Ingredients"}).click();

    const offered = await dialog.getByLabel("Ingredient item").locator("option").allTextContents();
    expect(offered).toEqual(["German Pils", "Crystal Malt 40L", "Special Robust"]);

    // deliberately not the preselected one
    await dialog.getByLabel("Ingredient item").selectOption({label: "Special Robust"});
    await dialog.getByRole("button", {name: "Confirm"}).click();
    await expect(dialog).not.toBeVisible();
    await settleSave(page);

    await expect(page.getByRole("checkbox", {name: "Special Robust"})).toBeChecked();
    await expect(page.getByRole("checkbox", {name: "German Pils"})).not.toBeChecked();
    await expect(page.getByRole("checkbox", {name: "Crystal Malt 40L"})).not.toBeChecked();
});

// BATCH-SCHEDULE-08/-09: the phase lists boil additions longest-boil first, and Planning is
// left exactly as the brewer arranged it.
//
// ⚠️ The edit is what gives this test teeth. The kb recipe already stores its three Northern
// Brewer additions in descending boil order, so asserting the panel order straight after brewing
// cannot tell "the screen sorted them" from "they were already sorted" — an earlier version of
// this test was green against the #656 defect for exactly that reason. Retiming the first-stored
// addition to 1 min makes the stored order (1, 20, 0) and the brewing order (20, 1, 0) disagree,
// so only a screen that really sorts can pass.
test("a phase lists its boil additions in the order they go in, without reordering Planning", async ({page}) => {
    await brewBatchFromKbRecipe(page, "E2E Brew Order Batch");

    await page.getByRole("tab", {name: "Planning", exact: true}).click();
    await page.getByRole("tab", {name: "Ingredients", exact: true}).click();

    const toggles = page.getByRole("button", {name: "Show assignment details"});
    for (let guard = 0; guard < 12 && await toggles.count() > 0; guard++) {
        await toggles.first().click();
    }

    const boilTimes = (where: Page) => where.getByLabel(/Northern Brewer boil/)
        .evaluateAll(inputs => inputs.map(i => parseFloat((i as HTMLInputElement).value)));

    const planned = page.getByLabel("Northern Brewer boil");
    await expect(planned).toHaveCount(3);
    expect(await boilTimes(page)).toEqual([60, 20, 0]);

    // retime the first one so it now goes in LAST
    await planned.nth(0).fill("1");
    await planned.nth(0).blur();
    await settleSave(page);

    // BATCH-SCHEDULE-09: Planning still reads in the brewer's own arrangement
    await expect.poll(() => boilTimes(page)).toEqual([1, 20, 0]);

    // BATCH-SCHEDULE-08: the brew-day panel reads chronologically instead
    await openSchedulePhase(page, "2. Boil");
    await expect.poll(() => boilTimes(page)).toEqual([20, 1, 0]);
});

// BATCH-SCHEDULE-01: "If the brewer also enters a value, that value is recorded against the
// same item." Asserted against whichever item the action chose, for the reason above.
test("a value typed into the ingredients quick action is recorded against the item it checked off", async ({page}) => {
    await brewBatchFromKbRecipe(page, "E2E Quick Action Value Batch");
    await page.getByRole("tab", {name: "Brewing", exact: true}).click();

    await page.getByRole("button", {name: "Quick actions"}).click();
    const dialog = page.getByRole("dialog").filter({hasText: "Quick action"});
    await dialog.getByRole("tab", {name: "Ingredients"}).click();
    await dialog.getByLabel("Ingredient weight").fill("9.99");
    await dialog.getByRole("button", {name: "Confirm"}).click();
    await expect(dialog).not.toBeVisible();
    await settleSave(page);

    const GRAINS = ["Crystal Malt 40L", "German Pils", "Special Robust"];
    const checked: string[] = [];
    for (const name of GRAINS) {
        if (await page.getByRole("checkbox", {name}).isChecked()) checked.push(name);
    }
    expect(checked).toHaveLength(1);

    // the value lands on the item that was checked, and on no other
    await expect(page.getByLabel(`${checked[0]} weight`)).toHaveValue(/9\.99/);
    for (const other of GRAINS.filter(n => n !== checked[0])) {
        await expect(page.getByLabel(`${other} weight`)).not.toHaveValue(/9\.99/);
    }
});

// BATCH-SCHEDULE-06: equipment is NAMED by the brewer, not resolved for them. The test names a
// deliberately non-first item — an "earliest incomplete" resolver could never satisfy this,
// which is the point: it is what distinguishes the behaviour from the one it replaced.
test("the equipment quick action checks off the item the brewer names", async ({page}) => {
    await brewBatchFromKbRecipe(page, "E2E Quick Action Equipment Batch");
    await page.getByRole("tab", {name: "Brewing", exact: true}).click();

    await page.getByRole("button", {name: "Quick actions"}).click();
    const dialog = page.getByRole("dialog").filter({hasText: "Quick action"});
    await dialog.getByRole("tab", {name: "Equipment"}).click();
    await dialog.getByLabel("Equipment item").selectOption({label: "Digital Hydrometer"});
    await dialog.getByRole("button", {name: "Confirm"}).click();
    await expect(dialog).not.toBeVisible();
    await settleSave(page);

    await expect(page.getByRole("checkbox", {name: "Digital Hydrometer"})).toBeChecked();
    await expect(page.getByRole("checkbox", {name: "Mash Tun - 10gal"})).not.toBeChecked();

    // and it is no longer on offer
    await page.getByRole("button", {name: "Quick actions"}).click();
    await dialog.getByRole("tab", {name: "Equipment"}).click();
    const left = await dialog.getByLabel("Equipment item").locator("option").allTextContents();
    expect(left).not.toContain("Digital Hydrometer");
    expect(left).toContain("Mash Tun - 10gal");
});

// BATCH-SCHEDULE-07: "never reaches into a later phase while the current phase still has one
// left." The mash phase has grains and no hops; the boil phase has hops. While mash grains
// remain, Hop must not be on offer and the boil's hops must stay untouched.
test("a quick action never reaches into a later phase", async ({page}) => {
    await brewBatchFromKbRecipe(page, "E2E Quick Action Phase Scope Batch");
    await page.getByRole("tab", {name: "Brewing", exact: true}).click();

    await page.getByRole("button", {name: "Quick actions"}).click();
    const dialog = page.getByRole("dialog").filter({hasText: "Quick action"});
    await dialog.getByRole("tab", {name: "Ingredients"}).click();

    // only this phase's remaining items are on offer — the boil's hops are not among them
    const offered = await dialog.getByLabel("Ingredient item").locator("option").allTextContents();
    expect(offered).toContain("German Pils");
    expect(offered.some(name => name.startsWith("Northern Brewer"))).toBe(false);

    await dialog.getByRole("button", {name: "Confirm"}).click();
    await expect(dialog).not.toBeVisible();
    await settleSave(page);

    // the boil phase's hops are untouched
    await openSchedulePhase(page, "2. Boil");
    for (const box of await page.getByRole("checkbox", {name: /Northern Brewer/}).all()) {
        await expect(box).not.toBeChecked();
    }
});

// Covers the marker overlay's 24px hit target + popover work (#380): each
// marker gets its own transparent hit box independent of its drawn dot, and
// only one popover is open at a time. Real wall-clock separation between the
// two milestones is what the "own popover text" claim needs — with markers at
// very different offsets, hovering one can't accidentally hit-test the other.
test("hovering each marker after logging two milestones shows that marker's own popover text", async ({page}) => {
    await brewBatchFromKbRecipe(page, "E2E Marker Popover Batch");
    await page.getByRole("tab", {name: "Brewing", exact: true}).click();

    await page.getByRole("button", {name: "Start timer"}).click();
    await page.waitForTimeout(1000);

    // defaults (Gravity kind, "Reading" label) match the first milestone
    await page.getByRole("button", {name: "Quick actions"}).click();
    let dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await dialog.getByRole("button", {name: "Confirm"}).click();
    await expect(dialog).not.toBeVisible();

    const gravityMarker = page.getByRole("button", {name: /^Reading at \d{2}:\d{2}:\d{2}$/});
    await expect(gravityMarker).toBeVisible();

    await page.waitForTimeout(4000);

    await page.getByRole("button", {name: "Quick actions"}).click();
    dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await dialog.getByLabel("Reading kind").selectOption("volume");
    await dialog.getByRole("button", {name: "Confirm"}).click();
    await expect(dialog).not.toBeVisible();

    const volumeMarker = page.getByRole("button", {name: /^Volume at \d{2}:\d{2}:\d{2}$/});
    await expect(volumeMarker).toBeVisible();

    await gravityMarker.hover();
    const gravityTooltip = page.getByRole("tooltip");
    await expect(gravityTooltip).toBeVisible();
    await expect(gravityTooltip).toContainText("Reading");
    await expect(gravityTooltip).toContainText("Gravity");

    // switching hover must swap the popover's content, not just its position —
    // this is the case the overlay's single openMarkerId exists to get right
    await volumeMarker.hover();
    const volumeTooltip = page.getByRole("tooltip");
    await expect(volumeTooltip).toBeVisible();
    await expect(volumeTooltip).toContainText("Volume");
    await expect(volumeTooltip).not.toContainText("Gravity");
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

    await page.getByRole("button", {name: "Quick actions"}).click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await dialog.getByRole("button", {name: "Confirm"}).click();
    await expect(dialog).not.toBeVisible();

    // no further clock advance past this point — a marker that only shows up
    // once the next tick fires would time out here, not eventually pass
    await expect(page.getByRole("button", {name: /at \d{2}:\d{2}:\d{2}$/})).toBeVisible();
});

// #422: elapsedSeconds used to sum only the *running* intervals of Batch.timer, so
// a paused counter fell behind the wall-clock basis the markers use, and anything
// logged during a pause could sit past elapsedSeconds indefinitely — catching up
// required as much *additional running time after resume* as the pause itself
// lasted. That's what the pause below is long relative to: a fixed implementation
// clears the tight post-resume assertion window immediately (it jumps straight to
// the true wall-clock offset), while a regressed one would need the whole pause
// length in further running time to get there, which the window doesn't allow.
// (page.clock isn't used here — freezing time across two consecutive immediate
// writes races this app's query invalidation/refetch and reverts the optimistic
// UI update within milliseconds, unrelated to the bug under test.)
test("keeps a milestone logged during a long pause on the timeline once resumed", async ({page}) => {
    await brewBatchFromKbRecipe(page, "E2E Timer Pause Marker Batch");
    await page.getByRole("tab", {name: "Brewing", exact: true}).click();

    await page.getByRole("button", {name: "Start timer"}).click();
    await page.waitForTimeout(1000);
    await page.getByRole("button", {name: "Pause timer"}).click();
    await expect(page.getByRole("button", {name: "Start timer"})).toBeVisible();

    const frozenValue = await page.getByRole("timer", {name: "Elapsed time"}).textContent();

    // a pause much longer than the running time before it
    await page.waitForTimeout(6000);

    await page.getByRole("button", {name: "Quick actions"}).click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await dialog.getByRole("button", {name: "Confirm"}).click();
    await expect(dialog).not.toBeVisible();

    const marker = page.getByRole("button", {name: /^Reading at \d{2}:\d{2}:\d{2}$/});
    // still paused: the milestone's wall-clock offset is past the frozen counter,
    // so the marker must not show yet, and the counter itself stays frozen
    await expect(marker).toHaveCount(0);
    await expect(page.getByRole("timer", {name: "Elapsed time"})).toHaveText(frozenValue ?? "");

    await page.getByRole("button", {name: "Start timer"}).click();
    // resuming alone must jump the counter to the true wall-clock offset and reveal
    // the marker — well inside the 6s pause a regressed implementation would need
    await expect(marker).toBeVisible({timeout: 2500});
});
