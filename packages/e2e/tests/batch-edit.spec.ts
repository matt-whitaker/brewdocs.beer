import {expect, Page, test} from "@playwright/test";
import {seedBatch} from "./seedBatch";
import {settleSave} from "./settleSave";

/**
 * Persistence coverage for the brew-day editing flows.
 *
 * The rest of the suite is navigation-only — it proves screens *render*. These
 * tests prove they *save*, which is the gap that let two silent write-loss bugs
 * through: in both, the UI showed the change, the write threw inside a
 * fire-and-forget save, and lint/tsc/build stayed green. Every test here is
 * shaped **edit → reload → assert**, because only the reload catches that.
 */

/** open a batch tab, then one of the Schedule screen's per-phase sub-tabs */
async function openSchedulePhase(page: Page, phase: string) {
    await page.getByRole("tab", {name: "Brewing", exact: true}).click();
    await page.getByRole("tab", {name: phase, exact: true}).click();
    await expect(page.getByRole("tab", {name: phase, exact: true})).toHaveAttribute("aria-selected", "true");
}

test("records as-brewed values without overwriting the plan", async ({page}) => {
    await seedBatch(page, {name: "E2E Actuals Batch"});
    await openSchedulePhase(page, "2. Boil");

    const weight = page.getByLabel("Northern Brewer weight").first();
    const boil = page.getByLabel("Northern Brewer boil").first();

    await expect(weight).toHaveValue("1.0oz");
    await expect(boil).toHaveValue("60min");

    await weight.fill("1.25");
    await weight.blur();
    await boil.fill("45");
    await boil.blur();

    await settleSave(page);
    await page.reload();
    await openSchedulePhase(page, "2. Boil");

    await expect(page.getByLabel("Northern Brewer weight").first()).toHaveValue(/1\.25/);
    await expect(page.getByLabel("Northern Brewer boil").first()).toHaveValue(/45/);

    await expect(page.getByText("plan 1.0oz")).toBeVisible();
    await expect(page.getByText("plan 60min")).toBeVisible();
});

// BATCH-SCHEDULE-15 (packages/spec/product/batch-schedule.md): the Brewing
// schedule offers an additive's weight as a plan/actual field the same way it
// already does for a grain's or hop's weight — mirroring the grain/hop actuals
// test above, but for an additive added fresh in Planning first.
test("records an actual weight against a planned additive without overwriting the plan", async ({page}) => {
    await seedBatch(page, {name: "E2E Additive Actual Batch"});

    await page.getByRole("tab", {name: "Planning", exact: true}).click();
    await page.getByRole("tab", {name: "Ingredients", exact: true}).click();
    await page.getByLabel("Additive for 2. Boil").fill("Irish Moss");
    await page.getByRole("button", {name: "Add additive to 2. Boil"}).click();
    await settleSave(page);

    await openSchedulePhase(page, "2. Boil");

    const weight = page.getByLabel("Irish Moss weight");
    await expect(weight).toBeVisible();
    await expect(weight).toHaveValue("1.0oz");

    await weight.fill("0.75");
    await weight.blur();

    await settleSave(page);
    await page.reload();
    await openSchedulePhase(page, "2. Boil");

    await expect(page.getByLabel("Irish Moss weight")).toHaveValue(/0\.75/);
    await expect(page.getByText("plan 1.0oz")).toBeVisible();
});

test("keeps equipment and ingredient checkoffs after a reload", async ({page}) => {
    await seedBatch(page, {name: "E2E Checkoff Batch"});
    await openSchedulePhase(page, "1. Mash");

    const equipment = page.getByLabel("Mash Tun - 10gal");
    const ingredient = page.getByLabel("German Pils", {exact: true});

    await expect(equipment).not.toBeChecked();
    await expect(ingredient).not.toBeChecked();

    await equipment.check();
    await ingredient.check();

    await settleSave(page);
    await page.reload();
    await openSchedulePhase(page, "1. Mash");

    await expect(page.getByLabel("Mash Tun - 10gal")).toBeChecked();
    await expect(page.getByLabel("German Pils", {exact: true})).toBeChecked();
});

test("adds a gravity reading on a phase and persists its value", async ({page}) => {
    await seedBatch(page, {name: "E2E Gravity Batch"});

    await openSchedulePhase(page, "3. Ferment");

    await page.getByRole("button", {name: "Add reading"}).click();

    const reading = page.getByLabel("Reading reading");
    await expect(reading).toBeVisible();
    await reading.fill("1.012");
    await reading.blur();

    await settleSave(page);
    await page.reload();
    await openSchedulePhase(page, "3. Ferment");

    await expect(page.getByLabel("Reading reading")).toHaveValue(/1\.012/);
});

