/**
 * 테마 탭 컴포넌트
 */

import { Typography } from "antd";
import { BgColorsOutlined, CheckOutlined } from "@ant-design/icons";
import { useWorkStore } from "@/store/useWorkStore";
import {
    APP_THEME_COLORS,
    APP_THEME_LABELS,
    type AppTheme,
} from "@/shared/constants";
import { APP_THEME_VALUES } from "@/shared/constants/enums/theme";
import {
    SETTINGS_THEME_TITLE,
    SETTINGS_THEME_DESC,
    SETTINGS_THEME_AUTO_SAVE_HINT,
} from "../../constants";

const { Text } = Typography;

const THEME_ICON_WRAPPER_BASE: React.CSSProperties = {
    width: 64,
    height: 64,
    borderRadius: 16,
    margin: "0 auto 12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
};

const THEME_ITEM_BASE: React.CSSProperties = {
    cursor: "pointer",
    borderRadius: 12,
    padding: 4,
    border: "2px solid transparent",
    transition: "all 0.2s ease",
};

const THEME_ITEM_BOX_BASE: React.CSSProperties = {
    height: 56,
    borderRadius: 8,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
};

const THEME_ITEM_LABEL_BASE: React.CSSProperties = {
    display: "block",
    textAlign: "center",
    fontSize: 12,
};

const THEME_HINT_BOX_BASE: React.CSSProperties = {
    marginTop: 24,
    padding: "12px 16px",
    borderRadius: 8,
};

export function ThemeTab() {
    const app_theme = useWorkStore((state) => state.app_theme);
    const setAppTheme = useWorkStore((state) => state.setAppTheme);

    return (
        <div>
            <div className="mb-xl text-center">
                <div
                    style={{
                        ...THEME_ICON_WRAPPER_BASE,
                        background: APP_THEME_COLORS[app_theme].gradient,
                        boxShadow: `0 8px 24px ${APP_THEME_COLORS[app_theme].primary}33`,
                    }}
                >
                    <BgColorsOutlined className="!text-[28px] !text-white" />
                </div>
                <Text strong className="!text-base !block">
                    {SETTINGS_THEME_TITLE}
                </Text>
                <Text type="secondary" className="!text-[13px]">
                    {SETTINGS_THEME_DESC}
                </Text>
            </div>

            <div className="grid grid-cols-[repeat(auto-fill,minmax(90px,1fr))] gap-md">
                {APP_THEME_VALUES.map((theme) => {
                    const is_selected = app_theme === theme;
                    return (
                        <div
                            key={theme}
                            role="button"
                            tabIndex={0}
                            onClick={() => setAppTheme(theme as AppTheme)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ") {
                                    e.preventDefault();
                                    setAppTheme(theme as AppTheme);
                                }
                            }}
                            style={{
                                ...THEME_ITEM_BASE,
                                background: is_selected
                                    ? `${APP_THEME_COLORS[theme].primary}15`
                                    : "transparent",
                                borderColor: is_selected
                                    ? APP_THEME_COLORS[theme].primary
                                    : "transparent",
                            }}
                        >
                            <div
                                style={{
                                    ...THEME_ITEM_BOX_BASE,
                                    background:
                                        APP_THEME_COLORS[theme].gradient,
                                    boxShadow: is_selected
                                        ? `0 4px 12px ${APP_THEME_COLORS[theme].primary}40`
                                        : "none",
                                }}
                            >
                                {is_selected && (
                                    <div className="w-6 h-6 rounded-full bg-white/90 flex items-center justify-center">
                                        <CheckOutlined
                                            style={{
                                                color: APP_THEME_COLORS[theme]
                                                    .primary,
                                                fontSize: 14,
                                            }}
                                        />
                                    </div>
                                )}
                            </div>
                            <Text
                                style={{
                                    ...THEME_ITEM_LABEL_BASE,
                                    fontWeight: is_selected ? 600 : 400,
                                    color: is_selected
                                        ? APP_THEME_COLORS[theme].primary
                                        : "#595959",
                                }}
                            >
                                {APP_THEME_LABELS[theme]}
                            </Text>
                        </div>
                    );
                })}
            </div>

            <div
                style={{
                    ...THEME_HINT_BOX_BASE,
                    background: `${APP_THEME_COLORS[app_theme].primary}08`,
                    border: `1px solid ${APP_THEME_COLORS[app_theme].primary}20`,
                }}
            >
                <Text className="!text-xs !text-[#595959]">
                    {SETTINGS_THEME_AUTO_SAVE_HINT}
                </Text>
            </div>
        </div>
    );
}

export default ThemeTab;
