import { expect, Locator, Page, test } from "@playwright/test";
import {settleSave} from "./settleSave";

// RECIPE-LIST-04 (packages/spec/product/recipe-list.md): a bad recipe id returns the
// brewer to /recipes, with the page's normal navigation intact, instead of RootError.
// Holds for both the view route and the edit route.
test("a bad recipe id redirects to /recipes with the breadcrumb trail and tab bar intact", async ({ page }) => {
    await page.goto("/recipe/not-a-real-id");

    await expect(page).toHaveURL(/\/recipes$/);
    await expect(page.locator(".breadcrumbs").getByText("Recipes")).toBeVisible();
    await expect(page.getByRole("tab", { name: "All" })).toHaveAttribute("aria-selected", "true");
});

test("a bad recipe id on the edit route also redirects to /recipes", async ({ page }) => {
    await page.goto("/recipe/not-a-real-id/edit");

    await expect(page).toHaveURL(/\/recipes$/);
    await expect(page.locator(".breadcrumbs").getByText("Recipes")).toBeVisible();
    await expect(page.getByRole("tab", { name: "All" })).toHaveAttribute("aria-selected", "true");
});

test("recipes page defaults to the All tab, listing the kb catalog", async ({ page }) => {
    await page.goto("/recipes");
    await expect(page.getByRole("tab", { name: "All" })).toBeVisible();
    await expect(page.getByRole("tab", { name: "Starred" })).toBeVisible();
    await expect(page.getByRole("tab", { name: "My Recipes" })).toBeVisible();
    await expect(page.getByRole("tab", { name: "All" })).toHaveAttribute("aria-selected", "true");
    await expect(page.getByText("Anchor Steam Beer Clone")).toBeVisible();
});

test("My Recipes tab activates and shows the Create action with an empty list", async ({ page }) => {
    await page.goto("/recipes");
    await page.getByRole("tab", { name: "My Recipes" }).click();
    await expect(page.getByRole("tab", { name: "My Recipes" })).toHaveAttribute("aria-selected", "true");
    await expect(page.getByRole("button", { name: "Create" })).toBeVisible();
    await expect(page.getByText("Anchor Steam Beer Clone")).not.toBeVisible();
});

test("Create action opens the recipe-create modal, which closes on Close", async ({ page }) => {
    await page.goto("/recipes");
    await page.getByRole("tab", { name: "My Recipes" }).click();
    await page.getByRole("button", { name: "Create" }).click();

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole("heading", { name: "Create Recipe" })).toBeVisible();

    await dialog.getByRole("button", { name: "Close" }).click();
    await expect(dialog).not.toBeVisible();
});

/**
 * The two create paths are told apart by `__type` in `actions/createRecipe.ts`: a
 * `kbRecipeTemplate` seeds a default recipe with the template's brewable, anything
 * else goes through `kbRecipeToRecipe`. Routing a *template* down the KbRecipe path
 * produces a recipe with no `batchSize`/`targets`, and the Details panel — the edit
 * screen's default tab — reads `data.batchSize.value` and throws. So simply landing
 * on a rendered edit screen is the assertion that the branch was chosen correctly;
 * the equipment check then proves the template's brewable actually came through.
 */
async function createRecipeFromTemplate(page: Page, name: string, template: string) {
    await page.goto("/recipes");
    await page.getByRole("tab", { name: "My Recipes" }).click();
    await page.getByRole("button", { name: "Create" }).click();

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await dialog.getByLabel(/Recipe name/).fill(name);
    await dialog.getByLabel(/Template/).selectOption(template);
    await dialog.getByRole("button", { name: "Confirm" }).click();

    await expect(page).toHaveURL(/\/recipe\/.+\/edit/);
}

test("creating from a template applies its equipment and keeps the recipe defaults", async ({ page }) => {
    await createRecipeFromTemplate(page, "E2E Kettle Sour", "kettle-sour");

    await expect(page.getByRole("heading", { name: "E2E Kettle Sour" })).toBeVisible();
    await expect(page.getByText("Batch Size")).toBeVisible();

    await page.getByRole("tab", { name: "Equipment", exact: true }).click();
    await expect(page.getByRole("combobox").first()).toHaveValue("Mash Tun - 10gal");
});

