/**
 * Mobile record list — each record is an independent card with gap between them.
 * Long-press on a card opens a shared context menu for edit/complete/delete.
 */

import { useState, useCallback } from "react";
import {
    CheckCircleOutlined,
    DeleteOutlined,
    CopyOutlined,
} from "@ant-design/icons";

import type { WorkRecord } from "../../../../shared/types";
import { MOBILE_RECORD_LABEL, RECORD_EMPTY } from "../../constants";

import { MobileSwipeCard } from "./MobileSwipeCard";
import { MobileRecordRow } from "./MobileRecordRow";
import { MobileContextMenu } from "./MobileContextMenu";

interface MobileRecordListProps {
    records: WorkRecord[];
    active_record_id: string | null;
    onToggle: (record: WorkRecord) => void;
    onEdit: (record: WorkRecord) => void;
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
    onEdit,
    onOpenCompleted,
    onOpenTrash,
    onCopyRecords,
    onComplete,
    onDelete,
    animation_key,
}: MobileRecordListProps) {
    const [menu_record, setMenuRecord] = useState<WorkRecord | null>(null);
    const [menu_anchor, setMenuAnchor] = useState<DOMRect | null>(null);

    const handleLongPress = useCallback(
        (record: WorkRecord, anchor_rect: DOMRect) => {
            setMenuRecord(record);
            setMenuAnchor(anchor_rect);
        },
        []
    );

    const handleCloseMenu = useCallback(() => {
        setMenuRecord(null);
        setMenuAnchor(null);
    }, []);

    return (
        <div className="px-xl pb-md">
            {/* Section header — standalone above card list */}
            <div
                className="flex items-center justify-between mb-md"
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
                        className="w-8 h-8 rounded-full flex items-center justify-center border-0 cursor-pointer bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)]"
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
                        className="w-8 h-8 rounded-full flex items-center justify-center border-0 cursor-pointer bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)]"
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
                        className="w-8 h-8 rounded-full flex items-center justify-center border-0 cursor-pointer bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)]"
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

            {/* Record cards — each record is an independent card */}
            <div key={`list-body-${animation_key}`}>
                {records.length === 0 ? (
                    <div className="py-xl text-center bg-white rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
                        <span className="text-sm text-text-disabled">
                            {RECORD_EMPTY.NO_RECORDS}
                        </span>
                    </div>
                ) : (
                    <div className="flex flex-col gap-sm">
                        {records.map((record) => (
                            <MobileSwipeCard
                                key={record.id}
                                onComplete={() => onComplete(record)}
                                onDelete={() => onDelete(record)}
                                onLongPress={(rect) =>
                                    handleLongPress(record, rect)
                                }
                            >
                                {(is_pressing) => (
                                    <MobileRecordRow
                                        record={record}
                                        onToggle={() => onToggle(record)}
                                        is_pressing={is_pressing}
                                    />
                                )}
                            </MobileSwipeCard>
                        ))}
                    </div>
                )}
            </div>

            {/* Shared context menu — one instance for the entire list */}
            <MobileContextMenu
                open={menu_record !== null}
                anchor_rect={menu_anchor}
                onEdit={() => {
                    if (menu_record) onEdit(menu_record);
                }}
                onComplete={() => {
                    if (menu_record) onComplete(menu_record);
                }}
                onDelete={() => {
                    if (menu_record) onDelete(menu_record);
                }}
                onClose={handleCloseMenu}
            />
        </div>
    );
}
