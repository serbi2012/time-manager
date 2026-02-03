import { test, expect } from "@playwright/test";

test.describe("기본 페이지 테스트", () => {
    test("메인 페이지가 로드된다", async ({ page }) => {
        await page.goto("/");

        // 페이지 타이틀 확인
        await expect(page).toHaveTitle(/Time Manager/i);
    });

    test("일간 기록 페이지로 이동한다", async ({ page }) => {
        await page.goto("/");

        // 일간 기록 페이지 요소 확인
        await expect(page.locator("body")).toBeVisible();
    });
});

test.describe("모바일 뷰 테스트", () => {
    test.use({ viewport: { width: 375, height: 667 } });

    test("모바일에서 메인 페이지가 로드된다", async ({ page }) => {
        await page.goto("/");

        await expect(page.locator("body")).toBeVisible();
    });
});
