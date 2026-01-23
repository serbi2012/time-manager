/**
 * 모바일 헤더 컴포넌트
 */

import { Layout, Button, Space } from "antd";
import { SettingOutlined } from "@ant-design/icons";
import type { User } from "firebase/auth";
import { HeaderContent } from "./HeaderContent";
import { UserMenu } from "./UserMenu";
import { SyncIndicator } from "../SyncStatus";
import type { SyncStatus } from "../../features/sync";
import { APP_THEME_COLORS, type AppTheme } from "../../shared/config";

const { Header } = Layout;

interface MobileHeaderProps {
    app_theme: AppTheme;
    user: User | null;
    auth_loading: boolean;
    is_authenticated: boolean;
    sync_status: SyncStatus;
    show_sync_check: boolean;
    is_syncing: boolean;
    on_login: () => void;
    on_logout: () => void;
    on_manual_sync: () => void;
    on_settings_open: () => void;
}

/**
 * 모바일 헤더 컴포넌트
 */
export function MobileHeader({
    app_theme,
    user,
    auth_loading,
    is_authenticated,
    sync_status,
    show_sync_check,
    is_syncing,
    on_login,
    on_logout,
    on_manual_sync,
    on_settings_open,
}: MobileHeaderProps) {
    return (
        <Header
            className="app-header"
            style={{
                background: APP_THEME_COLORS[app_theme].gradient,
            }}
        >
            <HeaderContent />
            <Space size="small">
                <SyncIndicator
                    sync_status={sync_status}
                    show_sync_check={show_sync_check}
                    is_authenticated={is_authenticated}
                    auth_loading={auth_loading}
                    is_mobile={true}
                />

                <Button
                    type="text"
                    icon={<SettingOutlined />}
                    onClick={on_settings_open}
                    style={{
                        color: "white",
                        fontSize: 20,
                    }}
                />

                <UserMenu
                    user={user}
                    auth_loading={auth_loading}
                    is_authenticated={is_authenticated}
                    is_mobile={true}
                    is_syncing={is_syncing}
                    on_login={on_login}
                    on_logout={on_logout}
                    on_manual_sync={on_manual_sync}
                />
            </Space>
        </Header>
    );
}

export default MobileHeader;
