/**
 * MobileCalendarStrip 컴포넌트 테스트
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MobileCalendarStrip } from "../../../../../features/work-record/ui/Mobile/MobileCalendarStrip";

const FIXED_NOW = new Date("2026-01-21T10:00:00");
const TODAY = "2026-01-21";
const WEEK_MONDAY = "2026-01-19";

function getDayBox(date_num: number) {
    const box = screen.getByText(String(date_num)).parentElement;
    if (!box) throw new Error("날짜 칸을 찾을 수 없음");
    return box;
}

describe("MobileCalendarStrip", () => {
    beforeEach(() => {
        vi.useFakeTimers({ toFake: ["Date"] });
        vi.setSystemTime(FIXED_NOW);
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it("선택한 날짜가 속한 주를 월요일부터 7일 표시한다", () => {
        render(
            <MobileCalendarStrip
                selected_date={TODAY}
                onDateSelect={vi.fn()}
                records={[]}
            />
        );

        const buttons = screen.getAllByRole("button");
        expect(buttons).toHaveLength(7);
        expect(buttons[0]).toHaveTextContent("월19");
        expect(buttons[6]).toHaveTextContent("일25");
    });

    it("날짜를 클릭하면 해당 날짜로 onDateSelect가 호출된다", () => {
        const on_date_select = vi.fn();
        render(
            <MobileCalendarStrip
                selected_date={TODAY}
                onDateSelect={on_date_select}
                records={[]}
            />
        );

        fireEvent.click(screen.getAllByRole("button")[0]);

        expect(on_date_select).toHaveBeenCalledWith(WEEK_MONDAY);
    });

    it("선택된 날짜에만 primary 배경이 적용되고 오늘은 점으로 표시된다", () => {
        render(
            <MobileCalendarStrip
                selected_date="2026-01-22"
                onDateSelect={vi.fn()}
                records={[]}
            />
        );

        expect(getDayBox(22)).toHaveClass("bg-primary");
        expect(getDayBox(21)).not.toHaveClass("bg-primary");
        expect(getDayBox(21).querySelector(".bg-primary")).not.toBeNull();
    });
});
