import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
    testDir: "./tests",
    retries: process.env.CI ? 2 : 0,
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
        timeout: 120_000
    },
    projects: [
        { name: "chromium", use: { ...devices["Desktop Chrome"] } }
    ]
});
