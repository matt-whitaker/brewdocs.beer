import {expect, Page, test} from "@playwright/test";

// packages/spec/product/search.md is the source for every case here — never
// the implementation. Behaviour ids are cited per test.

async function settleSave(page: Page) {
    await page.waitForTimeout(1000);
}

async function createRecipeFromTemplate(page: Page, name: string, template: string) {
    await page.goto("/recipes");
    await page.getByRole("tab", {name: "My Recipes"}).click();
    await page.getByRole("button", {name: "Create"}).click();

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await dialog.getByLabel(/Recipe name/).fill(name);
    await dialog.getByLabel(/Template/).selectOption(template);
    await dialog.getByRole("button", {name: "Confirm"}).click();

    await expect(page).toHaveURL(/\/recipe\/.+\/edit/);
}

async function brewBatchFromKbRecipe(page: Page, batchName: string) {
    await page.goto("/kb/recipe/anchor-steam-beer-clone");
    await page.getByRole("button", {name: "Brew"}).click();

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await dialog.getByLabel(/Batch name/).fill(batchName);
    await dialog.getByRole("button", {name: "Confirm"}).click();

    await expect(page).toHaveURL(/\/batch\//);
}

// The "Brewed on" date input (screen/batch-schedule/index.tsx) carries no
// label/aria-label, so it has no accessible name — addressed mechanically by
// its type, which is unique on the mounted Prep panel (PanelSwitcher unmounts
// every other tab).
async function setBrewDate(page: Page, date: string) {
    await page.getByRole("tab", {name: "Brewing", exact: true}).click();
    await page.getByRole("tab", {name: "Prep", exact: true}).click();
    await expect(page.getByRole("tab", {name: "Prep", exact: true})).toHaveAttribute("aria-selected", "true");

    await page.locator("input[type=\"date\"]").fill(date);
    await settleSave(page);
}

// #1124: "/" always shows the everywhere-search box now, no gate required —
// no tabs alongside it, and no accessible name beyond its own placeholder.
test("/ with no query param shows the everywhere-search box, with no tabs", async ({page}) => {
    await page.goto("/");

    await expect(page.getByRole("heading", {name: "Welcome back!"})).toHaveCount(0);
    await expect(page.getByRole("textbox", {name: "What are you looking for?"})).toBeVisible();
    await expect(page.getByRole("tab")).toHaveCount(0);
});

// #1124: the old gate param is now inert rather than rejected or erroring —
// dropping validateSearch changes how the router treats an unknown search key.
test("/?search=everywhere still resolves and renders the same screen", async ({page}) => {
    await page.goto("/?search=everywhere");

    await expect(page.getByRole("heading", {name: "Welcome back!"})).toHaveCount(0);
    await expect(page.getByRole("textbox", {name: "What are you looking for?"})).toBeVisible();
    await expect(page.getByRole("tab")).toHaveCount(0);
});

// SEARCH-08: an empty box shows nothing below it — not a stray results list,
// not a no-match message.
test("an empty query shows no results and no no-match message", async ({page}) => {
    await page.goto("/");

    await expect(page.getByText("Nothing found.")).toHaveCount(0);
    await expect(page.locator(".hero-content").getByRole("listitem")).toHaveCount(0);
});

// SEARCH-09 + SEARCH-03: a no-match query says so, distinctly from the empty
// state, and clearing the box returns to that empty state.
test("a no-match query shows a message, and clearing the box returns to the empty state", async ({page}) => {
    await page.goto("/");

    const search = page.getByRole("textbox", {name: "What are you looking for?"});
    await search.fill("zzznosuchbrewingtermzzz");
    await expect(page.getByText("Nothing found.")).toBeVisible();

    await search.fill("");
    await expect(page.getByText("Nothing found.")).toHaveCount(0);
    await expect(page.locator(".hero-content").getByRole("listitem")).toHaveCount(0);
});

// SEARCH-04 + SEARCH-05: a case-insensitive, mid-word substring match on a kb
// entity's own name returns a card that navigates to that entity's own page.
test("a title match on a kb hop links to that hop's own page", async ({page}) => {
    await page.goto("/");

    const search = page.getByRole("textbox", {name: "What are you looking for?"});
    await search.fill("imco"); // mid-word, wrong case relative to "Simcoe"

    const results = page.locator(".hero-content");
    const row = results.getByRole("listitem").filter({hasText: "Simcoe"});
    await expect(row).toBeVisible();

    await row.getByRole("link").click();

    await expect(page).toHaveURL(/\/kb\/hop\/simcoe$/);
    await expect(page.locator(".breadcrumbs").getByText("Simcoe")).toBeVisible();
    await expect(page.getByText("Origin: United States")).toBeVisible();
});

// SEARCH-04: the same holds for a user-owned entity, on a differently-shaped route.
test("a title match on a user recipe links to that recipe's own page", async ({page}) => {
    await createRecipeFromTemplate(page, "E2E Everywhere Search Nav Recipe", "Empty");
    await settleSave(page);

    await page.goto("/");
    const search = page.getByRole("textbox", {name: "What are you looking for?"});
    await search.fill("Everywhere Search Nav");

    const results = page.locator(".hero-content");
    const row = results.getByRole("listitem").filter({hasText: "E2E Everywhere Search Nav Recipe"});
    await expect(row).toBeVisible();

    await row.getByRole("link").click();

    await expect(page).toHaveURL(/\/recipe\/[^/]+$/);
    await expect(page.getByRole("heading", {name: "E2E Everywhere Search Nav Recipe"})).toBeVisible();
});

// SEARCH-06 + SEARCH-07: a query that matches one entity by its own name and a
// different, unrelated-named entity only through a hop it contains returns
// both, with the title match listed first. Exact intra-tier order is out of
// scope (issue #1119) — only that title precedes ingredient-only.
test("a title match on a hop ranks before a recipe that only contains it", async ({page}) => {
    await createRecipeFromTemplate(page, "E2E Everywhere Search Ranked Recipe", "Empty");
    await page.getByRole("tab", {name: "Ingredients", exact: true}).click();
    await page.getByLabel("Hops for 2. Boil").selectOption("Cascade");
    await page.getByRole("button", {name: "Add hop to 2. Boil"}).click();
    await settleSave(page);

    await page.goto("/");
    const search = page.getByRole("textbox", {name: "What are you looking for?"});
    await search.fill("cascade");

    const results = page.locator(".hero-content");
    const hopRow = results.getByRole("listitem").filter({hasText: "Cascade"});
    const recipeRow = results.getByRole("listitem").filter({hasText: "E2E Everywhere Search Ranked Recipe"});
    await expect(hopRow).toBeVisible();
    await expect(recipeRow).toBeVisible();

    const rowTexts = await results.getByRole("listitem").allTextContents();
    const hopIndex = rowTexts.findIndex(t => t.includes("Cascade") && !t.includes("Ranked Recipe"));
    const recipeIndex = rowTexts.findIndex(t => t.includes("Ranked Recipe"));
    expect(hopIndex).toBeGreaterThanOrEqual(0);
    expect(recipeIndex).toBeGreaterThan(hopIndex);
});

// From #1117/#1118's handoff: the drawer wordmark is reachable as a link named
// "BrewDocs" and lands on /.
test("the BrewDocs wordmark navigates to /", async ({page}) => {
    await page.goto("/disclaimer");

    await page.getByRole("link", {name: "BrewDocs"}).click();

    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByRole("textbox", {name: "What are you looking for?"})).toBeVisible();
});

