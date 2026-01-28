/**
 * TemplateCard 스냅샷 테스트
 * 프리셋 카드 UI 구조 변경 감지
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { ConfigProvider } from "antd";
import koKR from "antd/locale/ko_KR";
import { TemplateCard } from "../../../../features/work-template/ui/TemplateCard";
import type { WorkTemplate } from "../../../../shared/types";

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
    <ConfigProvider locale={koKR}>{children}</ConfigProvider>
);

describe("TemplateCard 스냅샷", () => {
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

    it("기본 렌더링 구조가 유지됨", () => {
        const { container } = render(
            <TestWrapper>
                <TemplateCard {...default_props} />
            </TestWrapper>
        );
        expect(container.firstChild).toMatchSnapshot();
    });

    it("다른 색상 템플릿 구조가 유지됨", () => {
        const green_template = { ...mock_template, color: "#52c41a" };
        const { container } = render(
            <TestWrapper>
                <TemplateCard {...default_props} template={green_template} />
            </TestWrapper>
        );
        expect(container.firstChild).toMatchSnapshot();
    });

    it("드래그 중 상태 구조가 유지됨", () => {
        const { container } = render(
            <TestWrapper>
                <TemplateCard {...default_props} is_dragging={true} />
            </TestWrapper>
        );
        expect(container.firstChild).toMatchSnapshot();
    });

    it("긴 텍스트 템플릿 구조가 유지됨", () => {
        const long_template: WorkTemplate = {
            ...mock_template,
            work_name: "아주 긴 작업명이 들어가는 경우 테스트입니다",
            deal_name: "아주 긴 거래명이 들어가서 줄바꿈이 필요한 경우",
            note: "아주 긴 메모가 들어가는 경우에 어떻게 표시되는지 테스트합니다",
        };
        const { container } = render(
            <TestWrapper>
                <TemplateCard {...default_props} template={long_template} />
            </TestWrapper>
        );
        expect(container.firstChild).toMatchSnapshot();
    });
});
