/**
 * 모바일 프리셋 드로어 컴포넌트
 */

import { Drawer } from "antd";
import { AppstoreOutlined } from "@ant-design/icons";
import WorkTemplateList from "../../components/WorkTemplateList";
import { APP_THEME_COLORS, type AppTheme } from "../../shared/config";

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
    return (
        <button
            className="mobile-preset-fab"
            onClick={on_open}
            aria-label="프리셋 열기"
            style={{
                background: APP_THEME_COLORS[app_theme].gradient,
                boxShadow: `0 4px 12px ${APP_THEME_COLORS[app_theme].primary}66`,
            }}
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
            title="작업 프리셋"
            placement="bottom"
            open={is_open}
            onClose={on_close}
            className="mobile-preset-drawer"
            styles={{
                body: { padding: 12 },
                wrapper: { maxHeight: "70vh" },
            }}
        >
            <WorkTemplateList onAddRecordOnly={on_add_record_only} />
        </Drawer>
    );
}

export default MobilePresetDrawer;
