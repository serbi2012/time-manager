/**
 * Current time indicator (red dot + vertical line)
 * G: Drops in from top with spring bounce on mount
 * Dot and line share the same center via transform + flex align.
 */

interface CurrentTimeIndicatorProps {
    left_pct: string;
}

export function CurrentTimeIndicator({ left_pct }: CurrentTimeIndicatorProps) {
    return (
        <div
            className="absolute top-[-4px] bottom-0 z-20 gantt-current-time-enter flex flex-col items-center"
            style={{ left: left_pct, transform: "translateX(-50%)" }}
        >
            <div
                className="w-2 h-2 shrink-0 rounded-full bg-error"
                style={{
                    animation: "currentTimePulse 2s ease-in-out infinite",
                }}
            />
            <div className="w-px h-full min-h-0 bg-error opacity-60" />
        </div>
    );
}
