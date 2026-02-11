/**
 * Single record row inside the card list — play button + color bar + content + duration
 */

import { CaretRightFilled } from "@ant-design/icons";

import type { WorkRecord } from "../../../../shared/types";
import { formatDuration } from "../../../../shared/lib/time";
import { getCategoryColor } from "../../../../shared/config";
import { cn } from "../../../../shared/lib/cn";

interface MobileRecordRowProps {
    record: WorkRecord;
    is_last: boolean;
    onToggle: () => void;
}

export function MobileRecordRow({
    record,
    is_last,
    onToggle,
}: MobileRecordRowProps) {
    const display_name = record.deal_name || record.work_name;
    const category = record.category_name || "";
    const color = getCategoryColor(category);
    const sessions_text = record.start_time
        ? `${record.start_time} ~ ${record.end_time || "진행 중"}`
        : "";
    const sub_info = [category, sessions_text].filter(Boolean).join(" · ");

    return (
        <div
            className={cn(
                "flex items-center gap-md px-xl py-lg",
                !is_last && "border-b border-gray-100"
            )}
        >
            {/* Play button */}
            <button
                className="w-[34px] h-[34px] rounded-lg bg-gray-50 border-0 flex items-center justify-center text-gray-400 cursor-pointer shrink-0"
                onClick={(e) => {
                    e.stopPropagation();
                    onToggle();
                }}
            >
                <CaretRightFilled style={{ fontSize: 13 }} />
            </button>

            {/* Color bar */}
            <div
                className="w-[3px] h-[34px] rounded-full shrink-0"
                style={{ background: color }}
            />

            {/* Content */}
            <div className="flex-1 min-w-0">
                <div className="text-lg font-medium text-gray-800 truncate">
                    {display_name}
                </div>
                {sub_info && (
                    <div className="text-sm text-gray-400 mt-[2px] truncate">
                        {sub_info}
                    </div>
                )}
            </div>

            {/* Duration */}
            <div className="text-xl font-semibold text-gray-700 shrink-0 tabular-nums">
                {formatDuration(record.duration_minutes)}
            </div>
        </div>
    );
}
