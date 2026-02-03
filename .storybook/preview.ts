import type { Preview } from "@storybook/react";
import "../src/index.css";

const preview: Preview = {
    parameters: {
        controls: {
            matchers: {
                color: /(background|color)$/i,
                date: /Date$/i,
            },
        },
        // 액션 자동 탐지
        actions: { argTypesRegex: "^on[A-Z].*" },
        // 반응형 뷰포트
        viewport: {
            viewports: {
                mobile: {
                    name: "Mobile",
                    styles: { width: "375px", height: "667px" },
                },
                tablet: {
                    name: "Tablet",
                    styles: { width: "768px", height: "1024px" },
                },
                desktop: {
                    name: "Desktop",
                    styles: { width: "1280px", height: "800px" },
                },
            },
        },
    },
};

export default preview;
