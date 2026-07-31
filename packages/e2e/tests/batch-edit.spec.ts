import {expect, Page, test} from "@playwright/test";

/**
 * Persistence coverage for the brew-day editing flows.
 *
 * The rest of the suite is navigation-only — it proves screens *render*. These
 * tests prove they *save*, which is the gap that let two silent write-loss bugs
 * through: in both, the UI showed the change, the write threw inside a
 * fire-and-forget save, and lint/tsc/build stayed green. Every test here is
 * shaped **edit → reload → assert**, because only the reload catches that.
 */

// A fresh context has no batches, so each test brews its own (mirrors
// batch-detail.spec.ts). Tests stay independent at the cost of a few seconds each.
async function brewBatchFromKbRecipe(page: Page, batchName: string) {
    await page.goto("/kb/recipe/anchor-steam-beer-clone");
    await page.getByRole("button", {name: "Brew"}).click();

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await dialog.getByLabel(/Batch name/).fill(batchName);
    await dialog.getByRole("button", {name: "Confirm"}).click();

    await expect(page).toHaveURL(/\/batch\//);
}

/**
 * Let an edit reach IndexedDB before reloading.
 *
 * ⚠️ Load-bearing, not a flake patch. Saves are **fire-and-forget**: typed edits
 * debounce 350ms through `useJsonEdit` before calling `updateBatch`, and even the
 * "immediate" paths (checkoffs, add-rows) hand off to an async write nothing
 * awaits. Reloading straight after an edit therefore races the write and reads
 * back the pre-edit value — which is exactly what happens without this, and what
 * made the first CI run fail three of these tests.
 *
 * The interval is bounded by that known 350ms debounce plus one IndexedDB write,
 * so this waits for a fixed cost rather than papering over a race.
 */
async function settleSave(page: Page) {
    await page.waitForTimeout(1000);
}

/** open a batch tab, then one of the Schedule screen's per-phase sub-tabs */
async function openSchedulePhase(page: Page, phase: string) {
    await page.getByRole("tab", {name: "Schedule", exact: true}).click();
    await page.getByRole("tab", {name: phase, exact: true}).click();
    await expect(page.getByRole("tab", {name: phase, exact: true})).toHaveAttribute("aria-selected", "true");
}

test("records as-brewed values without overwriting the plan", async ({page}) => {
    await brewBatchFromKbRecipe(page, "E2E Actuals Batch");
    await openSchedulePhase(page, "2. Boil");

    // the recipe ships three Northern Brewer additions; act on the first
    const weight = page.getByLabel("Northern Brewer weight").first();
    const boil = page.getByLabel("Northern Brewer boil").first();

    await expect(weight).toHaveValue("1.0oz");
    await expect(boil).toHaveValue("60min");

    // two separate patches into the same tracker entry — the second must not
    // clobber the first (putEntry merges `resource` a level deeper for this)
    await weight.fill("1.25");
    await weight.blur();
    await boil.fill("45");
    await boil.blur();

    await settleSave(page);
    await page.reload();
    await openSchedulePhase(page, "2. Boil");

    // both survived the round-trip, and both are on the same row
    await expect(page.getByLabel("Northern Brewer weight").first()).toHaveValue(/1\.25/);
    await expect(page.getByLabel("Northern Brewer boil").first()).toHaveValue(/45/);

    // The drift note is rendered from the *plan* (`ScheduleItem.resource`), so its
    // presence is the assertion that the brewable was never written over — if the
    // brew-day edit had mutated the plan, plan and actual would agree and no note
    // would show at all.
    await expect(page.getByText("plan 1.0oz")).toBeVisible();
    await expect(page.getByText("plan 60min")).toBeVisible();
});

test("keeps equipment and ingredient checkoffs after a reload", async ({page}) => {
    await brewBatchFromKbRecipe(page, "E2E Checkoff Batch");
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
    await brewBatchFromKbRecipe(page, "E2E Gravity Batch");
    // ferment starts with no readings at all — nothing is seeded
    await openSchedulePhase(page, "3. Ferment");

    await page.getByRole("button", {name: "Add reading"}).click();

    // a new milestone defaults to the label "Reading", which names its inputs
    const reading = page.getByLabel("Reading reading");
    await expect(reading).toBeVisible();
    await reading.fill("1.012");
    await reading.blur();

    await settleSave(page);
    await page.reload();
    await openSchedulePhase(page, "3. Ferment");

    await expect(page.getByLabel("Reading reading")).toHaveValue(/1\.012/);
});

test("a second phase of the same type gets its own tab and its own ingredients", async ({page}) => {
    await brewBatchFromKbRecipe(page, "E2E Phase Split Batch");

    // add a second Boil in Planning -> Phases
    await page.getByRole("tab", {name: "Planning", exact: true}).click();
    await page.getByRole("tab", {name: "Phases", exact: true}).click();
    await page.getByLabel("Phase type to add").selectOption("boil");
    await page.getByRole("button", {name: "Add phase"}).click();

    // it becomes its own Schedule tab — never merged into the existing Boil
    await page.getByRole("tab", {name: "Schedule", exact: true}).click();
    const secondBoil = page.getByRole("tab", {name: "4. Boil", exact: true});
    await expect(secondBoil).toBeVisible();
    // ...and starts empty, so the switcher renders it as a disabled tab
    await expect(secondBoil).toBeDisabled();

    // give it an ingredient of its own (the add-row needs a selection first)
    await page.getByRole("tab", {name: "Planning", exact: true}).click();
    await page.getByRole("tab", {name: "Ingredients", exact: true}).click();
    await page.getByLabel("Ingredient for 4. Boil").selectOption("hop:Cascade");
    await page.getByRole("button", {name: "Add ingredient to 4. Boil"}).click();

    await settleSave(page);
    await page.reload();
    await openSchedulePhase(page, "4. Boil");

    // the new phase holds only what was added to it, and the original Boil keeps
    // its three Northern Brewers — the whole point of phase *instances*
    await expect(page.getByLabel("Cascade weight")).toBeVisible();
    await expect(page.getByLabel("Northern Brewer weight")).toHaveCount(0);

    await page.getByRole("tab", {name: "2. Boil", exact: true}).click();
    await expect(page.getByLabel("Northern Brewer weight")).toHaveCount(3);
    await expect(page.getByLabel("Cascade weight")).toHaveCount(0);
});
