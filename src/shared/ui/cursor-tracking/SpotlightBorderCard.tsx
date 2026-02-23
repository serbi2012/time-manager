import type { ReactNode } from "react";
import { cn } from "@/shared/lib/cn";
import { useMousePosition } from "@/shared/hooks/useMousePosition";
import { useWorkStore } from "@/store/useWorkStore";

interface SpotlightBorderCardProps {
    children: ReactNode;
    className?: string;
    /** RGB string e.g. "49, 130, 246" */
    border_color?: string;
    glow_size?: number;
}

const DEFAULT_BORDER_COLOR = "49, 130, 246";
const DEFAULT_GLOW_SIZE = 300;
const BORDER_WIDTH = "1px";

export function SpotlightBorderCard({
    children,
    className,
    border_color = DEFAULT_BORDER_COLOR,
    glow_size = DEFAULT_GLOW_SIZE,
}: SpotlightBorderCardProps) {
    const enabled = useWorkStore((s) => s.cursor_tracking_enabled);
    const { ref, pos, handlers } = useMousePosition();

    if (!enabled) {
        return (
            <div
                className={cn(
                    "rounded-xl border border-border-default",
                    className
                )}
            >
                {children}
            </div>
        );
    }

    return (
        <div
            ref={ref}
            className={cn("relative rounded-xl", className)}
            style={{
                padding: BORDER_WIDTH,
                background: pos.inside
                    ? `radial-gradient(${glow_size}px circle at ${pos.x}px ${pos.y}px, rgba(${border_color}, 0.35), rgba(${border_color}, 0.05) 50%, var(--color-border-default) 100%)`
                    : "var(--color-border-default)",
                transition: "background 0.15s ease",
            }}
            {...handlers}
        >
            <div className="relative bg-white rounded-[11px] overflow-hidden">
                {pos.inside && (
                    <div
                        className="pointer-events-none absolute inset-0 z-[1]"
                        style={{
                            background: `radial-gradient(${glow_size}px circle at ${pos.x}px ${pos.y}px, rgba(${border_color}, 0.04), transparent 60%)`,
                        }}
                    />
                )}
                <div className="relative z-[2]">{children}</div>
            </div>
        </div>
    );
}
