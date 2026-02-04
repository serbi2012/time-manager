/**
 * 설정 항목 레이아웃 (반응형)
 */

import { Typography } from "antd";

const { Text } = Typography;

const ROW_MOBILE: React.CSSProperties = {
    padding: "12px 0",
    borderBottom: "1px solid #f0f0f0",
};

const TITLE_MOBILE: React.CSSProperties = {
    fontSize: 14,
    display: "block",
    marginBottom: 2,
};

const DESC_MOBILE: React.CSSProperties = {
    fontSize: 12,
    lineHeight: 1.4,
};

const ROW_DESKTOP: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "16px 0",
    borderBottom: "1px solid #f0f0f0",
};

const INNER_DESKTOP: React.CSSProperties = {
    display: "flex",
    alignItems: "flex-start",
    gap: 12,
    flex: 1,
};

const ICON_WRAPPER: React.CSSProperties = {
    width: 36,
    height: 36,
    borderRadius: 8,
    background: "#f5f5f5",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 16,
    color: "#595959",
    flexShrink: 0,
};

const TITLE_DESKTOP: React.CSSProperties = {
    fontSize: 14,
    display: "block",
};

const DESC_DESKTOP: React.CSSProperties = {
    fontSize: 12,
};

const ACTION_WRAPPER: React.CSSProperties = {
    flexShrink: 0,
    marginLeft: 16,
};

export interface SettingItemProps {
    icon: React.ReactNode;
    title: string;
    description?: string;
    action: React.ReactNode;
    is_mobile?: boolean;
}

export function SettingItem({
    icon,
    title,
    description,
    action,
    is_mobile,
}: SettingItemProps) {
    if (is_mobile) {
        return (
            <div style={ROW_MOBILE}>
                <div style={{ marginBottom: 8 }}>
                    <Text strong style={TITLE_MOBILE}>
                        {title}
                    </Text>
                    {description && (
                        <Text type="secondary" style={DESC_MOBILE}>
                            {description}
                        </Text>
                    )}
                </div>
                <div>{action}</div>
            </div>
        );
    }

    return (
        <div style={ROW_DESKTOP}>
            <div style={INNER_DESKTOP}>
                <div style={ICON_WRAPPER}>{icon}</div>
                <div style={{ flex: 1 }}>
                    <Text strong style={TITLE_DESKTOP}>
                        {title}
                    </Text>
                    {description && (
                        <Text type="secondary" style={DESC_DESKTOP}>
                            {description}
                        </Text>
                    )}
                </div>
            </div>
            <div style={ACTION_WRAPPER}>{action}</div>
        </div>
    );
}
