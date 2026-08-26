import {expect, Page, test} from "@playwright/test";
import {seedBatch} from "./seedBatch";
import {settleSave} from "./settleSave";

/**
 * Persistence coverage for `batch.shopping` — the only persisted derivation
 * left in the app. `cost`/`purchased` are user-owned; `_updateShopping`
 * re-attaches them to a rebuilt list by a `tag:name` key (not `id`), so every
 * test here is shaped edit -> reload -> assert per batch-edit.spec.ts, and the
 * "Planning edit rebuilds the list" case is the one that actually exercises
 * that re-attachment machinery.
 */

async function openShopping(page: Page) {
    await page.getByRole("tab", {name: "Shopping", exact: true}).click();
    await expect(page.getByRole("tab", {name: "Shopping", exact: true})).toHaveAttribute("aria-selected", "true");
}

async function openIngredients(page: Page) {
    await page.getByRole("tab", {name: "Planning", exact: true}).click();
    await page.getByRole("tab", {name: "Ingredients", exact: true}).click();
}

// The shopping row's "purchased" checkbox is labelled by its wrapping
// <label>'s full text, which is the item's name plus " - <scalar>" for a
// weighed item — anchored so it doesn't also match that row's own "<name>
// cost" input, whose accessible name shares the name as a prefix.
function purchasedCheckbox(page: Page, name: string) {
    return page.getByLabel(new RegExp(`^${name}(?: - .*)?$`));
}

/**
 * FINDING, not a flaky test — left failing on purpose (see the PR/issue for
 * detail). Checking `purchased` fires an *immediate* save (`toggle`, in
 * useJsonEdit.ts); typing `cost` fires a *debounced* one 350ms later. Both are
 * independent, unserialized `updateBatch` calls against the same stored batch
 * (a plain `{...current, ...patch}` read-then-write, updateBatch.ts:17), and
 * `saveBatch` (state/batches.ts:33-37) invalidates the batch query on every
 * save, so each save's own refetch can race the other's in-flight write.
 * Reproduced deterministically (~4/5 runs, both edit orderings) with
 * `--repeat-each=5 --retries=0` — one edit is silently dropped on reload.
 * This is exactly the class of bug this suite exists to catch, and it's out
 * of Tester scope to fix (`packages/app` beyond an `aria-label` is off
 * limits) — reported instead.
 */
test("keeps a shopping item's cost and purchased state after a reload", async ({page}) => {
    await seedBatch(page, {name: "E2E Shopping Persist Batch"});
    await openShopping(page);

    const purchased = purchasedCheckbox(page, "Crystal Malt 40L");
    const cost = page.getByLabel("Crystal Malt 40L cost");

    await expect(purchased).not.toBeChecked();
    await purchased.check();
    await cost.fill("12.50");
    await cost.blur();

    await settleSave(page);
    await page.reload();
    await openShopping(page);

    await expect(purchasedCheckbox(page, "Crystal Malt 40L")).toBeChecked();
    await expect(page.getByLabel("Crystal Malt 40L cost")).toHaveValue(/12\.50/);
});

test("keeps cost and purchased after a Planning edit rebuilds the shopping list", async ({page}) => {
    await seedBatch(page, {name: "E2E Shopping Rebuild Batch"});
    await openShopping(page);

    await purchasedCheckbox(page, "Crystal Malt 40L").check();
    await settleSave(page);
    await page.getByLabel("Crystal Malt 40L cost").fill("8.00");
    await page.getByLabel("Crystal Malt 40L cost").blur();
    await settleSave(page);

    await openIngredients(page);
    const weight = page.getByLabel("Crystal Malt 40L weight");
    await weight.fill("2.0");
    await weight.blur();
    await settleSave(page);

    await page.reload();
    await openShopping(page);

    await expect(purchasedCheckbox(page, "Crystal Malt 40L")).toBeChecked();
    await expect(page.getByLabel("Crystal Malt 40L cost")).toHaveValue(/8\.00/);
});

