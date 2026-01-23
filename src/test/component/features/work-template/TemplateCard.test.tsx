/**
 * TemplateCard 컴포넌트 테스트
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { TemplateCard } from "../../../../features/work-template/ui/TemplateCard";
import type { WorkTemplate } from "../../../../shared/types";

describe("TemplateCard", () => {
    const mock_template: WorkTemplate = {
        id: "template-1",
        work_name: "프론트엔드 개발",
        deal_name: "ABC 프로젝트",
        task_name: "개발",
        category_name: "개발",
        project_code: "PRJ-001",
        color: "#1890ff",
        note: "",
        created_at: new Date().toISOString(),
    };

    const default_props = {
        template: mock_template,
        on_apply: vi.fn(),
        on_edit: vi.fn(),
        on_delete: vi.fn(),
    };

    it("렌더링되어야 함", () => {
        render(<TemplateCard {...default_props} />);

        expect(screen.getByText("프론트엔드 개발")).toBeInTheDocument();
    });

    it("템플릿 정보 표시", () => {
        render(<TemplateCard {...default_props} />);

        expect(screen.getByText("ABC 프로젝트")).toBeInTheDocument();
        expect(screen.getAllByText("개발").length).toBeGreaterThanOrEqual(1);
        expect(screen.getByText("PRJ-001")).toBeInTheDocument();
    });

    it("작업명 표시", () => {
        render(<TemplateCard {...default_props} />);

        expect(screen.getByText("프론트엔드 개발")).toBeInTheDocument();
    });

    it("적용 버튼 클릭 시 on_apply 호출", () => {
        const on_apply = vi.fn();
        render(<TemplateCard {...default_props} on_apply={on_apply} />);

        // Tooltip 내부의 버튼 찾기 (data-testid가 없어서 role로 찾기)
        const buttons = screen.getAllByRole("button");
        // 첫 번째 버튼이 적용 버튼 (PlayCircleOutlined)
        fireEvent.click(buttons[0]);

        expect(on_apply).toHaveBeenCalled();
    });

    it("드래깅 상태 시 스타일 변경", () => {
        const { container } = render(
            <TemplateCard {...default_props} is_dragging={true} />
        );

        const card = container.querySelector(".template-card-dragging");
        expect(card).toBeInTheDocument();
    });
});
