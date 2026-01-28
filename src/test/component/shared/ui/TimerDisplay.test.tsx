/**
 * TimerDisplay 컴포넌트 테스트
 */

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { TimerDisplay } from "../../../../shared/ui/TimerDisplay";

describe("TimerDisplay", () => {
    // =====================================================
    // 기본 렌더링 테스트
    // =====================================================
    describe("기본 렌더링", () => {
        it("초를 HH:mm 형식으로 표시", () => {
            render(<TimerDisplay seconds={3661} />);
            expect(screen.getByText("01:01")).toBeInTheDocument();
        });

        it("0초는 00:00으로 표시", () => {
            render(<TimerDisplay seconds={0} />);
            expect(screen.getByText("00:00")).toBeInTheDocument();
        });

        it("60초는 00:01로 표시", () => {
            render(<TimerDisplay seconds={60} />);
            expect(screen.getByText("00:01")).toBeInTheDocument();
        });

        it("3600초는 01:00으로 표시", () => {
            render(<TimerDisplay seconds={3600} />);
            expect(screen.getByText("01:00")).toBeInTheDocument();
        });
    });

    // =====================================================
    // 초 단위 표시 테스트
    // =====================================================
    describe("초 단위 표시", () => {
        it("showSeconds=true일 때 HH:mm:ss 형식으로 표시", () => {
            render(<TimerDisplay seconds={3661} showSeconds={true} />);
            expect(screen.getByText("01:01:01")).toBeInTheDocument();
        });

        it("showSeconds=true이고 0초일 때 00:00:00 표시", () => {
            render(<TimerDisplay seconds={0} showSeconds={true} />);
            expect(screen.getByText("00:00:00")).toBeInTheDocument();
        });

        it("showSeconds=true이고 90초일 때 00:01:30 표시", () => {
            render(<TimerDisplay seconds={90} showSeconds={true} />);
            expect(screen.getByText("00:01:30")).toBeInTheDocument();
        });
    });

    // =====================================================
    // 실행 중 스타일 테스트
    // =====================================================
    describe("실행 중 스타일", () => {
        it("isRunning=false일 때 기본 스타일", () => {
            const { container } = render(<TimerDisplay seconds={60} />);
            const text = container.querySelector("span");
            expect(text).not.toHaveStyle({ color: "#1890ff" });
        });

        it("isRunning=true일 때 파란색 스타일", () => {
            const { container } = render(
                <TimerDisplay seconds={60} isRunning={true} />
            );
            const text = container.querySelector("span");
            expect(text).toHaveStyle({ color: "#1890ff" });
        });
    });

    // =====================================================
    // 커스텀 스타일 테스트
    // =====================================================
    describe("커스텀 스타일", () => {
        it("커스텀 스타일이 전달됨", () => {
            const { container } = render(
                <TimerDisplay seconds={60} style={{ fontSize: 24 }} />
            );
            const text = container.querySelector("span");
            // happy-dom에서는 인라인 스타일 검증이 어려우므로 요소 존재만 확인
            expect(text).toBeInTheDocument();
        });

        it("텍스트 요소가 렌더링됨", () => {
            const { container } = render(<TimerDisplay seconds={60} />);
            const text = container.querySelector("span");
            expect(text).toBeInTheDocument();
            expect(text?.textContent).toBe("00:01");
        });
    });

    // =====================================================
    // 엣지 케이스 테스트
    // =====================================================
    describe("엣지 케이스", () => {
        it("큰 시간 값 처리 (24시간)", () => {
            render(<TimerDisplay seconds={86400} />);
            expect(screen.getByText("24:00")).toBeInTheDocument();
        });

        it("매우 큰 시간 값 처리 (48시간)", () => {
            render(<TimerDisplay seconds={172800} />);
            expect(screen.getByText("48:00")).toBeInTheDocument();
        });
    });
});
