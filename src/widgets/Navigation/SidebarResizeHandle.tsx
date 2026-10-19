import { cn } from "@/shared/lib/cn";
import { SIDEBAR_LABELS } from "@/shared/constants";
import type { ResizeHandleProps } from "@/shared/hooks";

interface SidebarResizeHandleProps {
    is_resizing: boolean;
    handle_props: ResizeHandleProps;
    className?: string;
}

export function SidebarResizeHandle({
    is_resizing,
    handle_props,
    className,
}: SidebarResizeHandleProps) {
    return (
        <div
            role="separator"
            aria-orientation="vertical"
            aria-label={SIDEBAR_LABELS.resizeHandle}
            title={SIDEBAR_LABELS.resizeHandle}
            className={cn(
                "group/resize flex justify-center",
                "w-sm cursor-col-resize touch-none select-none",
                className
            )}
            {...handle_props}
        >
            <div
                className={cn(
                    "h-full w-0.5 transition-colors duration-200",
                    is_resizing
                        ? "bg-primary"
                        : "bg-transparent group-hover/resize:bg-primary/40"
                )}
            />
        </div>
    );
}
