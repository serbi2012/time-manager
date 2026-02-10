/**
 * 모바일 헤더 컴포넌트
 */

import { Layout, Button, Space, Typography } from "antd";
import {
    SettingOutlined,
    ClockCircleOutlined,
    HomeOutlined,
    CalendarOutlined,
    MessageOutlined,
    BookOutlined,
} from "@ant-design/icons";
import type { User } from "firebase/auth";
import { useNavigate, useLocation } from "react-router-dom";
import { UserMenu } from "./UserMenu";
import { SyncIndicator } from "../SyncStatus";
import type { SyncStatus } from "../../features/sync";
import { APP_THEME_COLORS, type AppTheme } from "../../shared/config";
import { FEATURE_FLAGS } from "../../shared/constants";

const { Header } = Layout;
const { Text } = Typography;

/** 페이지 정보 매핑 */
const PAGE_INFO: Record<string, { label: string; icon: React.ReactNode }> = {
    "/": { label: "일간 기록", icon: <HomeOutlined /> },
    "/weekly": { label: "주간 일정", icon: <CalendarOutlined /> },
    ...(FEATURE_FLAGS.suggestions.visible
        ? { "/suggestions": { label: "건의사항", icon: <MessageOutlined /> } }
        : {}),
    "/guide": { label: "설명서", icon: <BookOutlined /> },
};

/** 오늘 날짜 포맷 (예: 1월 28일 화요일) */
function formatToday(): string {
    const today = new Date();
    const month = today.getMonth() + 1;
    const date = today.getDate();
    const days = ["일", "월", "화", "수", "목", "금", "토"];
    const day_name = days[today.getDay()];
    return `${month}월 ${date}일 ${day_name}요일`;
}

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
    const navigate = useNavigate();
    const location = useLocation();

    const current_page = PAGE_INFO[location.pathname] || PAGE_INFO["/"];

    const handleLogoClick = () => {
        navigate("/");
    };

    return (
        <Header
            className="app-header mobile-header"
            style={{
                background: APP_THEME_COLORS[app_theme].gradient,
            }}
        >
            {/* 왼쪽: 로고 + 현재 페이지 */}
            <div className="mobile-header-left" onClick={handleLogoClick}>
                <ClockCircleOutlined className="mobile-header-logo" />
                <div className="mobile-header-info">
                    <Text className="mobile-header-page">
                        {current_page.icon}
                        <span>{current_page.label}</span>
                    </Text>
                    <Text className="mobile-header-date">{formatToday()}</Text>
                </div>
            </div>

            {/* 오른쪽: 액션 버튼들 */}
            <Space size={4}>
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
                    className="mobile-header-btn"
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
