/**
 * WorkTemplateList 컴포넌트 테스트
 *
 * 프리셋(템플릿) 목록 컴포넌트의 렌더링 및 상호작용 테스트
 *
 * 주의: antd 모달은 포털을 사용하여 렌더링되므로 DOM 테스트가 복잡합니다.
 * 따라서 모달 관련 테스트는 스토어 직접 테스트로 대체합니다.
 */
import { describe, it, expect, beforeEach } from "vitest";
import { screen, waitFor, fireEvent, within } from "@testing-library/react";
import { renderWithAntd, resetWorkStore } from "@/test/helpers";
import { DesktopWorkTemplateList } from "@/features/work-template/ui/Desktop/DesktopWorkTemplateList";
import { useWorkStore } from "@/store/useWorkStore";
import { useSidebarStore } from "@/store/useSidebarStore";
import type { WorkTemplate } from "@/types";
import {
    MODAL_TITLE_EDIT,
    POPCONFIRM_DELETE_DESCRIPTION,
    POPCONFIRM_DELETE_TITLE,
    POPCONFIRM_OK_TEXT,
} from "@/features/work-template/constants";

// 테스트용 템플릿 생성
const createTestTemplate = (
    overrides: Partial<WorkTemplate> = {}
): WorkTemplate => ({
    id: "template-1",
    project_code: "A26_TEST",
    work_name: "테스트 작업",
    task_name: "개발",
    deal_name: "테스트 거래",
    category_name: "개발",
    note: "테스트 노트",
    color: "#1890ff",
    created_at: "2026-01-19T00:00:00.000Z",
    sort_order: 0,
    ...overrides,
});

