import {expect, Page, test} from "@playwright/test";
import {advanceClock, resetClock} from "./clock";
import {seedBatch} from "./seedBatch";
import {settleSave} from "./settleSave";

async function openSchedulePhase(page: Page, phase: string) {
    await page.getByRole("tab", {name: "Brewing", exact: true}).click();
    await page.getByRole("tab", {name: phase, exact: true}).click();
    await expect(page.getByRole("tab", {name: phase, exact: true})).toHaveAttribute("aria-selected", "true");
}

function parseElapsed(text: string): number {
    const [h, m, s] = text.split(":").map(Number);
    return (h * 3600) + (m * 60) + s;
}

async function markerOffsetSeconds(page: Page, namePattern: RegExp): Promise<number> {
    const label = await page.getByRole("button", {name: namePattern}).getAttribute("aria-label");
    const match = label?.match(/(\d{2}):(\d{2}):(\d{2})$/);
    if (!match) throw new Error(`marker aria-label carried no time: ${label}`);
    return (Number(match[1]) * 3600) + (Number(match[2]) * 60) + Number(match[3]);
}

test("keeps the timer running across a reload", async ({page}) => {
    await seedBatch(page, {name: "E2E Timer Running Batch"});
    await page.getByRole("tab", {name: "Brewing", exact: true}).click();

    await expect(page.getByRole("timer", {name: "Elapsed time"})).toHaveText("00:00:00");

    await advanceClock(page, -3000);
    await page.getByRole("button", {name: "Start timer"}).click();
    await expect(page.getByRole("button", {name: "Pause timer"})).toBeVisible();

    await settleSave(page);
    await page.reload();
    await page.getByRole("tab", {name: "Brewing", exact: true}).click();

    await expect(page.getByRole("button", {name: "Pause timer"})).toBeVisible();
    await expect(page.getByRole("timer", {name: "Elapsed time"})).not.toHaveText("00:00:00");
});

test("freezes the counter on pause, and a reload keeps it frozen", async ({page}) => {
    await seedBatch(page, {name: "E2E Timer Paused Batch"});
    await page.getByRole("tab", {name: "Brewing", exact: true}).click();

    await advanceClock(page, -2000);
    await page.getByRole("button", {name: "Start timer"}).click();
    await resetClock(page);
    await page.getByRole("button", {name: "Pause timer"}).click();
    await expect(page.getByRole("button", {name: "Start timer"})).toBeVisible();

    const frozenValue = await page.getByRole("timer", {name: "Elapsed time"}).textContent();
    expect(frozenValue).not.toBe("00:00:00");

    await settleSave(page);
    await page.reload();
    await page.getByRole("tab", {name: "Brewing", exact: true}).click();

    await expect(page.getByRole("button", {name: "Start timer"})).toBeVisible();
    await expect(page.getByRole("timer", {name: "Elapsed time"})).toHaveText(frozenValue ?? "");
});

test("logs a quick milestone that lands on the timeline and in the phase's reading grid", async ({page}) => {
    await seedBatch(page, {name: "E2E Timer Milestone Batch"});
    await page.getByRole("tab", {name: "Brewing", exact: true}).click();

    await page.getByRole("group", {name: "Timer scope"}).getByRole("button", {name: "Phase", exact: true}).click();

    await page.getByRole("button", {name: "Start timer"}).click();
    await advanceClock(page, 1000);

    await page.getByRole("button", {name: "Quick actions"}).click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await dialog.getByRole("button", {name: "Confirm"}).click();
    await expect(dialog).not.toBeVisible();

    await expect(page.getByRole("button", {name: /^Reading at \d{2}:\d{2}:\d{2}$/})).toBeVisible();
    await openSchedulePhase(page, "1. Mash");
    await expect(page.getByLabel("Reading reading")).toBeVisible();

    await settleSave(page);
    await page.reload();
    await page.getByRole("tab", {name: "Brewing", exact: true}).click();

    await page.getByRole("group", {name: "Timer scope"}).getByRole("button", {name: "Phase", exact: true}).click();

    await expect(page.getByRole("button", {name: /^Reading at \d{2}:\d{2}:\d{2}$/})).toBeVisible();
    await openSchedulePhase(page, "1. Mash");
    await expect(page.getByLabel("Reading reading")).toBeVisible();
});

