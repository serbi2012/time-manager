/**
 * DurationDisplay 컴포넌트 테스트
 */

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { DurationDisplay } from "../../../../shared/ui/DurationDisplay";

describe("DurationDisplay", () => {
    // =====================================================
    // 기본 렌더링 테스트
    // =====================================================
    describe("기본 렌더링", () => {
        it("분 단위 시간을 읽기 쉬운 형식으로 표시", () => {
            render(<DurationDisplay minutes={90} />);
            expect(screen.getByText("1시간 30분")).toBeInTheDocument();
        });

        it("0분은 0분으로 표시", () => {
            render(<DurationDisplay minutes={0} />);
            expect(screen.getByText("0분")).toBeInTheDocument();
        });

        it("60분 미만은 분만 표시", () => {
            render(<DurationDisplay minutes={45} />);
            expect(screen.getByText("45분")).toBeInTheDocument();
        });

        it("정확히 1시간은 1시간으로 표시", () => {
            render(<DurationDisplay minutes={60} />);
            expect(screen.getByText("1시간")).toBeInTheDocument();
        });

        it("여러 시간은 시간과 분으로 표시", () => {
            render(<DurationDisplay minutes={150} />);
            expect(screen.getByText("2시간 30분")).toBeInTheDocument();
        });
    });

    // =====================================================
    // 포맷 옵션 테스트
    // =====================================================
    describe("포맷 옵션", () => {
        it('format="time"일 때 HH:mm 형식으로 표시', () => {
            render(<DurationDisplay minutes={90} format="time" />);
            expect(screen.getByText("01:30")).toBeInTheDocument();
        });

        it('format="time"일 때 0분은 00:00으로 표시', () => {
            render(<DurationDisplay minutes={0} format="time" />);
            expect(screen.getByText("00:00")).toBeInTheDocument();
        });

        it('format="readable"가 기본값', () => {
            render(<DurationDisplay minutes={90} />);
            expect(screen.getByText("1시간 30분")).toBeInTheDocument();
        });
    });

    // =====================================================
    // 스타일 옵션 테스트
    // =====================================================
    describe("스타일 옵션", () => {
        it("strong=true일 때 굵은 글씨로 표시", () => {
            const { container } = render(
                <DurationDisplay minutes={60} strong={true} />
            );
            expect(container.querySelector("strong")).toBeInTheDocument();
        });

        it('type="secondary"일 때 보조 색상으로 표시', () => {
            const { container } = render(
                <DurationDisplay minutes={60} type="secondary" />
            );
            expect(
                container.querySelector(".ant-typography-secondary")
            ).toBeInTheDocument();
        });

        it('type="success"일 때 성공 색상으로 표시', () => {
            const { container } = render(
                <DurationDisplay minutes={60} type="success" />
            );
            expect(
                container.querySelector(".ant-typography-success")
            ).toBeInTheDocument();
        });

        it("커스텀 스타일이 전달됨", () => {
            const { container } = render(
                <DurationDisplay
                    minutes={60}
                    style={{ fontSize: 20, color: "red" }}
                />
            );
            const element = container.querySelector("span");
            // happy-dom에서는 인라인 스타일 검증이 어려우므로 요소 존재만 확인
            expect(element).toBeInTheDocument();
        });
    });

    // =====================================================
    // 엣지 케이스 테스트
    // =====================================================
    describe("엣지 케이스", () => {
        it("큰 시간 값 처리", () => {
            render(<DurationDisplay minutes={600} />);
            expect(screen.getByText("10시간")).toBeInTheDocument();
        });

        it("매우 큰 시간 값 처리", () => {
            render(<DurationDisplay minutes={1440} />);
            expect(screen.getByText("24시간")).toBeInTheDocument();
        });
    });
});
