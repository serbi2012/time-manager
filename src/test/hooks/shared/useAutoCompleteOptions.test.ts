/**
 * useAutoCompleteOptions 훅 테스트
 */

import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useAutoCompleteOptions } from "../../../shared/hooks/useAutoCompleteOptions";
import { useWorkStore } from "../../../store/useWorkStore";
import {
    createMockRecord,
    createMockTemplate,
} from "../../helpers/mock_factory";

describe("useAutoCompleteOptions", () => {
    beforeEach(() => {
        // 스토어 초기화
        useWorkStore.setState({
            records: [
                createMockRecord({
                    project_code: "A01_001",
                    work_name: "작업1",
                    task_name: "개발",
                    deal_name: "거래1",
                    category_name: "개발",
                }),
                createMockRecord({
                    project_code: "A02_002",
                    work_name: "작업2",
                    task_name: "테스트",
                    deal_name: "거래2",
                    category_name: "테스트",
                }),
            ],
            templates: [
                createMockTemplate({
                    project_code: "A03_003",
                    work_name: "작업3",
                    task_name: "분석",
                    category_name: "분석",
                }),
            ],
            custom_task_options: ["커스텀업무"],
            custom_category_options: ["커스텀카테고리"],
            hidden_autocomplete_options: {
                work_name: [],
                task_name: [],
                deal_name: [],
                project_code: [],
                task_option: [],
                category_option: [],
            },
        });
    });

    describe("옵션 조회", () => {
        it("workNameOptions를 반환한다", () => {
            const { result } = renderHook(() => useAutoCompleteOptions());

            const values = result.current.workNameOptions.map((o) => o.value);
            expect(values).toContain("작업1");
            expect(values).toContain("작업2");
            expect(values).toContain("작업3");
        });

        it("taskNameOptions를 반환한다", () => {
            const { result } = renderHook(() => useAutoCompleteOptions());

            const values = result.current.taskNameOptions.map((o) => o.value);
            expect(values).toContain("개발");
            expect(values).toContain("테스트");
            expect(values).toContain("분석");
        });

        it("dealNameOptions를 반환한다", () => {
            const { result } = renderHook(() => useAutoCompleteOptions());

            const values = result.current.dealNameOptions.map((o) => o.value);
            expect(values).toContain("거래1");
            expect(values).toContain("거래2");
        });

        it("taskSelectOptions에 커스텀 옵션이 포함된다", () => {
            const { result } = renderHook(() => useAutoCompleteOptions());

            const values = result.current.taskSelectOptions.map((o) => o.value);
            expect(values).toContain("커스텀업무");
        });

        it("categorySelectOptions에 커스텀 옵션이 포함된다", () => {
            const { result } = renderHook(() => useAutoCompleteOptions());

            const values = result.current.categorySelectOptions.map(
                (o) => o.value
            );
            expect(values).toContain("커스텀카테고리");
        });
    });

    describe("옵션 숨김", () => {
        it("hideOption으로 옵션을 숨길 수 있다", () => {
            const { result } = renderHook(() => useAutoCompleteOptions());

            act(() => {
                result.current.hideOption("work_name", "작업1");
            });

            const hidden = useWorkStore.getState().hidden_autocomplete_options;
            expect(hidden.work_name).toContain("작업1");
        });

        it("unhideOption으로 숨김을 해제할 수 있다", () => {
            // 먼저 숨김 설정
            useWorkStore.setState({
                hidden_autocomplete_options: {
                    ...useWorkStore.getState().hidden_autocomplete_options,
                    work_name: ["작업1"],
                },
            });

            const { result } = renderHook(() => useAutoCompleteOptions());

            act(() => {
                result.current.unhideOption("work_name", "작업1");
            });

            const hidden = useWorkStore.getState().hidden_autocomplete_options;
            expect(hidden.work_name).not.toContain("작업1");
        });

        it("숨겨진 옵션은 결과에서 제외된다", () => {
            useWorkStore.setState({
                hidden_autocomplete_options: {
                    ...useWorkStore.getState().hidden_autocomplete_options,
                    task_option: ["개발"],
                },
            });

            const { result } = renderHook(() => useAutoCompleteOptions());

            const values = result.current.taskSelectOptions.map((o) => o.value);
            expect(values).not.toContain("개발");
        });
    });

    describe("커스텀 옵션 관리", () => {
        it("addTaskOption으로 업무명 옵션을 추가할 수 있다", () => {
            const { result } = renderHook(() => useAutoCompleteOptions());

            act(() => {
                result.current.addTaskOption("새업무");
            });

            const options = useWorkStore.getState().custom_task_options;
            expect(options).toContain("새업무");
        });

        it("addCategoryOption으로 카테고리 옵션을 추가할 수 있다", () => {
            const { result } = renderHook(() => useAutoCompleteOptions());

            act(() => {
                result.current.addCategoryOption("새카테고리");
            });

            const options = useWorkStore.getState().custom_category_options;
            expect(options).toContain("새카테고리");
        });

        it("removeTaskOption으로 업무명 옵션을 제거할 수 있다", () => {
            const { result } = renderHook(() => useAutoCompleteOptions());

            act(() => {
                result.current.removeTaskOption("커스텀업무");
            });

            const options = useWorkStore.getState().custom_task_options;
            expect(options).not.toContain("커스텀업무");
        });

        it("removeCategoryOption으로 카테고리 옵션을 제거할 수 있다", () => {
            const { result } = renderHook(() => useAutoCompleteOptions());

            act(() => {
                result.current.removeCategoryOption("커스텀카테고리");
            });

            const options = useWorkStore.getState().custom_category_options;
            expect(options).not.toContain("커스텀카테고리");
        });
    });
});
