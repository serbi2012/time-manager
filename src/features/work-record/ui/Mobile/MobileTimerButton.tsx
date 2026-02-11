/**
 * Mobile timer button — matches desktop TimerActionColumn style
 * Active: bg-error + white icon + pulse ring
 * Inactive: gray border circle + disabled icon
 */

import { PlayCircleOutlined, PauseCircleOutlined } from "@ant-design/icons";
import { cn } from "../../../../shared/lib/cn";

interface MobileTimerButtonProps {
    is_active: boolean;
    size?: number;
    onToggle: () => void;
}

export function MobileTimerButton({
    is_active,
    size = 36,
    onToggle,
}: MobileTimerButtonProps) {
    const icon_size = Math.round(size * 0.5);

    return (
        <button
            className={cn(
                "flex-shrink-0 rounded-full flex items-center justify-center border-0 cursor-pointer transition-colors",
                is_active
                    ? "bg-error text-white shadow-sm mobile-timer-pulse"
                    : "text-text-disabled hover:text-primary"
            )}
            style={{
                width: size,
                height: size,
                ...(!is_active && {
                    border: "2px solid var(--color-border-default)",
                    background: "transparent",
                }),
            }}
            onClick={(e) => {
                e.stopPropagation();
                onToggle();
            }}
        >
            {is_active ? (
                <PauseCircleOutlined style={{ fontSize: icon_size }} />
            ) : (
                <PlayCircleOutlined style={{ fontSize: icon_size }} />
            )}
        </button>
    );
}
