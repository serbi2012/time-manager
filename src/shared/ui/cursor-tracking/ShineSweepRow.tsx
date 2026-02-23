import type { ReactNode } from "react";
import { cn } from "@/shared/lib/cn";
import { useMousePosition } from "@/shared/hooks/useMousePosition";
import { useWorkStore } from "@/store/useWorkStore";

interface ShineSweepRowProps {
    children: ReactNode;
    className?: string;
    /** RGB string e.g. "49, 130, 246" */
    sweep_color?: string;
    sweep_width?: number;
}

const DEFAULT_SWEEP_COLOR = "49, 130, 246";
const DEFAULT_SWEEP_WIDTH = 100;

export function ShineSweepRow({
    children,
    className,
    sweep_color = DEFAULT_SWEEP_COLOR,
    sweep_width = DEFAULT_SWEEP_WIDTH,
}: ShineSweepRowProps) {
    const enabled = useWorkStore((s) => s.cursor_tracking_enabled);
    const { ref, pos, handlers } = useMousePosition();

    if (!enabled) {
        return <div className={className}>{children}</div>;
    }

    const half = sweep_width / 2;

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
                        background: `linear-gradient(90deg, transparent ${
                            pos.x - half * 1.2
                        }px, rgba(${sweep_color}, 0.03) ${
                            pos.x - half * 0.4
                        }px, rgba(${sweep_color}, 0.06) ${
                            pos.x
                        }px, rgba(${sweep_color}, 0.03) ${
                            pos.x + half * 0.4
                        }px, transparent ${pos.x + half * 1.2}px)`,
                    }}
                />
            )}
            {children}
        </div>
    );
}
