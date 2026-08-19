import { expect, test } from "@playwright/test";

// Home hero heading and the /disclaimer route's own content are already
// asserted directly in smoke.spec.ts; this spec exercises the sidebar as
// the navigation surface (present on every page) rather than each route.

test("sidebar shows the primary nav links", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("link", { name: "Disclaimer" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Batches" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Recipes" })).toBeVisible();
});

test("Batches link navigates to /batches", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "Batches" }).click();
    await expect(page).toHaveURL(/\/batches$/);
    await expect(page.locator(".breadcrumbs").getByText("Batches")).toBeVisible();
});

test("Recipes link navigates to /recipes", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "Recipes" }).click();
    await expect(page).toHaveURL(/\/recipes$/);
    await expect(page.locator(".breadcrumbs").getByText("Recipes")).toBeVisible();
});

test("Disclaimer link navigates to /disclaimer", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "Disclaimer" }).click();
    await expect(page).toHaveURL(/\/disclaimer$/);
    await expect(page.getByRole("heading", { name: "Disclaimer" })).toBeVisible();
});

// About is an external link (WWW_URL) with no target set — clicking it would
// navigate this same page off-site. Assert the href instead of following it.
test("About link points off-site", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("link", { name: "About" })).toHaveAttribute("href", /\/about$/);
});