test("boil phase shows each stored equipment item, even names outside the app catalog", async ({ page }) => {
    await createRecipeFromTemplate(page, "E2E Kettle Sour Boil", "kettle-sour");

    await page.getByRole("tab", { name: "Equipment", exact: true }).click();

    const boilSection = page.locator(".data-grid").filter({ has: page.getByRole("button", { name: "2. Boil" }) });
    const boilCombobox = boilSection.getByRole("combobox");
    await expect(boilCombobox.nth(0)).toHaveValue("Boil Kettle - 15gal");
    await expect(boilCombobox.nth(1)).toHaveValue("pH Meter");
    await expect(boilCombobox.nth(2)).toHaveValue("Souring Vessel Lid / Cover");
});

test("creating an empty recipe brings no template equipment", async ({ page }) => {
    await createRecipeFromTemplate(page, "E2E Empty Recipe", "Empty");

    await expect(page.getByRole("heading", { name: "E2E Empty Recipe" })).toBeVisible();

    await page.getByRole("tab", { name: "Equipment", exact: true }).click();
    await expect(page.getByRole("combobox")).toHaveCount(3);
});

test("kb recipes show no delete affordance", async ({ page }) => {
    await page.goto("/recipes");

    const row = page.getByRole("listitem").filter({ hasText: "Anchor Steam Beer Clone" });
    await expect(row).toBeVisible();
    await expect(row.getByRole("button")).toHaveCount(0);
});

// The confirm dialog is a top-layer <dialog>, so its box is measured straight against the
// viewport. Centred means equal margins on both axes; the width threshold is deliberately
// loose — it guards the ~185px shrink-wrapped regression (#591) without pinning to a pixel
// value that a wording change would break.
async function expectConfirmDialogCentred(page: Page) {
    const box = await page.getByRole("dialog").locator(".modal-box").boundingBox();
    if (!box) throw new Error("the confirm dialog has no bounding box");
    const size = page.viewportSize();
    if (!size) throw new Error("no viewport size");

    const left = box.x, right = size.width - (box.x + box.width);
    const top = box.y, bottom = size.height - (box.y + box.height);

    expect(Math.abs(left - right), `horizontally centred (left ${left}, right ${right})`).toBeLessThanOrEqual(2);
    expect(Math.abs(top - bottom), `vertically centred (top ${top}, bottom ${bottom})`).toBeLessThanOrEqual(2);
    expect(box.width, "wide enough not to be shrink-wrapped").toBeGreaterThan(400);
}

test("the recipe delete confirmation renders centred, not shrink-wrapped in a corner", async ({ page }) => {
    await createRecipeFromTemplate(page, "E2E Centred Confirm Recipe", "Empty");

    await page.goto("/recipes");
    await page.getByRole("tab", { name: "My Recipes" }).click();
    const row = page.getByRole("listitem").filter({ hasText: "E2E Centred Confirm Recipe" });
    await row.getByRole("button").click();
    await expect(page.getByRole("dialog")).toBeVisible();

    await expectConfirmDialogCentred(page);
});

test("deleting a user recipe removes it from the list and it stays gone after reload", async ({ page }) => {
    await createRecipeFromTemplate(page, "E2E Delete Recipe", "Empty");

    await page.goto("/recipes");
    await page.getByRole("tab", { name: "My Recipes" }).click();
    const row = page.getByRole("listitem").filter({ hasText: "E2E Delete Recipe" });
    await expect(row).toBeVisible();

    await row.getByRole("button").click();

    await expect(page).not.toHaveURL(/\/recipe\//);

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole("heading", { name: "Delete E2E Delete Recipe?" })).toBeVisible();

    await dialog.getByRole("button", { name: "Confirm" }).click();
    await expect(row).not.toBeVisible();

    await settleSave(page);
    await page.reload();
    await page.getByRole("tab", { name: "My Recipes" }).click();
    await expect(page.getByText("E2E Delete Recipe")).not.toBeVisible();
});

