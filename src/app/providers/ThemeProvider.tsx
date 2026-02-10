/**
 * 테마 프로바이더
 * Ant Design ConfigProvider + App + CSS Custom Properties 동기화
 */

import { useEffect } from "react";
import { StyleProvider } from "@ant-design/cssinjs";
import { App, ConfigProvider, theme } from "antd";
import koKR from "antd/locale/ko_KR";
import dayjs from "dayjs";
import "dayjs/locale/ko";
import { useWorkStore } from "../../store/useWorkStore";
import { APP_THEME_COLORS } from "../../shared/config";
import { registerMessageInstance } from "../../shared/lib/message";

dayjs.locale("ko");

interface ThemeProviderProps {
    children: React.ReactNode;
}

/**
 * Sync CSS custom properties with current theme.
 * Enables Tailwind classes to reference theme-aware colors.
 */
function useSyncCssVariables(theme_colors: {
    primary: string;
    gradient: string;
    gradientDark: string;
}) {
    useEffect(() => {
        const root = document.documentElement;
        root.style.setProperty("--color-primary", theme_colors.primary);
        root.style.setProperty(
            "--color-primary-gradient",
            theme_colors.gradient
        );
        root.style.setProperty(
            "--color-primary-dark",
            theme_colors.gradientDark
        );
    }, [theme_colors]);
}

/**
 * Captures context-aware message instance from App.useApp().
 * Must be rendered inside <App>.
 */
function MessageInstanceCapture({ children }: { children: React.ReactNode }) {
    const { message } = App.useApp();

    useEffect(() => {
        registerMessageInstance(message);
    }, [message]);

    return <>{children}</>;
}

/**
 * 앱 테마 프로바이더
 */
export function ThemeProvider({ children }: ThemeProviderProps) {
    const app_theme = useWorkStore((state) => state.app_theme);
    const theme_colors = APP_THEME_COLORS[app_theme];

    useSyncCssVariables(theme_colors);

    return (
        <StyleProvider layer>
            <ConfigProvider
                locale={koKR}
                theme={{
                    algorithm: theme.defaultAlgorithm,
                    token: {
                        colorPrimary: theme_colors.primary,
                        borderRadius: 12,
                        fontFamily:
                            '"Pretendard Variable", Pretendard, -apple-system, BlinkMacSystemFont, system-ui, Roboto, "Helvetica Neue", "Segoe UI", "Apple SD Gothic Neo", "Noto Sans KR", "Malgun Gothic", "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", sans-serif',
                    },
                }}
            >
                <App component={false}>
                    <MessageInstanceCapture>{children}</MessageInstanceCapture>
                </App>
            </ConfigProvider>
        </StyleProvider>
    );
}

export default ThemeProvider;
