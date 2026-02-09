/**
 * 사용자 메뉴 컴포넌트
 */

import { Button, Dropdown, Avatar, Space, Spin } from "antd";
import {
    GoogleOutlined,
    UserOutlined,
    LogoutOutlined,
    SyncOutlined,
} from "@ant-design/icons";
import type { User } from "firebase/auth";

interface UserMenuProps {
    user: User | null;
    auth_loading: boolean;
    is_authenticated: boolean;
    is_mobile: boolean;
    is_syncing: boolean;
    on_login: () => void;
    on_logout: () => void;
    on_manual_sync: () => void;
}

/**
 * 사용자 메뉴 컴포넌트
 */
export function UserMenu({
    user,
    auth_loading,
    is_authenticated,
    is_mobile,
    is_syncing,
    on_login,
    on_logout,
    on_manual_sync,
}: UserMenuProps) {
    const user_menu_items = [
        {
            key: "refresh",
            icon: <SyncOutlined spin={is_syncing} />,
            label: "서버에서 새로고침",
            onClick: on_manual_sync,
        },
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
                        size="small"
                    />
                    {!is_mobile && (
                        <span className="!text-white !text-[13px]">
                            {user.displayName || user.email}
                        </span>
                    )}
                </Space>
            </Dropdown>
        );
    }

    return (
        <Button
            type="primary"
            icon={<GoogleOutlined />}
            onClick={on_login}
            size="small"
        >
            {is_mobile ? "" : "로그인"}
        </Button>
    );
}

export default UserMenu;
