/**
 * RouteTransition 컴포넌트 테스트
 */

import { describe, it, expect } from "vitest";
import type { ReactElement } from "react";
import { screen } from "@testing-library/react";
import { renderWithAntd } from "@/test/helpers/test_utils";
import {
    RouteTransition,
    PageTransitionProvider,
} from "@/shared/ui/transitions";

const DEFAULT_ROUTE = "/";

function renderWithRouter(ui: ReactElement, route = DEFAULT_ROUTE) {
    return renderWithAntd(ui, { route });
}

describe("RouteTransition", () => {
    it("children을 렌더링한다", () => {
        renderWithRouter(
            <PageTransitionProvider is_ready={true} transition_enabled={true}>
                <RouteTransition>
                    <div>테스트 콘텐츠</div>
                </RouteTransition>
            </PageTransitionProvider>
        );

        expect(screen.getByText("테스트 콘텐츠")).toBeInTheDocument();
    });

    it("transition_enabled=false일 때 children을 그대로 렌더링한다", () => {
        renderWithRouter(
            <PageTransitionProvider is_ready={true} transition_enabled={false}>
                <RouteTransition>
                    <div data-testid="content">콘텐츠</div>
                </RouteTransition>
            </PageTransitionProvider>
        );

        const content = screen.getByTestId("content");
        expect(content).toBeInTheDocument();
        expect(content.closest("div[style]")).toBeNull();
    });

    it("transition_enabled=true일 때 motion.div로 감싸서 렌더링한다", () => {
        renderWithRouter(
            <PageTransitionProvider is_ready={true} transition_enabled={true}>
                <RouteTransition>
                    <div data-testid="content">콘텐츠</div>
                </RouteTransition>
            </PageTransitionProvider>
        );

        const content = screen.getByTestId("content");
        expect(content.parentElement).toHaveAttribute("style");
    });

    it("is_ready=true면 투명 상태에서 슬라이드 인을 시작한다", () => {
        renderWithRouter(
            <PageTransitionProvider is_ready={true} transition_enabled={true}>
                <RouteTransition>
                    <div data-testid="content">콘텐츠</div>
                </RouteTransition>
            </PageTransitionProvider>
        );

        const wrapper = screen.getByTestId("content").parentElement;
        expect(wrapper?.style.opacity).toBe("0");
    });

    it("is_ready=false일 때 초기 애니메이션이 적용되지 않는다", () => {
        renderWithRouter(
            <PageTransitionProvider is_ready={false} transition_enabled={true}>
                <RouteTransition>
                    <div data-testid="content">콘텐츠</div>
                </RouteTransition>
            </PageTransitionProvider>
        );

        const wrapper = screen.getByTestId("content").parentElement;
        expect(wrapper?.style.opacity).toBe("1");
    });

    it("기본 context 값으로도 정상 렌더링된다", () => {
        renderWithRouter(
            <PageTransitionProvider is_ready={false}>
                <RouteTransition>
                    <div>기본값 테스트</div>
                </RouteTransition>
            </PageTransitionProvider>
        );

        expect(screen.getByText("기본값 테스트")).toBeInTheDocument();
    });

    it("다양한 초기 라우트에서 정상 렌더링된다", () => {
        renderWithRouter(
            <PageTransitionProvider is_ready={true} transition_enabled={true}>
                <RouteTransition>
                    <div>주간 페이지</div>
                </RouteTransition>
            </PageTransitionProvider>,
            "/weekly"
        );

        expect(screen.getByText("주간 페이지")).toBeInTheDocument();
    });

    it("ROUTE_ORDER에 없는 라우트에서도 정상 동작한다", () => {
        renderWithRouter(
            <PageTransitionProvider is_ready={true} transition_enabled={true}>
                <RouteTransition>
                    <div>알 수 없는 라우트</div>
                </RouteTransition>
            </PageTransitionProvider>,
            "/unknown"
        );

        expect(screen.getByText("알 수 없는 라우트")).toBeInTheDocument();
    });
});