test("empty Gravity, Volume and Temperature reading value inputs show an example placeholder", async ({page}) => {
    await seedBatch(page, {name: "E2E Reading Placeholder Batch"});
    await openSchedulePhase(page, "1. Mash");

    await expect(page.getByLabel("Gravity value to add")).toHaveAttribute("placeholder", "12");
    await expect(page.getByLabel("Volume value to add")).toHaveAttribute("placeholder", "5.5");
    await expect(page.getByLabel("Temperature value to add")).toHaveAttribute("placeholder", "68");

    await page.getByRole("button", {name: "Quick actions"}).click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await dialog.getByRole("button", {name: "Confirm"}).click();
    await expect(dialog).not.toBeVisible();

    await expect(page.getByLabel("Reading reading")).toHaveAttribute("placeholder", "12");
});

test("the quick-log Reading tab's Value field placeholder follows the selected reading kind", async ({page}) => {
    await seedBatch(page, {name: "E2E Reading Tab Placeholder Batch"});
    await page.getByRole("tab", {name: "Brewing", exact: true}).click();

    await page.getByRole("button", {name: "Quick actions"}).click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();

    await expect(dialog.getByLabel("Reading value")).toHaveAttribute("placeholder", "12");

    await dialog.getByLabel("Reading kind").selectOption("volume");
    await expect(dialog.getByLabel("Reading value")).toHaveAttribute("placeholder", "5.5");

    await dialog.getByLabel("Reading kind").selectOption("temperature");
    await expect(dialog.getByLabel("Reading value")).toHaveAttribute("placeholder", "68");
});

test("logs a quick reading with a typed label that names the resulting reading", async ({page}) => {
    await seedBatch(page, {name: "E2E Quick Reading Label Batch"});
    await page.getByRole("tab", {name: "Brewing", exact: true}).click();

    await page.getByRole("button", {name: "Quick actions"}).click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await dialog.getByLabel("Reading label").fill("Mash pH check");
    await dialog.getByRole("button", {name: "Confirm"}).click();
    await expect(dialog).not.toBeVisible();

    await openSchedulePhase(page, "1. Mash");
    await expect(page.getByLabel("Mash pH check reading")).toBeVisible();
    await expect(page.getByLabel("Reading reading")).not.toBeVisible();

    await settleSave(page);
    await page.reload();
    await page.getByRole("tab", {name: "Brewing", exact: true}).click();

    await openSchedulePhase(page, "1. Mash");
    await expect(page.getByLabel("Mash pH check reading")).toBeVisible();
});

test("logs a quick reading with a whitespace-only label under the kind's default label", async ({page}) => {
    await seedBatch(page, {name: "E2E Quick Reading Blank Label Batch"});
    await page.getByRole("tab", {name: "Brewing", exact: true}).click();

    await page.getByRole("button", {name: "Quick actions"}).click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await dialog.getByLabel("Reading label").fill("   ");
    await dialog.getByRole("button", {name: "Confirm"}).click();
    await expect(dialog).not.toBeVisible();

    await openSchedulePhase(page, "1. Mash");
    await expect(page.getByLabel("Reading name")).toHaveValue("Reading");
});

test("quick action modal opens on Reading with every applicable tab enabled", async ({page}) => {
    await seedBatch(page, {name: "E2E Quick Action Tabs Batch"});
    await page.getByRole("tab", {name: "Brewing", exact: true}).click();

    await page.getByRole("button", {name: "Quick actions"}).click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();

    await expect(dialog.getByRole("tab")).toHaveText(["Ingredients", "Reading", "Equipment"]);
    await expect(dialog.getByRole("tab", {name: "Ingredients"})).toBeEnabled();
    await expect(dialog.getByRole("tab", {name: "Reading"})).toHaveAttribute("aria-selected", "true");
    await expect(dialog.getByRole("tab", {name: "Equipment"})).toBeEnabled();
});

