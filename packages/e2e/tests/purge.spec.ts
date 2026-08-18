import {expect, test} from "@playwright/test";
import {seedBatch} from "./seedBatch";

test("/?purge=true redirects home and leaves no batches behind", async ({page}) => {
    await seedBatch(page, {name: "E2E Purge Batch"});

    await page.goto("/?purge=true");
    await expect(page).toHaveURL(/\/$/);

    await page.goto("/batches");
    await expect(page.getByText("E2E Purge Batch")).not.toBeVisible();
});
