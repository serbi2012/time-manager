/**
 * 모바일 프리셋 드로어 컴포넌트
 */

import { Drawer } from "antd";
import { AppstoreOutlined } from "@ant-design/icons";
import WorkTemplateList from "../../components/WorkTemplateList";
import { APP_THEME_COLORS, type AppTheme } from "../../shared/config";

const DRAWER_TITLE = "작업 프리셋";
const DRAWER_ARIA_LABEL = "프리셋 열기";

const DRAWER_BODY_STYLE = { padding: 12 };
const DRAWER_WRAPPER_STYLE = { maxHeight: "70vh" };

interface MobilePresetDrawerProps {
    is_open: boolean;
    on_close: () => void;
    on_add_record_only: (template_id: string) => void;
    app_theme: AppTheme;
}

/**
 * 모바일 프리셋 FAB 버튼
 */
export function MobilePresetFab({
    on_open,
    app_theme,
}: {
    on_open: () => void;
    app_theme: AppTheme;
}) {
    const fab_style: React.CSSProperties = {
        background: APP_THEME_COLORS[app_theme].gradient,
        boxShadow: `0 4px 12px ${APP_THEME_COLORS[app_theme].primary}66`,
    };

    return (
        <button
            className="mobile-preset-fab"
            onClick={on_open}
            aria-label={DRAWER_ARIA_LABEL}
            style={fab_style}
        >
            <AppstoreOutlined />
        </button>
    );
}

/**
 * 모바일 프리셋 드로어 컴포넌트
 */
export function MobilePresetDrawer({
    is_open,
    on_close,
    on_add_record_only,
}: MobilePresetDrawerProps) {
    return (
        <Drawer
            title={DRAWER_TITLE}
            placement="bottom"
            open={is_open}
            onClose={on_close}
            className="mobile-preset-drawer"
            styles={{
                body: DRAWER_BODY_STYLE,
                wrapper: DRAWER_WRAPPER_STYLE,
            }}
        >
            <WorkTemplateList onAddRecordOnly={on_add_record_only} />
        </Drawer>
    );
}

export default MobilePresetDrawer;
