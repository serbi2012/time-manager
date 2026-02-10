/**
 * Inline stats component (Toss-style single line)
 * 1-3: Animated number counting
 */

import { ClockCircleOutlined } from "@ant-design/icons";

import type { TodayStats } from "../../lib/record_stats";
import { RECORD_STATS } from "../../constants";
import {
    AnimatedDuration,
    AnimatedNumber,
} from "../../../../shared/ui/animation";

interface InlineStatsProps {
    stats: TodayStats;
}

export function InlineStats({ stats }: InlineStatsProps) {
    return (
        <div className="flex items-center gap-xl py-xs">
            <div className="flex items-center gap-sm">
                <ClockCircleOutlined
                    style={{ color: "var(--color-primary)", fontSize: 15 }}
                />
                <AnimatedDuration
                    minutes={stats.total_minutes}
                    className="text-2xl font-semibold text-text-primary"
                />
                <span className="text-sm text-text-secondary">
                    {RECORD_STATS.TOTAL_DURATION}
                </span>
            </div>
            <div className="w-px h-5 bg-border-default" />
            <div className="flex items-center gap-sm">
                <AnimatedNumber
                    value={stats.completed_count}
                    className="text-2xl font-semibold text-success"
                />
                <span className="text-sm text-text-secondary">
                    {RECORD_STATS.COUNT_UNIT} {RECORD_STATS.COMPLETED_COUNT}
                </span>
            </div>
            <div className="w-px h-5 bg-border-default" />
            <div className="flex items-center gap-sm">
                <AnimatedNumber
                    value={stats.incomplete_count}
                    className="text-2xl font-semibold text-primary"
                />
                <span className="text-sm text-text-secondary">
                    {RECORD_STATS.COUNT_UNIT} {RECORD_STATS.INCOMPLETE_COUNT}
                </span>
            </div>
        </div>
    );
}