test("a user recipe's detail page is reached from the list and renders its stored values", async ({ page }) => {
    await createRecipeFromTemplate(page, "E2E Overview Recipe", "Empty");
    await page.getByLabel("Brewer").fill("E2E Overview Brewer");
    await settleSave(page);

    await page.goto("/recipes");
    await page.getByRole("tab", { name: "My Recipes" }).click();
    const row = page.getByRole("listitem").filter({ hasText: "E2E Overview Recipe" });
    await row.getByRole("heading", { name: "E2E Overview Recipe" }).click();

    await expect(page).toHaveURL(/\/recipe\/[^/]+$/);
    await expect(page.getByRole("heading", { name: "E2E Overview Recipe" })).toBeVisible();
    await expect(page.getByText("By E2E Overview Brewer")).toBeVisible();
    await expect(page.getByText("ABV 0.0% | IBUs 0 | O.G. 0.00°P | F.G. 0.00°P")).toBeVisible();

    await expect(page.getByRole("button", { name: "Brew" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Edit" })).toBeVisible();
});

// recipe names are also echoed into the (normally hidden) delete-confirm
// dialog's heading, so a bare getByText/getByRole("heading") is ambiguous —
// scope to the list row, as the delete tests above already do
function recipeRow(page: Page, name: string): Locator {
    return page.getByRole("listitem").filter({ hasText: name });
}

test("search filters the All tab to matching recipes and clearing restores the full list", async ({ page }) => {
    await createRecipeFromTemplate(page, "E2E Search All Tab", "Empty");

    await page.goto("/recipes");
    await expect(recipeRow(page, "Anchor Steam Beer Clone")).toBeVisible();
    await expect(recipeRow(page, "E2E Search All Tab")).toBeVisible();

    const search = page.getByLabel("Search recipes");
    await search.fill("Anchor");
    await expect(recipeRow(page, "Anchor Steam Beer Clone")).toBeVisible();
    await expect(recipeRow(page, "E2E Search All Tab")).not.toBeVisible();

    await search.fill("");
    await expect(recipeRow(page, "Anchor Steam Beer Clone")).toBeVisible();
    await expect(recipeRow(page, "E2E Search All Tab")).toBeVisible();
});

test("search filters the My Recipes tab to matching recipes and clearing restores the full list", async ({ page }) => {
    await createRecipeFromTemplate(page, "E2E Search Mine Alpha", "Empty");
    await createRecipeFromTemplate(page, "E2E Search Mine Beta", "Empty");

    await page.goto("/recipes");
    await page.getByRole("tab", { name: "My Recipes" }).click();
    await expect(recipeRow(page, "E2E Search Mine Alpha")).toBeVisible();
    await expect(recipeRow(page, "E2E Search Mine Beta")).toBeVisible();

    const search = page.getByLabel("Search recipes");
    await search.fill("Alpha");
    await expect(recipeRow(page, "E2E Search Mine Alpha")).toBeVisible();
    await expect(recipeRow(page, "E2E Search Mine Beta")).not.toBeVisible();

    await search.fill("");
    await expect(recipeRow(page, "E2E Search Mine Alpha")).toBeVisible();
    await expect(recipeRow(page, "E2E Search Mine Beta")).toBeVisible();
});

// The first two <li>s inside CardGrid's <ul class="grid">, in DOM order — CSS grid auto-flow
// guarantees they're adjacent regardless of how many other cards exist or what order the
// list renders in, unlike filtering by a specific card's name.
async function expectCardGridResponsive(page: Page) {
    const grid = page.locator("ul.grid");
    const cardOne = grid.getByRole("listitem").nth(0);
    const cardTwo = grid.getByRole("listitem").nth(1);
    await expect(cardTwo).toBeVisible();

    const desktopOne = await cardOne.boundingBox();
    const desktopTwo = await cardTwo.boundingBox();
    if (!desktopOne || !desktopTwo) throw new Error("a card has no bounding box");
    expect(Math.abs(desktopOne.y - desktopTwo.y), "cards share a row at desktop width").toBeLessThanOrEqual(2);
    expect(Math.abs(desktopOne.x - desktopTwo.x), "cards sit in different columns at desktop width").toBeGreaterThan(100);

    await page.setViewportSize({ width: 390, height: 844 });
    const mobileOne = await cardOne.boundingBox();
    const mobileTwo = await cardTwo.boundingBox();
    if (!mobileOne || !mobileTwo) throw new Error("a card has no bounding box");
    expect(Math.abs(mobileOne.x - mobileTwo.x), "cards share a column at phone width").toBeLessThanOrEqual(2);
    expect(Math.abs(mobileOne.y - mobileTwo.y), "cards stack into separate rows at phone width").toBeGreaterThan(20);
}

// RECIPE-LIST-19 (packages/spec/product/recipe-list.md): a desktop-width screen arranges
// recipe cards into a grid of several per row; a phone-width screen returns to one per row.
// A fresh context already has one kb recipe (Anchor Steam Beer Clone), so only one new
// recipe needs creating to get a second card on the default All tab.
test("recipe cards arrange in a grid at desktop width and stack in one column at phone width", async ({ page }) => {
    await createRecipeFromTemplate(page, "E2E Grid Recipe", "Empty");

    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/recipes");
    await expectCardGridResponsive(page);
});
