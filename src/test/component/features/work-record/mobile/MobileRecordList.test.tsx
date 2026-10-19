/**
 * MobileRecordList 컴포넌트 테스트
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MobileRecordList } from "@/features/work-record/ui/Mobile/MobileRecordList";
import { createMockRecord } from "@/test/helpers/mock_factory";
import {
    MOBILE_RECORD_LABEL,
    RECORD_EMPTY,
} from "@/features/work-record/constants";

describe("MobileRecordList", () => {
    const default_props = {
        active_record_id: null,
        onToggle: vi.fn(),
        onEdit: vi.fn(),
        onOpenCompleted: vi.fn(),
        onOpenTrash: vi.fn(),
        onCopyRecords: vi.fn(),
        onComplete: vi.fn(),
        onDelete: vi.fn(),
    };

    it("'작업 목록' 섹션 라벨이 표시된다", () => {
        render(<MobileRecordList {...default_props} records={[]} />);

        expect(
            screen.getByText(MOBILE_RECORD_LABEL.RECORD_LIST_SECTION)
        ).toBeInTheDocument();
    });

    it("레코드가 없으면 빈 상태 메시지가 표시된다", () => {
        render(<MobileRecordList {...default_props} records={[]} />);

        expect(screen.getByText(RECORD_EMPTY.NO_RECORDS)).toBeInTheDocument();
    });

    it("레코드가 있으면 작업명이 표시된다", () => {
        const records = [
            createMockRecord({
                work_name: "첫번째 작업",
                deal_name: "",
                category_name: "개발",
                start_time: "09:00",
                end_time: "12:00",
                duration_minutes: 180,
            }),
            createMockRecord({
                work_name: "두번째 작업",
                deal_name: "",
                category_name: "회의",
                start_time: "13:00",
                end_time: "14:00",
                duration_minutes: 60,
            }),
        ];

        render(<MobileRecordList {...default_props} records={records} />);

        expect(screen.getByText("첫번째 작업")).toBeInTheDocument();
        expect(screen.getByText("두번째 작업")).toBeInTheDocument();
    });

    it.each([
        ["check-circle", "onOpenCompleted"],
        ["delete", "onOpenTrash"],
        ["copy", "onCopyRecords"],
    ] as const)("%s 버튼을 누르면 %s가 호출된다", (button_name, handler_name) => {
        const handler = vi.fn();
        render(
            <MobileRecordList
                {...default_props}
                records={[]}
                {...{ [handler_name]: handler }}
            />
        );

        fireEvent.click(screen.getByRole("button", { name: button_name }));

        expect(handler).toHaveBeenCalledTimes(1);
    });
});
