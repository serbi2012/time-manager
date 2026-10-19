import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { SortableTemplateCard } from "@/features/work-template/ui/SortableTemplateCard";
import { createMockTemplate } from "@/test/helpers";

const sortable_state = vi.hoisted(() => ({
    transform: null as null | {
        x: number;
        y: number;
        scaleX: number;
        scaleY: number;
    },
    is_dragging: false,
}));

vi.mock("@dnd-kit/sortable", async (importOriginal) => ({
    ...(await importOriginal<typeof import("@dnd-kit/sortable")>()),
    useSortable: () => ({
        attributes: {},
        listeners: {},
        setNodeRef: () => undefined,
        transform: sortable_state.transform,
        transition: undefined,
        isDragging: sortable_state.is_dragging,
    }),
}));

const TEMPLATE = createMockTemplate({
    id: "t1",
    deal_name: "아주 긴 거래명 제목",
    work_name: "작업명",
    task_name: "개발",
    category_name: "회의",
    project_code: "A26_00001",
    note: "비고 메모",
});

function renderCard(
    props: Partial<React.ComponentProps<typeof SortableTemplateCard>> = {}
) {
    return render(
        <SortableTemplateCard
            template={TEMPLATE}
            onEdit={vi.fn()}
            onDelete={vi.fn()}
            {...props}
        />
    );
}

function getCardRoot(container: HTMLElement) {
    const root = container.querySelector<HTMLElement>(".group");
    if (!root) throw new Error("카드 루트를 찾을 수 없음");
    return root;
}

describe("SortableTemplateCard", () => {
    beforeEach(() => {
        sortable_state.transform = null;
        sortable_state.is_dragging = false;
    });

    it("제목은 말줄임 한 줄이 아니라 최대 2줄로 표시한다", () => {
        renderCard();

        const title = screen.getByText("아주 긴 거래명 제목");
        expect(title).toHaveClass("line-clamp-2");
        expect(title).not.toHaveClass("truncate");
    });

    it("내용 영역에 머물면 프로젝트 코드·비고를 포함한 상세 정보를 보여준다", async () => {
        renderCard();

        fireEvent.mouseEnter(
            screen.getByText("아주 긴 거래명 제목").parentElement as HTMLElement
        );

        expect(await screen.findByText("A26_00001")).toBeInTheDocument();
        expect(screen.getByText("프로젝트 코드")).toBeInTheDocument();
        expect(screen.getByText("비고 메모")).toBeInTheDocument();
    });

    it("검색어와 일치하는 부분을 강조한다", () => {
        renderCard({ search_query: "긴 거래" });

        const mark = screen.getByText("긴 거래");
        expect(mark.tagName).toBe("MARK");
    });

    it("드래그가 비활성화되면 드래그 핸들을 숨긴다", () => {
        const { container } = renderCard({ drag_disabled: true });

        expect(container.querySelector(".cursor-grab")).toHaveClass(
            "invisible"
        );
    });

    it("드래그 중 다른 높이의 카드를 지나도 카드가 늘어나거나 줄어들지 않는다", () => {
        sortable_state.transform = { x: 0, y: -120, scaleX: 1, scaleY: 1.22 };
        sortable_state.is_dragging = true;

        const { container } = renderCard();
        const transform = getCardRoot(container).style.transform;

        expect(transform).toContain("translate3d(0px, -120px, 0)");
        expect(transform).not.toContain("scaleX");
        expect(transform).not.toContain("scaleY");
    });
});
