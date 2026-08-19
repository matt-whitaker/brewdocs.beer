import {expect, Page, test} from "@playwright/test";
import {seedBatch} from "./seedBatch";
import {settleSave} from "./settleSave";

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

async function setBrewDate(page: Page, date: string) {
    await page.getByRole("tab", {name: "Brewing", exact: true}).click();
    await page.getByRole("tab", {name: "Prep", exact: true}).click();
    await expect(page.getByRole("tab", {name: "Prep", exact: true})).toHaveAttribute("aria-selected", "true");

    await page.locator("input[type=\"date\"]").fill(date);
    await settleSave(page);
}

test("/ with no query param shows the everywhere-search box, with no tabs", async ({page}) => {
    await page.goto("/");

    await expect(page.getByRole("heading", {name: "Welcome back!"})).toHaveCount(0);
    await expect(page.getByRole("textbox", {name: "What are you looking for?"})).toBeVisible();
    await expect(page.getByRole("tab")).toHaveCount(0);
});

test("/?search=everywhere still resolves and renders the same screen", async ({page}) => {
    await page.goto("/?search=everywhere");

    await expect(page.getByRole("heading", {name: "Welcome back!"})).toHaveCount(0);
    await expect(page.getByRole("textbox", {name: "What are you looking for?"})).toBeVisible();
    await expect(page.getByRole("tab")).toHaveCount(0);
});

test("an empty query shows no results and no no-match message", async ({page}) => {
    await page.goto("/");

    await expect(page.getByText("Nothing found.")).toHaveCount(0);
    await expect(page.locator(".hero-content").getByRole("listitem")).toHaveCount(0);
});

test("a no-match query shows a message, and clearing the box returns to the empty state", async ({page}) => {
    await page.goto("/");

    const search = page.getByRole("textbox", {name: "What are you looking for?"});
    await search.fill("zzznosuchbrewingtermzzz");
    await expect(page.getByText("Nothing found.")).toBeVisible();

    await search.fill("");
    await expect(page.getByText("Nothing found.")).toHaveCount(0);
    await expect(page.locator(".hero-content").getByRole("listitem")).toHaveCount(0);
});

test("a title match on a kb hop links to that hop's own page", async ({page}) => {
    await page.goto("/");

    const search = page.getByRole("textbox", {name: "What are you looking for?"});
    await search.fill("imco");

    const results = page.locator(".hero-content");
    const row = results.getByRole("listitem").filter({hasText: "Simcoe"});
    await expect(row).toBeVisible();

    await row.getByRole("link").click();

    await expect(page).toHaveURL(/\/kb\/hop\/simcoe$/);
    await expect(page.locator(".breadcrumbs").getByText("Simcoe")).toBeVisible();
    await expect(page.getByText("Origin: United States")).toBeVisible();
});

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

test("the BrewDocs wordmark navigates to /", async ({page}) => {
    await page.goto("/disclaimer");

    await page.getByRole("link", {name: "BrewDocs"}).click();

    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByRole("textbox", {name: "What are you looking for?"})).toBeVisible();
});

test("recent batches shows only a brewed batch, and typing replaces it with results", async ({page}) => {
    await seedBatch(page, {name: "E2E Recent Batch Dated"});
    await setBrewDate(page, "2026-01-05");

    await seedBatch(page, {name: "E2E Recent Batch Undated"});

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
