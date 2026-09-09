import { useCallback, useMemo } from "react";
import { Button, Typography } from "antd";
import { CopyOutlined } from "@ant-design/icons";
import { useShallow } from "zustand/react/shallow";
import { BaseModal } from "@/shared/ui/modal";
import { EmptyState } from "@/shared/ui/layout";
import { message } from "@/shared/lib/message";
import { useWorkStore } from "@/store/useWorkStore";
import type { WorkRecord } from "@/shared/types";
import { buildRecordCopyRows, formatCopyRowsToMarkdown } from "../../lib";
import { RECORD_COPY_MODAL } from "../../constants";
import { RecordCopyTable } from "./RecordCopyTable";

const MODAL_WIDTH = 1240;
const MODAL_BODY_STYLE = { maxHeight: "70vh", overflowY: "auto" as const };
const MODAL_STYLE = { maxWidth: "calc(100vw - 32px)" };

const { Text } = Typography;

interface RecordCopyModalProps {
    open: boolean;
    records: WorkRecord[];
    selected_date: string;
    onClose: () => void;
}

export function RecordCopyModal({
    open,
    records,
    selected_date,
    onClose,
}: RecordCopyModalProps) {
    const {
        deal_codes,
        category_codes,
        setDealCode,
        setCategoryCode,
        getLunchTimeMinutes,
    } = useWorkStore(
        useShallow((s) => ({
            deal_codes: s.deal_codes,
            category_codes: s.category_codes,
            setDealCode: s.setDealCode,
            setCategoryCode: s.setCategoryCode,
            getLunchTimeMinutes: s.getLunchTimeMinutes,
        }))
    );

    const rows = useMemo(
        () =>
            buildRecordCopyRows(records, selected_date, {
                deal_codes,
                category_codes,
                lunch_time: getLunchTimeMinutes(),
            }),
        [
            records,
            selected_date,
            deal_codes,
            category_codes,
            getLunchTimeMinutes,
        ]
    );

    const handleCopyCell = useCallback((value: string) => {
        if (!value) return;
        navigator.clipboard.writeText(value);
        message.success(RECORD_COPY_MODAL.CELL_COPIED);
    }, []);

    const handleCopyAll = useCallback(() => {
        const text = formatCopyRowsToMarkdown(rows);
        if (!text) return;
        navigator.clipboard.writeText(text);
        message.success(RECORD_COPY_MODAL.ALL_COPIED);
    }, [rows]);

    const handleSaveDealCode = useCallback(
        (deal_name: string, code: string) => {
            setDealCode(deal_name, code);
            message.success(RECORD_COPY_MODAL.CODE_SAVED);
        },
        [setDealCode]
    );

    const handleSaveCategoryCode = useCallback(
        (category_name: string, code: string) => {
            setCategoryCode(category_name, code);
            message.success(RECORD_COPY_MODAL.CODE_SAVED);
        },
        [setCategoryCode]
    );

    return (
        <BaseModal
            title={RECORD_COPY_MODAL.TITLE}
            open={open}
            onCancel={onClose}
            width={MODAL_WIDTH}
            style={MODAL_STYLE}
            styles={{ body: MODAL_BODY_STYLE }}
            footer={
                <Button
                    type="primary"
                    icon={<CopyOutlined />}
                    onClick={handleCopyAll}
                    disabled={rows.length === 0}
                >
                    {RECORD_COPY_MODAL.COPY_ALL}
                </Button>
            }
        >
            {rows.length === 0 ? (
                <EmptyState description={RECORD_COPY_MODAL.EMPTY} />
            ) : (
                <div className="flex flex-col gap-md">
                    <Text type="secondary" className="text-sm">
                        {RECORD_COPY_MODAL.HINT}
                    </Text>
                    <RecordCopyTable
                        rows={rows}
                        onCopyCell={handleCopyCell}
                        onSaveDealCode={handleSaveDealCode}
                        onSaveCategoryCode={handleSaveCategoryCode}
                    />
                    <Text type="secondary" className="text-xs">
                        {RECORD_COPY_MODAL.CODE_HINT}
                    </Text>
                </div>
            )}
        </BaseModal>
    );
}