describe("DesktopWorkTemplateList", () => {
    beforeEach(() => {
        resetWorkStore({ selected_date: "2026-01-19" });
    });

    // =====================================================
    // 기본 렌더링 테스트
    // =====================================================
    describe("기본 렌더링", () => {
        it("컴포넌트가 렌더링됨", () => {
            renderWithAntd(<DesktopWorkTemplateList />);

            expect(screen.getByText("작업 프리셋")).toBeInTheDocument();
        });

        it("템플릿이 없으면 빈 상태 표시", () => {
            renderWithAntd(<DesktopWorkTemplateList />);

            expect(
                screen.getByText("아직 프리셋이 없어요")
            ).toBeInTheDocument();
        });

        it("추가 버튼이 표시됨", () => {
            renderWithAntd(<DesktopWorkTemplateList />);

            // '추가' 버튼 찾기 (단축키는 Tooltip으로 이동)
            expect(
                screen.getByRole("button", { name: /추가/ })
            ).toBeInTheDocument();
        });

        it("템플릿이 있으면 목록에 표시됨", () => {
            const template = createTestTemplate();
            useWorkStore.setState({ templates: [template] });

            renderWithAntd(<DesktopWorkTemplateList />);

            // SortableTemplateCard: title = deal_name || work_name
            expect(screen.getByText("테스트 거래")).toBeInTheDocument();
            expect(screen.getByText("개발 · 개발")).toBeInTheDocument();
        });

        it("여러 템플릿이 모두 표시됨", () => {
            const templates = [
                createTestTemplate({
                    id: "t1",
                    work_name: "작업1",
                    deal_name: "거래1",
                }),
                createTestTemplate({
                    id: "t2",
                    work_name: "작업2",
                    deal_name: "거래2",
                }),
                createTestTemplate({
                    id: "t3",
                    work_name: "작업3",
                    deal_name: "거래3",
                }),
            ];
            useWorkStore.setState({ templates });

            renderWithAntd(<DesktopWorkTemplateList />);

            // SortableTemplateCard: title = deal_name || work_name
            expect(screen.getByText("거래1")).toBeInTheDocument();
            expect(screen.getByText("거래2")).toBeInTheDocument();
            expect(screen.getByText("거래3")).toBeInTheDocument();
        });
    });

    describe("템플릿 카드 메뉴", () => {
        const openCardMenu = async () => {
            const more_icon = document.querySelector(".anticon-more");
            const more_button = more_icon?.closest("button");
            if (!more_button) throw new Error("더보기 버튼을 찾을 수 없음");
            fireEvent.click(more_button);
            return screen.findByRole("menuitem", { name: /삭제/ });
        };

        const renderWithTemplate = () => {
            useWorkStore.setState({ templates: [createTestTemplate()] });
            renderWithAntd(<DesktopWorkTemplateList />);
        };

        const openDeleteConfirm = async () => {
            const delete_item = await openCardMenu();
            fireEvent.click(delete_item);
            await screen.findByText(POPCONFIRM_DELETE_TITLE);
            const popconfirm = document.querySelector<HTMLElement>(
                ".template-card-popconfirm"
            );
            if (!popconfirm) throw new Error("삭제 확인 팝업을 찾을 수 없음");
            return popconfirm;
        };

        it("수정 메뉴를 누르면 기존 값이 채워진 편집 모달이 열린다", async () => {
            renderWithTemplate();

            await openCardMenu();
            fireEvent.click(screen.getByRole("menuitem", { name: /수정/ }));

            expect(
                await screen.findByText(MODAL_TITLE_EDIT)
            ).toBeInTheDocument();
            expect(screen.getByDisplayValue("테스트 거래")).toBeInTheDocument();
            expect(useWorkStore.getState().templates).toHaveLength(1);
        });

        it("삭제 메뉴를 누르면 바로 지우지 않고 확인 팝업을 띄운다", async () => {
            renderWithTemplate();

            const popconfirm = await openDeleteConfirm();

            expect(
                within(popconfirm).getByText(POPCONFIRM_DELETE_DESCRIPTION)
            ).toBeInTheDocument();
            expect(useWorkStore.getState().templates).toHaveLength(1);
        });

        it("확인 팝업에서 삭제를 누르면 템플릿이 삭제된다", async () => {
            renderWithTemplate();

            const popconfirm = await openDeleteConfirm();
            fireEvent.click(
                within(popconfirm).getByRole("button", {
                    name: POPCONFIRM_OK_TEXT,
                })
            );

            await waitFor(() => {
                expect(useWorkStore.getState().templates).toHaveLength(0);
            });
        });
    });

    // =====================================================
    // UI 요소 테스트
    // =====================================================
    describe("UI 요소", () => {
        it("업무명과 카테고리가 표시됨", () => {
            const template = createTestTemplate({
                task_name: "기획",
                category_name: "기획업무",
            });
            useWorkStore.setState({ templates: [template] });

            renderWithAntd(<DesktopWorkTemplateList />);

            expect(screen.getByText("기획 · 기획업무")).toBeInTheDocument();
        });

        it("템플릿이 없을 때 안내 텍스트 표시", () => {
            renderWithAntd(<DesktopWorkTemplateList />);

            expect(
                screen.getByText("자주 쓰는 작업을 저장해 보세요")
            ).toBeInTheDocument();
        });
    });

    describe("프리셋 검색", () => {
        const createSearchTemplates = (count: number) =>
            Array.from({ length: count }, (_, index) =>
                createTestTemplate({
                    id: `t${index}`,
                    work_name: `작업${index}`,
                    deal_name: `거래${index}`,
                    task_name: "",
                    category_name: "",
                })
            );

        const renderList = () =>
            renderWithAntd(<DesktopWorkTemplateList />);

        it("개수 대신 사이드바 접기 버튼을 표시한다", () => {
            useSidebarStore.setState({ is_collapsed: false });
            useWorkStore.setState({ templates: createSearchTemplates(3) });
            renderList();

            expect(screen.queryByText("3개")).not.toBeInTheDocument();
            fireEvent.click(
                screen.getByRole("button", { name: "사이드바 접기" })
            );
            expect(useSidebarStore.getState().is_collapsed).toBe(true);
        });

        it("프리셋이 5개 미만이면 검색창을 숨긴다", () => {
            useWorkStore.setState({ templates: createSearchTemplates(4) });
            renderList();

            expect(
                screen.queryByPlaceholderText("프리셋 검색")
            ).not.toBeInTheDocument();
        });

        it("검색어로 프리셋을 거른다", async () => {
            useWorkStore.setState({ templates: createSearchTemplates(5) });
            renderList();

            fireEvent.change(screen.getByPlaceholderText("프리셋 검색"), {
                target: { value: "거래3" },
            });

            await waitFor(() => {
                expect(screen.queryByText("거래1")).not.toBeInTheDocument();
            });
            expect(screen.getByText("거래3")).toBeInTheDocument();
        });

        it("검색 결과가 없으면 안내 문구를 표시한다", async () => {
            useWorkStore.setState({ templates: createSearchTemplates(5) });
            renderList();

            fireEvent.change(screen.getByPlaceholderText("프리셋 검색"), {
                target: { value: "없는 프리셋" },
            });

            expect(
                await screen.findByText("검색 결과가 없어요")
            ).toBeInTheDocument();
        });
    });
});
