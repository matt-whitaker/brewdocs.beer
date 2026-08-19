import { defineConfig, devices } from "@playwright/test";

// One channel everywhere: the Google Chrome the machine already has.
//
// Locally this was forced — Playwright 1.62 ships no chromium build for macOS 13, so
// `playwright install` refuses and every run died on a missing executable. CI joined on
// 2026-08-19: ubuntu-latest preinstalls Chrome (the old "the runner has no Chrome" premise
// was wrong), and the bundled build cost a 268MB download per PR plus cache plumbing,
// buying only a version pin against runner-image updates.
//
// ⚠️ The accepted trade: the CI browser floats with the runner image. A suite that breaks
// right after an image update should suspect Chrome drift first. E2E_CHANNEL overrides in
// either environment.
const channel = process.env.E2E_CHANNEL || "chrome";

export default defineConfig({
    testDir: "./tests",
    fullyParallel: true,
    retries: process.env.CI ? 2 : 0,
    workers: process.env.CI ? 6 : undefined,
    use: {
        baseURL: process.env.E2E_BASE_URL ?? "http://localhost:4173",
        trace: "on-first-retry",
        screenshot: "only-on-failure"
    },
    webServer: {
        command: "npm run serve-e2e -w packages/app",
        cwd: "../..",
        url: "http://localhost:4173",
        reuseExistingServer: !process.env.CI,
        timeout: 300_000
    },
    projects: [
        { name: "chromium", use: { ...devices["Desktop Chrome"], channel } }
    ]
});
