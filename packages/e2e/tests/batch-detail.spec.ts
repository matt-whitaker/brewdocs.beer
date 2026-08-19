import {expect, test} from "@playwright/test";
import {seedBatch} from "./seedBatch";

// BATCH-LIST-03 (packages/spec/product/batch-list.md): a bad batch id returns the
// brewer to /batches, with the page's normal navigation intact, instead of RootError.
test("a bad batch id redirects to /batches with the breadcrumb trail and tab bar intact", async ({page}) => {
    await page.goto("/batch/not-a-real-id");

    await expect(page).toHaveURL(/\/batches$/);
    await expect(page.locator(".breadcrumbs").getByText("Batches")).toBeVisible();
    await expect(page.getByRole("tab", {name: "Ready"})).toHaveAttribute("aria-selected", "true");
});

// Per #607's handoff testing notes: the redirect uses replace semantics, so the bad
// URL never becomes its own history entry — Back from /batches goes to whatever
// preceded the bad link, not back onto /batch/not-a-real-id.
test("a bad batch id does not leave the bad URL in browser history", async ({page}) => {
    await page.goto("/");
    await page.goto("/batch/not-a-real-id");
    await expect(page).toHaveURL(/\/batches$/);

    await page.goBack();
    await expect(page).not.toHaveURL(/\/batch\/not-a-real-id/);
    await expect(page).toHaveURL(/\/$/);
});

test("a batch's detail page opens on the Planning tab with its recipe's sub-tabs", async ({page}) => {
    await seedBatch(page, {name: "E2E Steam Batch"});

    await expect(page.getByRole("tab", {name: "Planning", exact: true})).toHaveAttribute("aria-selected", "true");
    await expect(page.getByRole("heading", {name: "E2E Steam Batch"})).toBeVisible();
    await expect(page.getByText("By Anonymous")).toBeVisible();

    await expect(page.getByRole("tab", {name: "Ingredients"})).toBeVisible();
    await expect(page.getByRole("tab", {name: "Equipment"})).toBeVisible();
    await expect(page.getByRole("tab", {name: "Phases"})).toBeVisible();
});

test("switches between the Planning/Shopping/Brewing/Summary tabs", async ({page}) => {
    await seedBatch(page, {name: "E2E Tab Switch Batch"});

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

// BATCH-SCHEDULE-12/-13 (packages/spec/product/batch-schedule.md): confirming a phase
// complete moves the schedule on to the phase that follows it; completing the last phase
// leaves the schedule showing that phase, since there is none after it. The kb recipe's
// three phases (Mash/Boil/Ferment) are walked in order — the BrewTimer's Complete action
// always targets the current (first incomplete) phase, independent of which sub-tab is
// showing, so no manual tab navigation is needed between confirmations.
test("completing a phase advances the Brewing tab to the phase that follows it, and stays put on the last one", async ({page}) => {
    await seedBatch(page, {name: "E2E Phase Advance Batch"});
    await page.getByRole("tab", {name: "Brewing", exact: true}).click();

    const mashTab = page.getByRole("tab", {name: "1. Mash"});
    const boilTab = page.getByRole("tab", {name: "2. Boil"});
    const fermentTab = page.getByRole("tab", {name: "3. Ferment"});

    await expect(mashTab).toHaveAttribute("aria-selected", "true");

    const dialog = page.getByRole("dialog");

    await page.getByRole("button", {name: "Complete 1. Mash"}).click();
    await expect(dialog).toBeVisible();
    await dialog.getByRole("button", {name: "Confirm"}).click();

    await expect(boilTab).toHaveAttribute("aria-selected", "true");
    await expect(mashTab).toHaveAttribute("aria-selected", "false");

    await page.getByRole("button", {name: "Complete 2. Boil"}).click();
    await expect(dialog).toBeVisible();
    await dialog.getByRole("button", {name: "Confirm"}).click();

    await expect(fermentTab).toHaveAttribute("aria-selected", "true");
    await expect(boilTab).toHaveAttribute("aria-selected", "false");

    await page.getByRole("button", {name: "Complete 3. Ferment"}).click();
    await expect(dialog).toBeVisible();
    await dialog.getByRole("button", {name: "Confirm"}).click();

    await expect(fermentTab).toHaveAttribute("aria-selected", "true");
    await expect(page.getByRole("tab", {name: "Prep"})).toHaveAttribute("aria-selected", "false");
});

// Regression guard from #672's handoff testing notes: the active tab is matched by the
// exact position-numbered phaseLabel string ("2. Boil"), not the bare phase type, so a
// second phase of the same type must not be skipped or matched ambiguously. Two Boil
// phases are made adjacent (Mash/Boil/Boil/Ferment) via Planning's Phases panel so
// completing the first Boil can only be verified correct by landing on the second one.
test("advancing past a repeated phase type lands on the next position, not any tab of that type", async ({page}) => {
    await seedBatch(page, {name: "E2E Repeated Phase Type Batch"});

    await page.getByRole("tab", {name: "Planning", exact: true}).click();
    await page.getByRole("tab", {name: "Phases", exact: true}).click();

    await page.getByLabel("Phase type to add").selectOption({label: "Boil"});
    await page.getByRole("button", {name: "Add phase"}).click();
    await page.getByRole("button", {name: "Move 4. Boil up"}).click();

    await expect(page.getByRole("button", {name: "Move 3. Boil up"})).toBeVisible();

    await page.getByRole("tab", {name: "Brewing", exact: true}).click();

    const firstBoilTab = page.getByRole("tab", {name: "2. Boil"});
    const secondBoilTab = page.getByRole("tab", {name: "3. Boil"});
    const fermentTab = page.getByRole("tab", {name: "4. Ferment"});
    const dialog = page.getByRole("dialog");

    await page.getByRole("button", {name: "Complete 1. Mash"}).click();
    await expect(dialog).toBeVisible();
    await dialog.getByRole("button", {name: "Confirm"}).click();
    await expect(firstBoilTab).toHaveAttribute("aria-selected", "true");

    await page.getByRole("button", {name: "Complete 2. Boil"}).click();
    await expect(dialog).toBeVisible();
    await dialog.getByRole("button", {name: "Confirm"}).click();

    await expect(secondBoilTab).toHaveAttribute("aria-selected", "true");
    await expect(fermentTab).toHaveAttribute("aria-selected", "false");
});
