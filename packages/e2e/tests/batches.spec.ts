import { expect, test } from "@playwright/test";

const TABS = ["Ready", "Brewing", "Fermenting", "Complete"];

test("shows all four status tabs with Ready active by default", async ({ page }) => {
    await page.goto("/batches");

    for (const name of TABS) {
        await expect(page.getByRole("tab", { name })).toBeVisible();
    }
    await expect(page.getByRole("tab", { name: "Ready" })).toHaveAttribute("aria-selected", "true");
    await expect(page.locator(".breadcrumbs").getByText("Batches")).toBeVisible();
});

// a fresh context has no batches, so every tab's panel is an empty list —
// there's no dedicated "no batches" message, just zero rows
test("each tab shows its empty state on a fresh context", async ({ page }) => {
    await page.goto("/batches");

    for (const name of TABS) {
        await page.getByRole("tab", { name }).click();
        await expect(page.getByRole("tab", { name })).toHaveAttribute("aria-selected", "true");
        await expect(page.getByRole("tabpanel").locator("li")).toHaveCount(0);
    }
});

test("clicking a tab moves aria-selected off the previously active tab", async ({ page }) => {
    await page.goto("/batches");
    await expect(page.getByRole("tab", { name: "Ready" })).toHaveAttribute("aria-selected", "true");

    await page.getByRole("tab", { name: "Brewing" }).click();
    await expect(page.getByRole("tab", { name: "Brewing" })).toHaveAttribute("aria-selected", "true");
    await expect(page.getByRole("tab", { name: "Ready" })).toHaveAttribute("aria-selected", "false");
});