test("adds a volume reading on a phase and persists its value", async ({page}) => {
    await seedBatch(page, {name: "E2E Volume Batch"});
    await openSchedulePhase(page, "2. Boil");

    await page.getByRole("button", {name: "Add volume reading"}).click();

    const reading = page.getByLabel("Volume reading", {exact: true});
    await expect(reading).toBeVisible();
    await reading.fill("5.5");
    await reading.blur();

    await settleSave(page);
    await page.reload();
    await openSchedulePhase(page, "2. Boil");

    await expect(page.getByLabel("Volume reading", {exact: true})).toHaveValue(/5\.5/);
});

test("adds a temperature reading on a phase and persists its value", async ({page}) => {
    await seedBatch(page, {name: "E2E Temperature Batch"});
    await openSchedulePhase(page, "1. Mash");

    await page.getByRole("button", {name: "Add temperature reading"}).click();

    const reading = page.getByLabel("Temperature reading", {exact: true});
    await expect(reading).toBeVisible();
    await reading.fill("152");
    await reading.blur();

    await settleSave(page);
    await page.reload();
    await openSchedulePhase(page, "1. Mash");

    await expect(page.getByLabel("Temperature reading", {exact: true})).toHaveValue(/152/);
});

test("gravity, volume and temperature readings coexist on the same phase without colliding", async ({page}) => {
    await seedBatch(page, {name: "E2E Coexist Batch"});
    await openSchedulePhase(page, "3. Ferment");

    await page.getByRole("button", {name: "Add reading"}).click();
    await page.getByRole("button", {name: "Add volume reading"}).click();
    await page.getByRole("button", {name: "Add temperature reading"}).click();

    const gravity = page.getByLabel("Reading reading");
    const volume = page.getByLabel("Volume reading", {exact: true});
    const temperature = page.getByLabel("Temperature reading", {exact: true});
    await expect(gravity).toBeVisible();
    await expect(volume).toBeVisible();
    await expect(temperature).toBeVisible();

    await gravity.fill("1.050");
    await gravity.blur();
    await volume.fill("6");
    await volume.blur();
    await temperature.fill("68");
    await temperature.blur();

    await settleSave(page);
    await page.reload();
    await openSchedulePhase(page, "3. Ferment");

    await expect(page.getByLabel("Reading reading")).toHaveValue(/1\.05/);
    await expect(page.getByLabel("Volume reading", {exact: true})).toHaveValue(/6/);
    await expect(page.getByLabel("Temperature reading", {exact: true})).toHaveValue(/68/);
});

test("a second phase of the same type gets its own tab and its own ingredients", async ({page}) => {
    await seedBatch(page, {name: "E2E Phase Split Batch"});

    await page.getByRole("tab", {name: "Planning", exact: true}).click();
    await page.getByRole("tab", {name: "Phases", exact: true}).click();
    await page.getByLabel("Phase type to add").selectOption("boil");
    await page.getByRole("button", {name: "Add phase"}).click();

    await page.getByRole("tab", {name: "Brewing", exact: true}).click();
    const secondBoil = page.getByRole("tab", {name: "4. Boil", exact: true});
    await expect(secondBoil).toBeVisible();

    await expect(secondBoil).toBeDisabled();

    await page.getByRole("tab", {name: "Planning", exact: true}).click();
    await page.getByRole("tab", {name: "Ingredients", exact: true}).click();
    await page.getByLabel("Hops for 4. Boil").selectOption("Cascade");
    await page.getByRole("button", {name: "Add hop to 4. Boil"}).click();

    await settleSave(page);
    await page.reload();
    await openSchedulePhase(page, "4. Boil");

    await expect(page.getByLabel("Cascade weight")).toBeVisible();
    await expect(page.getByLabel("Northern Brewer weight")).toHaveCount(0);

    await page.getByRole("tab", {name: "2. Boil", exact: true}).click();
    await expect(page.getByLabel("Northern Brewer weight")).toHaveCount(3);
    await expect(page.getByLabel("Cascade weight")).toHaveCount(0);
});

/**
 * The add-row is scoped to its phase, not its subsection — a phase with more
 * than one subsection (2. Boil ships both Hops and Additives) has only one add
 * row, rendered after the last one. Scoping the assertion to the Hops group
 * (phase-section.tsx wraps each resourceType in its own DOM group) is what
 * actually proves the new hop joined Hops rather than merely existing
 * somewhere on the page.
 */
