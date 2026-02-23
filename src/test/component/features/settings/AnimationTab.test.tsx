/**
 * AnimationTab 컴포넌트 테스트
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ConfigProvider } from "antd";
import koKR from "antd/locale/ko_KR";
import { AnimationTab } from "../../../../features/settings/ui/tabs/AnimationTab";
import { useWorkStore } from "../../../../store/useWorkStore";

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
    <ConfigProvider locale={koKR}>{children}</ConfigProvider>
);

describe("AnimationTab", () => {
    beforeEach(() => {
        useWorkStore.setState({
            app_theme: "blue",
            transition_enabled: false,
            transition_speed: "normal",
            cursor_tracking_enabled: false,
        });
        vi.clearAllMocks();
    });

    it("트랜지션 효과 섹션이 렌더링됨", () => {
        render(
            <TestWrapper>
                <AnimationTab />
            </TestWrapper>
        );

        expect(screen.getByText("트랜지션 효과")).toBeInTheDocument();
        expect(screen.getByText("페이지 진입 애니메이션")).toBeInTheDocument();
    });

    it("커서 인터랙션 섹션이 렌더링됨", () => {
        render(
            <TestWrapper>
                <AnimationTab />
            </TestWrapper>
        );

        expect(screen.getByText("커서 인터랙션")).toBeInTheDocument();
        expect(screen.getByText("커서 트래킹 효과")).toBeInTheDocument();
    });

    it("커서 트래킹 토글 클릭 시 스토어 업데이트", () => {
        render(
            <TestWrapper>
                <AnimationTab />
            </TestWrapper>
        );

        const switches = screen.getAllByRole("switch");
        const cursor_tracking_switch = switches[switches.length - 1];

        fireEvent.click(cursor_tracking_switch);

        expect(useWorkStore.getState().cursor_tracking_enabled).toBe(true);
    });

    it("트랜지션 토글 클릭 시 스토어 업데이트", () => {
        render(
            <TestWrapper>
                <AnimationTab />
            </TestWrapper>
        );

        const switches = screen.getAllByRole("switch");
        const transition_switch = switches[0];

        fireEvent.click(transition_switch);

        expect(useWorkStore.getState().transition_enabled).toBe(true);
    });
});
