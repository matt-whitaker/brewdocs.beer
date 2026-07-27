import type { Page } from "@playwright/test";

// Prefer built-in getByRole/getByText locators directly; this only exists
// because "the active PanelSwitcher tab" has no simpler accessible query.
export async function activeTabName(page: Page) {
    return page.locator("[role=\"tab\"][aria-selected=\"true\"]").innerText();
}
