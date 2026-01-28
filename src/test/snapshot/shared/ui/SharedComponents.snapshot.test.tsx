/**
 * 공유 UI 컴포넌트 스냅샷 테스트
 */

import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import { DurationDisplay } from "../../../../shared/ui/DurationDisplay";
import { TimerDisplay } from "../../../../shared/ui/TimerDisplay";
import { TimeInput } from "../../../../shared/ui/TimeInput";

describe("공유 UI 컴포넌트 스냅샷", () => {
    // =====================================================
    // DurationDisplay 스냅샷
    // =====================================================
    describe("DurationDisplay", () => {
        it("readable 포맷 스냅샷", () => {
            const { container } = render(<DurationDisplay minutes={90} />);
            expect(container.firstChild).toMatchSnapshot();
        });

        it("time 포맷 스냅샷", () => {
            const { container } = render(
                <DurationDisplay minutes={90} format="time" />
            );
            expect(container.firstChild).toMatchSnapshot();
        });

        it("스타일 옵션 적용 스냅샷", () => {
            const { container } = render(
                <DurationDisplay
                    minutes={60}
                    type="success"
                    strong={true}
                />
            );
            expect(container.firstChild).toMatchSnapshot();
        });
    });

    // =====================================================
    // TimerDisplay 스냅샷
    // =====================================================
    describe("TimerDisplay", () => {
        it("기본 타이머 스냅샷", () => {
            const { container } = render(<TimerDisplay seconds={3661} />);
            expect(container.firstChild).toMatchSnapshot();
        });

        it("초 포함 타이머 스냅샷", () => {
            const { container } = render(
                <TimerDisplay seconds={3661} showSeconds={true} />
            );
            expect(container.firstChild).toMatchSnapshot();
        });

        it("실행 중 타이머 스냅샷", () => {
            const { container } = render(
                <TimerDisplay seconds={3661} isRunning={true} />
            );
            expect(container.firstChild).toMatchSnapshot();
        });
    });

    // =====================================================
    // TimeInput 스냅샷
    // =====================================================
    describe("TimeInput", () => {
        it("기본 입력 스냅샷", () => {
            const { container } = render(
                <TimeInput value="09:30" onSave={vi.fn()} />
            );
            expect(container.firstChild).toMatchSnapshot();
        });

        it("비활성화 입력 스냅샷", () => {
            const { container } = render(
                <TimeInput value="09:30" onSave={vi.fn()} disabled={true} />
            );
            expect(container.firstChild).toMatchSnapshot();
        });

        it("커스텀 너비 스냅샷", () => {
            const { container } = render(
                <TimeInput value="09:30" onSave={vi.fn()} width={120} />
            );
            expect(container.firstChild).toMatchSnapshot();
        });
    });
});