test("a quick-action tab goes unavailable, with its reason, once the phase is exhausted", async ({page}) => {
    await seedBatch(page, {name: "E2E Quick Action Exhaust Batch"});
    await page.getByRole("tab", {name: "Brewing", exact: true}).click();

    const dialog = page.getByRole("dialog");
    const ingredients = dialog.getByRole("tab", {name: "Ingredients"});

    for (let i = 0; i < 10; i++) {
        await page.getByRole("button", {name: "Quick actions"}).click();
        await expect(dialog).toBeVisible();
        if (!await ingredients.isEnabled()) break;

        await ingredients.click();
        await dialog.getByRole("button", {name: "Confirm"}).click();
        await expect(dialog).not.toBeVisible();
        await settleSave(page);
    }

    await expect(ingredients).toBeDisabled();
    await expect(ingredients).toHaveAttribute("title", "Nothing left to add on this phase");
    await expect(dialog.getByRole("tab", {name: "Reading"})).toHaveAttribute("aria-selected", "true");
});

test("the ingredients quick action works down the phase one confirm at a time", async ({page}) => {
    await seedBatch(page, {name: "E2E Quick Action Advance Batch"});
    await page.getByRole("tab", {name: "Brewing", exact: true}).click();

    const GRAINS = ["Crystal Malt 40L", "German Pils", "Special Robust"];
    await expect(page.getByRole("checkbox", {name: GRAINS[0]})).toBeVisible();
    const displayed = (await page.getByRole("checkbox").evaluateAll(boxes => boxes.map(box => {
        const el = box as HTMLInputElement;
        const label = el.closest("label") ?? document.querySelector(`label[for="${el.id}"]`);
        return label?.textContent?.trim() ?? "";
    }))).filter(name => GRAINS.includes(name));
    expect(displayed).toHaveLength(GRAINS.length);

    for (let done = 1; done <= displayed.length; done++) {
        await page.getByRole("button", {name: "Quick actions"}).click();
        const dialog = page.getByRole("dialog").filter({hasText: "Quick action"});
        await dialog.getByRole("tab", {name: "Ingredients"}).click();

        await expect(dialog.getByLabel("Ingredient item")).toHaveValue(/.+/);
        await dialog.getByRole("button", {name: "Confirm"}).click();
        await expect(dialog).not.toBeVisible();
        await settleSave(page);

        for (const [i, name] of displayed.entries()) {
            const box = page.getByRole("checkbox", {name});
            if (i < done) await expect(box, `${name} (row ${i + 1}) after ${done}`).toBeChecked();
            else await expect(box, `${name} (row ${i + 1}) after ${done}`).not.toBeChecked();
        }
    }
});

test("the ingredients quick action checks off the item the brewer names, out of order", async ({page}) => {
    await seedBatch(page, {name: "E2E Quick Action Named Batch"});
    await page.getByRole("tab", {name: "Brewing", exact: true}).click();

    await page.getByRole("button", {name: "Quick actions"}).click();
    const dialog = page.getByRole("dialog").filter({hasText: "Quick action"});
    await dialog.getByRole("tab", {name: "Ingredients"}).click();

    const offered = await dialog.getByLabel("Ingredient item").locator("option").allTextContents();
    expect(offered).toEqual(["German Pils", "Crystal Malt 40L", "Special Robust"]);

    await dialog.getByLabel("Ingredient item").selectOption({label: "Special Robust"});
    await dialog.getByRole("button", {name: "Confirm"}).click();
    await expect(dialog).not.toBeVisible();
    await settleSave(page);

    await expect(page.getByRole("checkbox", {name: "Special Robust"})).toBeChecked();
    await expect(page.getByRole("checkbox", {name: "German Pils"})).not.toBeChecked();
    await expect(page.getByRole("checkbox", {name: "Crystal Malt 40L"})).not.toBeChecked();
});

test("a phase lists its boil additions in the order they go in, without reordering Planning", async ({page}) => {
    await seedBatch(page, {name: "E2E Brew Order Batch"});

    await page.getByRole("tab", {name: "Planning", exact: true}).click();
    await page.getByRole("tab", {name: "Ingredients", exact: true}).click();

    const toggles = page.getByRole("button", {name: "Show assignment details"});
    for (let guard = 0; guard < 12 && await toggles.count() > 0; guard++) {
        await toggles.first().click();
    }

    const boilTimes = (where: Page) => where.getByLabel(/Northern Brewer boil/)
        .evaluateAll(inputs => inputs.map(i => parseFloat((i as HTMLInputElement).value)));

    const planned = page.getByLabel("Northern Brewer boil");
    await expect(planned).toHaveCount(3);
    expect(await boilTimes(page)).toEqual([60, 20, 0]);

    await planned.nth(0).fill("1");
    await planned.nth(0).blur();
    await settleSave(page);

    await expect.poll(() => boilTimes(page)).toEqual([1, 20, 0]);

    await openSchedulePhase(page, "2. Boil");
    await expect.poll(() => boilTimes(page)).toEqual([20, 1, 0]);
});

