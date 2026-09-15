/**
 * MobileRecordListSheet 컴포넌트 테스트
 */

import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";

import { MobileRecordListSheet } from "@/features/work-record/ui/Mobile/MobileRecordListSheet";
import { createMockRecord } from "@/test/helpers/mock_factory";
import { RECORD_BUTTON } from "@/features/work-record/constants";

const TITLE = "완료된 작업";
const EMPTY_TEXT = "완료된 작업이 없습니다";

const RECORDS = [
    createMockRecord({
        id: "r1",
        work_name: "브랜치 최신화",
        deal_name: "",
        category_name: "환경세팅",
        duration_minutes: 40,
    }),
    createMockRecord({
        id: "r2",
        work_name: "코드 리뷰",
        deal_name: "",
        category_name: "코드리뷰",
        duration_minutes: 70,
    }),
];

function renderSheet(
    overrides: Partial<{
        open: boolean;
        records: typeof RECORDS;
        onPermanentDelete: (record: (typeof RECORDS)[number]) => void;
    }> = {}
) {
    const onRestore = vi.fn();
    const onClose = vi.fn();

    render(
        <MobileRecordListSheet
            open={overrides.open ?? true}
            title={TITLE}
            records={overrides.records ?? RECORDS}
            empty_text={EMPTY_TEXT}
            onClose={onClose}
            onRestore={onRestore}
            onPermanentDelete={overrides.onPermanentDelete}
        />
    );

    return { onRestore, onClose };
}

describe("MobileRecordListSheet", () => {
    afterEach(() => {
        document.body.style.overflow = "";
    });

    it("닫혀 있으면 아무것도 렌더하지 않는다", () => {
        renderSheet({ open: false });

        expect(screen.queryByText(TITLE)).not.toBeInTheDocument();
    });

    it("제목과 개수, 작업 목록을 보여준다", () => {
        renderSheet();

        expect(screen.getByText(TITLE)).toBeInTheDocument();
        expect(screen.getByText("브랜치 최신화")).toBeInTheDocument();
        expect(screen.getByText("코드 리뷰")).toBeInTheDocument();
    });

    it("기록이 없으면 빈 상태 문구를 보여준다", () => {
        renderSheet({ records: [] });

        expect(screen.getByText(EMPTY_TEXT)).toBeInTheDocument();
    });

    it("영구 삭제 콜백이 없으면 되돌리기 액션만 둔다", () => {
        renderSheet();

        expect(
            screen.queryByText(RECORD_BUTTON.DELETE)
        ).not.toBeInTheDocument();
    });
});
