/**
 * TimeInput 컴포넌트 테스트
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TimeInput } from "../../../../shared/ui/TimeInput";

describe("TimeInput", () => {
    const defaultProps = {
        value: "09:30",
        onSave: vi.fn(),
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    // =====================================================
    // 기본 렌더링 테스트
    // =====================================================
    describe("기본 렌더링", () => {
        it("초기값이 표시됨", () => {
            render(<TimeInput {...defaultProps} />);
            const input = screen.getByRole("textbox");
            expect(input).toHaveValue("09:30");
        });

        it("placeholder가 표시됨", () => {
            render(<TimeInput {...defaultProps} value="" />);
            const input = screen.getByRole("textbox");
            expect(input).toHaveAttribute("placeholder", "HH:mm");
        });

        it("커스텀 placeholder가 적용됨", () => {
            render(
                <TimeInput {...defaultProps} value="" placeholder="시간 입력" />
            );
            const input = screen.getByRole("textbox");
            expect(input).toHaveAttribute("placeholder", "시간 입력");
        });

        it("커스텀 너비가 적용됨", () => {
            render(<TimeInput {...defaultProps} width={100} />);
            const input = screen.getByRole("textbox");
            expect(input).toHaveStyle({ width: "100px" });
        });
    });

    // =====================================================
    // 입력 상호작용 테스트
    // =====================================================
    describe("입력 상호작용", () => {
        it("포커스 시 편집 모드로 전환", async () => {
            const user = userEvent.setup();
            render(<TimeInput {...defaultProps} />);

            const input = screen.getByRole("textbox");
            await user.click(input);

            // 편집 모드에서는 입력이 가능해야 함
            expect(input).toHaveFocus();
        });

        it("유효한 시간 형식으로 변경 후 blur 시 onSave 호출", async () => {
            const on_save = vi.fn();
            const user = userEvent.setup();
            render(<TimeInput {...defaultProps} onSave={on_save} />);

            const input = screen.getByRole("textbox");
            await user.clear(input);
            await user.type(input, "10:00");
            fireEvent.blur(input);

            expect(on_save).toHaveBeenCalledWith("10:00");
        });

        it("같은 값으로 변경 시 onSave가 호출되지 않음", async () => {
            const on_save = vi.fn();
            const user = userEvent.setup();
            render(<TimeInput {...defaultProps} onSave={on_save} />);

            const input = screen.getByRole("textbox");
            await user.click(input);
            fireEvent.blur(input);

            expect(on_save).not.toHaveBeenCalled();
        });

        it("유효하지 않은 시간 형식은 onSave를 호출하지 않음", async () => {
            const on_save = vi.fn();
            const user = userEvent.setup();
            render(<TimeInput {...defaultProps} onSave={on_save} />);

            const input = screen.getByRole("textbox");
            await user.clear(input);
            await user.type(input, "invalid");
            fireEvent.blur(input);

            expect(on_save).not.toHaveBeenCalled();
        });
    });

    // =====================================================
    // 키보드 이벤트 테스트
    // =====================================================
    describe("키보드 이벤트", () => {
        it("Enter 키를 누르면 blur되고 저장됨", async () => {
            const on_save = vi.fn();
            const user = userEvent.setup();
            render(<TimeInput {...defaultProps} onSave={on_save} />);

            const input = screen.getByRole("textbox");
            await user.clear(input);
            await user.type(input, "11:00{enter}");

            expect(on_save).toHaveBeenCalledWith("11:00");
        });

        it("Escape 키를 누르면 편집 취소", async () => {
            const on_save = vi.fn();
            const user = userEvent.setup();
            render(<TimeInput {...defaultProps} onSave={on_save} />);

            const input = screen.getByRole("textbox");
            await user.click(input);
            await user.clear(input);
            await user.type(input, "99:99");
            fireEvent.keyDown(input, { key: "Escape" });

            // 원래 값으로 복원되어야 함
            expect(input).toHaveValue("09:30");
            expect(on_save).not.toHaveBeenCalled();
        });
    });

    // =====================================================
    // 비활성화 테스트
    // =====================================================
    describe("비활성화 상태", () => {
        it("disabled=true일 때 입력 불가", () => {
            render(<TimeInput {...defaultProps} disabled={true} />);

            const input = screen.getByRole("textbox");
            expect(input).toBeDisabled();
        });

        it("disabled=true일 때 포커스해도 편집 모드로 전환되지 않음", () => {
            const on_save = vi.fn();
            render(
                <TimeInput {...defaultProps} disabled={true} onSave={on_save} />
            );

            const input = screen.getByRole("textbox");

            // disabled 상태에서는 클릭해도 편집 모드로 전환되지 않음
            expect(input).toBeDisabled();
        });
    });

    // =====================================================
    // 시간 형식 검증 테스트
    // =====================================================
    describe("시간 형식 검증", () => {
        it("HH:mm 형식이 유효함", async () => {
            const on_save = vi.fn();
            const user = userEvent.setup();
            render(<TimeInput {...defaultProps} onSave={on_save} />);

            const input = screen.getByRole("textbox");
            await user.clear(input);
            await user.type(input, "14:30");
            fireEvent.blur(input);

            expect(on_save).toHaveBeenCalledWith("14:30");
        });

        it("00:00 형식이 유효함", async () => {
            const on_save = vi.fn();
            const user = userEvent.setup();
            render(<TimeInput {...defaultProps} onSave={on_save} />);

            const input = screen.getByRole("textbox");
            await user.clear(input);
            await user.type(input, "00:00");
            fireEvent.blur(input);

            expect(on_save).toHaveBeenCalledWith("00:00");
        });

        it("23:59 형식이 유효함", async () => {
            const on_save = vi.fn();
            const user = userEvent.setup();
            render(<TimeInput {...defaultProps} onSave={on_save} />);

            const input = screen.getByRole("textbox");
            await user.clear(input);
            await user.type(input, "23:59");
            fireEvent.blur(input);

            expect(on_save).toHaveBeenCalledWith("23:59");
        });
    });
});