test("the ingredients quick action pre-fills the value field with the selected item's planned value", async ({page}) => {
    await seedBatch(page, {name: "E2E Quick Action Prefill Batch"});
    await page.getByRole("tab", {name: "Brewing", exact: true}).click();

    await page.getByRole("button", {name: "Quick actions"}).click();
    const dialog = page.getByRole("dialog").filter({hasText: "Quick action"});
    await dialog.getByRole("tab", {name: "Ingredients"}).click();

    await expect(dialog.getByLabel("Ingredient item").locator("option:checked")).toHaveText("German Pils");
    await expect(dialog.getByLabel("Ingredient weight")).toHaveValue(/9\.0/);
});

test("switching the selected ingredient replaces the pre-fill with the new item's own planned value", async ({page}) => {
    await seedBatch(page, {name: "E2E Quick Action Prefill Switch Batch"});
    await page.getByRole("tab", {name: "Brewing", exact: true}).click();

    await page.getByRole("button", {name: "Quick actions"}).click();
    const dialog = page.getByRole("dialog").filter({hasText: "Quick action"});
    await dialog.getByRole("tab", {name: "Ingredients"}).click();

    await expect(dialog.getByLabel("Ingredient weight")).toHaveValue(/9\.0/);

    await dialog.getByLabel("Ingredient item").selectOption({label: "Crystal Malt 40L"});
    await expect(dialog.getByLabel("Ingredient weight")).toHaveValue(/1\.0/);

    await dialog.getByLabel("Ingredient item").selectOption({label: "Special Robust"});
    await expect(dialog.getByLabel("Ingredient weight")).toHaveValue(/0\.5/);
});

test("a value typed into the ingredients quick action is recorded against the item it checked off", async ({page}) => {
    await seedBatch(page, {name: "E2E Quick Action Value Batch"});
    await page.getByRole("tab", {name: "Brewing", exact: true}).click();

    await page.getByRole("button", {name: "Quick actions"}).click();
    const dialog = page.getByRole("dialog").filter({hasText: "Quick action"});
    await dialog.getByRole("tab", {name: "Ingredients"}).click();
    await expect(dialog.getByLabel("Ingredient weight")).toHaveValue(/9\.0/);
    await dialog.getByLabel("Ingredient weight").fill("9.99");
    await dialog.getByRole("button", {name: "Confirm"}).click();
    await expect(dialog).not.toBeVisible();
    await settleSave(page);

    const GRAINS = ["Crystal Malt 40L", "German Pils", "Special Robust"];
    const checked: string[] = [];
    for (const name of GRAINS) {
        if (await page.getByRole("checkbox", {name}).isChecked()) checked.push(name);
    }
    expect(checked).toHaveLength(1);

    await expect(page.getByLabel(`${checked[0]} weight`)).toHaveValue(/9\.99/);
    for (const other of GRAINS.filter(n => n !== checked[0])) {
        await expect(page.getByLabel(`${other} weight`)).not.toHaveValue(/9\.99/);
    }
});

test("the equipment quick action checks off the item the brewer names", async ({page}) => {
    await seedBatch(page, {name: "E2E Quick Action Equipment Batch"});
    await page.getByRole("tab", {name: "Brewing", exact: true}).click();

    await page.getByRole("button", {name: "Quick actions"}).click();
    const dialog = page.getByRole("dialog").filter({hasText: "Quick action"});
    await dialog.getByRole("tab", {name: "Equipment"}).click();
    await dialog.getByLabel("Equipment item").selectOption({label: "Digital Hydrometer"});
    await dialog.getByRole("button", {name: "Confirm"}).click();
    await expect(dialog).not.toBeVisible();
    await settleSave(page);

    await expect(page.getByRole("checkbox", {name: "Digital Hydrometer"})).toBeChecked();
    await expect(page.getByRole("checkbox", {name: "Mash Tun - 10gal"})).not.toBeChecked();

    await page.getByRole("button", {name: "Quick actions"}).click();
    await dialog.getByRole("tab", {name: "Equipment"}).click();
    const left = await dialog.getByLabel("Equipment item").locator("option").allTextContents();
    expect(left).not.toContain("Digital Hydrometer");
    expect(left).toContain("Mash Tun - 10gal");
});

