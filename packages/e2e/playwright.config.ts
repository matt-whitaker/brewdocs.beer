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
        timeout: 120_000,
        // packages/app/.env.development sets VITE_DEV_TOOLS=true, so the dev server
        // renders the TanStack devtools overlay by default. That overlay injects
        // hidden "status:"/"statusCode:" nodes that break substring locators like
        // getByText("Status") (strict-mode: multiple matches) and can shift layout /
        // intercept clicks. A process env var overrides the .env file, so force it off.
        env: { VITE_DEV_TOOLS: "false" }
    },
    projects: [
        { name: "chromium", use: { ...devices["Desktop Chrome"] } }
    ]
});
