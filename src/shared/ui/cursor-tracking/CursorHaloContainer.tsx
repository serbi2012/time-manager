import type { ReactNode } from "react";
import { cn } from "@/shared/lib/cn";
import { useMousePosition } from "@/shared/hooks/useMousePosition";
import { useWorkStore } from "@/store/useWorkStore";

interface CursorHaloContainerProps {
    children: ReactNode;
    className?: string;
    /** RGB string e.g. "49, 130, 246" */
    halo_color?: string;
    halo_size?: number;
    halo_opacity?: number;
}

const DEFAULT_HALO_COLOR = "49, 130, 246";
const DEFAULT_HALO_SIZE = 200;
const DEFAULT_HALO_OPACITY = 0.06;

export function CursorHaloContainer({
    children,
    className,
    halo_color = DEFAULT_HALO_COLOR,
    halo_size = DEFAULT_HALO_SIZE,
    halo_opacity = DEFAULT_HALO_OPACITY,
}: CursorHaloContainerProps) {
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
                    className="pointer-events-none absolute inset-0 z-[1]"
                    style={{
                        background: `radial-gradient(${halo_size}px circle at ${pos.x}px ${pos.y}px, rgba(${halo_color}, ${halo_opacity}), transparent 60%)`,
                    }}
                />
            )}
            {children}
        </div>
    );
}