test("a quick action never reaches into a later phase", async ({page}) => {
    await seedBatch(page, {name: "E2E Quick Action Phase Scope Batch"});
    await page.getByRole("tab", {name: "Brewing", exact: true}).click();

    await page.getByRole("button", {name: "Quick actions"}).click();
    const dialog = page.getByRole("dialog").filter({hasText: "Quick action"});
    await dialog.getByRole("tab", {name: "Ingredients"}).click();

    const offered = await dialog.getByLabel("Ingredient item").locator("option").allTextContents();
    expect(offered).toContain("German Pils");
    expect(offered.some(name => name.startsWith("Northern Brewer"))).toBe(false);

    await dialog.getByRole("button", {name: "Confirm"}).click();
    await expect(dialog).not.toBeVisible();
    await settleSave(page);

    await openSchedulePhase(page, "2. Boil");
    for (const box of await page.getByRole("checkbox", {name: /Northern Brewer/}).all()) {
        await expect(box).not.toBeChecked();
    }
});

test("hovering each marker after logging two milestones shows that marker's own popover text", async ({page}) => {
    await seedBatch(page, {name: "E2E Marker Popover Batch"});
    await page.getByRole("tab", {name: "Brewing", exact: true}).click();

    await page.getByRole("group", {name: "Timer scope"}).getByRole("button", {name: "Phase", exact: true}).click();

    await page.getByRole("button", {name: "Start timer"}).click();

    await advanceClock(page, 1000);

    await page.getByRole("button", {name: "Quick actions"}).click();
    let dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await dialog.getByRole("button", {name: "Confirm"}).click();
    await expect(dialog).not.toBeVisible();

    const gravityMarker = page.getByRole("button", {name: /^Reading at \d{2}:\d{2}:\d{2}$/});
    await expect(gravityMarker).toBeVisible();

    await advanceClock(page, 4000);

    await page.getByRole("button", {name: "Quick actions"}).click();
    dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await dialog.getByLabel("Reading kind").selectOption("volume");
    await dialog.getByRole("button", {name: "Confirm"}).click();
    await expect(dialog).not.toBeVisible();

    const volumeMarker = page.getByRole("button", {name: /^Volume at \d{2}:\d{2}:\d{2}$/});
    await expect(volumeMarker).toBeVisible();

    await gravityMarker.hover();
    const gravityTooltip = page.getByRole("tooltip");
    await expect(gravityTooltip).toBeVisible();
    await expect(gravityTooltip).toContainText("Reading");
    await expect(gravityTooltip).toContainText("Gravity");

    await volumeMarker.hover();
    const volumeTooltip = page.getByRole("tooltip");
    await expect(volumeTooltip).toBeVisible();
    await expect(volumeTooltip).toContainText("Volume");
    await expect(volumeTooltip).not.toContainText("Gravity");
});

test("places a freshly logged milestone marker without waiting for a tick to catch up", async ({page}) => {
    await seedBatch(page, {name: "E2E Marker Clock Batch"});
    await page.getByRole("tab", {name: "Brewing", exact: true}).click();

    await page.getByRole("group", {name: "Timer scope"}).getByRole("button", {name: "Phase", exact: true}).click();

    await page.getByRole("button", {name: "Start timer"}).click();
    await expect(page.getByRole("button", {name: "Pause timer"})).toBeVisible();

    await advanceClock(page, 5600);

    await page.getByRole("button", {name: "Quick actions"}).click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await dialog.getByRole("button", {name: "Confirm"}).click();
    await expect(dialog).not.toBeVisible();

    await expect(page.getByRole("button", {name: /^Reading at \d{2}:\d{2}:\d{2}$/})).toBeVisible();
});

