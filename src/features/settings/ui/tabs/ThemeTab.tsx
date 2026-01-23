/**
 * 테마 탭 컴포넌트
 */

import { Radio, Space, Typography } from "antd";
import type { ThemeTabProps } from "../../model/types";
import { 
    APP_THEME_COLORS, 
    APP_THEME_LABELS, 
    type AppTheme 
} from "../../../../shared/config";

const { Text } = Typography;

const THEME_OPTIONS: AppTheme[] = [
    "blue",
    "green", 
    "purple",
    "red",
    "orange",
    "teal",
    "black",
];

/**
 * 테마 탭 컴포넌트
 * 앱 테마 색상 선택
 */
export function ThemeTab({
    current_theme,
    on_change,
}: ThemeTabProps) {
    return (
        <div className="theme-tab">
            <Text strong>앱 테마 색상</Text>
            <div style={{ marginTop: 16 }}>
                <Radio.Group
                    value={current_theme}
                    onChange={(e) => on_change(e.target.value)}
                >
                    <Space direction="vertical">
                        {THEME_OPTIONS.map((theme) => (
                            <Radio key={theme} value={theme}>
                                <Space>
                                    <div
                                        style={{
                                            width: 16,
                                            height: 16,
                                            borderRadius: 4,
                                            background: APP_THEME_COLORS[theme].primary,
                                        }}
                                    />
                                    <span>{APP_THEME_LABELS[theme]}</span>
                                </Space>
                            </Radio>
                        ))}
                    </Space>
                </Radio.Group>
            </div>

            <style>{`
                .theme-tab {
                    padding: 16px 0;
                }
            `}</style>
        </div>
    );
}

export default ThemeTab;
