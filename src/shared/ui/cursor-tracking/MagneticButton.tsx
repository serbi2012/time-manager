import type { ReactNode } from "react";
import { cn } from "@/shared/lib/cn";
import { useMagnetic } from "@/shared/hooks/useMagnetic";
import { useWorkStore } from "@/store/useWorkStore";

interface MagneticButtonProps {
    children: ReactNode;
    className?: string;
    strength?: number;
}

const DEFAULT_STRENGTH = 0.2;

export function MagneticButton({
    children,
    className,
    strength = DEFAULT_STRENGTH,
}: MagneticButtonProps) {
    const enabled = useWorkStore((s) => s.cursor_tracking_enabled);
    const { ref, style, handlers } = useMagnetic<HTMLDivElement>(strength);

    if (!enabled) {
        return <div className={cn("inline-block", className)}>{children}</div>;
    }

    return (
        <div
            ref={ref}
            className={cn("inline-block", className)}
            style={style}
            {...handlers}
        >
            {children}
        </div>
    );
}
