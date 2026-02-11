/**
 * MobileRunningSection 컴포넌트 테스트
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MobileRunningSection } from "../../../../../features/work-record/ui/Mobile/MobileRunningSection";
import { createMockRecord } from "../../../../helpers/mock_factory";
import { MOBILE_RECORD_LABEL } from "../../../../../features/work-record/constants";

describe("MobileRunningSection", () => {
    it("레코드가 없으면 렌더링하지 않는다", () => {
        const { container } = render(
            <MobileRunningSection
                records={[]}
                active_record_id={null}
                elapsed_seconds={0}
                onToggle={vi.fn()}
            />
        );

        expect(container.firstChild).toBeNull();
    });

    it("레코드가 있으면 '진행 중' 섹션 라벨이 표시된다", () => {
        const record = createMockRecord({
            work_name: "진행 중 작업",
            deal_name: "",
            category_name: "개발",
            start_time: "09:00",
            duration_minutes: 30,
        });

        render(
            <MobileRunningSection
                records={[record]}
                active_record_id={record.id}
                elapsed_seconds={120}
                onToggle={vi.fn()}
            />
        );

        expect(
            screen.getByText(MOBILE_RECORD_LABEL.RUNNING_SECTION)
        ).toBeInTheDocument();
    });

    it("전달된 레코드가 렌더링된다", () => {
        const record = createMockRecord({
            work_name: "실행 작업",
            deal_name: "",
            category_name: "회의",
            start_time: "10:00",
            duration_minutes: 60,
        });

        render(
            <MobileRunningSection
                records={[record]}
                active_record_id={record.id}
                elapsed_seconds={60}
                onToggle={vi.fn()}
            />
        );

        expect(screen.getByText("실행 작업")).toBeInTheDocument();
    });
});
