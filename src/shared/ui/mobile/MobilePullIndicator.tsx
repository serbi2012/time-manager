import { LoadingOutlined, ArrowDownOutlined } from "@ant-design/icons";

import { cn } from "@/shared/lib/cn";
import { PULL_TO_REFRESH_LABELS } from "@/shared/constants";

export interface MobilePullIndicatorProps {
    /** 당겨진 거리 (px) */
    pull_distance: number;
    /** 놓으면 새로고침되는 상태인가 */
    is_ready: boolean;
    is_refreshing: boolean;
}

/**
 * 당겨서 새로고침 표시
 * 당긴 거리만큼 내려오고, 임계값을 넘으면 문구가 바뀐다
 */
export function MobilePullIndicator({
    pull_distance,
    is_ready,
    is_refreshing,
}: MobilePullIndicatorProps) {
    const is_visible = is_refreshing || pull_distance > 0;

    if (!is_visible) return null;

    return (
        <div
            className="flex items-center justify-center gap-xs overflow-hidden text-sm text-text-disabled"
            style={{ height: is_refreshing ? 48 : pull_distance }}
        >
            {is_refreshing ? (
                <>
                    <LoadingOutlined spin />
                    {PULL_TO_REFRESH_LABELS.refreshing}
                </>
            ) : (
                <>
                    <ArrowDownOutlined
                        className={cn(
                            "transition-transform duration-200",
                            is_ready && "rotate-180"
                        )}
                    />
                    {is_ready
                        ? PULL_TO_REFRESH_LABELS.release
                        : PULL_TO_REFRESH_LABELS.pull}
                </>
            )}
        </div>
    );
}
