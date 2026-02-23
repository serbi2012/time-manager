import { useState, useEffect, useRef, type ReactNode } from "react";
import { cn } from "@/shared/lib/cn";
import { useWorkStore } from "@/store/useWorkStore";

interface BorderBeamCardProps {
    children: ReactNode;
    className?: string;
    /** Beam color */
    beam_color?: string;
    /** Rotation period in seconds */
    duration?: number;
    /** Always animate (for active states) or only on hover */
    always_on?: boolean;
}

const DEFAULT_BEAM_COLOR = "#3182F6";
const DEFAULT_DURATION = 4;

export function BorderBeamCard({
    children,
    className,
    beam_color = DEFAULT_BEAM_COLOR,
    duration = DEFAULT_DURATION,
    always_on = false,
}: BorderBeamCardProps) {
    const enabled = useWorkStore((s) => s.cursor_tracking_enabled);
    const [is_hovered, setIsHovered] = useState(false);
    const [angle, setAngle] = useState(0);
    const frame_ref = useRef<number>(0);

    const is_active = always_on || is_hovered;

    useEffect(() => {
        if (!enabled || !is_active) return;
        let start: number | null = null;
        const animate = (ts: number) => {
            if (!start) start = ts;
            const elapsed = ts - start;
            setAngle(((elapsed / (duration * 1000)) * 360) % 360);
            frame_ref.current = requestAnimationFrame(animate);
        };
        frame_ref.current = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(frame_ref.current);
    }, [enabled, is_active, duration]);

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
            className={cn("relative rounded-xl", className)}
            style={{
                padding: "1.5px",
                background: is_active
                    ? `conic-gradient(from ${angle}deg at 50% 50%, transparent 0%, transparent 70%, ${beam_color} 80%, ${beam_color}66 90%, transparent 100%)`
                    : "var(--color-border-default)",
                transition: is_active ? "none" : "background 0.3s ease",
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => {
                setIsHovered(false);
                setAngle(0);
            }}
        >
            <div className="bg-white rounded-[10.5px] relative z-[1]">
                {children}
            </div>
        </div>
    );
}