test("keeps a phase's complete stamp on Global's timeline once resumed, even completed during a long pause", async ({page}) => {
    await seedBatch(page, {name: "E2E Timer Pause Marker Batch"});
    await page.getByRole("tab", {name: "Brewing", exact: true}).click();

    const mashStamps = page.getByRole("button", {name: /^1\. Mash at \d{2}:\d{2}:\d{2}$/});

    await page.getByRole("button", {name: "Start timer"}).click();
    await advanceClock(page, 1000);
    await page.getByRole("button", {name: "Pause timer"}).click();
    await expect(page.getByRole("button", {name: "Start timer"})).toBeVisible();

    await expect(mashStamps).toHaveCount(1);

    const frozenValue = await page.getByRole("timer", {name: "Elapsed time"}).textContent();

    await advanceClock(page, 6000);

    await page.getByRole("button", {name: "Complete 1. Mash"}).click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await dialog.getByRole("button", {name: "Confirm"}).click();
    await expect(dialog).not.toBeVisible();

    await expect(mashStamps).toHaveCount(1);
    await expect(page.getByRole("timer", {name: "Elapsed time"})).toHaveText(frozenValue ?? "");

    await page.getByRole("button", {name: "Start timer"}).click();

    await expect(mashStamps).toHaveCount(2, {timeout: 2500});
});

test("switching Global/Phase scope never disturbs the running or paused clock", async ({page}) => {
    await seedBatch(page, {name: "E2E Timer Scope Toggle Batch"});
    await page.getByRole("tab", {name: "Brewing", exact: true}).click();

    const scopeGroup = page.getByRole("group", {name: "Timer scope"});
    const globalButton = scopeGroup.getByRole("button", {name: "Global", exact: true});
    const phaseButton = scopeGroup.getByRole("button", {name: "Phase", exact: true});

    await phaseButton.click();
    await expect(page.getByRole("timer", {name: "Elapsed time"})).toHaveText("00:00:00");
    await expect(page.getByRole("button", {name: "Start timer"})).toBeVisible();
    await globalButton.click();

    await page.getByRole("button", {name: "Start timer"}).click();
    await expect(page.getByRole("button", {name: "Pause timer"})).toBeVisible();

    await phaseButton.click();
    await expect(phaseButton).toHaveAttribute("aria-pressed", "true");
    await expect(globalButton).toHaveAttribute("aria-pressed", "false");

    await expect(page.getByRole("button", {name: "Pause timer"})).toBeVisible();

    await advanceClock(page, 1000);
    await globalButton.click();
    await expect(globalButton).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByRole("button", {name: "Pause timer"})).toBeVisible();

    await page.getByRole("button", {name: "Pause timer"}).click();
    await expect(page.getByRole("button", {name: "Start timer"})).toBeVisible();
    const frozenValue = await page.getByRole("timer", {name: "Elapsed time"}).textContent();

    await phaseButton.click();
    await expect(page.getByRole("button", {name: "Start timer"})).toBeVisible();
    await globalButton.click();
    await expect(page.getByRole("timer", {name: "Elapsed time"})).toHaveText(frozenValue ?? "");
});

test("Phase's elapsed excludes a pause, and Global reads the true elapsed the moment you switch back", async ({page}) => {
    await seedBatch(page, {name: "E2E Timer Scope Pause Batch"});
    await page.getByRole("tab", {name: "Brewing", exact: true}).click();

    const scopeGroup = page.getByRole("group", {name: "Timer scope"});

    await page.getByRole("button", {name: "Start timer"}).click();
    await advanceClock(page, 1000);
    await scopeGroup.getByRole("button", {name: "Phase", exact: true}).click();

    await page.getByRole("button", {name: "Pause timer"}).click();

    await advanceClock(page, 6000);
    await page.getByRole("button", {name: "Start timer"}).click();
    await advanceClock(page, 1000);

    const phaseValue = parseElapsed((await page.getByRole("timer", {name: "Elapsed time"}).textContent()) ?? "");

    await scopeGroup.getByRole("button", {name: "Global", exact: true}).click();
    const globalValue = parseElapsed((await page.getByRole("timer", {name: "Elapsed time"}).textContent()) ?? "");

    expect(globalValue - phaseValue).toBeGreaterThan(3);
});

