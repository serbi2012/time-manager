/**
 * 모바일 하단 네비게이션 — 플로팅 글래스 스타일
 */

import { useNavigate, useLocation } from "react-router-dom";
import {
    HomeOutlined,
    HomeFilled,
    CalendarOutlined,
    CalendarFilled,
    BookOutlined,
    BookFilled,
} from "@ant-design/icons";
import { cn } from "../../shared/lib/cn";

interface NavItem {
    key: string;
    icon: React.ReactNode;
    active_icon: React.ReactNode;
    label: string;
}

const NAV_ITEMS: NavItem[] = [
    {
        key: "/",
        icon: <HomeOutlined />,
        active_icon: <HomeFilled />,
        label: "일간",
    },
    {
        key: "/weekly",
        icon: <CalendarOutlined />,
        active_icon: <CalendarFilled />,
        label: "주간",
    },
    {
        key: "/guide",
        icon: <BookOutlined />,
        active_icon: <BookFilled />,
        label: "설명서",
    },
];

const GLASS_NAV_STYLE: React.CSSProperties = {
    background: "rgba(255, 255, 255, 0.88)",
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    boxShadow: "0 4px 24px rgba(0, 0, 0, 0.06), 0 0 0 1px rgba(0, 0, 0, 0.03)",
};

/**
 * 모바일 하단 네비게이션 — 플로팅 글래스 스타일
 */
export function MobileBottomNav() {
    const navigate = useNavigate();
    const location = useLocation();

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-[100] hidden max-sm:block">
            <div
                className="mx-lg mb-lg rounded-2xl flex items-center py-sm px-sm"
                style={GLASS_NAV_STYLE}
            >
                {NAV_ITEMS.map((item) => {
                    const is_active = location.pathname === item.key;
                    return (
                        <button
                            key={item.key}
                            className={cn(
                                "flex-1 flex flex-col items-center gap-[3px] border-0 bg-transparent cursor-pointer transition-all duration-200 py-xs rounded-xl",
                                is_active
                                    ? "text-primary bg-primary/[0.06]"
                                    : "text-gray-400"
                            )}
                            style={{
                                WebkitTapHighlightColor: "transparent",
                            }}
                            onClick={() => navigate(item.key)}
                        >
                            <span className="text-[20px] leading-none">
                                {is_active ? item.active_icon : item.icon}
                            </span>
                            <span
                                className={cn(
                                    "text-[10px]",
                                    is_active ? "font-semibold" : "font-medium"
                                )}
                            >
                                {item.label}
                            </span>
                        </button>
                    );
                })}
            </div>
        </nav>
    );
}

export default MobileBottomNav;