test("adds a hop to a phase that also has additives, and it persists under Hops", async ({page}) => {
    await seedBatch(page, {name: "E2E Hops Subsection Batch"});

    await page.getByRole("tab", {name: "Planning", exact: true}).click();
    await page.getByRole("tab", {name: "Ingredients", exact: true}).click();

    await page.getByLabel("Hops for 2. Boil").selectOption("Cascade");
    await page.getByRole("button", {name: "Add hop to 2. Boil"}).click();
    await expect(page.getByLabel("Cascade weight")).toBeVisible();

    await settleSave(page);
    await page.reload();
    await page.getByRole("tab", {name: "Planning", exact: true}).click();
    await page.getByRole("tab", {name: "Ingredients", exact: true}).click();

    const hopsGroup = page.getByText("Hops", {exact: true}).locator("xpath=..");
    await expect(hopsGroup.getByLabel("Cascade weight")).toBeVisible();
    await expect(hopsGroup.getByLabel("Northern Brewer weight")).toHaveCount(3);
    await expect(hopsGroup.getByText("Irish Moss")).toHaveCount(0);
});

test("adds a water sample on the Mash phase and persists bundled parameters", async ({page}) => {
    await seedBatch(page, {name: "E2E Water Batch"});
    await openSchedulePhase(page, "1. Mash");

    await page.getByRole("button", {name: "Add water sample"}).click();
    await page.getByRole("button", {name: "Show Water Sample parameters"}).click();

    const calcium = page.getByLabel("Water Sample Calcium");
    await calcium.fill("50");
    await calcium.blur();

    const sulfate = page.getByLabel("Water Sample Sulfate");
    await sulfate.fill("100");
    await sulfate.blur();

    await settleSave(page);
    await page.reload();
    await openSchedulePhase(page, "1. Mash");
    await page.getByRole("button", {name: "Show Water Sample parameters"}).click();

    await expect(page.getByLabel("Water Sample Calcium")).toHaveValue(/50ppm/);
    await expect(page.getByLabel("Water Sample Sulfate")).toHaveValue(/100ppm/);
});

test("keeps Water Chemistry scoped to the Mash phase", async ({page}) => {
    await seedBatch(page, {name: "E2E Water Gating Batch"});

    await openSchedulePhase(page, "1. Mash");
    await expect(page.getByRole("button", {name: "Water Chemistry"})).toBeVisible();

    await openSchedulePhase(page, "2. Boil");
    await expect(page.getByRole("button", {name: "Water Chemistry"})).toHaveCount(0);

    await openSchedulePhase(page, "3. Ferment");
    await expect(page.getByRole("button", {name: "Water Chemistry"})).toHaveCount(0);
});

test("completes the Mash phase, advances the current phase, and keeps its water sample", async ({page}) => {
    await seedBatch(page, {name: "E2E Complete Phase Batch"});
    await openSchedulePhase(page, "1. Mash");

    await page.getByRole("button", {name: "Add water sample"}).click();
    await page.getByRole("button", {name: "Show Water Sample parameters"}).click();
    const calcium = page.getByLabel("Water Sample Calcium");
    await calcium.fill("60");
    await calcium.blur();
    await settleSave(page);

    await page.getByRole("button", {name: "Complete 1. Mash"}).click();
    await page.getByRole("dialog").getByRole("button", {name: "Confirm"}).click();
    await settleSave(page);

    await page.reload();
    await openSchedulePhase(page, "1. Mash");

    await expect(page.getByRole("button", {name: "Complete 1. Mash"})).toHaveCount(0);
    await page.getByRole("button", {name: "Show Water Sample parameters"}).click();
    await expect(page.getByLabel("Water Sample Calcium")).toHaveValue(/60ppm/);

    await openSchedulePhase(page, "2. Boil");
    await expect(page.getByRole("button", {name: "Complete 2. Boil"})).toBeVisible();
});

test("keeps a batch note and SRM value after a reload", async ({page}) => {
    await seedBatch(page, {name: "E2E Notes Batch"});

    await openSchedulePhase(page, "Notes");

    const notes = page.getByRole("textbox", {name: "Notes"});
    const srm = page.getByRole("textbox", {name: "SRM"});
    await expect(notes).toHaveValue("");
    await expect(srm).toHaveValue("0");

    await srm.fill("9");
    await srm.blur();
    await notes.fill("Fermentation smelled great, slightly fruity.");
    await notes.blur();

    await settleSave(page);
    await page.reload();
    await openSchedulePhase(page, "Notes");

    await expect(page.getByRole("textbox", {name: "SRM"})).toHaveValue("9");
    await expect(page.getByRole("textbox", {name: "Notes"})).toHaveValue("Fermentation smelled great, slightly fruity.");
});

