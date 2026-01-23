/**
 * 모바일 하단 네비게이션 컴포넌트
 */

import { useNavigate, useLocation } from "react-router-dom";
import {
    HomeOutlined,
    CalendarOutlined,
    MessageOutlined,
    BookOutlined,
} from "@ant-design/icons";

interface NavItem {
    key: string;
    icon: React.ReactNode;
    label: string;
}

const NAV_ITEMS: NavItem[] = [
    { key: "/", icon: <HomeOutlined />, label: "일간" },
    { key: "/weekly", icon: <CalendarOutlined />, label: "주간" },
    { key: "/suggestions", icon: <MessageOutlined />, label: "건의" },
    { key: "/guide", icon: <BookOutlined />, label: "설명서" },
];

/**
 * 모바일 하단 네비게이션 컴포넌트
 */
export function MobileBottomNav() {
    const navigate = useNavigate();
    const location = useLocation();

    return (
        <nav className="mobile-bottom-nav">
            {NAV_ITEMS.map((item) => (
                <button
                    key={item.key}
                    className={`mobile-nav-item ${
                        location.pathname === item.key ? "active" : ""
                    }`}
                    onClick={() => navigate(item.key)}
                >
                    {item.icon}
                    <span>{item.label}</span>
                </button>
            ))}
        </nav>
    );
}

export default MobileBottomNav;