test("removing an ingredient in Planning drops its shopping row without disturbing the others", async ({page}) => {
    await seedBatch(page, {name: "E2E Shopping Removal Batch"});
    await openShopping(page);

    await purchasedCheckbox(page, "Crystal Malt 40L").check();
    await settleSave(page);
    await page.getByLabel("Crystal Malt 40L cost").fill("8.00");
    await page.getByLabel("Crystal Malt 40L cost").blur();
    await settleSave(page);

    await purchasedCheckbox(page, "Special Robust").check();
    await settleSave(page);
    await page.getByLabel("Special Robust cost").fill("3.25");
    await page.getByLabel("Special Robust cost").blur();
    await settleSave(page);

    await openIngredients(page);
    await page.getByRole("button", {name: "Remove Special Robust"}).click();
    await settleSave(page);

    await page.reload();
    await openShopping(page);

    await expect(purchasedCheckbox(page, "Special Robust")).toHaveCount(0);
    await expect(purchasedCheckbox(page, "Crystal Malt 40L")).toBeChecked();
    await expect(page.getByLabel("Crystal Malt 40L cost")).toHaveValue(/8\.00/);
});

/**
 * `itemKey` re-attaches by `tags[0]:name`, not `id` — the trade `_updateShopping`
 * makes on purpose because it aggregates across assignments. `named()` dedupes
 * same-tag same-name additives into a single row, so a second additive typed
 * with an existing row's name is this repo's real collision case: the new
 * assignment contributes no separate row, and the original's cost/purchased
 * must not be duplicated or dropped in the merge.
 */
test("a freeform additive that collides with an existing row's name keeps that row's cost and purchased state", async ({page}) => {
    await seedBatch(page, {name: "E2E Shopping Collision Batch"});
    await openShopping(page);

    await page.getByLabel("Irish Moss", {exact: true}).check();
    await settleSave(page);
    await page.getByLabel("Irish Moss cost").fill("5.00");
    await page.getByLabel("Irish Moss cost").blur();
    await settleSave(page);

    await openIngredients(page);
    await page.getByLabel("Additive for 2. Boil").fill("Irish Moss");
    await page.getByRole("button", {name: "Add additive to 2. Boil"}).click();
    await settleSave(page);

    await page.reload();
    await openShopping(page);

    await expect(page.getByLabel("Irish Moss", {exact: true})).toHaveCount(1);
    await expect(page.getByLabel("Irish Moss", {exact: true})).toBeChecked();
    await expect(page.getByLabel("Irish Moss cost")).toHaveValue(/5\.00/);
});

/**
 * BATCH-SHOPPING-10/11 — the add-row offers no category picker; a hand-added
 * item whose name doesn't match anything already on the list gets its own
 * "Misc" group, which only exists once it holds a row.
 */
test("a hand-added item with no matching name lands in its own Misc group", async ({page}) => {
    await seedBatch(page, {name: "E2E Shopping Misc Default Batch"});
    await openShopping(page);

    await expect(page.getByLabel("New shopping item type")).toHaveCount(0);
    await expect(page.getByRole("button", {name: "Misc", exact: true})).toHaveCount(0);

    await page.getByLabel("New shopping item").fill("Duct Tape");
    await page.getByRole("button", {name: "Add shopping item"}).click();
    await settleSave(page);

    await page.reload();
    await openShopping(page);

    await expect(page.getByRole("button", {name: "Misc", exact: true})).toBeVisible();
    await expect(purchasedCheckbox(page, "Duct Tape")).toBeVisible();
});

/**
 * BATCH-SHOPPING-12 — a hand-added item whose name matches (case-insensitive,
 * trimmed) an item already on the list under Hops/Grains/Yeasts/Additives
 * joins that item's group instead of Misc.
 */
test("a hand-added item whose name matches an existing row joins that row's group, not Misc", async ({page}) => {
    await seedBatch(page, {name: "E2E Shopping Match Route Batch"});
    await openShopping(page);

    await page.getByLabel("New shopping item").fill("  crystal malt 40l  ");
    await page.getByRole("button", {name: "Add shopping item"}).click();
    await settleSave(page);

    await page.reload();
    await openShopping(page);

    await expect(page.getByRole("button", {name: "Misc", exact: true})).toHaveCount(0);
    await expect(page.getByRole("button", {name: "Grains", exact: true})).toBeVisible();
    await expect(purchasedCheckbox(page, "crystal malt 40l")).toBeVisible();
    await expect(purchasedCheckbox(page, "Crystal Malt 40L")).toBeVisible();
});