// SrmTag is `aria-hidden` with no text, so locate it structurally like
// batch-summary.spec.ts's srmRow — the Notes tab's only .data-grid has the SRM row
test("shows an SRM colour swatch on the Notes tab only for a parseable value", async ({page}) => {
    await seedBatch(page, {name: "E2E Notes SRM Swatch Batch"});
    await openSchedulePhase(page, "Notes");

    const srm = page.getByRole("textbox", {name: "SRM"});
    const swatch = page.locator(".data-grid").filter({hasText: "SRM"}).locator("span.rounded-full");
    await expect(swatch).toHaveCount(0);

    await srm.fill("12");
    await expect(swatch).toBeVisible();

    await srm.fill("abc");
    await expect(swatch).toHaveCount(0);

    await srm.fill("0");
    await expect(swatch).toBeVisible();

    await srm.fill("");
    await expect(swatch).toHaveCount(0);
});

/**
 * The brew timer is a *global* view, so a phase completion has to reach it. Two
 * separate things have to hold for that, and each failed independently while this
 * was being built: the completion must record **when** it happened
 * (`TrackerEntry.date`), and the timer's marker derivation must look at phase
 * entries at all, not only at milestones. Asserting on the rendered marker covers
 * both — a missing date and an unread entry are indistinguishable from the UI.
 */
test("completing a phase puts a marker on the brew timer's live timeline", async ({page}) => {
    await seedBatch(page, {name: "E2E Timer Marker Batch"});
    await openSchedulePhase(page, "1. Mash");

    await page.getByRole("button", {name: "Start timer"}).click();
    await settleSave(page);

    const mashMarkers = page.getByRole("button", {name: /^1\. Mash at /});

    await expect(mashMarkers).toHaveCount(1);
    await page.getByRole("button", {name: "Complete 1. Mash"}).click();
    await page.getByRole("dialog").getByRole("button", {name: "Confirm"}).click();
    await settleSave(page);

    await expect(mashMarkers).toHaveCount(2);
});

/**
 * DaisyUI's `.tabs` is `flex-wrap: wrap`, so before `flex-nowrap` the compact bar
 * silently grew a second row at five phases (72px at a 390px viewport) instead of
 * overflowing. Height is the assertion because that is the actual cost — and a
 * scrolling bar is only an improvement if a scrolled-away tab still comes back,
 * hence the second half.
 */
test("the phase tab bar stays one row on a phone and keeps every tab reachable", async ({page}) => {
    await page.setViewportSize({width: 390, height: 844});
    await seedBatch(page, {name: "E2E Tab Scroll Batch"});

    for (let i = 0; i < 4; i++) {
        await page.getByRole("tab", {name: "Planning", exact: true}).click();
        await page.getByRole("tab", {name: "Phases", exact: true}).click();
        await page.getByLabel("Phase type to add").selectOption("boil");
        await page.getByRole("button", {name: "Add phase"}).click();
        await settleSave(page);
    }

    await page.getByRole("tab", {name: "Brewing", exact: true}).click();

    const bar = page.locator('[role="tablist"]:visible').last();
    await expect(bar).toHaveCount(1);
    expect(await bar.evaluate(el => el.getBoundingClientRect().height)).toBeLessThan(56);
    expect(await bar.evaluate(el => el.scrollWidth > el.clientWidth)).toBe(true);

    const notes = page.getByRole("tab", {name: "Notes", exact: true});
    await notes.click();
    await expect(notes).toHaveAttribute("aria-selected", "true");
    await expect(notes).toBeInViewport();

    await bar.evaluate(el => { el.scrollLeft = 0; });
    await page.waitForTimeout(600);
    expect(await bar.evaluate(el => el.scrollLeft)).toBe(0);
});

/**
 * Creating a reading writes two things — the Milestone on the brewable and its value
 * in the tracker — and `useJsonEdit` assigns `stateRef.current` during render, not in
 * the setter. Two successive calls therefore read the same stale draft and the second
 * overwrites the first, so this has to be one `mutate`. Asserting after a reload is
 * what catches that: on screen the lost write looks identical to a saved one.
 */
test("creates a reading with its name and value in one action", async ({page}) => {
    await seedBatch(page, {name: "E2E Reading Create Batch"});
    await openSchedulePhase(page, "1. Mash");

    await page.getByLabel("Gravity name to add").fill("Pre-boil");
    await page.getByLabel("Gravity value to add").fill("1.048");
    await page.getByRole("button", {name: "Add reading"}).click();
    await settleSave(page);

    await page.reload();
    await openSchedulePhase(page, "1. Mash");

    await expect(page.getByLabel("Pre-boil name")).toHaveValue("Pre-boil");
    await expect(page.getByLabel("Pre-boil reading")).toHaveValue(/1\.048/);
});