test("completing a phase while Phase is displayed re-anchors its markers to the new phase", async ({page}) => {
    await seedBatch(page, {name: "E2E Timer Scope Complete Batch"});
    await page.getByRole("tab", {name: "Brewing", exact: true}).click();

    const scopeGroup = page.getByRole("group", {name: "Timer scope"});
    const readingMarker = page.getByRole("button", {name: /^Reading at \d{2}:\d{2}:\d{2}$/});

    await page.getByRole("button", {name: "Start timer"}).click();
    await advanceClock(page, 1000);

    await page.getByRole("button", {name: "Quick actions"}).click();
    let dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await dialog.getByRole("button", {name: "Confirm"}).click();
    await expect(dialog).not.toBeVisible();

    await expect(readingMarker).toHaveCount(0);

    await scopeGroup.getByRole("button", {name: "Phase", exact: true}).click();

    await expect(readingMarker).toBeVisible();

    await page.getByRole("button", {name: "Complete 1. Mash"}).click();
    dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await dialog.getByRole("button", {name: "Confirm"}).click();
    await expect(dialog).not.toBeVisible();
    await settleSave(page);

    await expect(readingMarker).toHaveCount(0);

    await scopeGroup.getByRole("button", {name: "Global", exact: true}).click();

    await expect(readingMarker).toHaveCount(0);
    await expect(page.getByRole("button", {name: /^1\. Mash at \d{2}:\d{2}:\d{2}$/})).toHaveCount(2);

    await scopeGroup.getByRole("button", {name: "Phase", exact: true}).click();

    await page.getByRole("button", {name: "Start timer"}).click();
    await advanceClock(page, 1000);
    await page.getByRole("button", {name: "Quick actions"}).click();
    dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await dialog.getByRole("button", {name: "Confirm"}).click();
    await expect(dialog).not.toBeVisible();

    await expect(readingMarker).toHaveCount(1);
});

test("a reading logged while Phase is active lands at its phase-relative offset", async ({page}) => {
    await seedBatch(page, {name: "E2E Timer Scope Offset Batch"});
    await page.getByRole("tab", {name: "Brewing", exact: true}).click();

    const scopeGroup = page.getByRole("group", {name: "Timer scope"});
    const readingMarker = /^Reading at \d{2}:\d{2}:\d{2}$/;

    await page.getByRole("button", {name: "Start timer"}).click();

    await advanceClock(page, 2000);

    await page.getByRole("button", {name: "Complete 1. Mash"}).click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await dialog.getByRole("button", {name: "Confirm"}).click();
    await expect(dialog).not.toBeVisible();
    await settleSave(page);

    await page.getByRole("button", {name: "Start timer"}).click();
    await scopeGroup.getByRole("button", {name: "Phase", exact: true}).click();
    await advanceClock(page, 1000);

    await page.getByRole("button", {name: "Quick actions"}).click();
    const readingDialog = page.getByRole("dialog");
    await expect(readingDialog).toBeVisible();
    await readingDialog.getByRole("button", {name: "Confirm"}).click();
    await expect(readingDialog).not.toBeVisible();
    await expect(page.getByRole("button", {name: readingMarker})).toBeVisible();

    const phaseOffset = await markerOffsetSeconds(page, readingMarker);

    expect(phaseOffset).toBeGreaterThan(0);

    await scopeGroup.getByRole("button", {name: "Global", exact: true}).click();

    await expect(page.getByRole("button", {name: readingMarker})).toHaveCount(0);
});

test("Global shows a phase's start stamp once it begins, a complete stamp once it's completed, and nothing before that", async ({page}) => {
    await seedBatch(page, {name: "E2E Global Stamps Batch"});
    await page.getByRole("tab", {name: "Brewing", exact: true}).click();

    const scopeGroup = page.getByRole("group", {name: "Timer scope"});
    const mashStamp = page.getByRole("button", {name: /^1\. Mash at \d{2}:\d{2}:\d{2}$/});
    const boilStamp = page.getByRole("button", {name: /^2\. Boil at \d{2}:\d{2}:\d{2}$/});

    await scopeGroup.getByRole("button", {name: "Global", exact: true}).click();

    await expect(mashStamp).toHaveCount(0);

    await page.getByRole("button", {name: "Start timer"}).click();
    await advanceClock(page, 1000);

    await expect(mashStamp).toHaveCount(1);
    await expect(boilStamp).toHaveCount(0);

    await page.getByRole("button", {name: "Complete 1. Mash"}).click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await dialog.getByRole("button", {name: "Confirm"}).click();
    await expect(dialog).not.toBeVisible();
    await settleSave(page);

    await expect(mashStamp).toHaveCount(2);
    await expect(boilStamp).toHaveCount(1);
});

