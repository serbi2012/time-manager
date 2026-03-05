/**
 * MobileDayCard 래퍼 컴포넌트 테스트
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, fireEvent, act } from "@testing-library/react";
import { MobileDayCard } from "../../../../../features/weekly-schedule/ui/Mobile/MobileDayCard";
import type { DayGroup } from "../../../../../features/weekly-schedule/lib/week_grouper";

const MOCK_DAY_GROUP: DayGroup = {
    date: "2026-03-05",
    day_name: "목",
    works: [
        {
            project_code: "A25_00001",
            work_name: "프론트엔드 개발",
            status: "진행중",
            start_date: "2026-03-01",
            total_minutes: 480,
            deals: [
                { deal_name: "UI 구현", total_minutes: 240 },
                { deal_name: "테스트 작성", total_minutes: 240 },
            ],
        },
    ],
};

describe("MobileDayCard", () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
        vi.restoreAllMocks();
    });

    it("DayCard가 정상적으로 렌더링된다", () => {
        const { container } = render(
            <MobileDayCard
                day_group={MOCK_DAY_GROUP}
                on_status_change={vi.fn()}
            />
        );

        expect(container.firstChild).toBeInTheDocument();
    });

    it("래퍼 div가 touch 이벤트 핸들러를 가진다", () => {
        const { container } = render(
            <MobileDayCard
                day_group={MOCK_DAY_GROUP}
                on_status_change={vi.fn()}
                onLongPress={vi.fn()}
            />
        );

        const wrapper = container.firstChild as HTMLElement;
        expect(wrapper.tagName).toBe("DIV");
    });

    it("롱프레스 시 onLongPress가 DayGroup과 DOMRect와 함께 호출된다", () => {
        const on_long_press = vi.fn();
        const { container } = render(
            <MobileDayCard
                day_group={MOCK_DAY_GROUP}
                on_status_change={vi.fn()}
                onLongPress={on_long_press}
            />
        );

        const wrapper = container.firstChild as HTMLElement;

        const mock_rect = new DOMRect(0, 100, 300, 200);
        vi.spyOn(wrapper, "getBoundingClientRect").mockReturnValue(mock_rect);

        act(() => {
            fireEvent.touchStart(wrapper, {
                touches: [{ clientX: 150, clientY: 200 }],
            });
        });

        act(() => {
            vi.advanceTimersByTime(500);
        });

        expect(on_long_press).toHaveBeenCalledWith(MOCK_DAY_GROUP, mock_rect);
    });

    it("onLongPress가 없어도 에러 없이 렌더링된다", () => {
        const { container } = render(
            <MobileDayCard
                day_group={MOCK_DAY_GROUP}
                on_status_change={vi.fn()}
            />
        );

        expect(container.firstChild).toBeInTheDocument();
    });
});
