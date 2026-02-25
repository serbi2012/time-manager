/**
 * 작업 기록 테이블 하단 푸터
 *
 * 총 건수 표시 및 완료/휴지통/복사 빠른 액션 버튼 제공
 */

import {
    CheckCircleOutlined,
    DeleteOutlined,
    CopyOutlined,
} from "@ant-design/icons";
import { motion } from "../../../../shared/ui/animation";
import { RECORD_BUTTON } from "../../constants";

const FOOTER_TOTAL_PREFIX = "총";
const FOOTER_TOTAL_SUFFIX = "건";
const COMPLETED_LIST_LABEL = `${RECORD_BUTTON.VIEW_COMPLETED} 목록`;

interface RecordFooterProps {
    record_count: number;
    onOpenCompleted: () => void;
    onOpenTrash: () => void;
    onCopyRecords: () => void;
}

export function RecordFooter({
    record_count,
    onOpenCompleted,
    onOpenTrash,
    onCopyRecords,
}: RecordFooterProps) {
    return (
        <div className="px-xl py-md flex items-center justify-between border-t border-border-light mt-sm">
            <span className="text-sm text-text-secondary">
                {FOOTER_TOTAL_PREFIX} {record_count}
                {FOOTER_TOTAL_SUFFIX}
            </span>
            <div className="toss-footer-actions flex items-center gap-sm">
                <motion.button
                    whileTap={{ scale: 0.95 }}
                    className="h-8 px-md rounded-md flex items-center gap-xs hover:bg-bg-grey transition-colors text-sm text-text-secondary cursor-pointer"
                    onClick={onOpenCompleted}
                >
                    <CheckCircleOutlined
                        style={{
                            color: "var(--color-success)",
                            fontSize: 13,
                        }}
                    />
                    {COMPLETED_LIST_LABEL}
                </motion.button>
                <motion.button
                    whileTap={{ scale: 0.95 }}
                    className="h-8 px-md rounded-md flex items-center gap-xs hover:bg-bg-grey transition-colors text-sm text-text-secondary cursor-pointer"
                    onClick={onOpenTrash}
                >
                    <DeleteOutlined
                        style={{
                            color: "var(--color-error)",
                            fontSize: 13,
                        }}
                    />
                    {RECORD_BUTTON.VIEW_TRASH}
                </motion.button>
                <motion.button
                    whileTap={{ scale: 0.95 }}
                    className="h-8 px-md rounded-md flex items-center gap-xs hover:bg-bg-grey transition-colors text-sm text-text-secondary cursor-pointer"
                    onClick={onCopyRecords}
                >
                    <CopyOutlined style={{ fontSize: 13 }} />
                    {RECORD_BUTTON.COPY_RECORDS}
                </motion.button>
            </div>
        </div>
    );
}
