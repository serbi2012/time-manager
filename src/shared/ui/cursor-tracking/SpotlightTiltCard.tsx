import { useRef, useState, useCallback, type ReactNode } from "react";
import { cn } from "@/shared/lib/cn";
import { useWorkStore } from "@/store/useWorkStore";

interface SpotlightTiltCardProps {
    children: ReactNode;
    className?: string;
    /** RGB string e.g. "49, 130, 246" */
    glow_color?: string;
    max_tilt?: number;
}

const DEFAULT_GLOW_COLOR = "49, 130, 246";
const DEFAULT_MAX_TILT = 4;

export function SpotlightTiltCard({
    children,
    className,
    glow_color = DEFAULT_GLOW_COLOR,
    max_tilt = DEFAULT_MAX_TILT,
}: SpotlightTiltCardProps) {
    const enabled = useWorkStore((s) => s.cursor_tracking_enabled);
    const el_ref = useRef<HTMLDivElement>(null);
    const [pos, setPos] = useState({ x: 0, y: 0, inside: false });
    const [transform, setTransform] = useState("");

    const handleMove = useCallback(
        (e: React.MouseEvent) => {
            const el = el_ref.current;
            if (!el) return;
            const rect = el.getBoundingClientRect();
            const mx = e.clientX - rect.left;
            const my = e.clientY - rect.top;
            setPos({ x: mx, y: my, inside: true });
            const x = mx / rect.width;
            const y = my / rect.height;
            const tilt_x = (0.5 - y) * max_tilt;
            const tilt_y = (x - 0.5) * max_tilt;
            setTransform(
                `perspective(600px) rotateX(${tilt_x}deg) rotateY(${tilt_y}deg) scale3d(1.01, 1.01, 1.01)`
            );
        },
        [max_tilt]
    );

    const handleLeave = useCallback(() => {
        setPos((p) => ({ ...p, inside: false }));
        setTransform("");
    }, []);

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
            ref={el_ref}
            className={cn("relative rounded-xl", className)}
            style={{
                padding: "1px",
                background: pos.inside
                    ? `radial-gradient(400px circle at ${pos.x}px ${pos.y}px, rgba(${glow_color}, 0.25), var(--color-border-default) 60%)`
                    : "var(--color-border-default)",
                transform:
                    transform ||
                    "perspective(600px) rotateX(0deg) rotateY(0deg)",
                transition: pos.inside
                    ? "transform 0.1s ease-out"
                    : "transform 0.4s cubic-bezier(0.23, 1, 0.32, 1)",
                willChange: "transform",
            }}
            onMouseMove={handleMove}
            onMouseLeave={handleLeave}
        >
            <div
                className="relative bg-white rounded-[11px] overflow-hidden"
                style={{
                    boxShadow: pos.inside
                        ? "0 8px 30px rgba(0,0,0,0.08)"
                        : "0 1px 2px rgba(0,0,0,0.04)",
                    transition: "box-shadow 0.2s ease",
                }}
            >
                {pos.inside && (
                    <div
                        className="pointer-events-none absolute inset-0 z-[1]"
                        style={{
                            background: `radial-gradient(300px circle at ${pos.x}px ${pos.y}px, rgba(${glow_color}, 0.05), transparent 60%)`,
                        }}
                    />
                )}
                <div className="relative z-[2]">{children}</div>
            </div>
        </div>
    );
}
