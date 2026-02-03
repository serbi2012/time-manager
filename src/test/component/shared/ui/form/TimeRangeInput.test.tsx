/**
 * TimeRangeInput 컴포넌트 테스트
 */

import { describe, it, expect, vi } from "vitest";
import { screen, fireEvent } from "@testing-library/react";
import { renderWithProviders } from "../../../../helpers/test_utils";
import { TimeRangeInput } from "../../../../../shared/ui/form";

describe("TimeRangeInput", () => {
    describe("기본 렌더링", () => {
        it("시작 시간과 종료 시간 입력이 표시된다", () => {
            renderWithProviders(
                <TimeRangeInput
                    startTime="09:00"
                    endTime="18:00"
                    onStartChange={vi.fn()}
                    onEndChange={vi.fn()}
                />
            );

            const inputs = screen.getAllByRole("textbox");
            expect(inputs).toHaveLength(2);
            expect(inputs[0]).toHaveValue("09:00");
            expect(inputs[1]).toHaveValue("18:00");
        });

        it("구분자가 표시된다", () => {
            renderWithProviders(
                <TimeRangeInput
                    startTime="09:00"
                    endTime="18:00"
                    onStartChange={vi.fn()}
                    onEndChange={vi.fn()}
                    separator="~"
                />
            );

            expect(screen.getByText("~")).toBeInTheDocument();
        });

        it("커스텀 구분자가 적용된다", () => {
            renderWithProviders(
                <TimeRangeInput
                    startTime="09:00"
                    endTime="18:00"
                    onStartChange={vi.fn()}
                    onEndChange={vi.fn()}
                    separator="-"
                />
            );

            expect(screen.getByText("-")).toBeInTheDocument();
        });
    });

    describe("시간 변경", () => {
        it("시작 시간 변경 시 onStartChange가 호출된다", () => {
            const handle_start_change = vi.fn();

            renderWithProviders(
                <TimeRangeInput
                    startTime="09:00"
                    endTime="18:00"
                    onStartChange={handle_start_change}
                    onEndChange={vi.fn()}
                />
            );

            const inputs = screen.getAllByRole("textbox");
            const start_input = inputs[0];

            // 포커스
            fireEvent.focus(start_input);

            // 값 변경
            fireEvent.change(start_input, { target: { value: "10:00" } });

            // blur로 저장
            fireEvent.blur(start_input);

            expect(handle_start_change).toHaveBeenCalledWith("10:00");
        });

        it("종료 시간 변경 시 onEndChange가 호출된다", () => {
            const handle_end_change = vi.fn();

            renderWithProviders(
                <TimeRangeInput
                    startTime="09:00"
                    endTime="18:00"
                    onStartChange={vi.fn()}
                    onEndChange={handle_end_change}
                />
            );

            const inputs = screen.getAllByRole("textbox");
            const end_input = inputs[1];

            // 포커스
            fireEvent.focus(end_input);

            // 값 변경
            fireEvent.change(end_input, { target: { value: "19:00" } });

            // blur로 저장
            fireEvent.blur(end_input);

            expect(handle_end_change).toHaveBeenCalledWith("19:00");
        });

        it("잘못된 형식은 저장되지 않는다", () => {
            const handle_start_change = vi.fn();

            renderWithProviders(
                <TimeRangeInput
                    startTime="09:00"
                    endTime="18:00"
                    onStartChange={handle_start_change}
                    onEndChange={vi.fn()}
                />
            );

            const inputs = screen.getAllByRole("textbox");
            const start_input = inputs[0];

            fireEvent.focus(start_input);
            fireEvent.change(start_input, { target: { value: "invalid" } });
            fireEvent.blur(start_input);

            expect(handle_start_change).not.toHaveBeenCalled();
        });
    });

    describe("비활성화", () => {
        it("disabled=true일 때 입력이 비활성화된다", () => {
            renderWithProviders(
                <TimeRangeInput
                    startTime="09:00"
                    endTime="18:00"
                    onStartChange={vi.fn()}
                    onEndChange={vi.fn()}
                    disabled={true}
                />
            );

            const inputs = screen.getAllByRole("textbox");
            expect(inputs[0]).toBeDisabled();
            expect(inputs[1]).toBeDisabled();
        });
    });

    describe("placeholder", () => {
        it("커스텀 placeholder가 적용된다", () => {
            renderWithProviders(
                <TimeRangeInput
                    startTime=""
                    endTime=""
                    onStartChange={vi.fn()}
                    onEndChange={vi.fn()}
                    startPlaceholder="시작 시간"
                    endPlaceholder="종료 시간"
                />
            );

            expect(
                screen.getByPlaceholderText("시작 시간")
            ).toBeInTheDocument();
            expect(
                screen.getByPlaceholderText("종료 시간")
            ).toBeInTheDocument();
        });
    });
});
