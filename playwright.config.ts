import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright E2E 테스트 설정
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
    testDir: "./src/test/e2e",

    /* 테스트 실행 설정 */
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    workers: process.env.CI ? 1 : undefined,

    /* 리포터 설정 */
    reporter: [["html", { outputFolder: "playwright-report" }], ["list"]],

    /* 전역 테스트 설정 */
    use: {
        baseURL: "http://localhost:5173",
        trace: "on-first-retry",
        screenshot: "only-on-failure",
        video: "on-first-retry",
    },

    /* 프로젝트별 설정 */
    projects: [
        {
            name: "chromium",
            use: { ...devices["Desktop Chrome"] },
        },
        {
            name: "firefox",
            use: { ...devices["Desktop Firefox"] },
        },
        {
            name: "webkit",
            use: { ...devices["Desktop Safari"] },
        },
        /* 모바일 테스트 */
        {
            name: "Mobile Chrome",
            use: { ...devices["Pixel 5"] },
        },
        {
            name: "Mobile Safari",
            use: { ...devices["iPhone 12"] },
        },
    ],

    /* 로컬 개발 서버 */
    webServer: {
        command: "pnpm dev",
        url: "http://localhost:5173",
        reuseExistingServer: !process.env.CI,
        timeout: 120 * 1000,
    },
});
