import type { ReactNode } from "react";
import { cn } from "@/shared/lib/cn";
import { useMousePosition } from "@/shared/hooks/useMousePosition";
import { useWorkStore } from "@/store/useWorkStore";

interface SpotlightCardProps {
    children: ReactNode;
    className?: string;
    /** RGB string e.g. "49, 130, 246" */
    glow_color?: string;
    glow_opacity?: number;
    glow_size?: number;
}

const DEFAULT_GLOW_COLOR = "49, 130, 246";
const DEFAULT_GLOW_OPACITY = 0.07;
const DEFAULT_GLOW_SIZE = 350;

export function SpotlightCard({
    children,
    className,
    glow_color = DEFAULT_GLOW_COLOR,
    glow_opacity = DEFAULT_GLOW_OPACITY,
    glow_size = DEFAULT_GLOW_SIZE,
}: SpotlightCardProps) {
    const enabled = useWorkStore((s) => s.cursor_tracking_enabled);
    const { ref, pos, handlers } = useMousePosition();

    if (!enabled) {
        return <div className={className}>{children}</div>;
    }

    return (
        <div
            ref={ref}
            className={cn("relative overflow-hidden", className)}
            {...handlers}
        >
            {pos.inside && (
                <div
                    className="pointer-events-none absolute inset-0 z-[1] transition-opacity duration-200"
                    style={{
                        background: `radial-gradient(${glow_size}px circle at ${pos.x}px ${pos.y}px, rgba(${glow_color}, ${glow_opacity}), transparent 60%)`,
                    }}
                />
            )}
            {children}
        </div>
    );
}
