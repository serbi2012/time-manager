/**
 * DiagnosticsCard 컴포넌트 테스트
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ConfigProvider } from "antd";
import koKR from "antd/locale/ko_KR";
import { DiagnosticsCard } from "../../../../features/settings/ui/tabs/DiagnosticsCard";
import { useWorkStore } from "../../../../store/useWorkStore";
import { DIAGNOSTIC_LABELS } from "../../../../shared/constants";
import {
    recordDiagnosticEvent,
    clearDiagnosticEvents,
} from "../../../../shared/lib/diagnostics";

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
    <ConfigProvider locale={koKR}>{children}</ConfigProvider>
);

const create_element = document.createElement.bind(document);

describe("DiagnosticsCard", () => {
    beforeEach(() => {
        useWorkStore.setState({ app_theme: "blue" });
        clearDiagnosticEvents();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("진단 섹션 제목과 설명이 표시된다", () => {
        render(
            <TestWrapper>
                <DiagnosticsCard />
            </TestWrapper>
        );

        expect(
            screen.getByText(DIAGNOSTIC_LABELS.SECTION_TITLE)
        ).toBeInTheDocument();
        expect(
            screen.getByText(DIAGNOSTIC_LABELS.SECTION_DESCRIPTION)
        ).toBeInTheDocument();
    });

    it("오류가 없으면 없다는 문구를 보여준다", () => {
        render(
            <TestWrapper>
                <DiagnosticsCard />
            </TestWrapper>
        );

        expect(
            screen.getByText(DIAGNOSTIC_LABELS.NO_EVENTS)
        ).toBeInTheDocument();
    });

    it("기록된 오류 건수를 보여준다", () => {
        recordDiagnosticEvent({
            level: "error",
            source: "manual",
            message: "테스트 오류",
        });

        render(
            <TestWrapper>
                <DiagnosticsCard />
            </TestWrapper>
        );

        expect(
            screen.getByText(DIAGNOSTIC_LABELS.EVENT_COUNT(1))
        ).toBeInTheDocument();
    });

    it("오류가 없으면 기록 지우기 버튼이 비활성화된다", () => {
        render(
            <TestWrapper>
                <DiagnosticsCard />
            </TestWrapper>
        );

        const button = screen
            .getByText(DIAGNOSTIC_LABELS.CLEAR_BUTTON)
            .closest("button")!;

        expect(button).toBeDisabled();
    });

    it("기록 지우기를 누르면 오류 기록이 비워진다", () => {
        recordDiagnosticEvent({
            level: "error",
            source: "manual",
            message: "테스트 오류",
        });

        render(
            <TestWrapper>
                <DiagnosticsCard />
            </TestWrapper>
        );

        fireEvent.click(screen.getByText(DIAGNOSTIC_LABELS.CLEAR_BUTTON));

        expect(
            screen.getByText(DIAGNOSTIC_LABELS.NO_EVENTS)
        ).toBeInTheDocument();
    });

    it("내려받기를 누르면 json 파일 다운로드를 시작한다", () => {
        const click = vi.fn();
        const anchor = create_element("a");
        anchor.click = click;

        vi.spyOn(document, "createElement").mockImplementation((tag) =>
            tag === "a" ? anchor : create_element(tag)
        );
        vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:diagnostics");
        vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {});

        render(
            <TestWrapper>
                <DiagnosticsCard />
            </TestWrapper>
        );

        fireEvent.click(screen.getByText(DIAGNOSTIC_LABELS.DOWNLOAD_BUTTON));

        expect(click).toHaveBeenCalledTimes(1);
        expect(anchor.download).toMatch(/^time-manager-diagnostics-.*\.json$/);
    });
});