test("a hop addition logged while Phase is active never plots on Global's timeline", async ({page}) => {
    await seedBatch(page, {name: "E2E Global No Hop Marker Batch"});
    await page.getByRole("tab", {name: "Brewing", exact: true}).click();

    await page.getByRole("button", {name: "Start timer"}).click();
    await advanceClock(page, 1000);

    await page.getByRole("button", {name: "Complete 1. Mash"}).click();
    let dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await dialog.getByRole("button", {name: "Confirm"}).click();
    await expect(dialog).not.toBeVisible();
    await settleSave(page);

    await page.getByRole("button", {name: "Start timer"}).click();
    await advanceClock(page, 1000);

    await page.getByRole("button", {name: "Quick actions"}).click();
    dialog = page.getByRole("dialog").filter({hasText: "Quick action"});
    await dialog.getByRole("tab", {name: "Ingredients"}).click();
    await dialog.getByRole("button", {name: "Confirm"}).click();
    await expect(dialog).not.toBeVisible();
    await settleSave(page);

    const hopMarker = page.getByRole("button", {name: /Northern Brewer/});
    const scopeGroup = page.getByRole("group", {name: "Timer scope"});
    await scopeGroup.getByRole("button", {name: "Phase", exact: true}).click();

    await expect(hopMarker).toBeVisible();

    await scopeGroup.getByRole("button", {name: "Global", exact: true}).click();
    await expect(hopMarker).toHaveCount(0);
});

test("confirming a phase complete pauses a running timer", async ({page}) => {
    await seedBatch(page, {name: "E2E Complete Pauses Timer Batch"});
    await page.getByRole("tab", {name: "Brewing", exact: true}).click();

    await page.getByRole("button", {name: "Start timer"}).click();
    await advanceClock(page, 1000);

    await page.getByRole("button", {name: "Complete 1. Mash"}).click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await dialog.getByRole("button", {name: "Confirm"}).click();
    await expect(dialog).not.toBeVisible();
    await settleSave(page);

    await expect(page.getByRole("button", {name: "Start timer"})).toBeVisible();
    const frozenValue = await page.getByRole("timer", {name: "Elapsed time"}).textContent();

    await page.waitForTimeout(1200);
    await expect(page.getByRole("timer", {name: "Elapsed time"})).toHaveText(frozenValue ?? "");
});

test("confirming a phase complete leaves an already-paused or not-yet-started timer untouched", async ({page}) => {
    await seedBatch(page, {name: "E2E Complete Timer Untouched Batch"});
    await page.getByRole("tab", {name: "Brewing", exact: true}).click();

    await expect(page.getByRole("button", {name: "Start timer"})).toBeVisible();
    await page.getByRole("button", {name: "Complete 1. Mash"}).click();
    let dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await dialog.getByRole("button", {name: "Confirm"}).click();
    await expect(dialog).not.toBeVisible();
    await settleSave(page);

    await expect(page.getByRole("button", {name: "Start timer"})).toBeVisible();
    await expect(page.getByRole("timer", {name: "Elapsed time"})).toHaveText("00:00:00");

    await page.getByRole("button", {name: "Start timer"}).click();
    await advanceClock(page, 1000);
    await page.getByRole("button", {name: "Pause timer"}).click();
    await expect(page.getByRole("button", {name: "Start timer"})).toBeVisible();
    const frozenValue = await page.getByRole("timer", {name: "Elapsed time"}).textContent();

    await page.getByRole("button", {name: "Complete 2. Boil"}).click();
    dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await dialog.getByRole("button", {name: "Confirm"}).click();
    await expect(dialog).not.toBeVisible();
    await settleSave(page);

    await expect(page.getByRole("button", {name: "Start timer"})).toBeVisible();
    await expect(page.getByRole("timer", {name: "Elapsed time"})).toHaveText(frozenValue ?? "");
});
