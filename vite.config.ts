import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
    build: {
        target: "es2022",
        reportCompressedSize: false,
        rollupOptions: {
            external: ["mermaid"],
            output: {
                manualChunks(id) {
                    if (
                        id.includes("node_modules/react/") ||
                        id.includes("node_modules/react-dom/") ||
                        id.includes("node_modules/react-router")
                    ) {
                        return "vendor-react";
                    }
                    if (
                        id.includes("node_modules/antd/") ||
                        id.includes("node_modules/@ant-design/")
                    ) {
                        return "vendor-antd";
                    }
                    if (id.includes("node_modules/firebase/")) {
                        return "vendor-firebase";
                    }
                    if (id.includes("node_modules/framer-motion/")) {
                        return "vendor-motion";
                    }
                },
            },
        },
    },
    plugins: [
        tailwindcss(),
        react(),
        VitePWA({
            registerType: "autoUpdate",
            includeAssets: [
                "favicon.ico",
                "apple-touch-icon.png",
                "mask-icon.svg",
            ],
            manifest: {
                name: "업무 관리",
                short_name: "업무 관리",
                description: "실시간 타이머 기반 업무 시간 측정 및 관리",
                theme_color: "#1890ff",
                background_color: "#f5f7fa",
                display: "standalone",
                orientation: "portrait",
                scope: "/",
                start_url: "/",
                icons: [
                    {
                        src: "pwa-192x192.png",
                        sizes: "192x192",
                        type: "image/png",
                    },
                    {
                        src: "pwa-512x512.png",
                        sizes: "512x512",
                        type: "image/png",
                    },
                    {
                        src: "pwa-512x512.png",
                        sizes: "512x512",
                        type: "image/png",
                        purpose: "any maskable",
                    },
                ],
            },
            workbox: {
                disableDevLogs: true,
                skipWaiting: true,
                clientsClaim: true,
                globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
                navigateFallback: "index.html",
                navigateFallbackDenylist: [/^\/api\//],
                maximumFileSizeToCacheInBytes: 4 * 1024 * 1024, // 4MB
                runtimeCaching: [
                    {
                        urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
                        handler: "CacheFirst",
                        options: {
                            cacheName: "google-fonts-cache",
                            expiration: {
                                maxEntries: 10,
                                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
                            },
                            cacheableResponse: {
                                statuses: [0, 200],
                            },
                        },
                    },
                    {
                        urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
                        handler: "CacheFirst",
                        options: {
                            cacheName: "gstatic-fonts-cache",
                            expiration: {
                                maxEntries: 10,
                                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
                            },
                            cacheableResponse: {
                                statuses: [0, 200],
                            },
                        },
                    },
                    {
                        urlPattern:
                            /^https:\/\/cdn\.jsdelivr\.net\/npm\/mermaid.*/i,
                        handler: "CacheFirst",
                        options: {
                            cacheName: "mermaid-cdn-cache",
                            expiration: {
                                maxEntries: 5,
                                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
                            },
                            cacheableResponse: {
                                statuses: [0, 200],
                            },
                        },
                    },
                ],
            },
            devOptions: {
                enabled: false,
            },
        }),
    ],
});
