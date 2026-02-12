/**
 * MobileRecordRow 컴포넌트 테스트
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MobileRecordRow } from "../../../../../features/work-record/ui/Mobile/MobileRecordRow";
import { createMockRecord } from "../../../../helpers/mock_factory";

describe("MobileRecordRow", () => {
    const default_props = {
        record: createMockRecord({
            work_name: "테스트 작업",
            deal_name: "거래명",
            category_name: "개발",
            start_time: "09:00",
            end_time: "12:00",
            duration_minutes: 180,
            is_completed: false,
        }),
        onToggle: vi.fn(),
    };

    it("작업명이 표시된다 (deal_name 우선)", () => {
        render(
            <MobileRecordRow
                {...default_props}
                record={createMockRecord({
                    work_name: "작업명",
                    deal_name: "거래명",
                })}
            />
        );

        expect(screen.getByText("거래명")).toBeInTheDocument();
    });

    it("작업명이 표시된다 (deal_name 없을 때 work_name)", () => {
        render(
            <MobileRecordRow
                {...default_props}
                record={createMockRecord({
                    work_name: "작업명",
                    deal_name: "",
                })}
            />
        );

        expect(screen.getByText("작업명")).toBeInTheDocument();
    });

    it("카테고리와 시간 정보가 표시된다", () => {
        render(
            <MobileRecordRow
                {...default_props}
                record={createMockRecord({
                    category_name: "개발",
                    start_time: "09:00",
                    end_time: "12:00",
                })}
            />
        );

        expect(screen.getByText("개발 · 09:00 ~ 12:00")).toBeInTheDocument();
    });

    it("소요 시간이 표시된다 (formatDuration)", () => {
        render(
            <MobileRecordRow
                {...default_props}
                record={createMockRecord({
                    duration_minutes: 90,
                })}
            />
        );

        expect(screen.getByText("1시간 30분")).toBeInTheDocument();
    });

    it("완료된 작업은 체크 아이콘이 표시된다 (is_completed=true)", () => {
        const { container } = render(
            <MobileRecordRow
                {...default_props}
                record={createMockRecord({
                    is_completed: true,
                })}
            />
        );

        expect(container.querySelector(".bg-success")).toBeInTheDocument();
        expect(screen.queryByRole("button")).not.toBeInTheDocument();
    });

    it("미완료 작업은 재생 버튼이 표시된다 (is_completed=false)", () => {
        render(
            <MobileRecordRow
                {...default_props}
                record={createMockRecord({
                    is_completed: false,
                })}
            />
        );

        expect(screen.getByRole("button")).toBeInTheDocument();
    });

    it("재생 버튼 클릭 시 onToggle이 호출된다", () => {
        const onToggle = vi.fn();
        render(
            <MobileRecordRow
                {...default_props}
                record={createMockRecord({ is_completed: false })}
                onToggle={onToggle}
            />
        );

        fireEvent.click(screen.getByRole("button"));

        expect(onToggle).toHaveBeenCalledTimes(1);
    });
});
