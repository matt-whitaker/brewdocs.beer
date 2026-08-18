import { defineConfig, devices } from "@playwright/test";

// Locally we drive the INSTALLED Google Chrome; in CI, Playwright's own chromium.
//
// Playwright 1.62 ships no chromium build for macOS 13, so `playwright install` refuses
// ("does not support chromium on mac13") and the browser cache stays empty — every local run
// then dies on a missing executable, which reads as "cannot verify" rather than as a failure
// and quietly hands verification to CI. `channel` skips the download and uses the browser the
// machine already has.
//
// ⚠️ CI must stay on the bundled build: functional-test.yaml installs chromium and the runner
// has no Chrome. This used to be a commented-out line to flip by hand, and both directions of
// forgetting cost something — an unverified local run, or a committed channel that breaks CI.
const channel = process.env.E2E_CHANNEL || (process.env.CI ? undefined : "chrome");

export default defineConfig({
    testDir: "./tests",
    fullyParallel: true,
    retries: process.env.CI ? 2 : 0,
    workers: process.env.CI ? 6 : undefined,
    use: {
        baseURL: process.env.E2E_BASE_URL ?? "http://localhost:5173",
        trace: "on-first-retry",
        screenshot: "only-on-failure"
    },
    webServer: {
        command: "npm run dev -w packages/app",
        cwd: "../..",
        url: "http://localhost:5173",
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
        // packages/app/.env.development sets VITE_DEV_TOOLS=true, so the dev server
        // renders the TanStack devtools overlay by default. That overlay injects
        // hidden "status:"/"statusCode:" nodes that break substring locators like
        // getByText("Status") (strict-mode: multiple matches) and can shift layout /
        // intercept clicks. A process env var overrides the .env file, so force it off.
        env: { VITE_DEV_TOOLS: "false" }
    },
    projects: [
        { name: "chromium", use: { ...devices["Desktop Chrome"], channel } }
    ]
});
