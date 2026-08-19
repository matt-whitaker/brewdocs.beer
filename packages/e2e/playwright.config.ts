import { defineConfig, devices } from "@playwright/test";

const channel = process.env.E2E_CHANNEL || (process.env.CI ? undefined : "chrome");

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
