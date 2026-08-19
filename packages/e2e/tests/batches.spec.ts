import { expect, Page, test } from "@playwright/test";
import {seedBatch, seedBatches} from "./seedBatch";
import {settleSave} from "./settleSave";

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

test("brewing a batch from a kb recipe reaches its detail page", async ({ page }) => {
    await page.goto("/kb/recipe/anchor-steam-beer-clone");
    await page.getByRole("button", { name: "Brew" }).click();

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await dialog.getByLabel(/Batch name/).fill("E2E UI Brewed Batch");
    await dialog.getByRole("button", { name: "Confirm" }).click();

    await expect(page).toHaveURL(/\/batch\//);
    await expect(page.getByRole("heading", { name: "E2E UI Brewed Batch" })).toBeVisible();
});

test("the batch delete confirmation renders centred, not shrink-wrapped in a corner", async ({ page }) => {
    await seedBatch(page, { name: "E2E Centred Confirm Batch", goto: "/batches" });

    const row = page.getByRole("listitem").filter({ hasText: "E2E Centred Confirm Batch" });
    await row.getByRole("button").click();
    await expect(page.getByRole("dialog")).toBeVisible();

    await expectConfirmDialogCentred(page);
});

test("deletes a batch after confirmation, and it stays gone after reload", async ({ page }) => {
    await seedBatch(page, { name: "E2E Delete Batch", goto: "/batches" });

    const row = page.getByRole("listitem").filter({ hasText: "E2E Delete Batch" });
    await expect(row).toBeVisible();

    await row.getByRole("button").click();

    await expect(page).not.toHaveURL(/\/batch\//);

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole("heading", { name: "Delete E2E Delete Batch?" })).toBeVisible();

    await dialog.getByRole("button", { name: "Confirm" }).click();
    await expect(row).not.toBeVisible();

    await settleSave(page);
    await page.reload();
    await expect(page.getByText("E2E Delete Batch")).not.toBeVisible();
});

test("every batch row shows a delete affordance", async ({ page }) => {
    await seedBatches(page, [{ name: "E2E Row One" }, { name: "E2E Row Two" }]);

    await expect(page.getByRole("listitem").filter({ hasText: "E2E Row One" }).getByRole("button")).toHaveCount(1);
    await expect(page.getByRole("listitem").filter({ hasText: "E2E Row Two" }).getByRole("button")).toHaveCount(1);
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

// BATCH-LIST-08 (packages/spec/product/batch-list.md): a desktop-width screen arranges
// batch cards into a grid of several per row; a phone-width screen returns to one per row.
test("batch cards arrange in a grid at desktop width and stack in one column at phone width", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await seedBatches(page, [{ name: "E2E Grid Batch One" }, { name: "E2E Grid Batch Two" }]);

    await expectCardGridResponsive(page);
});
