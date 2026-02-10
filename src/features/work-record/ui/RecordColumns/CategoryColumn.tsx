/**
 * Category column (Toss-style soft fill tag)
 */

import type { WorkRecord } from "../../../../shared/types";
import { RECORD_UI_TEXT } from "../../constants";

interface CategoryColumnProps {
    record: WorkRecord;
}

const SOFT_CATEGORY_COLORS: Record<string, { bg: string; text: string }> = {
    개발: { bg: "#E8F5E9", text: "#2E7D32" },
    문서작업: { bg: "#FFF3E0", text: "#E65100" },
    회의: { bg: "#FFF3E0", text: "#E65100" },
    환경세팅: { bg: "#E3F2FD", text: "#1565C0" },
    코드리뷰: { bg: "#F3E5F5", text: "#7B1FA2" },
    테스트: { bg: "#E3F2FD", text: "#1565C0" },
    기타: { bg: "#F2F4F6", text: "#4E5968" },
};

const DEFAULT_SOFT_COLOR = { bg: "#F2F4F6", text: "#4E5968" };

export function CategoryColumn({ record }: CategoryColumnProps) {
    if (!record.category_name) {
        return (
            <span className="text-text-disabled">
                {RECORD_UI_TEXT.EMPTY_VALUE}
            </span>
        );
    }

    const colors =
        SOFT_CATEGORY_COLORS[record.category_name] || DEFAULT_SOFT_COLOR;

    return (
        <span
            className="inline-flex items-center rounded-sm text-sm font-medium"
            style={{
                padding: "3px 10px",
                borderRadius: 6,
                background: colors.bg,
                color: colors.text,
            }}
        >
            {record.category_name}
        </span>
    );
}
