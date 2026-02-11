/**
 * MobileDateNavBar 컴포넌트 테스트
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import dayjs from "dayjs";
import "dayjs/locale/ko";
import { MobileDateNavBar } from "../../../../../features/work-record/ui/Mobile/MobileDateNavBar";

dayjs.locale("ko");

describe("MobileDateNavBar", () => {
    it("선택된 날짜가 표시된다", () => {
        render(
            <MobileDateNavBar
                selected_date="2026-02-11"
                onDateChange={vi.fn()}
            />
        );

        expect(screen.getByText("2월 11일 수요일")).toBeInTheDocument();
    });

    it("이전 버튼 클릭 시 하루 전 날짜로 변경된다", () => {
        const on_date_change = vi.fn();
        render(
            <MobileDateNavBar
                selected_date="2026-02-11"
                onDateChange={on_date_change}
            />
        );

        const buttons = screen.getAllByRole("button");
        fireEvent.click(buttons[0]);
        expect(on_date_change).toHaveBeenCalledWith("2026-02-10");
    });

    it("다음 버튼 클릭 시 하루 후 날짜로 변경된다", () => {
        const on_date_change = vi.fn();
        render(
            <MobileDateNavBar
                selected_date="2026-02-11"
                onDateChange={on_date_change}
            />
        );

        const buttons = screen.getAllByRole("button");
        fireEvent.click(buttons[1]);
        expect(on_date_change).toHaveBeenCalledWith("2026-02-12");
    });
});
