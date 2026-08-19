import { expect, Page, test } from "@playwright/test";

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

test("equipment cards arrange in a grid at desktop width and stack in one column at phone width", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/equipment");
    await expectCardGridResponsive(page);
});
