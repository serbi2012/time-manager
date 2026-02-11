/**
 * Mobile running section — dark gradient timer card
 * Redesigned to match Toss-inspired dark card mockup
 */

import type { WorkRecord } from "../../../../shared/types";
import { formatTimer } from "../../../../shared/lib/time";
import { MOBILE_RECORD_LABEL } from "../../constants";

interface MobileRunningSectionProps {
    records: WorkRecord[];
    active_record_id: string | null;
    elapsed_seconds: number;
    onToggle: (record: WorkRecord) => void;
    animation_key?: string;
}

const DARK_CARD_GRADIENT: React.CSSProperties = {
    background: "linear-gradient(135deg, #191F28 0%, #333D4B 100%)",
};

const STOP_ICON_STYLE: React.CSSProperties = {
    display: "inline-block",
    width: 14,
    height: 14,
    borderRadius: 3,
    background: "white",
};

export function MobileRunningSection({
    records,
    elapsed_seconds,
    onToggle,
}: MobileRunningSectionProps) {
    if (records.length === 0) return null;

    const record = records[0];
    const display_name = record.deal_name || record.work_name;
    const category = record.category_name || "";
    const start_time = record.start_time || "";
    const sub_info = [category, start_time ? `${start_time} ~` : ""]
        .filter(Boolean)
        .join(" · ");

    return (
        <div className="px-xl pt-xl pb-md">
            <div
                className="rounded-2xl overflow-hidden"
                style={DARK_CARD_GRADIENT}
            >
                <div className="p-xl">
                    {/* Running indicator */}
                    <div className="flex items-center gap-sm mb-md">
                        <div className="w-[7px] h-[7px] rounded-full bg-success animate-pulse" />
                        <span className="text-sm font-medium text-success">
                            {MOBILE_RECORD_LABEL.RUNNING_TIMER_LABEL}
                        </span>
                    </div>

                    {/* Content row */}
                    <div className="flex items-center justify-between">
                        <div className="min-w-0 flex-1 mr-md">
                            <div className="text-lg font-semibold text-white truncate">
                                {display_name}
                            </div>
                            {sub_info && (
                                <div className="text-sm text-gray-400 mt-xs truncate">
                                    {sub_info}
                                </div>
                            )}
                        </div>
                        <div className="flex items-center gap-lg shrink-0">
                            <span className="text-h1 font-bold text-white tabular-nums">
                                {formatTimer(elapsed_seconds)}
                            </span>
                            <button
                                className="w-[48px] h-[48px] rounded-full bg-error/90 border-0 flex items-center justify-center cursor-pointer"
                                onClick={() => onToggle(record)}
                            >
                                <span style={STOP_ICON_STYLE} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
