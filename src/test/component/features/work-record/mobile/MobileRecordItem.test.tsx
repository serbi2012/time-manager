/**
 * MobileRecordItem 컴포넌트 테스트
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MobileRecordItem } from "../../../../../features/work-record/ui/Mobile/MobileRecordItem";
import { createMockRecord } from "../../../../helpers/mock_factory";

describe("MobileRecordItem", () => {
    const base_record = createMockRecord({
        work_name: "테스트 작업",
        deal_name: "테스트 딜",
        category_name: "개발",
        start_time: "09:00",
        end_time: "12:00",
        duration_minutes: 180,
        is_completed: false,
    });

    it("작업명이 렌더링된다", () => {
        render(
            <MobileRecordItem
                record={base_record}
                is_active={false}
                elapsed_seconds={0}
                onToggle={vi.fn()}
            />
        );

        expect(screen.getByText("테스트 딜")).toBeInTheDocument();
    });

    it("deal_name이 있으면 deal_name이 메인에, work_name이 서브에 표시된다", () => {
        render(
            <MobileRecordItem
                record={base_record}
                is_active={false}
                elapsed_seconds={0}
                onToggle={vi.fn()}
            />
        );

        expect(screen.getByText("테스트 딜")).toBeInTheDocument();
        expect(screen.getByText("테스트 작업")).toBeInTheDocument();
    });

    it("deal_name이 없으면 work_name이 메인에 표시된다", () => {
        const record_no_deal = createMockRecord({
            work_name: "단독 작업",
            deal_name: "",
            category_name: "개발",
            start_time: "09:00",
            end_time: "12:00",
            duration_minutes: 60,
        });

        render(
            <MobileRecordItem
                record={record_no_deal}
                is_active={false}
                elapsed_seconds={0}
                onToggle={vi.fn()}
            />
        );

        expect(screen.getByText("단독 작업")).toBeInTheDocument();
    });

    it("카테고리 태그가 표시된다", () => {
        render(
            <MobileRecordItem
                record={base_record}
                is_active={false}
                elapsed_seconds={0}
                onToggle={vi.fn()}
            />
        );

        expect(screen.getByText("개발")).toBeInTheDocument();
    });

    it("시간 범위가 표시된다", () => {
        render(
            <MobileRecordItem
                record={base_record}
                is_active={false}
                elapsed_seconds={0}
                onToggle={vi.fn()}
            />
        );

        expect(screen.getByText(/09:00/)).toBeInTheDocument();
        expect(screen.getByText(/12:00/)).toBeInTheDocument();
    });

    it("완료된 레코드는 취소선 스타일이 적용된다", () => {
        const completed_record = createMockRecord({
            work_name: "완료된 작업",
            deal_name: "",
            category_name: "회의",
            start_time: "14:00",
            end_time: "15:00",
            duration_minutes: 60,
            is_completed: true,
        });

        render(
            <MobileRecordItem
                record={completed_record}
                is_active={false}
                elapsed_seconds={0}
                onToggle={vi.fn()}
            />
        );

        const name_el = screen.getByText("완료된 작업");
        expect(name_el.className).toContain("line-through");
        expect(name_el.className).toContain("text-text-disabled");
    });

    it("완료된 레코드는 체크 아이콘이 표시된다", () => {
        const completed_record = createMockRecord({
            work_name: "완료됨",
            deal_name: "",
            category_name: "회의",
            start_time: "14:00",
            end_time: "15:00",
            duration_minutes: 60,
            is_completed: true,
        });

        const { container } = render(
            <MobileRecordItem
                record={completed_record}
                is_active={false}
                elapsed_seconds={0}
                onToggle={vi.fn()}
            />
        );

        const check_icon = container.querySelector(".anticon-check-circle");
        expect(check_icon).toBeInTheDocument();
    });

    it("완료된 레코드는 opacity-60 클래스가 적용된다", () => {
        const completed_record = createMockRecord({
            work_name: "완료됨",
            deal_name: "",
            category_name: "회의",
            start_time: "14:00",
            end_time: "15:00",
            duration_minutes: 60,
            is_completed: true,
        });

        const { container } = render(
            <MobileRecordItem
                record={completed_record}
                is_active={false}
                elapsed_seconds={0}
                onToggle={vi.fn()}
            />
        );

        const root_div = container.firstChild as HTMLElement;
        expect(root_div.className).toContain("opacity-60");
    });

    it("미완료 레코드에는 타이머 버튼이 표시된다", () => {
        render(
            <MobileRecordItem
                record={base_record}
                is_active={false}
                elapsed_seconds={0}
                onToggle={vi.fn()}
            />
        );

        expect(screen.getByRole("button")).toBeInTheDocument();
    });

    it("시간이 분 단위로 표시된다", () => {
        render(
            <MobileRecordItem
                record={base_record}
                is_active={false}
                elapsed_seconds={0}
                onToggle={vi.fn()}
            />
        );

        expect(screen.getByText("180분")).toBeInTheDocument();
    });
});
