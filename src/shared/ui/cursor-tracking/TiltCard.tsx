import { useRef, useState, useCallback, type ReactNode } from "react";
import { useWorkStore } from "@/store/useWorkStore";

interface TiltCardProps {
    children: ReactNode;
    className?: string;
    max_tilt?: number;
}

const DEFAULT_MAX_TILT = 5;

export function TiltCard({
    children,
    className,
    max_tilt = DEFAULT_MAX_TILT,
}: TiltCardProps) {
    const enabled = useWorkStore((s) => s.cursor_tracking_enabled);
    const ref = useRef<HTMLDivElement>(null);
    const [transform, setTransform] = useState("");
    const [is_hovered, setIsHovered] = useState(false);

    const handleMove = useCallback(
        (e: React.MouseEvent) => {
            const el = ref.current;
            if (!el) return;
            const rect = el.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width;
            const y = (e.clientY - rect.top) / rect.height;
            const tilt_x = (0.5 - y) * max_tilt;
            const tilt_y = (x - 0.5) * max_tilt;
            setTransform(
                `perspective(600px) rotateX(${tilt_x}deg) rotateY(${tilt_y}deg) scale3d(1.01, 1.01, 1.01)`
            );
            setIsHovered(true);
        },
        [max_tilt]
    );

    const handleLeave = useCallback(() => {
        setTransform("");
        setIsHovered(false);
    }, []);

    if (!enabled) {
        return <div className={className}>{children}</div>;
    }

    return (
        <div
            ref={ref}
            className={className}
            style={{
                transform:
                    transform ||
                    "perspective(600px) rotateX(0deg) rotateY(0deg)",
                transition: is_hovered
                    ? "transform 0.12s ease-out, box-shadow 0.12s ease-out"
                    : "transform 0.4s cubic-bezier(0.23, 1, 0.32, 1), box-shadow 0.4s ease",
                boxShadow: is_hovered
                    ? "0 8px 24px rgba(0,0,0,0.08)"
                    : "0 1px 2px rgba(0,0,0,0.04)",
                willChange: "transform",
            }}
            onMouseMove={handleMove}
            onMouseLeave={handleLeave}
        >
            {children}
        </div>
    );
}
