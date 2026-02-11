/**
 * Mobile record list — white card container with play button items
 * Redesigned to match Toss-inspired card list mockup
 */

import {
    CheckCircleOutlined,
    DeleteOutlined,
    CopyOutlined,
} from "@ant-design/icons";

import type { WorkRecord } from "../../../../shared/types";
import { MOBILE_RECORD_LABEL, RECORD_EMPTY } from "../../constants";

import { MobileSwipeCard } from "./MobileSwipeCard";
import { MobileRecordRow } from "./MobileRecordRow";

interface MobileRecordListProps {
    records: WorkRecord[];
    active_record_id: string | null;
    onToggle: (record: WorkRecord) => void;
    onOpenCompleted: () => void;
    onOpenTrash: () => void;
    onCopyRecords: () => void;
    onComplete: (record: WorkRecord) => void;
    onDelete: (record: WorkRecord) => void;
    animation_key?: string;
}

export function MobileRecordList({
    records,
    onToggle,
    onOpenCompleted,
    onOpenTrash,
    onCopyRecords,
    onComplete,
    onDelete,
    animation_key,
}: MobileRecordListProps) {
    return (
        <div className="px-xl pb-md">
            <div className="bg-white rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
                {/* Section header */}
                <div
                    className="flex items-center justify-between px-xl pt-xl pb-md"
                    key={`list-header-${animation_key}`}
                >
                    <span className="text-md font-semibold text-gray-600">
                        {MOBILE_RECORD_LABEL.RECORD_LIST_SECTION}
                    </span>
                    <div className="flex items-center gap-sm">
                        <span className="text-sm text-gray-400 mr-xs">
                            {records.length}
                            {MOBILE_RECORD_LABEL.RECORD_COUNT_SUFFIX}
                        </span>
                        <button
                            className="w-8 h-8 rounded-full flex items-center justify-center border-0 cursor-pointer bg-bg-grey"
                            style={{ WebkitTapHighlightColor: "transparent" }}
                            onClick={onOpenCompleted}
                        >
                            <CheckCircleOutlined
                                style={{
                                    fontSize: 14,
                                    color: "var(--color-success)",
                                }}
                            />
                        </button>
                        <button
                            className="w-8 h-8 rounded-full flex items-center justify-center border-0 cursor-pointer bg-bg-grey"
                            style={{ WebkitTapHighlightColor: "transparent" }}
                            onClick={onOpenTrash}
                        >
                            <DeleteOutlined
                                style={{
                                    fontSize: 14,
                                    color: "var(--color-error)",
                                }}
                            />
                        </button>
                        <button
                            className="w-8 h-8 rounded-full flex items-center justify-center border-0 cursor-pointer bg-bg-grey"
                            style={{ WebkitTapHighlightColor: "transparent" }}
                            onClick={onCopyRecords}
                        >
                            <CopyOutlined
                                style={{
                                    fontSize: 14,
                                    color: "var(--gray-600)",
                                }}
                            />
                        </button>
                    </div>
                </div>

                {/* Record items */}
                <div key={`list-body-${animation_key}`}>
                    {records.length === 0 ? (
                        <div className="py-xl text-center">
                            <span className="text-sm text-text-disabled">
                                {RECORD_EMPTY.NO_RECORDS}
                            </span>
                        </div>
                    ) : (
                        records.map((record, i, arr) => (
                            <MobileSwipeCard
                                key={record.id}
                                onComplete={() => onComplete(record)}
                                onDelete={() => onDelete(record)}
                            >
                                <MobileRecordRow
                                    record={record}
                                    is_last={i === arr.length - 1}
                                    onToggle={() => onToggle(record)}
                                />
                            </MobileSwipeCard>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