test("quick reading records against the current phase, and offers water parameters", async ({page}) => {
    await seedBatch(page, {name: "E2E Quick Reading Batch"});
    await openSchedulePhase(page, "1. Mash");
    await page.getByRole("button", {name: "Start timer"}).click();
    await settleSave(page);

    await page.getByRole("button", {name: "Quick actions"}).click();
    const modal = page.getByRole("dialog");

    await expect(modal.getByText("Recording on 1. Mash")).toBeVisible();
    await expect(modal.getByLabel("Reading phase")).toHaveCount(0);

    await modal.getByLabel("Reading kind").selectOption("water");
    await expect(modal.getByLabel("Reading measurement")).toBeVisible();
    await modal.getByLabel("Reading measurement").selectOption({label: "Calcium"});
    await modal.getByLabel("Reading value").fill("60");
    await modal.getByRole("button", {name: "Confirm"}).click();
    await settleSave(page);

    await page.reload();
    await openSchedulePhase(page, "1. Mash");

    await page.getByRole("button", {name: "Show Water Sample parameters"}).click();
    await expect(page.getByLabel("Water Sample Calcium")).toHaveValue(/60/);
});

/**
 * The recipe's three Boil hops all share the name "Northern Brewer" — their
 * `aria-label`s are identical, so this discriminates them by weight instead
 * (1.0oz/0.75oz/1.0oz). Asserting the exact surviving pair, not just a count
 * of two, is what would catch an off-by-one `remove(dot, index)` bug: removing
 * a neighbour instead still leaves two rows, just with the wrong weights.
 */
test("removes the middle of three ingredients and keeps the other two", async ({page}) => {
    await seedBatch(page, {name: "E2E Remove Ingredient Batch"});
    await page.getByRole("tab", {name: "Planning", exact: true}).click();
    await page.getByRole("tab", {name: "Ingredients", exact: true}).click();

    const weights = page.getByLabel("Northern Brewer weight");
    await expect(weights).toHaveCount(3);
    await expect(weights.nth(0)).toHaveValue("1.0oz");
    await expect(weights.nth(1)).toHaveValue("0.75oz");
    await expect(weights.nth(2)).toHaveValue("1.0oz");

    await page.getByLabel("Remove Northern Brewer").nth(1).click();
    await settleSave(page);
    await page.reload();
    await page.getByRole("tab", {name: "Planning", exact: true}).click();
    await page.getByRole("tab", {name: "Ingredients", exact: true}).click();

    const survivors = page.getByLabel("Northern Brewer weight");
    await expect(survivors).toHaveCount(2);
    await expect(survivors.nth(0)).toHaveValue("1.0oz");
    await expect(survivors.nth(1)).toHaveValue("1.0oz");
});

test("adds and removes equipment on a phase, persisting each change", async ({page}) => {
    await seedBatch(page, {name: "E2E Equipment Batch"});
    await page.getByRole("tab", {name: "Planning", exact: true}).click();
    await page.getByRole("tab", {name: "Equipment", exact: true}).click();

    const mashSection = page.getByRole("button", {name: "1. Mash", exact: true}).locator("xpath=..");
    await mashSection.getByRole("combobox").last().selectOption("CO2");
    await mashSection.getByRole("button", {name: "Add equipment to 1. Mash"}).click();

    await settleSave(page);
    await page.reload();
    await page.getByRole("tab", {name: "Planning", exact: true}).click();
    await page.getByRole("tab", {name: "Equipment", exact: true}).click();

    const removeCo2 = page.getByRole("button", {name: "Remove CO2 from 1. Mash"});
    await expect(removeCo2).toBeVisible();

    await removeCo2.click();
    await settleSave(page);
    await page.reload();
    await page.getByRole("tab", {name: "Planning", exact: true}).click();
    await page.getByRole("tab", {name: "Equipment", exact: true}).click();

    await expect(page.getByRole("button", {name: "Remove CO2 from 1. Mash"})).toHaveCount(0);
});

