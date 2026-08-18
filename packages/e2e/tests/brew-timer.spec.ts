import {expect, Page, test} from "@playwright/test";
import {settleSave} from "./settleSave";

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

async function openSchedulePhase(page: Page, phase: string) {
    await page.getByRole("tab", {name: "Brewing", exact: true}).click();
    await page.getByRole("tab", {name: phase, exact: true}).click();
    await expect(page.getByRole("tab", {name: phase, exact: true})).toHaveAttribute("aria-selected", "true");
}

function parseElapsed(text: string): number {
    const [h, m, s] = text.split(":").map(Number);
    return (h * 3600) + (m * 60) + s;
}

async function markerOffsetSeconds(page: Page, namePattern: RegExp): Promise<number> {
    const label = await page.getByRole("button", {name: namePattern}).getAttribute("aria-label");
    const match = label?.match(/(\d{2}):(\d{2}):(\d{2})$/);
    if (!match) throw new Error(`marker aria-label carried no time: ${label}`);
    return (Number(match[1]) * 3600) + (Number(match[2]) * 60) + Number(match[3]);
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

// also the BREW-TIMER-12 blank-label case: the Reading tab's label field is left
// untouched here, and the grid row still renders under the Gravity kind's own
// default label ("Reading"), unchanged from BREW-TIMER-02.
test("logs a quick milestone that lands on the timeline and in the phase's reading grid", async ({page}) => {
    await brewBatchFromKbRecipe(page, "E2E Timer Milestone Batch");
    await page.getByRole("tab", {name: "Brewing", exact: true}).click();

    // an individual reading marker only ever plots on Phase's own timeline (BREW-TIMER-09)
    await page.getByRole("group", {name: "Timer scope"}).getByRole("button", {name: "Phase", exact: true}).click();

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
    // scope resets to its default (Global) on remount — back to Phase to see the marker
    await page.getByRole("group", {name: "Timer scope"}).getByRole("button", {name: "Phase", exact: true}).click();

    // both writes (the milestone on the phase, and the timer's marker derived
    // from it) are fire-and-forget saves — the reload is what proves neither
    // was silently lost
    await expect(page.getByRole("button", {name: /^Reading at \d{2}:\d{2}:\d{2}$/})).toBeVisible();
    await openSchedulePhase(page, "1. Mash");
    await expect(page.getByLabel("Reading reading")).toBeVisible();
});

// BATCH-SCHEDULE-16: an empty Gravity, Volume or Temperature reading's value field — an
// existing reading row's value cell, and the "add reading" row's value field alike — shows a
// greyed-out example placeholder.
test("empty Gravity, Volume and Temperature reading value inputs show an example placeholder", async ({page}) => {
    await brewBatchFromKbRecipe(page, "E2E Reading Placeholder Batch");
    await openSchedulePhase(page, "1. Mash");

    await expect(page.getByLabel("Gravity value to add")).toHaveAttribute("placeholder", "12");
    await expect(page.getByLabel("Volume value to add")).toHaveAttribute("placeholder", "5.5");
    await expect(page.getByLabel("Temperature value to add")).toHaveAttribute("placeholder", "68");

    // an existing row's own value cell, left blank, shows the same example — not just the add row
    await page.getByRole("button", {name: "Quick actions"}).click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await dialog.getByRole("button", {name: "Confirm"}).click();
    await expect(dialog).not.toBeVisible();

    await expect(page.getByLabel("Reading reading")).toHaveAttribute("placeholder", "12");
});

// BREW-TIMER-14: the Reading tab's Value field shows the same kind of example placeholder as
// the batch schedule's reading fields (BATCH-SCHEDULE-16), matching whichever of Gravity,
// Volume or Temperature is the selected reading kind.
test("the quick-log Reading tab's Value field placeholder follows the selected reading kind", async ({page}) => {
    await brewBatchFromKbRecipe(page, "E2E Reading Tab Placeholder Batch");
    await page.getByRole("tab", {name: "Brewing", exact: true}).click();

    await page.getByRole("button", {name: "Quick actions"}).click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();

    // defaults to Gravity, the first reading kind offered
    await expect(dialog.getByLabel("Reading value")).toHaveAttribute("placeholder", "12");

    await dialog.getByLabel("Reading kind").selectOption("volume");
    await expect(dialog.getByLabel("Reading value")).toHaveAttribute("placeholder", "5.5");

    await dialog.getByLabel("Reading kind").selectOption("temperature");
    await expect(dialog.getByLabel("Reading value")).toHaveAttribute("placeholder", "68");
});

// BREW-TIMER-12: a typed label names the recorded reading instead of the kind's
// default, and that name is a real write, not just a moment's UI state.
test("logs a quick reading with a typed label that names the resulting reading", async ({page}) => {
    await brewBatchFromKbRecipe(page, "E2E Quick Reading Label Batch");
    await page.getByRole("tab", {name: "Brewing", exact: true}).click();

    await page.getByRole("button", {name: "Quick actions"}).click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await dialog.getByLabel("Reading label").fill("Mash pH check");
    await dialog.getByRole("button", {name: "Confirm"}).click();
    await expect(dialog).not.toBeVisible();

    await openSchedulePhase(page, "1. Mash");
    await expect(page.getByLabel("Mash pH check reading")).toBeVisible();
    await expect(page.getByLabel("Reading reading")).not.toBeVisible();

    await settleSave(page);
    await page.reload();
    await page.getByRole("tab", {name: "Brewing", exact: true}).click();

    // proves the typed label was persisted, not just held in the modal's own state
    await openSchedulePhase(page, "1. Mash");
    await expect(page.getByLabel("Mash pH check reading")).toBeVisible();
});

// BREW-TIMER-12: a label of only whitespace must fall back the same way a truly
// blank one does — the fallback is two independent trims (design coerces to
// undefined, app trims again before its `||` default) and either alone looks
// sufficient, so this is the case that would survive losing one of them.
test("logs a quick reading with a whitespace-only label under the kind's default label", async ({page}) => {
    await brewBatchFromKbRecipe(page, "E2E Quick Reading Blank Label Batch");
    await page.getByRole("tab", {name: "Brewing", exact: true}).click();

    await page.getByRole("button", {name: "Quick actions"}).click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await dialog.getByLabel("Reading label").fill("   ");
    await dialog.getByRole("button", {name: "Confirm"}).click();
    await expect(dialog).not.toBeVisible();

    await openSchedulePhase(page, "1. Mash");
    await expect(page.getByLabel("Reading name")).toHaveValue("Reading");
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

// BREW-TIMER-13: selecting an item pre-fills the value field with that item's own planned
// value from the recipe, instead of leaving it blank.
test("the ingredients quick action pre-fills the value field with the selected item's planned value", async ({page}) => {
    await brewBatchFromKbRecipe(page, "E2E Quick Action Prefill Batch");
    await page.getByRole("tab", {name: "Brewing", exact: true}).click();

    await page.getByRole("button", {name: "Quick actions"}).click();
    const dialog = page.getByRole("dialog").filter({hasText: "Quick action"});
    await dialog.getByRole("tab", {name: "Ingredients"}).click();

    // German Pils is the preselected item (first offered, per the "named, out of order" test
    // above), and its own planned weight in the kb recipe is 9.0lb
    await expect(dialog.getByLabel("Ingredient item").locator("option:checked")).toHaveText("German Pils");
    await expect(dialog.getByLabel("Ingredient weight")).toHaveValue(/9\.0/);
});

// BREW-TIMER-13: "picking a different item replaces it with that item's own planned value
// rather than carrying over the previous one."
test("switching the selected ingredient replaces the pre-fill with the new item's own planned value", async ({page}) => {
    await brewBatchFromKbRecipe(page, "E2E Quick Action Prefill Switch Batch");
    await page.getByRole("tab", {name: "Brewing", exact: true}).click();

    await page.getByRole("button", {name: "Quick actions"}).click();
    const dialog = page.getByRole("dialog").filter({hasText: "Quick action"});
    await dialog.getByRole("tab", {name: "Ingredients"}).click();

    await expect(dialog.getByLabel("Ingredient weight")).toHaveValue(/9\.0/);

    await dialog.getByLabel("Ingredient item").selectOption({label: "Crystal Malt 40L"});
    await expect(dialog.getByLabel("Ingredient weight")).toHaveValue(/1\.0/);

    await dialog.getByLabel("Ingredient item").selectOption({label: "Special Robust"});
    await expect(dialog.getByLabel("Ingredient weight")).toHaveValue(/0\.5/);
});

// BATCH-SCHEDULE-01: "If the brewer also enters a value, that value is recorded against the
// same item." Asserted against whichever item the action chose, for the reason above.
//
// BREW-TIMER-13: the field starts pre-filled with the preselected item's own planned value
// (German Pils, 9.0lb) rather than blank — this proves the typed value wins over that
// pre-fill at confirm, not that the field started empty and got filled.
test("a value typed into the ingredients quick action is recorded against the item it checked off", async ({page}) => {
    await brewBatchFromKbRecipe(page, "E2E Quick Action Value Batch");
    await page.getByRole("tab", {name: "Brewing", exact: true}).click();

    await page.getByRole("button", {name: "Quick actions"}).click();
    const dialog = page.getByRole("dialog").filter({hasText: "Quick action"});
    await dialog.getByRole("tab", {name: "Ingredients"}).click();
    await expect(dialog.getByLabel("Ingredient weight")).toHaveValue(/9\.0/);
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

    // an individual reading marker only ever plots on Phase's own timeline (BREW-TIMER-09)
    await page.getByRole("group", {name: "Timer scope"}).getByRole("button", {name: "Phase", exact: true}).click();

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

    // an individual reading marker only ever plots on Phase's own timeline (BREW-TIMER-09) —
    // Global's own Mash start stamp is visible from t=0 and would otherwise satisfy the loose
    // "at HH:MM:SS" match below regardless of the timing behaviour under test
    await page.getByRole("group", {name: "Timer scope"}).getByRole("button", {name: "Phase", exact: true}).click();

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
    await expect(page.getByRole("button", {name: /^Reading at \d{2}:\d{2}:\d{2}$/})).toBeVisible();
});

// #422: elapsedSeconds used to sum only the *running* intervals of Batch.timer, so
// a paused counter fell behind the wall-clock basis Global's markers use, and anything
// timestamped during a pause could sit past elapsedSeconds indefinitely — catching up
// required as much *additional running time after resume* as the pause itself
// lasted. That's what the pause below is long relative to: a fixed implementation
// clears the tight post-resume assertion window immediately (it jumps straight to
// the true wall-clock offset), while a regressed one would need the whole pause
// length in further running time to get there, which the window doesn't allow.
//
// Global's only markers are now the phase stamps (BREW-TIMER-08), not an individual
// reading — reproduced here via a phase completed while ALREADY paused: BATCH-SCHEDULE-14
// leaves an already-paused timer untouched, so the completion's recorded `date` is real
// wall-clock time even though the frozen counter doesn't move to match it.
// (page.clock isn't used here — freezing time across two consecutive immediate
// writes races this app's query invalidation/refetch and reverts the optimistic
// UI update within milliseconds, unrelated to the bug under test.)
test("keeps a phase's complete stamp on Global's timeline once resumed, even completed during a long pause", async ({page}) => {
    await brewBatchFromKbRecipe(page, "E2E Timer Pause Marker Batch");
    await page.getByRole("tab", {name: "Brewing", exact: true}).click();

    const mashStamps = page.getByRole("button", {name: /^1\. Mash at \d{2}:\d{2}:\d{2}$/});

    await page.getByRole("button", {name: "Start timer"}).click();
    await page.waitForTimeout(1000);
    await page.getByRole("button", {name: "Pause timer"}).click();
    await expect(page.getByRole("button", {name: "Start timer"})).toBeVisible();
    // just Mash's own start stamp so far
    await expect(mashStamps).toHaveCount(1);

    const frozenValue = await page.getByRole("timer", {name: "Elapsed time"}).textContent();

    // a pause much longer than the running time before it
    await page.waitForTimeout(6000);

    // completing while already paused leaves the timer untouched (BATCH-SCHEDULE-14) — the
    // completion's recorded date is still real wall-clock time, well past what the frozen
    // counter shows
    await page.getByRole("button", {name: "Complete 1. Mash"}).click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await dialog.getByRole("button", {name: "Confirm"}).click();
    await expect(dialog).not.toBeVisible();

    // still paused: the completion's wall-clock offset is past the frozen counter, so its
    // stamp must not show yet, and the counter itself stays frozen
    await expect(mashStamps).toHaveCount(1);
    await expect(page.getByRole("timer", {name: "Elapsed time"})).toHaveText(frozenValue ?? "");

    await page.getByRole("button", {name: "Start timer"}).click();
    // resuming alone must jump the counter to the true wall-clock offset and reveal the
    // complete stamp — well inside the 6s pause a regressed implementation would need
    await expect(mashStamps).toHaveCount(2, {timeout: 2500});
});

// BREW-TIMER-06: the scope toggle changes only what is displayed. It must never touch
// play/pause, and switching before the session has even started (no phase boundary yet)
// must not throw — an empty/never-started timer is a real, reachable state.
test("switching Global/Phase scope never disturbs the running or paused clock", async ({page}) => {
    await brewBatchFromKbRecipe(page, "E2E Timer Scope Toggle Batch");
    await page.getByRole("tab", {name: "Brewing", exact: true}).click();

    const scopeGroup = page.getByRole("group", {name: "Timer scope"});
    const globalButton = scopeGroup.getByRole("button", {name: "Global", exact: true});
    const phaseButton = scopeGroup.getByRole("button", {name: "Phase", exact: true});

    await phaseButton.click();
    await expect(page.getByRole("timer", {name: "Elapsed time"})).toHaveText("00:00:00");
    await expect(page.getByRole("button", {name: "Start timer"})).toBeVisible();
    await globalButton.click();

    await page.getByRole("button", {name: "Start timer"}).click();
    await expect(page.getByRole("button", {name: "Pause timer"})).toBeVisible();

    await phaseButton.click();
    await expect(phaseButton).toHaveAttribute("aria-pressed", "true");
    await expect(globalButton).toHaveAttribute("aria-pressed", "false");
    // still running — the toggle only picks what is displayed
    await expect(page.getByRole("button", {name: "Pause timer"})).toBeVisible();

    await page.waitForTimeout(1000);
    await globalButton.click();
    await expect(globalButton).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByRole("button", {name: "Pause timer"})).toBeVisible();

    await page.getByRole("button", {name: "Pause timer"}).click();
    await expect(page.getByRole("button", {name: "Start timer"})).toBeVisible();
    const frozenValue = await page.getByRole("timer", {name: "Elapsed time"}).textContent();

    // paused: bouncing between scopes must never disturb the frozen counter
    await phaseButton.click();
    await expect(page.getByRole("button", {name: "Start timer"})).toBeVisible();
    await globalButton.click();
    await expect(page.getByRole("timer", {name: "Elapsed time"})).toHaveText(frozenValue ?? "");
});

// BREW-TIMER-07/-10: Phase's elapsed excludes the paused span; Global's (wall-clock)
// does not. Switching back to Global must read the true value right away, never a
// smaller number carried over from what Phase was just showing.
test("Phase's elapsed excludes a pause, and Global reads the true elapsed the moment you switch back", async ({page}) => {
    await brewBatchFromKbRecipe(page, "E2E Timer Scope Pause Batch");
    await page.getByRole("tab", {name: "Brewing", exact: true}).click();

    const scopeGroup = page.getByRole("group", {name: "Timer scope"});

    await page.getByRole("button", {name: "Start timer"}).click();
    await page.waitForTimeout(1000);
    await scopeGroup.getByRole("button", {name: "Phase", exact: true}).click();

    await page.getByRole("button", {name: "Pause timer"}).click();
    // a pause much longer than the running time on either side of it
    await page.waitForTimeout(6000);
    await page.getByRole("button", {name: "Start timer"}).click();
    await page.waitForTimeout(1000);

    const phaseValue = parseElapsed((await page.getByRole("timer", {name: "Elapsed time"}).textContent()) ?? "");

    await scopeGroup.getByRole("button", {name: "Global", exact: true}).click();
    const globalValue = parseElapsed((await page.getByRole("timer", {name: "Elapsed time"}).textContent()) ?? "");

    // Global carries the whole ~8s stretch including the pause; Phase excluded it —
    // the gap must sit close to the pause length, never near zero
    expect(globalValue - phaseValue).toBeGreaterThan(3);
});

// BREW-TIMER-08: completing the active phase while Phase is displayed re-anchors both
// the counter and the markers to the newly current phase, which only ever shows the
// phase that's active right now. Global shows only a start and a complete stamp per
// phase that's begun — a milestone logged on the finished phase never appears there,
// compacted or otherwise.
test("completing a phase while Phase is displayed re-anchors its markers to the new phase", async ({page}) => {
    await brewBatchFromKbRecipe(page, "E2E Timer Scope Complete Batch");
    await page.getByRole("tab", {name: "Brewing", exact: true}).click();

    const scopeGroup = page.getByRole("group", {name: "Timer scope"});
    const readingMarker = page.getByRole("button", {name: /^Reading at \d{2}:\d{2}:\d{2}$/});

    await page.getByRole("button", {name: "Start timer"}).click();
    await page.waitForTimeout(1000);

    // log a milestone on Mash (defaults: Gravity kind, current phase)
    await page.getByRole("button", {name: "Quick actions"}).click();
    let dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await dialog.getByRole("button", {name: "Confirm"}).click();
    await expect(dialog).not.toBeVisible();
    // Global (the default scope) never shows an individual reading marker
    await expect(readingMarker).toHaveCount(0);

    await scopeGroup.getByRole("button", {name: "Phase", exact: true}).click();
    // still on Mash, so its own reading marker shows in Phase scope
    await expect(readingMarker).toBeVisible();

    await page.getByRole("button", {name: "Complete 1. Mash"}).click();
    dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await dialog.getByRole("button", {name: "Confirm"}).click();
    await expect(dialog).not.toBeVisible();
    await settleSave(page);

    // now on Boil: Phase re-anchors and Mash's own marker drops off it
    await expect(readingMarker).toHaveCount(0);

    await scopeGroup.getByRole("button", {name: "Global", exact: true}).click();
    // Global drops the individual reading marker entirely, and shows Mash's compacted
    // start and complete stamps instead — both share the same "1. Mash at HH:MM:SS" name
    // (kind isn't part of the accessible name), so two of them is the assertion
    await expect(readingMarker).toHaveCount(0);
    await expect(page.getByRole("button", {name: /^1\. Mash at \d{2}:\d{2}:\d{2}$/})).toHaveCount(2);

    await scopeGroup.getByRole("button", {name: "Phase", exact: true}).click();
    // completing Mash paused the timer (BATCH-SCHEDULE-14); Boil's own phase-relative
    // clock stays at zero — and plots no markers at all — until it's resumed
    await page.getByRole("button", {name: "Start timer"}).click();
    await page.waitForTimeout(1000);
    await page.getByRole("button", {name: "Quick actions"}).click();
    dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await dialog.getByRole("button", {name: "Confirm"}).click();
    await expect(dialog).not.toBeVisible();

    // a fresh reading logged on Boil while Phase is active shows — and it's the only
    // one, because Mash's earlier reading is still scoped out
    await expect(readingMarker).toHaveCount(1);
});

// BREW-TIMER-09 (reading only — ingredient/equipment check-offs record no timestamp
// yet, see #699): a reading logged while Phase is active lands at its phase-relative
// offset, on Phase's own timeline — and never plots in Global at all, which shows only
// the phase-level start/complete stamps from BREW-TIMER-08.
test("a reading logged while Phase is active lands at its phase-relative offset", async ({page}) => {
    await brewBatchFromKbRecipe(page, "E2E Timer Scope Offset Batch");
    await page.getByRole("tab", {name: "Brewing", exact: true}).click();

    const scopeGroup = page.getByRole("group", {name: "Timer scope"});
    const readingMarker = /^Reading at \d{2}:\d{2}:\d{2}$/;

    await page.getByRole("button", {name: "Start timer"}).click();
    // build up session time before Boil's own phase clock starts, so a phase-relative
    // offset and a session-relative one for the same reading can't coincide by chance
    await page.waitForTimeout(2000);

    await page.getByRole("button", {name: "Complete 1. Mash"}).click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await dialog.getByRole("button", {name: "Confirm"}).click();
    await expect(dialog).not.toBeVisible();
    await settleSave(page);

    // completing Mash paused the timer (BATCH-SCHEDULE-14) — resume it so Boil's own
    // phase-relative clock has elapsed time to plot the coming reading against
    await page.getByRole("button", {name: "Start timer"}).click();
    await scopeGroup.getByRole("button", {name: "Phase", exact: true}).click();
    await page.waitForTimeout(1000);

    await page.getByRole("button", {name: "Quick actions"}).click();
    const readingDialog = page.getByRole("dialog");
    await expect(readingDialog).toBeVisible();
    await readingDialog.getByRole("button", {name: "Confirm"}).click();
    await expect(readingDialog).not.toBeVisible();
    await expect(page.getByRole("button", {name: readingMarker})).toBeVisible();

    const phaseOffset = await markerOffsetSeconds(page, readingMarker);
    // logged partway into Boil's own phase clock, not at its very start
    expect(phaseOffset).toBeGreaterThan(0);

    await scopeGroup.getByRole("button", {name: "Global", exact: true}).click();
    // the reading itself never plots on Global's timeline — only the phase-level
    // start/complete stamps do (BREW-TIMER-08/09)
    await expect(page.getByRole("button", {name: readingMarker})).toHaveCount(0);
});

// BREW-TIMER-08: Global shows one start stamp and one complete stamp per phase that has
// begun, and nothing at all for one that hasn't.
test("Global shows a phase's start stamp once it begins, a complete stamp once it's completed, and nothing before that", async ({page}) => {
    await brewBatchFromKbRecipe(page, "E2E Global Stamps Batch");
    await page.getByRole("tab", {name: "Brewing", exact: true}).click();

    const scopeGroup = page.getByRole("group", {name: "Timer scope"});
    const mashStamp = page.getByRole("button", {name: /^1\. Mash at \d{2}:\d{2}:\d{2}$/});
    const boilStamp = page.getByRole("button", {name: /^2\. Boil at \d{2}:\d{2}:\d{2}$/});

    await scopeGroup.getByRole("button", {name: "Global", exact: true}).click();
    // the timer hasn't started, so Mash — the current phase — hasn't begun either
    await expect(mashStamp).toHaveCount(0);

    await page.getByRole("button", {name: "Start timer"}).click();
    await page.waitForTimeout(1000);

    // Mash has begun: one stamp, its start. Boil hasn't been reached yet: none.
    await expect(mashStamp).toHaveCount(1);
    await expect(boilStamp).toHaveCount(0);

    await page.getByRole("button", {name: "Complete 1. Mash"}).click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await dialog.getByRole("button", {name: "Confirm"}).click();
    await expect(dialog).not.toBeVisible();
    await settleSave(page);

    // Mash is complete: both its stamps now show. Boil is the new current phase, so its
    // own start stamp appears too, though it hasn't been completed yet.
    await expect(mashStamp).toHaveCount(2);
    await expect(boilStamp).toHaveCount(1);
});

// BREW-TIMER-08/09: a hop addition places a marker on Phase's own timeline (like a
// reading) but, same as a reading, never plots on Global's — which shows only the
// phase-level stamps.
test("a hop addition logged while Phase is active never plots on Global's timeline", async ({page}) => {
    await brewBatchFromKbRecipe(page, "E2E Global No Hop Marker Batch");
    await page.getByRole("tab", {name: "Brewing", exact: true}).click();

    await page.getByRole("button", {name: "Start timer"}).click();
    await page.waitForTimeout(1000);

    await page.getByRole("button", {name: "Complete 1. Mash"}).click();
    let dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await dialog.getByRole("button", {name: "Confirm"}).click();
    await expect(dialog).not.toBeVisible();
    await settleSave(page);

    // completing Mash paused the timer (BATCH-SCHEDULE-14) — resume it so Boil's own
    // phase-relative clock has elapsed time to plot the coming hop addition against
    await page.getByRole("button", {name: "Start timer"}).click();
    await page.waitForTimeout(1000);

    // log Boil's first hop addition (preselected, per BATCH-SCHEDULE-10/-11)
    await page.getByRole("button", {name: "Quick actions"}).click();
    dialog = page.getByRole("dialog").filter({hasText: "Quick action"});
    await dialog.getByRole("tab", {name: "Ingredients"}).click();
    await dialog.getByRole("button", {name: "Confirm"}).click();
    await expect(dialog).not.toBeVisible();
    await settleSave(page);

    const hopMarker = page.getByRole("button", {name: /Northern Brewer/});
    const scopeGroup = page.getByRole("group", {name: "Timer scope"});
    await scopeGroup.getByRole("button", {name: "Phase", exact: true}).click();
    // sanity check: the addition really was logged, on Phase's own timeline
    await expect(hopMarker).toBeVisible();

    await scopeGroup.getByRole("button", {name: "Global", exact: true}).click();
    await expect(hopMarker).toHaveCount(0);
});

// BATCH-SCHEDULE-14: confirming a phase complete, while the timer is running, stops it.
test("confirming a phase complete pauses a running timer", async ({page}) => {
    await brewBatchFromKbRecipe(page, "E2E Complete Pauses Timer Batch");
    await page.getByRole("tab", {name: "Brewing", exact: true}).click();

    await page.getByRole("button", {name: "Start timer"}).click();
    await page.waitForTimeout(1000);

    await page.getByRole("button", {name: "Complete 1. Mash"}).click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await dialog.getByRole("button", {name: "Confirm"}).click();
    await expect(dialog).not.toBeVisible();
    await settleSave(page);

    await expect(page.getByRole("button", {name: "Start timer"})).toBeVisible();
    const frozenValue = await page.getByRole("timer", {name: "Elapsed time"}).textContent();

    // genuinely paused, not just a stale UI read: the counter must not move further
    await page.waitForTimeout(1500);
    await expect(page.getByRole("timer", {name: "Elapsed time"})).toHaveText(frozenValue ?? "");
});

// BATCH-SCHEDULE-14: "If the timer was already paused, or the session had not been started at
// all, completing the phase changes nothing about the timer: it stays exactly as it was."
test("confirming a phase complete leaves an already-paused or not-yet-started timer untouched", async ({page}) => {
    await brewBatchFromKbRecipe(page, "E2E Complete Timer Untouched Batch");
    await page.getByRole("tab", {name: "Brewing", exact: true}).click();

    // never started
    await expect(page.getByRole("button", {name: "Start timer"})).toBeVisible();
    await page.getByRole("button", {name: "Complete 1. Mash"}).click();
    let dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await dialog.getByRole("button", {name: "Confirm"}).click();
    await expect(dialog).not.toBeVisible();
    await settleSave(page);

    await expect(page.getByRole("button", {name: "Start timer"})).toBeVisible();
    await expect(page.getByRole("timer", {name: "Elapsed time"})).toHaveText("00:00:00");

    // already paused
    await page.getByRole("button", {name: "Start timer"}).click();
    await page.waitForTimeout(1000);
    await page.getByRole("button", {name: "Pause timer"}).click();
    await expect(page.getByRole("button", {name: "Start timer"})).toBeVisible();
    const frozenValue = await page.getByRole("timer", {name: "Elapsed time"}).textContent();

    await page.getByRole("button", {name: "Complete 2. Boil"}).click();
    dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await dialog.getByRole("button", {name: "Confirm"}).click();
    await expect(dialog).not.toBeVisible();
    await settleSave(page);

    await expect(page.getByRole("button", {name: "Start timer"})).toBeVisible();
    await expect(page.getByRole("timer", {name: "Elapsed time"})).toHaveText(frozenValue ?? "");
});
