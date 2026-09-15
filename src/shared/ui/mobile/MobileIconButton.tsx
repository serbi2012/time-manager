import type { ReactNode } from "react";
import { motion } from "framer-motion";

import { cn } from "@/shared/lib/cn";
import { SPRING } from "@/shared/ui/animation";

export interface MobileIconButtonProps {
    /** 스크린리더용 이름 — 아이콘만 있는 버튼이므로 필수 */
    label: string;
    onClick: (event: React.MouseEvent) => void;
    children: ReactNode;
    variant?: "plain" | "tinted";
    disabled?: boolean;
    className?: string;
}

/**
 * 모바일 아이콘 버튼
 * 눈에 보이는 크기와 무관하게 최소 44px 터치 영역을 보장한다
 */
export function MobileIconButton({
    label,
    onClick,
    children,
    variant = "plain",
    disabled = false,
    className,
}: MobileIconButtonProps) {
    return (
        <motion.button
            type="button"
            aria-label={label}
            disabled={disabled}
            onClick={onClick}
            whileTap={disabled ? undefined : { scale: 0.92 }}
            transition={SPRING.snappy}
            className={cn(
                "mobile-touch-target inline-flex items-center justify-center",
                "rounded-full border-0 cursor-pointer",
                variant === "tinted"
                    ? "bg-bg-grey text-text-secondary"
                    : "bg-transparent text-text-secondary",
                disabled && "opacity-40 cursor-not-allowed",
                className
            )}
        >
            {children}
        </motion.button>
    );
}
