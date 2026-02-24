/**
 * 데스크탑 헤더 네비게이션 Pill
 * framer-motion layoutId 기반 슬라이딩 + 모프 애니메이션
 */

import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "../../shared/ui/animation";

export interface NavItem {
    key: string;
    label: string;
    icon: ReactNode;
}

interface HeaderNavPillProps {
    items: NavItem[];
    current_path: string;
}

const PILL_TRANSITION = {
    type: "spring" as const,
    stiffness: 350,
    damping: 25,
};

export function HeaderNavPill({ items, current_path }: HeaderNavPillProps) {
    const navigate = useNavigate();

    return (
        <nav className="flex items-center gap-[4px]">
            {items.map((item) => {
                const is_active = item.key === current_path;

                return (
                    <motion.button
                        key={item.key}
                        onClick={() => navigate(item.key)}
                        whileTap={{ scale: 0.97 }}
                        className="relative flex items-center gap-[6px] px-lg py-[5px] rounded-full text-sm border-none cursor-pointer bg-transparent"
                        style={{
                            color: is_active
                                ? "#1B64DA"
                                : "rgba(255,255,255,0.65)",
                            fontWeight: is_active ? 600 : 500,
                            zIndex: is_active ? 1 : 0,
                        }}
                    >
                        {is_active && (
                            <motion.div
                                layoutId="desktop-nav-pill"
                                className="absolute inset-0 bg-white rounded-full"
                                style={{
                                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                                }}
                                transition={PILL_TRANSITION}
                            />
                        )}
                        <span className="relative z-10 flex items-center gap-[6px]">
                            <span className="text-[13px] leading-none flex">
                                {item.icon}
                            </span>
                            {item.label}
                        </span>
                    </motion.button>
                );
            })}
        </nav>
    );
}
