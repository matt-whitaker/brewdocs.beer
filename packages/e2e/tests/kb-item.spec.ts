import { expect, test } from "@playwright/test";

// Real ids straight from packages/kb/data/{grains,hops,yeasts}/*.json filenames
// (the kb build stamps `id = basename(file)` - see packages/kb/CLAUDE.md).

test("grain detail page renders the item", async ({ page }) => {
    await page.goto("/kb/grain/carapils");
    await expect(page.locator(".breadcrumbs").getByText("Carapils")).toBeVisible();
    await expect(page.getByText("Adds body without additional sweetness")).toBeVisible();
});

test("hop detail page renders the item", async ({ page }) => {
    await page.goto("/kb/hop/cascade");
    await expect(page.locator(".breadcrumbs").getByText("Cascade")).toBeVisible();
    await expect(page.getByText("Citrusy, floral, grapefruit, with hints of pine")).toBeVisible();
});

test("yeast detail page renders the item", async ({ page }) => {
    await page.goto("/kb/yeast/danstar-nottingham");
    await expect(page.locator(".breadcrumbs").getByText("Danstar Nottingham Ale Yeast")).toBeVisible();
    await expect(page.getByText("A versatile British ale yeast with high attenuation")).toBeVisible();
});

test("/knowledge renders its not-implemented placeholder", async ({ page }) => {
    await page.goto("/knowledge");
    await expect(page.getByText("Page not implemented")).toBeVisible();
});
