/**
 * Mobile record list — "작업 목록" group with action icons header
 * Animations: H (section entrance), A (stagger), C (swipe to action)
 */

import {
    CheckCircleOutlined,
    DeleteOutlined,
    CopyOutlined,
} from "@ant-design/icons";

import type { WorkRecord } from "../../../../shared/types";
import { MOBILE_RECORD_LABEL, RECORD_EMPTY } from "../../constants";

import { MobileRecordItem } from "./MobileRecordItem";
import { MobileSwipeCard } from "./MobileSwipeCard";

interface MobileRecordListProps {
    records: WorkRecord[];
    active_record_id: string | null;
    onToggle: (record: WorkRecord) => void;
    onOpenCompleted: () => void;
    onOpenTrash: () => void;
    onCopyRecords: () => void;
    onComplete: (record: WorkRecord) => void;
    onDelete: (record: WorkRecord) => void;
    /** Key that changes to re-trigger entrance animations */
    animation_key?: string;
}

export function MobileRecordList({
    records,
    active_record_id,
    onToggle,
    onOpenCompleted,
    onOpenTrash,
    onCopyRecords,
    onComplete,
    onDelete,
    animation_key,
}: MobileRecordListProps) {
    return (
        <div className="pt-md">
            {/* Section header — H: slide-down */}
            <div
                className="flex items-center justify-between px-lg pb-sm mobile-section-slide-down"
                style={{ animationDelay: "0.15s" }}
                key={`list-header-${animation_key}`}
            >
                <span className="text-xs font-semibold text-text-secondary tracking-wide">
                    {MOBILE_RECORD_LABEL.RECORD_LIST_SECTION}
                </span>
                <div className="flex items-center gap-xs">
                    <button
                        className="w-7 h-7 rounded-full flex items-center justify-center border-0 cursor-pointer bg-bg-grey"
                        style={{ WebkitTapHighlightColor: "transparent" }}
                        onClick={onOpenCompleted}
                    >
                        <CheckCircleOutlined
                            style={{
                                fontSize: 13,
                                color: "var(--color-success)",
                            }}
                        />
                    </button>
                    <button
                        className="w-7 h-7 rounded-full flex items-center justify-center border-0 cursor-pointer bg-bg-grey"
                        style={{ WebkitTapHighlightColor: "transparent" }}
                        onClick={onOpenTrash}
                    >
                        <DeleteOutlined
                            style={{
                                fontSize: 13,
                                color: "var(--color-error)",
                            }}
                        />
                    </button>
                    <button
                        className="w-7 h-7 rounded-full flex items-center justify-center border-0 cursor-pointer bg-bg-grey"
                        style={{ WebkitTapHighlightColor: "transparent" }}
                        onClick={onCopyRecords}
                    >
                        <CopyOutlined
                            style={{
                                fontSize: 13,
                                color: "var(--gray-600)",
                            }}
                        />
                    </button>
                </div>
            </div>

            {/* Record cards — A: stagger fade-up, C: swipe to action */}
            <div
                className="px-lg flex flex-col gap-sm pb-lg"
                key={`list-body-${animation_key}`}
            >
                {records.length === 0 ? (
                    <div className="py-xl text-center">
                        <span className="text-sm text-text-disabled">
                            {RECORD_EMPTY.NO_RECORDS}
                        </span>
                    </div>
                ) : (
                    records.map((record, i) => (
                        <div
                            key={record.id}
                            className="rounded-lg overflow-hidden border border-border-light bg-bg-default mobile-record-fade-up"
                            style={{
                                boxShadow: "0 1px 2px rgba(0, 0, 0, 0.03)",
                                animationDelay: `${0.2 + i * 0.07}s`,
                            }}
                        >
                            <MobileSwipeCard
                                onComplete={() => onComplete(record)}
                                onDelete={() => onDelete(record)}
                            >
                                <MobileRecordItem
                                    record={record}
                                    is_active={record.id === active_record_id}
                                    elapsed_seconds={0}
                                    onToggle={() => onToggle(record)}
                                    stagger_index={i}
                                    animation_key={animation_key}
                                />
                            </MobileSwipeCard>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
