/**
 * 모바일 완료·휴지통 목록 시트
 * 데스크탑의 표 모달 대신 일간 화면과 같은 카드 목록을 쓴다
 */

import { useMemo } from "react";
import { RollbackOutlined, DeleteOutlined } from "@ant-design/icons";

import { MobileBottomSheet } from "@/shared/ui";
import { formatDuration } from "@/shared/lib/time";
import { getCategoryHexColor } from "@/shared/config";
import type { WorkRecord } from "@/shared/types";

import { MobileSwipeCard, type MobileSwipeAction } from "./MobileSwipeCard";
import { RECORD_BUTTON, MOBILE_LIST_SHEET } from "../../constants";

const SHEET_HEIGHT_RATIO = 0.85;

interface MobileRecordListSheetProps {
    open: boolean;
    title: string;
    records: WorkRecord[];
    /** 목록이 비었을 때 문구 */
    empty_text: string;
    onClose: () => void;
    onRestore: (record: WorkRecord) => void;
    /** 있으면 영구 삭제 액션을 함께 보여준다 (휴지통) */
    onPermanentDelete?: (record: WorkRecord) => void;
}

function formatSubInfo(record: WorkRecord): string {
    return [record.category_name, record.work_name].filter(Boolean).join(" · ");
}

export function MobileRecordListSheet({
    open,
    title,
    records,
    empty_text,
    onClose,
    onRestore,
    onPermanentDelete,
}: MobileRecordListSheetProps) {
    const sorted_records = useMemo(() => {
        if (!onPermanentDelete) return records;

        return [...records].sort((a, b) => {
            const a_time = a.deleted_at ? Date.parse(a.deleted_at) : 0;
            const b_time = b.deleted_at ? Date.parse(b.deleted_at) : 0;
            return b_time - a_time;
        });
    }, [records, onPermanentDelete]);

    const buildActions = (record: WorkRecord): MobileSwipeAction[] => {
        const restore_action: MobileSwipeAction = {
            key: "restore",
            label: RECORD_BUTTON.RESTORE,
            icon: <RollbackOutlined style={{ fontSize: 18 }} />,
            background: "var(--color-primary)",
            haptic: "success",
            onAction: () => onRestore(record),
        };

        if (!onPermanentDelete) return [restore_action];

        return [
            restore_action,
            {
                key: "permanent_delete",
                label: RECORD_BUTTON.DELETE,
                icon: <DeleteOutlined style={{ fontSize: 18 }} />,
                background: "var(--color-error)",
                haptic: "warning",
                onAction: () => onPermanentDelete(record),
            },
        ];
    };

    return (
        <MobileBottomSheet
            open={open}
            onClose={onClose}
            height_ratio={SHEET_HEIGHT_RATIO}
        >
            <div className="px-xl pb-md flex items-center justify-between">
                <span className="text-xl font-semibold text-text-primary">
                    {title}
                </span>
                <span className="text-sm text-text-disabled">
                    {records.length}
                    {MOBILE_LIST_SHEET.COUNT_SUFFIX}
                </span>
            </div>

            {records.length === 0 ? (
                <div className="py-section text-center text-sm text-text-disabled">
                    {empty_text}
                </div>
            ) : (
                <>
                    <div className="px-xl pb-sm text-xs text-text-disabled">
                        {MOBILE_LIST_SHEET.SWIPE_HINT}
                    </div>

                    <div className="px-lg pb-lg flex flex-col gap-sm">
                        {sorted_records.map((record) => (
                            <MobileSwipeCard
                                key={record.id}
                                actions={buildActions(record)}
                            >
                                <div className="flex items-center gap-md p-lg">
                                    <div
                                        className="w-1 h-8 rounded-full shrink-0"
                                        style={{
                                            background: getCategoryHexColor(
                                                record.category_name || ""
                                            ),
                                        }}
                                    />
                                    <div className="flex-1 min-w-0">
                                        <div className="text-md font-medium text-text-primary truncate">
                                            {record.deal_name ||
                                                record.work_name}
                                        </div>
                                        <div className="text-sm text-text-disabled truncate mt-[1px]">
                                            {formatSubInfo(record)}
                                        </div>
                                    </div>
                                    <div className="text-md font-semibold text-text-secondary tabular-nums shrink-0">
                                        {formatDuration(
                                            record.duration_minutes
                                        )}
                                    </div>
                                </div>
                            </MobileSwipeCard>
                        ))}
                    </div>
                </>
            )}
        </MobileBottomSheet>
    );
}