// EQUIPMENT-01 (packages/spec/product/equipment.md): a note is saved exactly as
// typed, with no interpretation — non-numeric text is what distinguishes this
// from the retired `count` field, which ran input through `Number()`.
test("types a freeform note on an equipment row, persisting it across a reload", async ({page}) => {
    await seedBatch(page, {name: "E2E Equipment Notes Batch"});
    await page.getByRole("tab", {name: "Planning", exact: true}).click();
    await page.getByRole("tab", {name: "Equipment", exact: true}).click();

    const mashSection = page.getByRole("button", {name: "1. Mash", exact: true}).locator("xpath=..");
    await mashSection.getByRole("combobox").last().selectOption("CO2");
    await mashSection.getByRole("button", {name: "Add equipment to 1. Mash"}).click();

    const co2Notes = page.getByRole("button", {name: "Remove CO2 from 1. Mash"}).locator("xpath=../..").getByRole("textbox");
    await co2Notes.fill("2 spare O-rings");

    await settleSave(page);
    await page.reload();
    await page.getByRole("tab", {name: "Planning", exact: true}).click();
    await page.getByRole("tab", {name: "Equipment", exact: true}).click();

    const reloadedCo2Notes = page.getByRole("button", {name: "Remove CO2 from 1. Mash"}).locator("xpath=../..").getByRole("textbox");
    await expect(reloadedCo2Notes).toHaveValue("2 spare O-rings");
});

// EQUIPMENT-02 (packages/spec/product/equipment.md): picking a catalog item
// seeds its own default note. "Keg (Coke) - 5.5gal" is the one catalog entry
// carrying a seeded value (data/equipment.ts). Also covers the implementor's
// testing note that clearing a note to empty persists as cleared, not as a
// stray stored value.
test("seeds an equipment row's note from the catalog default, and persists a clear", async ({page}) => {
    await seedBatch(page, {name: "E2E Equipment Catalog Notes Batch"});
    await page.getByRole("tab", {name: "Planning", exact: true}).click();
    await page.getByRole("tab", {name: "Equipment", exact: true}).click();

    const mashSection = page.getByRole("button", {name: "1. Mash", exact: true}).locator("xpath=..");
    await mashSection.getByRole("combobox").last().selectOption("Keg (Coke) - 5.5gal");
    await mashSection.getByRole("button", {name: "Add equipment to 1. Mash"}).click();

    const kegNotes = page.getByRole("button", {name: "Remove Keg (Coke) - 5.5gal from 1. Mash"}).locator("xpath=../..").getByRole("textbox");
    await expect(kegNotes).toHaveValue("4");

    await settleSave(page);
    await page.reload();
    await page.getByRole("tab", {name: "Planning", exact: true}).click();
    await page.getByRole("tab", {name: "Equipment", exact: true}).click();

    const reloadedKegNotes = page.getByRole("button", {name: "Remove Keg (Coke) - 5.5gal from 1. Mash"}).locator("xpath=../..").getByRole("textbox");
    await expect(reloadedKegNotes).toHaveValue("4");

    await reloadedKegNotes.fill("");
    await settleSave(page);
    await page.reload();
    await page.getByRole("tab", {name: "Planning", exact: true}).click();
    await page.getByRole("tab", {name: "Equipment", exact: true}).click();

    const clearedKegNotes = page.getByRole("button", {name: "Remove Keg (Coke) - 5.5gal from 1. Mash"}).locator("xpath=../..").getByRole("textbox");
    await expect(clearedKegNotes).toHaveValue("");
});

/**
 * A fresh batch's three phases (Mash/Boil/Ferment) are each the only instance
 * of a required type, so `canRemovePhase` should block every one of them.
 * ⚠️ It does so by omitting the remove button entirely, not by disabling it —
 * `disabled`/`title={lockedReason}` on this button is a *different* rule (a
 * batch that has already progressed), so there is no disabled control to read
 * a reason from here.
 */
test("keeps the last phase of a required type from being removed", async ({page}) => {
    await seedBatch(page, {name: "E2E Locked Phase Batch"});
    await page.getByRole("tab", {name: "Planning", exact: true}).click();
    await page.getByRole("tab", {name: "Phases", exact: true}).click();

    await expect(page.getByRole("button", {name: "Remove 1. Mash"})).toHaveCount(0);
    await expect(page.getByRole("button", {name: "Remove 2. Boil"})).toHaveCount(0);
    await expect(page.getByRole("button", {name: "Remove 3. Ferment"})).toHaveCount(0);

    await page.getByLabel("Phase type to add").selectOption("boil");
    await page.getByRole("button", {name: "Add phase"}).click();
    await settleSave(page);

    await expect(page.getByRole("button", {name: "Remove 2. Boil"})).toBeVisible();
    await expect(page.getByRole("button", {name: "Remove 4. Boil"})).toBeVisible();

    await page.getByRole("button", {name: "Remove 4. Boil"}).click();
    await settleSave(page);
    await expect(page.getByRole("button", {name: "Remove 2. Boil"})).toHaveCount(0);
});

