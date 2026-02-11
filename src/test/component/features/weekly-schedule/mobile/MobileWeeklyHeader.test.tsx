/**
 * MobileWeeklyHeader 컴포넌트 테스트
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import { MobileWeeklyHeader } from "../../../../../features/weekly-schedule/ui/Mobile/MobileWeeklyHeader";

dayjs.extend(isoWeek);

const DEFAULT_PROPS = {
    selected_week_start: dayjs("2026-02-09"),
    on_prev_week: vi.fn(),
    on_next_week: vi.fn(),
    on_this_week: vi.fn(),
    on_week_change: vi.fn(),
    hide_management_work: false,
    on_hide_management_change: vi.fn(),
    on_copy: vi.fn(),
    copy_disabled: false,
};

describe("MobileWeeklyHeader", () => {
    it("주간 일정 제목이 표시된다", () => {
        render(<MobileWeeklyHeader {...DEFAULT_PROPS} />);
        expect(screen.getByText("주간 일정")).toBeInTheDocument();
    });

    it("주간 네비게이션 텍스트가 표시된다", () => {
        render(<MobileWeeklyHeader {...DEFAULT_PROPS} />);
        expect(screen.getByText("2월 2주")).toBeInTheDocument();
    });

    it("이전 주 버튼 클릭 시 on_prev_week가 호출된다", () => {
        const on_prev_week = vi.fn();
        render(
            <MobileWeeklyHeader
                {...DEFAULT_PROPS}
                on_prev_week={on_prev_week}
            />
        );

        const nav_buttons = screen.getAllByRole("button");
        fireEvent.click(nav_buttons[1]);
        expect(on_prev_week).toHaveBeenCalledTimes(1);
    });

    it("다음 주 버튼 클릭 시 on_next_week가 호출된다", () => {
        const on_next_week = vi.fn();
        render(
            <MobileWeeklyHeader
                {...DEFAULT_PROPS}
                on_next_week={on_next_week}
            />
        );

        const nav_buttons = screen.getAllByRole("button");
        fireEvent.click(nav_buttons[2]);
        expect(on_next_week).toHaveBeenCalledTimes(1);
    });

    it("필터 버튼 클릭 시 on_hide_management_change가 호출된다", () => {
        const on_change = vi.fn();
        render(
            <MobileWeeklyHeader
                {...DEFAULT_PROPS}
                on_hide_management_change={on_change}
            />
        );

        fireEvent.click(screen.getByText("관리제외"));
        expect(on_change).toHaveBeenCalledWith(true);
    });

    it("복사 버튼이 비활성 시 disabled 상태이다", () => {
        const { container } = render(
            <MobileWeeklyHeader {...DEFAULT_PROPS} copy_disabled={true} />
        );

        const copy_btn = container.querySelector(
            "button[disabled]"
        ) as HTMLButtonElement;
        expect(copy_btn).toBeInTheDocument();
    });
});