// SEARCH-10 + SEARCH-03: with the box empty, only a batch that has actually
// been brewed shows under "Recent batches" — a created-but-undated batch
// (brewDate defaults to "") does not — and typing replaces the list with
// search results. Regression test for the recentBatches() bug fixed in
// 95b4843, where every batch was included regardless of brewDate. Written to
// discriminate rather than assert absence alone: per the Implementor's #1123
// handoff, a bare toHaveCount(0) can pass before the suspense-backed list
// renders and would pass against the bug too.
test("recent batches shows only a brewed batch, and typing replaces it with results", async ({page}) => {
    await brewBatchFromKbRecipe(page, "E2E Recent Batch Dated");
    await setBrewDate(page, "2026-01-05");

    await brewBatchFromKbRecipe(page, "E2E Recent Batch Undated");

    await page.goto("/");

    await expect(page.getByRole("heading", {name: "Recent batches"})).toBeVisible();
    const tiles = page.locator(".hero-content").getByRole("listitem");
    await expect(tiles).toHaveCount(1);
    await expect(tiles.filter({hasText: "E2E Recent Batch Dated"})).toBeVisible();
    await expect(page.getByText("E2E Recent Batch Undated")).toHaveCount(0);

    const search = page.getByRole("textbox", {name: "What are you looking for?"});
    await search.fill("zzznosuchbrewingtermzzz");

    await expect(page.getByRole("heading", {name: "Recent batches"})).toHaveCount(0);
    await expect(page.getByText("Nothing found.")).toBeVisible();
});
