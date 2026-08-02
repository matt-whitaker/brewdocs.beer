import {expect, Page, test} from "@playwright/test";

/**
 * Persistence coverage for `batch.shopping` — the only persisted derivation
 * left in the app. `cost`/`purchased` are user-owned; `_updateShopping`
 * re-attaches them to a rebuilt list by a `tag:name` key (not `id`), so every
 * test here is shaped edit -> reload -> assert per batch-edit.spec.ts, and the
 * "Planning edit rebuilds the list" case is the one that actually exercises
 * that re-attachment machinery.
 */

// A fresh context has no batches, so each test brews its own (mirrors
// batch-detail.spec.ts / batch-edit.spec.ts).
async function brewBatchFromKbRecipe(page: Page, batchName: string) {
    await page.goto("/kb/recipe/anchor-steam-beer-clone");
    await page.getByRole("button", {name: "Brew"}).click();

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await dialog.getByLabel(/Batch name/).fill(batchName);
    await dialog.getByRole("button", {name: "Confirm"}).click();

    await expect(page).toHaveURL(/\/batch\//);
}

// See batch-edit.spec.ts's settleSave: bounded by the known 350ms
// useJsonEdit debounce plus one IndexedDB write, not a guess.
async function settleSave(page: Page) {
    await page.waitForTimeout(1000);
}

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
    await brewBatchFromKbRecipe(page, "E2E Shopping Persist Batch");
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
    await brewBatchFromKbRecipe(page, "E2E Shopping Rebuild Batch");
    await openShopping(page);

    // settleSave between these two: an immediate (checkbox) and a debounced
    // (cost) save race each other with no gap — see the reported finding on
    // the test above. Isolating it here keeps this test about the rebuild
    // reuse-by-reference path, not that separate bug.
    await purchasedCheckbox(page, "Crystal Malt 40L").check();
    await settleSave(page);
    await page.getByLabel("Crystal Malt 40L cost").fill("8.00");
    await page.getByLabel("Crystal Malt 40L cost").blur();
    await settleSave(page);

    // this is the reuse-by-reference path: the derived scalar changes (a new
    // weight), so _updateShopping can't just hand back the previous object by
    // reference — it has to merge the refreshed fields onto it and keep cost/purchased
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
    await brewBatchFromKbRecipe(page, "E2E Shopping Removal Batch");
    await openShopping(page);

    // settleSave between each checkbox/cost pair — see the reported finding
    // on the reload-persistence test above; this test is about removal, not
    // that race.
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
    await brewBatchFromKbRecipe(page, "E2E Shopping Collision Batch");
    await openShopping(page);

    // settleSave between these two — see the reported finding on the
    // reload-persistence test above; this test is about the name-key
    // collision, not that race.
    await page.getByLabel("Irish Moss", {exact: true}).check();
    await settleSave(page);
    await page.getByLabel("Irish Moss cost").fill("5.00");
    await page.getByLabel("Irish Moss cost").blur();
    await settleSave(page);

    await openIngredients(page);
    await page.getByLabel("Ingredient for 2. Boil").selectOption("additive");
    await page.getByPlaceholder("Additive name").fill("Irish Moss");
    await page.getByRole("button", {name: "Add ingredient to 2. Boil"}).click();
    await settleSave(page);

    await page.reload();
    await openShopping(page);

    await expect(page.getByLabel("Irish Moss", {exact: true})).toHaveCount(1);
    await expect(page.getByLabel("Irish Moss", {exact: true})).toBeChecked();
    await expect(page.getByLabel("Irish Moss cost")).toHaveValue(/5\.00/);
});
