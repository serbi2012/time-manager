/**
 * MobileCalendarStrip 컴포넌트 테스트
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MobileCalendarStrip } from "../../../../../features/work-record/ui/Mobile/MobileCalendarStrip";

describe("MobileCalendarStrip", () => {
    const today = new Date().toISOString().split("T")[0];

    it("요일 라벨이 7개 표시된다", () => {
        render(
            <MobileCalendarStrip
                selected_date={today}
                onDateSelect={vi.fn()}
                records={[]}
            />
        );

        const day_labels = ["일", "월", "화", "수", "목", "금", "토"];
        for (const label of day_labels) {
            expect(screen.getAllByText(label).length).toBeGreaterThanOrEqual(1);
        }
    });

    it("날짜를 클릭하면 onDateSelect가 호출된다", () => {
        const on_date_select = vi.fn();
        render(
            <MobileCalendarStrip
                selected_date={today}
                onDateSelect={on_date_select}
                records={[]}
            />
        );

        const buttons = screen.getAllByRole("button");
        fireEvent.click(buttons[0]);
        expect(on_date_select).toHaveBeenCalledTimes(1);
    });

    it("선택된 날짜에 primary 스타일이 적용된다", () => {
        const { container } = render(
            <MobileCalendarStrip
                selected_date={today}
                onDateSelect={vi.fn()}
                records={[]}
            />
        );

        const primary_elements = container.querySelectorAll(".bg-primary");
        expect(primary_elements.length).toBeGreaterThanOrEqual(1);
    });
});
