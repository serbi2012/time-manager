/**
 * Current time indicator (red dot + vertical line)
 * G: Drops in from top with spring bounce on mount
 */

interface CurrentTimeIndicatorProps {
    left_pct: string;
}

export function CurrentTimeIndicator({ left_pct }: CurrentTimeIndicatorProps) {
    return (
        <div
            className="absolute top-[-4px] bottom-0 z-20 gantt-current-time-enter"
            style={{ left: left_pct }}
        >
            <div
                className="w-2 h-2 rounded-full bg-error -ml-1"
                style={{
                    animation: "currentTimePulse 2s ease-in-out infinite",
                }}
            />
            <div className="w-px h-full bg-error mx-auto opacity-60" />
        </div>
    );
}
