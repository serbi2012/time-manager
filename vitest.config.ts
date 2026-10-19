/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

const NODE_TEST_FILES = [
    "src/test/unit/**/*.test.{ts,tsx}",
    "src/test/store/**/*.test.{ts,tsx}",
    "src/test/firebase/**/*.test.{ts,tsx}",
    "src/test/utils/**/*.test.{ts,tsx}",
];

export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
    test: {
        projects: [
            {
                extends: true,
                test: {
                    name: "node",
                    environment: "node",
                    include: NODE_TEST_FILES,
                    setupFiles: ["./src/test/setup/common.ts"],
                },
            },
            {
                extends: true,
                test: {
                    name: "dom",
                    environment: "happy-dom",
                    include: ["src/**/*.test.{ts,tsx}"],
                    exclude: NODE_TEST_FILES,
                    setupFiles: ["./src/test/setup.ts"],
                },
            },
        ],

        // 전역 API 사용 (describe, it, expect 등)
        globals: true,

        // 커버리지 설정
        coverage: {
            provider: "v8",
            reporter: ["text", "json-summary", "html"],
            reportsDirectory: "./coverage",
            exclude: [
                "node_modules/",
                "src/test/",
                "**/*.d.ts",
                "**/*.config.{ts,js}",
            ],
            thresholds: {
                statements: 65,
                branches: 50,
                functions: 60,
                lines: 65,
            },
        },

        // 타임아웃 설정 (ms)
        testTimeout: 10000,

        // 모의 객체 초기화
        clearMocks: true,
        restoreMocks: true,

        deps: {
            optimizer: {
                client: {
                    enabled: true,
                    include: [
                        "antd",
                        "framer-motion",
                        "lodash-es",
                    ],
                },
            },
        },
    },
});
