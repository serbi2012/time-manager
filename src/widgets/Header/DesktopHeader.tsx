/**
 * 데스크탑 헤더 컴포넌트
 */

import { Layout, Menu, Button, Space } from "antd";
import { SettingOutlined, InfoCircleOutlined } from "@ant-design/icons";
import type { User } from "firebase/auth";
import { HeaderContent } from "./HeaderContent";
import { UserMenu } from "./UserMenu";
import { SyncIndicator } from "../SyncStatus";
import type { SyncStatus } from "../../features/sync";
import { APP_THEME_COLORS, type AppTheme } from "../../shared/config";
import type { MenuItemType } from "antd/es/menu/interface";

const { Header } = Layout;

interface DesktopHeaderProps {
    app_theme: AppTheme;
    menu_items: MenuItemType[];
    current_path: string;
    user: User | null;
    auth_loading: boolean;
    is_authenticated: boolean;
    sync_status: SyncStatus;
    show_sync_check: boolean;
    is_syncing: boolean;
    current_version: string;
    on_login: () => void;
    on_logout: () => void;
    on_manual_sync: () => void;
    on_settings_open: () => void;
    on_changelog_open: () => void;
}

/**
 * 데스크탑 헤더 컴포넌트
 */
export function DesktopHeader({
    app_theme,
    menu_items,
    current_path,
    user,
    auth_loading,
    is_authenticated,
    sync_status,
    show_sync_check,
    is_syncing,
    current_version,
    on_login,
    on_logout,
    on_manual_sync,
    on_settings_open,
    on_changelog_open,
}: DesktopHeaderProps) {
    return (
        <Header
            className="app-header"
            style={{
                background: APP_THEME_COLORS[app_theme].gradient,
            }}
        >
            <HeaderContent />
            <Menu
                mode="horizontal"
                selectedKeys={[current_path]}
                items={menu_items}
                className="!flex-1 !ml-xl !bg-transparent !border-b-0"
                theme="dark"
            />
            <Space size="middle">
                <SyncIndicator
                    sync_status={sync_status}
                    show_sync_check={show_sync_check}
                    is_authenticated={is_authenticated}
                    auth_loading={auth_loading}
                    is_mobile={false}
                />

                <Button
                    type="text"
                    icon={<InfoCircleOutlined />}
                    onClick={on_changelog_open}
                    className="!text-white/85 !text-xs !px-sm !py-xs !h-auto"
                >
                    v{current_version}
                </Button>

                <Button
                    type="text"
                    icon={<SettingOutlined />}
                    onClick={on_settings_open}
                    className="!text-white !text-lg"
                />

                <UserMenu
                    user={user}
                    auth_loading={auth_loading}
                    is_authenticated={is_authenticated}
                    is_mobile={false}
                    is_syncing={is_syncing}
                    on_login={on_login}
                    on_logout={on_logout}
                    on_manual_sync={on_manual_sync}
                />
            </Space>
        </Header>
    );
}

export default DesktopHeader;
