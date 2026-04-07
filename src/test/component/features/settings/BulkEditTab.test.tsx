/**
 * BulkEditTab 컴포넌트 테스트
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { BulkEditTab } from "@/features/settings/ui/tabs/BulkEditTab";
import { useWorkStore } from "@/store/useWorkStore";
import { message } from "@/shared/lib/message";
import type { WorkRecord, WorkTemplate } from "@/shared/types";

vi.mock("@/firebase/syncService");
vi.mock("@/firebase/firestore", () => ({
    saveRecordsBatch: vi.fn().mockResolvedValue(undefined),
    saveTemplatesBatch: vi.fn().mockResolvedValue(undefined),
}));
vi.mock("@/shared/lib/message", () => ({
    message: {
        error: vi.fn(),
        success: vi.fn(),
        warning: vi.fn(),
    },
}));

describe("BulkEditTab", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        useWorkStore.setState({
            records: [],
            templates: [],
        });
    });

    describe("로그인 상태 확인", () => {
        it("로그인하지 않은 경우 안내 화면 표시", () => {
            render(<BulkEditTab is_mobile={false} isAuthenticated={false} />);

            expect(screen.getByText("로그인이 필요합니다")).toBeInTheDocument();
            expect(
                screen.getByText(
                    "일괄 변경 기능은 로그인 후 사용할 수 있습니다."
                )
            ).toBeInTheDocument();
        });

        it("로그인한 경우 변경 폼 표시", () => {
            render(<BulkEditTab is_mobile={false} isAuthenticated={true} />);

            expect(screen.getByText("작업 일괄 변경")).toBeInTheDocument();
            expect(screen.getByText("변경 전")).toBeInTheDocument();
            expect(screen.getByText("변경 후")).toBeInTheDocument();
        });
    });

    describe("입력 필드", () => {
        it("4개의 입력 필드가 표시됨", () => {
            render(<BulkEditTab is_mobile={false} isAuthenticated={true} />);

            const inputs = screen.getAllByRole("textbox");
            expect(inputs).toHaveLength(4);
        });

        it("입력 필드에 값 입력 가능", () => {
            render(<BulkEditTab is_mobile={false} isAuthenticated={true} />);

            const inputs = screen.getAllByRole("textbox");
            fireEvent.change(inputs[0], {
                target: { value: "기존 작업명" },
            });
            fireEvent.change(inputs[1], {
                target: { value: "A25_01846" },
            });

            expect(inputs[0]).toHaveValue("기존 작업명");
            expect(inputs[1]).toHaveValue("A25_01846");
        });
    });

    describe("검증 로직", () => {
        it("필드가 비어있으면 에러 메시지 표시", () => {
            render(<BulkEditTab is_mobile={false} isAuthenticated={true} />);

            const search_button = screen.getByText("변경 대상 찾기");
            fireEvent.click(search_button);

            expect(message.error).toHaveBeenCalledWith(
                "모든 항목을 입력해 주세요"
            );
        });

        it("기존 값과 새 값이 같으면 에러 메시지 표시", () => {
            render(<BulkEditTab is_mobile={false} isAuthenticated={true} />);

            const inputs = screen.getAllByRole("textbox");
            fireEvent.change(inputs[0], {
                target: { value: "작업명" },
            });
            fireEvent.change(inputs[1], {
                target: { value: "A25_01846" },
            });
            fireEvent.change(inputs[2], {
                target: { value: "작업명" },
            });
            fireEvent.change(inputs[3], {
                target: { value: "A25_01846" },
            });

            const search_button = screen.getByText("변경 대상 찾기");
            fireEvent.click(search_button);

            expect(message.error).toHaveBeenCalledWith(
                "기존 값과 새 값이 동일합니다"
            );
        });
    });

    describe("변경 대상 찾기", () => {
        it("일치하는 항목이 없으면 경고 메시지 표시", () => {
            useWorkStore.setState({
                records: [],
                templates: [],
            });

            render(<BulkEditTab is_mobile={false} isAuthenticated={true} />);

            const inputs = screen.getAllByRole("textbox");
            fireEvent.change(inputs[0], {
                target: { value: "존재하지 않는 작업명" },
            });
            fireEvent.change(inputs[1], {
                target: { value: "A00_00000" },
            });
            fireEvent.change(inputs[2], {
                target: { value: "새 작업명" },
            });
            fireEvent.change(inputs[3], {
                target: { value: "A00_00001" },
            });

            const search_button = screen.getByText("변경 대상 찾기");
            fireEvent.click(search_button);

            expect(message.warning).toHaveBeenCalledWith(
                "일치하는 작업이 없습니다"
            );
        });

        it("일치하는 항목이 있으면 개수 표시", () => {
            const mock_records: WorkRecord[] = [
                {
                    id: "1",
                    work_name: "5.6 견적서 조회/현황_FE",
                    project_code: "A25_01846",
                    task_name: "개발",
                    deal_name: "테스트",
                    category_name: "개발",
                    duration_minutes: 60,
                    note: "",
                    start_time: "09:00",
                    end_time: "10:00",
                    date: "2026-01-01",
                    sessions: [],
                    is_completed: false,
                },
            ];

            const mock_templates: WorkTemplate[] = [
                {
                    id: "t1",
                    work_name: "5.6 견적서 조회/현황_FE",
                    project_code: "A25_01846",
                    task_name: "개발",
                    deal_name: "",
                    category_name: "",
                    note: "",
                    color: "#1890ff",
                    created_at: "2026-01-01",
                    sort_order: 0,
                },
            ];

            useWorkStore.setState({
                records: mock_records,
                templates: mock_templates,
            });

            render(<BulkEditTab is_mobile={false} isAuthenticated={true} />);

            const inputs = screen.getAllByRole("textbox");
            fireEvent.change(inputs[0], {
                target: { value: "5.6 견적서 조회/현황_FE" },
            });
            fireEvent.change(inputs[1], {
                target: { value: "A25_01846" },
            });
            fireEvent.change(inputs[2], {
                target: { value: "5.6 견적서 v2 FE" },
            });
            fireEvent.change(inputs[3], {
                target: { value: "A26_02000" },
            });

            const search_button = screen.getByText("변경 대상 찾기");
            fireEvent.click(search_button);

            expect(screen.getByText("변경 대상 확인")).toBeInTheDocument();
            expect(screen.getByText(/1.*작업 기록/)).toBeInTheDocument();
            expect(screen.getByText(/1.*프리셋/)).toBeInTheDocument();
        });
    });

    describe("일괄 변경 버튼", () => {
        it("검색 전에는 비활성화", () => {
            render(<BulkEditTab is_mobile={false} isAuthenticated={true} />);

            const bulk_edit_button = screen.getByRole("button", {
                name: /일괄 변경/,
            });
            expect(bulk_edit_button).toBeDisabled();
        });

        it("검색 후에는 활성화", () => {
            const mock_records: WorkRecord[] = [
                {
                    id: "1",
                    work_name: "작업명",
                    project_code: "A25_01846",
                    task_name: "개발",
                    deal_name: "",
                    category_name: "",
                    duration_minutes: 0,
                    note: "",
                    start_time: "",
                    end_time: "",
                    date: "2026-01-01",
                    sessions: [],
                    is_completed: false,
                },
            ];

            useWorkStore.setState({ records: mock_records, templates: [] });

            render(<BulkEditTab is_mobile={false} isAuthenticated={true} />);

            const inputs = screen.getAllByRole("textbox");
            fireEvent.change(inputs[0], { target: { value: "작업명" } });
            fireEvent.change(inputs[1], {
                target: { value: "A25_01846" },
            });
            fireEvent.change(inputs[2], {
                target: { value: "새 작업명" },
            });
            fireEvent.change(inputs[3], {
                target: { value: "A26_02000" },
            });

            const search_button = screen.getByText("변경 대상 찾기");
            fireEvent.click(search_button);

            const bulk_edit_button = screen.getByRole("button", {
                name: /일괄 변경/,
            });
            expect(bulk_edit_button).not.toBeDisabled();
        });
    });

    describe("모바일 렌더링", () => {
        it("모바일 모드에서도 정상 렌더링", () => {
            render(<BulkEditTab is_mobile={true} isAuthenticated={true} />);

            expect(screen.getByText("작업 일괄 변경")).toBeInTheDocument();
            expect(screen.getByText("변경 전")).toBeInTheDocument();
            expect(screen.getByText("변경 후")).toBeInTheDocument();
        });
    });
});
