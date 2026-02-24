/**
 * 데스크탑 헤더 컴포넌트
 * B안: White Pill on Blue + Slide Morph 애니메이션
 */

import { SettingOutlined } from "@ant-design/icons";
import type { User } from "firebase/auth";
import { HeaderContent } from "./HeaderContent";
import { HeaderNavPill } from "./HeaderNavPill";
import type { NavItem } from "./HeaderNavPill";
import { UserMenu } from "./UserMenu";
import { SyncIndicator } from "../SyncStatus";
import type { SyncStatus } from "../../features/sync";
import { APP_THEME_COLORS, type AppTheme } from "../../shared/config";

interface DesktopHeaderProps {
    app_theme: AppTheme;
    nav_items: NavItem[];
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

export function DesktopHeader({
    app_theme,
    nav_items,
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
        <header
            className="app-header"
            style={{
                background: APP_THEME_COLORS[app_theme].gradient,
            }}
        >
            {/* Left: Logo + Navigation */}
            <div className="flex items-center gap-2xl">
                <HeaderContent />
                <HeaderNavPill items={nav_items} current_path={current_path} />
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-md">
                <SyncIndicator
                    sync_status={sync_status}
                    show_sync_check={show_sync_check}
                    is_authenticated={is_authenticated}
                    auth_loading={auth_loading}
                    is_mobile={false}
                />

                <div
                    className="w-[1px] h-[14px]"
                    style={{ background: "rgba(255,255,255,0.15)" }}
                />

                <button
                    onClick={on_settings_open}
                    className="w-[28px] h-[28px] rounded-md flex items-center justify-center bg-transparent border-none cursor-pointer transition-all hover:bg-white/10"
                    style={{ color: "rgba(255,255,255,0.7)" }}
                >
                    <SettingOutlined style={{ fontSize: 14 }} />
                </button>

                <UserMenu
                    user={user}
                    auth_loading={auth_loading}
                    is_authenticated={is_authenticated}
                    is_mobile={false}
                    is_syncing={is_syncing}
                    current_version={current_version}
                    on_login={on_login}
                    on_logout={on_logout}
                    on_manual_sync={on_manual_sync}
                    on_changelog_open={on_changelog_open}
                />
            </div>
        </header>
    );
}

export default DesktopHeader;
