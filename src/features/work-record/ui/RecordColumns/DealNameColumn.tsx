/**
 * Deal name column (Toss-style with soft timer badge)
 */

import { CheckCircleOutlined } from "@ant-design/icons";
import type { WorkRecord } from "../../../../shared/types";
import { formatTimer } from "../../../../shared/lib/time";
import { cn } from "../../../../shared/lib/cn";

interface DealNameColumnProps {
    record: WorkRecord;
    is_active: boolean;
    is_completed: boolean;
    theme_color: string;
    elapsed_seconds: number;
}

export function DealNameColumn({
    record,
    is_active,
    is_completed,
    elapsed_seconds,
}: DealNameColumnProps) {
    return (
        <div className="flex items-center gap-sm">
            {is_completed && (
                <CheckCircleOutlined
                    className="!text-success"
                    style={{ fontSize: 14 }}
                />
            )}
            <span
                className={cn(
                    "font-semibold text-md",
                    is_active && "text-primary",
                    is_completed && "text-text-disabled line-through",
                    !is_active && !is_completed && "text-text-primary"
                )}
            >
                {record.deal_name || record.work_name}
            </span>
            {is_active && (
                <span className="inline-flex items-center px-sm py-xs bg-primary-light text-primary text-xs font-medium rounded-sm">
                    {formatTimer(elapsed_seconds)}
                </span>
            )}
        </div>
    );
}
