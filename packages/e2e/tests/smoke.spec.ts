import { expect, test } from "@playwright/test";

test("home renders the hero", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "Welcome back!" })).toBeVisible();
});

test("disclaimer route renders its content", async ({ page }) => {
    await page.goto("/disclaimer");
    await expect(page.getByRole("heading", { name: "Disclaimer" })).toBeVisible();
    await expect(page.getByText("BrewDocs is currently in an early prototyping phase")).toBeVisible();
});
