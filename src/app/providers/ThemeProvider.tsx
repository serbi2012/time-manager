/**
 * 테마 프로바이더
 * Ant Design ConfigProvider 설정
 */

import { ConfigProvider, theme } from "antd";
import koKR from "antd/locale/ko_KR";
import dayjs from "dayjs";
import "dayjs/locale/ko";
import { useWorkStore } from "../../store/useWorkStore";
import { APP_THEME_COLORS } from "../../shared/config";

dayjs.locale("ko");

interface ThemeProviderProps {
    children: React.ReactNode;
}

/**
 * 앱 테마 프로바이더
 */
export function ThemeProvider({ children }: ThemeProviderProps) {
    const app_theme = useWorkStore((state) => state.app_theme);
    const theme_color = APP_THEME_COLORS[app_theme].primary;

    return (
        <ConfigProvider
            locale={koKR}
            theme={{
                algorithm: theme.defaultAlgorithm,
                token: {
                    colorPrimary: theme_color,
                    borderRadius: 8,
                },
            }}
        >
            {children}
        </ConfigProvider>
    );
}

export default ThemeProvider;
