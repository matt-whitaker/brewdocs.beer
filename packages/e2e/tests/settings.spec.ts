import { expect, Page, test } from "@playwright/test";

const MOBILE = { width: 390, height: 844 };
const DESKTOP = { width: 1440, height: 900 };

async function openSettingsMenu(page: Page) {
    await page.getByRole("button", { name: "Settings" }).click();
    return page.getByRole("link", { name: "Backup" });
}

// SETTINGS-01/02 (packages/spec/product/settings.md): the Settings control is reachable from
// anywhere and opens a menu revealing Backup, at both the mobile top-bar and desktop
// drawer-footer mount sites.
for (const [label, viewport] of [
    ["phone width", MOBILE],
    ["desktop width", DESKTOP]
] as const) {
    test(`Settings control opens a menu revealing Backup at ${label}`, async ({ page }) => {
        await page.setViewportSize(viewport);
        await page.goto("/");

        const trigger = page.getByRole("button", { name: "Settings" });
        await expect(trigger).toHaveCount(1);
        await expect(trigger).toBeVisible();

        await expect(await openSettingsMenu(page)).toBeVisible();
    });
}

// SETTINGS-03: Backup is the menu's first entry.
test("Backup is the Settings menu's first entry", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Settings" }).click();

    const menu = page.locator("ul.dropdown-content");
    await expect(menu.getByRole("listitem").first()).toHaveText("Backup");
});

// SETTINGS-04: choosing Backup from the Settings menu takes the brewer to the Backup screen, at
// both widths. This proves navigation only — BACKUP-EXPORT-01's "Back up now" action itself is
// located in backup-restore.spec.ts.
for (const [label, viewport] of [
    ["phone width", MOBILE],
    ["desktop width", DESKTOP]
] as const) {
    test(`choosing Backup from the Settings menu navigates to /backup at ${label}`, async ({ page }) => {
        await page.setViewportSize(viewport);
        await page.goto("/");

        await (await openSettingsMenu(page)).click();
        await expect(page).toHaveURL(/\/backup$/);
        await expect(page.locator(".breadcrumbs").getByText("Backup")).toBeVisible();
    });
}

// #1306's testingNotes: opening is pure CSS (`.dropdown:focus-within`), and nothing in the
// toolchain proves which direction the menu reveals in — a lost `dropdown-top` class still
// compiles, still passes a DOM-presence assertion, and still lets Playwright click a
// permanently off-screen menu.
test("Settings menu opens upward on desktop and downward on phone", async ({ page }) => {
    await page.setViewportSize(DESKTOP);
    await page.goto("/");

    let trigger = page.getByRole("button", { name: "Settings" });
    let backup = await openSettingsMenu(page);
    let triggerBox = await trigger.boundingBox();
    let menuBox = await backup.boundingBox();
    if (!triggerBox || !menuBox) throw new Error("Settings trigger or menu item has no bounding box");
    expect(menuBox.y, "menu sits above the trigger at desktop width").toBeLessThan(triggerBox.y);

    await page.setViewportSize(MOBILE);
    trigger = page.getByRole("button", { name: "Settings" });
    backup = await openSettingsMenu(page);
    triggerBox = await trigger.boundingBox();
    menuBox = await backup.boundingBox();
    if (!triggerBox || !menuBox) throw new Error("Settings trigger or menu item has no bounding box");
    expect(menuBox.y, "menu sits below the trigger at phone width").toBeGreaterThan(triggerBox.y);
});

// #1306's testingNotes: data/nav.ts is a plain array with no consumer that would fail to
// compile if Backup came back — a merge that reinstates the row gives two links named
// "Backup" once the drawer is open, which breaks the Settings menu's own selector.
test("Backup no longer appears in the primary nav list", async ({ page }) => {
    await page.goto("/");

    const primaryNav = page.locator("ul.menu.text-primary-content");
    await expect(primaryNav.getByRole("link", { name: "Batches" })).toBeVisible();
    await expect(primaryNav.getByRole("link", { name: "Recipes" })).toBeVisible();
    await expect(primaryNav.getByRole("link", { name: "Equipment" })).toBeVisible();
    await expect(primaryNav.getByRole("link", { name: "Backup" })).toHaveCount(0);
});
