/**
 * Mobile running section — "진행 중" group with red-bordered cards
 * Animations: H (section header slide-down, card scale-in), D (breathing glow)
 */

import type { WorkRecord } from "../../../../shared/types";
import { MOBILE_RECORD_LABEL } from "../../constants";

import { MobileRecordItem } from "./MobileRecordItem";

interface MobileRunningSectionProps {
    records: WorkRecord[];
    active_record_id: string | null;
    elapsed_seconds: number;
    onToggle: (record: WorkRecord) => void;
    /** Key that changes to re-trigger entrance animations */
    animation_key?: string;
}

export function MobileRunningSection({
    records,
    active_record_id,
    elapsed_seconds,
    onToggle,
    animation_key,
}: MobileRunningSectionProps) {
    if (records.length === 0) return null;

    return (
        <div className="pt-md">
            {/* Section label — H: slide-down */}
            <div
                className="px-lg pb-sm mobile-section-slide-down"
                key={`running-header-${animation_key}`}
            >
                <span className="text-xs font-semibold text-error tracking-wide">
                    {MOBILE_RECORD_LABEL.RUNNING_SECTION}
                </span>
            </div>

            {/* Running record cards — D: breathing glow + H: scale-in */}
            <div className="px-lg flex flex-col gap-sm">
                {records.map((record, i) => (
                    <div
                        key={record.id}
                        className="rounded-lg overflow-hidden border-[1.5px] border-error mobile-card-glow mobile-scale-in"
                        style={{
                            background: "white",
                            animationDelay: `${0.1 + i * 0.07}s`,
                        }}
                    >
                        <MobileRecordItem
                            record={record}
                            is_active={record.id === active_record_id}
                            elapsed_seconds={
                                record.id === active_record_id
                                    ? elapsed_seconds
                                    : 0
                            }
                            onToggle={() => onToggle(record)}
                            animation_key={animation_key}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}
