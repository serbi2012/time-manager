/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
    test: {
        // 브라우저 환경 시뮬레이션 (happy-dom: 가볍고 빠름)
        environment: "happy-dom",

        // 전역 설정 파일
        setupFiles: ["./src/test/setup.ts"],

        // 테스트 파일 패턴
        include: ["src/**/*.test.{ts,tsx}"],

        // 전역 API 사용 (describe, it, expect 등)
        globals: true,

        // 커버리지 설정
        coverage: {
            provider: "v8",
            reporter: ["text", "json", "html"],
            exclude: [
                "node_modules/",
                "src/test/",
                "**/*.d.ts",
                "**/*.config.{ts,js}",
            ],
        },

        // 타임아웃 설정 (ms)
        testTimeout: 10000,

        // 모의 객체 초기화
        mockReset: true,
    },
});
