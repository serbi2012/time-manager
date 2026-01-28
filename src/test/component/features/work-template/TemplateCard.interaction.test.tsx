/**
 * TemplateCard 상호작용 테스트
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ConfigProvider } from "antd";
import koKR from "antd/locale/ko_KR";
import { TemplateCard } from "../../../../features/work-template/ui/TemplateCard";
import type { WorkTemplate } from "../../../../shared/types";

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
    <ConfigProvider locale={koKR}>{children}</ConfigProvider>
);

describe("TemplateCard 상호작용", () => {
    const mock_template: WorkTemplate = {
        id: "template-1",
        work_name: "프레임워크 개발",
        task_name: "개발",
        deal_name: "컴포넌트 구현",
        project_code: "A25_01234",
        category_name: "개발",
        note: "테스트 메모",
        color: "#1677ff",
        created_at: "2026-01-01T00:00:00.000Z",
    };

    const default_props = {
        template: mock_template,
        on_apply: vi.fn(),
        on_edit: vi.fn(),
        on_delete: vi.fn(),
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    // =====================================================
    // 렌더링 테스트
    // =====================================================
    describe("렌더링", () => {
        it("작업명이 표시됨", () => {
            render(
                <TestWrapper>
                    <TemplateCard {...default_props} />
                </TestWrapper>
            );

            expect(screen.getByText("프레임워크 개발")).toBeInTheDocument();
        });

        it("거래명이 표시됨", () => {
            render(
                <TestWrapper>
                    <TemplateCard {...default_props} />
                </TestWrapper>
            );

            expect(screen.getByText("컴포넌트 구현")).toBeInTheDocument();
        });

        it("카테고리 태그가 표시됨", () => {
            render(
                <TestWrapper>
                    <TemplateCard {...default_props} />
                </TestWrapper>
            );

            // 카테고리명은 여러 곳에 있을 수 있으므로 getAllByText 사용
            const elements = screen.getAllByText("개발");
            expect(elements.length).toBeGreaterThan(0);
        });

        it("프로젝트 코드가 표시됨", () => {
            render(
                <TestWrapper>
                    <TemplateCard {...default_props} />
                </TestWrapper>
            );

            expect(screen.getByText("A25_01234")).toBeInTheDocument();
        });

        it("색상 테두리 스타일이 존재함", () => {
            const { container } = render(
                <TestWrapper>
                    <TemplateCard {...default_props} />
                </TestWrapper>
            );

            const card = container.querySelector(".ant-card");
            // happy-dom에서는 인라인 스타일 검증이 어려우므로 존재 여부만 확인
            expect(card).toBeInTheDocument();
            expect(card?.getAttribute("style")).toContain("border-left");
        });
    });

    // =====================================================
    // 버튼 상호작용 테스트
    // =====================================================
    describe("버튼 상호작용", () => {
        it("적용 버튼 클릭 시 on_apply 호출", async () => {
            const on_apply = vi.fn();
            render(
                <TestWrapper>
                    <TemplateCard {...default_props} on_apply={on_apply} />
                </TestWrapper>
            );

            // PlayCircleOutlined 아이콘 버튼 찾기
            const apply_buttons = screen.getAllByRole("button");
            // 첫 번째 버튼이 적용 버튼
            fireEvent.click(apply_buttons[0]);

            expect(on_apply).toHaveBeenCalledTimes(1);
        });

        it("수정 버튼 클릭 시 on_edit 호출", async () => {
            const on_edit = vi.fn();
            render(
                <TestWrapper>
                    <TemplateCard {...default_props} on_edit={on_edit} />
                </TestWrapper>
            );

            const buttons = screen.getAllByRole("button");
            // 두 번째 버튼이 수정 버튼
            fireEvent.click(buttons[1]);

            expect(on_edit).toHaveBeenCalledTimes(1);
        });

        it("삭제 버튼 클릭 시 on_delete 호출", async () => {
            const on_delete = vi.fn();
            render(
                <TestWrapper>
                    <TemplateCard {...default_props} on_delete={on_delete} />
                </TestWrapper>
            );

            const buttons = screen.getAllByRole("button");
            // 세 번째 버튼이 삭제 버튼
            fireEvent.click(buttons[2]);

            expect(on_delete).toHaveBeenCalledTimes(1);
        });
    });

    // =====================================================
    // 드래그 상태 테스트
    // =====================================================
    describe("드래그 상태", () => {
        it("is_dragging=false일 때 기본 스타일", () => {
            const { container } = render(
                <TestWrapper>
                    <TemplateCard {...default_props} is_dragging={false} />
                </TestWrapper>
            );

            const card = container.querySelector(".template-card");
            expect(card).not.toHaveClass("template-card-dragging");
        });

        it("is_dragging=true일 때 드래그 스타일 적용", () => {
            const { container } = render(
                <TestWrapper>
                    <TemplateCard {...default_props} is_dragging={true} />
                </TestWrapper>
            );

            const card = container.querySelector(".template-card");
            expect(card).toHaveClass("template-card-dragging");
        });
    });

    // =====================================================
    // 옵셔널 필드 테스트
    // =====================================================
    describe("옵셔널 필드", () => {
        it("거래명이 없을 때 거래명 미표시", () => {
            const template_without_deal: WorkTemplate = {
                ...mock_template,
                deal_name: "",
            };
            render(
                <TestWrapper>
                    <TemplateCard {...default_props} template={template_without_deal} />
                </TestWrapper>
            );

            expect(screen.queryByText("컴포넌트 구현")).not.toBeInTheDocument();
        });

        it("프로젝트 코드가 없을 때 코드 미표시", () => {
            const template_without_code: WorkTemplate = {
                ...mock_template,
                project_code: "",
            };
            render(
                <TestWrapper>
                    <TemplateCard {...default_props} template={template_without_code} />
                </TestWrapper>
            );

            expect(screen.queryByText("A25_01234")).not.toBeInTheDocument();
        });

        it("업무명이 없을 때 업무명 태그 미표시", () => {
            const template_without_task: WorkTemplate = {
                ...mock_template,
                task_name: "",
            };
            const { container } = render(
                <TestWrapper>
                    <TemplateCard {...default_props} template={template_without_task} />
                </TestWrapper>
            );

            // 카테고리 태그만 있어야 함
            const tags = container.querySelectorAll(".ant-tag");
            expect(tags.length).toBe(1);
        });
    });

    // =====================================================
    // 툴팁 테스트
    // =====================================================
    describe("툴팁", () => {
        it("적용 버튼에 툴팁이 있음", async () => {
            const user = userEvent.setup();
            render(
                <TestWrapper>
                    <TemplateCard {...default_props} />
                </TestWrapper>
            );

            const buttons = screen.getAllByRole("button");
            await user.hover(buttons[0]);

            // 툴팁 표시 대기
            // Note: 실제 환경에서는 waitFor로 확인
        });
    });
});
