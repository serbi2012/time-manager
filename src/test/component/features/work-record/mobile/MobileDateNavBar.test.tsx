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

    it("연속 이전 클릭 시 날짜가 순차적으로 감소한다", () => {
        const on_date_change = vi.fn();
        const { rerender } = render(
            <MobileDateNavBar
                selected_date="2026-02-11"
                onDateChange={on_date_change}
            />
        );

        const buttons = screen.getAllByRole("button");
        fireEvent.click(buttons[0]);
        expect(on_date_change).toHaveBeenCalledWith("2026-02-10");

        rerender(
            <MobileDateNavBar
                selected_date="2026-02-10"
                onDateChange={on_date_change}
            />
        );

        expect(screen.getByText("2월 10일 화요일")).toBeInTheDocument();

        fireEvent.click(buttons[0]);
        expect(on_date_change).toHaveBeenCalledWith("2026-02-09");
    });

    it("이전과 다음을 번갈아 클릭해도 올바르게 동작한다", () => {
        const on_date_change = vi.fn();
        const { rerender } = render(
            <MobileDateNavBar
                selected_date="2026-03-05"
                onDateChange={on_date_change}
            />
        );

        const buttons = screen.getAllByRole("button");

        fireEvent.click(buttons[1]);
        expect(on_date_change).toHaveBeenCalledWith("2026-03-06");

        rerender(
            <MobileDateNavBar
                selected_date="2026-03-06"
                onDateChange={on_date_change}
            />
        );

        expect(screen.getByText("3월 6일 금요일")).toBeInTheDocument();

        fireEvent.click(buttons[0]);
        expect(on_date_change).toHaveBeenCalledWith("2026-03-05");
    });

    it("날짜 텍스트가 애니메이션 컨테이너 안에 렌더링된다", () => {
        render(
            <MobileDateNavBar
                selected_date="2026-02-11"
                onDateChange={vi.fn()}
            />
        );

        const date_text = screen.getByText("2월 11일 수요일");
        const container = date_text.parentElement;

        expect(container).toHaveClass("overflow-hidden");
    });
});
