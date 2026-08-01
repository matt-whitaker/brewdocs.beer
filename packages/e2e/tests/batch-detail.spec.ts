import {expect, Page, test} from "@playwright/test";

// A fresh context has no batches, so every test here drives the Brew flow
// itself: /kb/recipe/<id> -> Brew action -> modal (name + Confirm) -> navigates
// to /batch/<id> on the Planning tab. This re-drives the same flow the
// KB-recipe spec exercises, but goes on to confirm it (see issue #231).
async function brewBatchFromKbRecipe(page: Page, batchName: string) {
    await page.goto("/kb/recipe/anchor-steam-beer-clone");
    await page.getByRole("button", {name: "Brew"}).click();

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await dialog.getByLabel(/Batch name/).fill(batchName);
    await dialog.getByRole("button", {name: "Confirm"}).click();

    await expect(page).toHaveURL(/\/batch\//);
}

test("brewing a KB recipe creates a batch and lands on the Planning tab", async ({page}) => {
    await brewBatchFromKbRecipe(page, "E2E Steam Batch");

    await expect(page.getByRole("tab", {name: "Planning", exact: true})).toHaveAttribute("aria-selected", "true");
    await expect(page.getByRole("heading", {name: "E2E Steam Batch"})).toBeVisible();
    await expect(page.getByText("By Anonymous")).toBeVisible();

    // Planning's own sub-tabs (BrewableEdit)
    await expect(page.getByRole("tab", {name: "Ingredients"})).toBeVisible();
    await expect(page.getByRole("tab", {name: "Equipment"})).toBeVisible();
    await expect(page.getByRole("tab", {name: "Phases"})).toBeVisible();
});

test("switches between the Planning/Shopping/Brewing/Summary tabs", async ({page}) => {
    await brewBatchFromKbRecipe(page, "E2E Tab Switch Batch");

    const planningTab = page.getByRole("tab", {name: "Planning", exact: true});
    const shoppingTab = page.getByRole("tab", {name: "Shopping", exact: true});
    const scheduleTab = page.getByRole("tab", {name: "Brewing", exact: true});
    const summaryTab = page.getByRole("tab", {name: "Summary", exact: true});

    await expect(planningTab).toHaveAttribute("aria-selected", "true");
    await expect(shoppingTab).toHaveAttribute("aria-selected", "false");
    await expect(scheduleTab).toHaveAttribute("aria-selected", "false");
    await expect(summaryTab).toHaveAttribute("aria-selected", "false");

    await shoppingTab.click();
    await expect(shoppingTab).toHaveAttribute("aria-selected", "true");
    await expect(planningTab).toHaveAttribute("aria-selected", "false");
    await expect(page.getByText("Sort by")).toBeVisible();

    await scheduleTab.click();
    await expect(scheduleTab).toHaveAttribute("aria-selected", "true");
    await expect(shoppingTab).toHaveAttribute("aria-selected", "false");
    await expect(page.getByText("Status", {exact: true})).toBeVisible();
    // Brewing's phase sub-tabs (numbered by position, e.g. "1. Mash")
    await expect(page.getByRole("tab", {name: "1. Mash"})).toBeVisible();
    await expect(page.getByRole("tab", {name: "2. Boil"})).toBeVisible();
    await expect(page.getByRole("tab", {name: "3. Ferment"})).toBeVisible();

    await summaryTab.click();
    await expect(summaryTab).toHaveAttribute("aria-selected", "true");
    await expect(scheduleTab).toHaveAttribute("aria-selected", "false");
    await expect(page.getByRole("heading", {name: "Anchor Steam Beer Clone"})).toBeVisible();
    await expect(page.getByRole("heading", {name: "E2E Tab Switch Batch"})).toBeVisible();

    await planningTab.click();
    await expect(planningTab).toHaveAttribute("aria-selected", "true");
    await expect(summaryTab).toHaveAttribute("aria-selected", "false");
});