test("removing a phase drops its own reading but leaves a sibling phase's reading untouched", async ({page}) => {
    await seedBatch(page, {name: "E2E Phase Prune Batch"});

    await openSchedulePhase(page, "2. Boil");
    await page.getByRole("button", {name: "Add reading"}).click();
    await page.getByLabel("Reading reading").fill("1.050");
    await page.getByLabel("Reading reading").blur();
    await settleSave(page);

    await page.getByRole("tab", {name: "Planning", exact: true}).click();
    await page.getByRole("tab", {name: "Phases", exact: true}).click();
    await page.getByLabel("Phase type to add").selectOption("boil");
    await page.getByRole("button", {name: "Add phase"}).click();
    await settleSave(page);

    await page.getByRole("tab", {name: "Equipment", exact: true}).click();
    const newBoilSection = page.getByRole("button", {name: "4. Boil", exact: true}).locator("xpath=..");
    await newBoilSection.getByRole("combobox").last().selectOption("CO2");
    await newBoilSection.getByRole("button", {name: "Add equipment to 4. Boil"}).click();
    await settleSave(page);

    await openSchedulePhase(page, "4. Boil");
    await page.getByRole("button", {name: "Add reading"}).click();
    await page.getByLabel("Reading reading").fill("1.045");
    await page.getByLabel("Reading reading").blur();
    await settleSave(page);

    await page.getByRole("tab", {name: "Planning", exact: true}).click();
    await page.getByRole("tab", {name: "Phases", exact: true}).click();
    await page.getByRole("button", {name: "Remove 4. Boil"}).click();
    await settleSave(page);
    await page.reload();

    await page.getByRole("tab", {name: "Brewing", exact: true}).click();
    await expect(page.getByRole("tab", {name: "4. Boil", exact: true})).toHaveCount(0);

    await openSchedulePhase(page, "2. Boil");
    await expect(page.getByLabel("Reading reading")).toHaveValue(/1\.05/);
});

test("reorders a phase, renumbering its label, and survives a reload", async ({page}) => {
    await seedBatch(page, {name: "E2E Reorder Batch"});

    await page.getByRole("tab", {name: "Planning", exact: true}).click();
    await page.getByRole("tab", {name: "Phases", exact: true}).click();
    await page.getByRole("button", {name: "Move 2. Boil up", exact: true}).click();
    await settleSave(page);

    await expect(page.getByText("1. Boil", {exact: true})).toBeVisible();
    await expect(page.getByText("2. Mash", {exact: true})).toBeVisible();

    await page.reload();
    await page.getByRole("tab", {name: "Planning", exact: true}).click();
    await page.getByRole("tab", {name: "Phases", exact: true}).click();
    await expect(page.getByText("1. Boil", {exact: true})).toBeVisible();
    await expect(page.getByText("2. Mash", {exact: true})).toBeVisible();
    await expect(page.getByText("3. Ferment", {exact: true})).toBeVisible();
});

/**
 * Planning's Equipment collapse state is meant to key off `phase.id`, not the
 * phase's position — see the app CLAUDE.md's Model-boundary notes on
 * BatchSchedule's id-keyed collapse. This is a **finding, not a spec to
 * accommodate** (see Out of scope): `equipment-phase-section.tsx`'s session
 * key is `` `recipe-edit.equipment.phase.${phase}` ``, where `phase` is the
 * numeric index passed from `equipment/index.tsx` — position-keyed, not
 * id-keyed. After the swap below, the section that was collapsed as "2. Boil"
 * renders **expanded** as "1. Boil", and the untouched Mash section — now at
 * the collapsed section's old index — renders collapsed instead.
 */
test("keeps Planning's collapsed equipment section on its own phase after a reorder", async ({page}) => {
    test.fail();
    await seedBatch(page, {name: "E2E Reorder Collapse Batch"});

    await page.getByRole("tab", {name: "Planning", exact: true}).click();
    await page.getByRole("tab", {name: "Equipment", exact: true}).click();
    const boilEquipmentHeader = page.getByRole("button", {name: "2. Boil", exact: true});
    await boilEquipmentHeader.click();
    await expect(boilEquipmentHeader).toHaveAttribute("aria-expanded", "false");

    await page.getByRole("tab", {name: "Phases", exact: true}).click();
    await page.getByRole("button", {name: "Move 2. Boil up", exact: true}).click();
    await settleSave(page);
    await page.reload();

    await page.getByRole("tab", {name: "Planning", exact: true}).click();
    await page.getByRole("tab", {name: "Equipment", exact: true}).click();

    await expect(page.getByRole("button", {name: "1. Boil", exact: true})).toHaveAttribute("aria-expanded", "false");
    await expect(page.getByRole("button", {name: "2. Mash", exact: true})).toHaveAttribute("aria-expanded", "true");
});

