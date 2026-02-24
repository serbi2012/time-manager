/**
 * 사용자 메뉴 컴포넌트
 */

import { Button, Dropdown, Avatar, Space, Spin } from "antd";
import {
    GoogleOutlined,
    UserOutlined,
    LogoutOutlined,
    SyncOutlined,
    InfoCircleOutlined,
} from "@ant-design/icons";
import type { User } from "firebase/auth";

interface UserMenuProps {
    user: User | null;
    auth_loading: boolean;
    is_authenticated: boolean;
    is_mobile: boolean;
    is_syncing: boolean;
    current_version?: string;
    on_login: () => void;
    on_logout: () => void;
    on_manual_sync: () => void;
    on_changelog_open?: () => void;
}

export function UserMenu({
    user,
    auth_loading,
    is_authenticated,
    is_mobile,
    is_syncing,
    current_version,
    on_login,
    on_logout,
    on_manual_sync,
    on_changelog_open,
}: UserMenuProps) {
    const user_menu_items = [
        {
            key: "refresh",
            icon: <SyncOutlined spin={is_syncing} />,
            label: "서버에서 새로고침",
            onClick: on_manual_sync,
        },
        ...(on_changelog_open
            ? [
                  {
                      key: "changelog",
                      icon: <InfoCircleOutlined />,
                      label: current_version
                          ? `변경 내역 (v${current_version})`
                          : "변경 내역",
                      onClick: on_changelog_open,
                  },
              ]
            : []),
        {
            key: "divider",
            type: "divider" as const,
        },
        {
            key: "logout",
            icon: <LogoutOutlined />,
            label: "로그아웃",
            onClick: on_logout,
            danger: true,
        },
    ];

    if (auth_loading) {
        return <Spin size="small" />;
    }

    if (is_authenticated && user) {
        return (
            <Dropdown menu={{ items: user_menu_items }} placement="bottomRight">
                <Space className="cursor-pointer">
                    <Avatar
                        src={user.photoURL}
                        icon={<UserOutlined />}
                        size={26}
                        style={{
                            backgroundColor: "rgba(255,255,255,0.2)",
                            color: "white",
                        }}
                    />
                </Space>
            </Dropdown>
        );
    }

    if (is_mobile) {
        return (
            <Button
                type="primary"
                icon={<GoogleOutlined />}
                onClick={on_login}
                size="small"
            />
        );
    }

    return (
        <button
            onClick={on_login}
            className="flex items-center gap-[5px] h-[28px] px-md rounded-full text-xs font-medium border-none cursor-pointer transition-all hover:bg-white/20"
            style={{
                background: "rgba(255,255,255,0.15)",
                color: "white",
            }}
        >
            <GoogleOutlined style={{ fontSize: 12 }} />
            로그인
        </button>
    );
}

export default UserMenu;
