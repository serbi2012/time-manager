import { formatShortcutForPlatform } from "@/shared/lib/shortcuts";
import { cn } from "@/shared/lib/cn";

import { useInputCapability } from "./useInputCapability";

export interface ShortcutKeyBadgeProps {
    keys: string;
    /** parens: "(F8)" 형태 · chip: 배지 형태 */
    variant?: "parens" | "chip";
    className?: string;
}

/**
 * 단축키 안내 표시
 * 키보드가 없는 환경(모바일)에서는 아무것도 렌더하지 않는다
 */
export function ShortcutKeyBadge({
    keys,
    variant = "parens",
    className,
}: ShortcutKeyBadgeProps) {
    const { has_keyboard } = useInputCapability();

    if (!has_keyboard || !keys) return null;

    const formatted = formatShortcutForPlatform(keys);

    if (variant === "chip") {
        return <span className={className}>{formatted}</span>;
    }

    return <span className={cn("ml-xs", className)}>({formatted})</span>;
}