/**
 * The Brewing screen's active sub-tab is meant to key off `phase.id` too, but
 * `usePanelSwitcher` persists the panel's **title** string
 * (`schedule.tsx`: `PanelSwitcherContent title={phaseLabel(...)}`, matched
 * back via `props.title === active` in `panel-switcher/index.tsx`) — a
 * position-numbered label, not an id. This is a **finding, not a spec to
 * accommodate**: after the reorder below, the query still holds the old label
 * "2. Boil", no tab's title matches it any more, and the tab bar silently
 * shows no tab selected at all instead of following the phase.
 */
test("keeps the Brewing screen's active tab on the same phase after a reorder", async ({page}) => {
    test.fail();
    await seedBatch(page, {name: "E2E Reorder Active Tab Batch"});

    await openSchedulePhase(page, "2. Boil");
    await expect(page.getByRole("tab", {name: "2. Boil", exact: true})).toHaveAttribute("aria-selected", "true");

    await page.getByRole("tab", {name: "Planning", exact: true}).click();
    await page.getByRole("tab", {name: "Phases", exact: true}).click();
    await page.getByRole("button", {name: "Move 2. Boil up", exact: true}).click();
    await settleSave(page);

    await page.getByRole("tab", {name: "Brewing", exact: true}).click();
    await expect(page.getByRole("tab", {name: "1. Boil", exact: true})).toHaveAttribute("aria-selected", "true");
});

/**
 * A reading row's fields must not collide.
 *
 * ⚠️ This asserts *placement*, which is deliberately different from everything
 * above it. Every other test here fills a field and reads the value back, and
 * they all passed while these rows were visibly broken — the name and value
 * inputs overlapped by 65px and wrapped onto two lines, because `DataGridInput`
 * pinned itself to a value-side column and the name field was using it too.
 * A value assertion cannot see that; only geometry can.
 */
async function boxOf(page: Page, label: string) {
    const box = await page.getByLabel(label).boundingBox();
    if (!box) throw new Error(`no bounding box for "${label}"`);
    return box;
}

function overlaps(a: {x: number; y: number; width: number; height: number}, b: typeof a) {
    return a.x < b.x + b.width - 0.5 && b.x < a.x + a.width - 0.5
        && a.y < b.y + b.height - 0.5 && b.y < a.y + a.height - 0.5;
}

test("reading rows lay out without overlapping fields", async ({page}) => {
    await seedBatch(page, {name: "Reading layout"});
    await openSchedulePhase(page, "1. Mash");

    const addName = await boxOf(page, "Gravity name to add");
    const addValue = await boxOf(page, "Gravity value to add");
    expect(overlaps(addName, addValue), "add row: name and value overlap").toBe(false);
    expect(addName.x, "add row: name should start at the left of the grid").toBeLessThan(addValue.x);

    await page.getByRole("button", {name: "Add reading"}).click();
    await settleSave(page);

    const name = await boxOf(page, "Reading name");
    const value = await boxOf(page, "Reading reading");
    expect(overlaps(name, value), "item row: name and value overlap").toBe(false);
    expect(name.x, "item row: name should sit left of the value").toBeLessThan(value.x);

    expect(Math.abs(name.y - value.y), "item row: fields should share a line").toBeLessThan(name.height);
});

/**
 * Water Chemistry is the one reading kind with **no** value field — one row is
 * one water sample, and its seven parameters live behind the expander. That
 * makes it the case the test above cannot cover: with nothing to collide with,
 * a name field pinned to a value column looks fine until you notice it starts
 * halfway across the row.
 *
 * Asserts against the Gravity name field rather than a fixed x, so the two
 * grids are held to the same left edge without pinning the test to a layout
 * constant.
 */
test("the Water Chemistry name field starts at the same left edge as the other reading grids", async ({page}) => {
    await seedBatch(page, {name: "Water layout"});
    await openSchedulePhase(page, "1. Mash");

    const gravity = await boxOf(page, "Gravity name to add");
    const water = await boxOf(page, "Water Chemistry name to add");
    expect(water.x, "water add row should share the left edge of the other grids").toBeCloseTo(gravity.x, 0);

    await page.getByRole("button", {name: "Add water sample"}).click();
    await settleSave(page);

    const item = await boxOf(page, "Water Sample name");
    expect(item.x, "water item row should share that left edge").toBeCloseTo(gravity.x, 0);
});
