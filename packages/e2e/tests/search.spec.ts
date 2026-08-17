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

// SEARCH-01: visiting "/" on its own is unaffected by this story at all.
test("/ with no query param still shows the unchanged welcome hero", async ({page}) => {
    await page.goto("/");

    await expect(page.getByRole("heading", {name: "Welcome back!"})).toBeVisible();
    await expect(page.getByRole("textbox", {name: "What are you looking for?"})).toHaveCount(0);
});

// SEARCH-02: the gate replaces the hero with a single centered search box —
// no tabs alongside it, and no accessible name beyond its own placeholder.
test("/?search=everywhere shows only the search box, with no tabs", async ({page}) => {
    await page.goto("/?search=everywhere");

    await expect(page.getByRole("heading", {name: "Welcome back!"})).toHaveCount(0);
    await expect(page.getByRole("textbox", {name: "What are you looking for?"})).toBeVisible();
    await expect(page.getByRole("tab")).toHaveCount(0);
});

// SEARCH-08: an empty box shows nothing below it — not a stray results list,
// not a no-match message.
test("an empty query shows no results and no no-match message", async ({page}) => {
    await page.goto("/?search=everywhere");

    await expect(page.getByText("Nothing found.")).toHaveCount(0);
    await expect(page.locator(".hero-content").getByRole("listitem")).toHaveCount(0);
});

// SEARCH-09 + SEARCH-03: a no-match query says so, distinctly from the empty
// state, and clearing the box returns to that empty state.
test("a no-match query shows a message, and clearing the box returns to the empty state", async ({page}) => {
    await page.goto("/?search=everywhere");

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
    await page.goto("/?search=everywhere");

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

    await page.goto("/?search=everywhere");
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

    await page.goto("/?search=everywhere");
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
    await expect(page.getByRole("heading", {name: "Welcome back!"})).toBeVisible();
});
