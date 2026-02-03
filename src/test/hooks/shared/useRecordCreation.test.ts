/**
 * useRecordCreation 훅 테스트
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useRecordCreation } from "../../../shared/hooks/useRecordCreation";
import { useWorkStore } from "../../../store/useWorkStore";
import {
    createMockTemplate,
    createMockRecord,
} from "../../helpers/mock_factory";

// antd message 모킹
vi.mock("antd", async () => {
    const actual = await vi.importActual("antd");
    return {
        ...actual,
        message: {
            success: vi.fn(),
            error: vi.fn(),
        },
    };
});

describe("useRecordCreation", () => {
    beforeEach(() => {
        // 스토어 초기화
        useWorkStore.setState({
            records: [],
            templates: [
                createMockTemplate({
                    id: "template-1",
                    work_name: "테스트 작업",
                    deal_name: "거래",
                }),
            ],
            selected_date: "2026-02-03",
            use_postfix_on_preset_add: false,
        });
    });

    describe("createFromTemplate", () => {
        it("템플릿에서 레코드를 생성한다", async () => {
            const { result } = renderHook(() => useRecordCreation());

            await act(async () => {
                result.current.createFromTemplate("template-1");
            });

            const records = useWorkStore.getState().records;
            expect(records.length).toBe(1);
            expect(records[0].work_name).toBe("테스트 작업");
        });

        it("존재하지 않는 템플릿 ID는 null을 반환한다", async () => {
            const { result } = renderHook(() => useRecordCreation());

            let created_record: unknown;
            await act(async () => {
                created_record =
                    result.current.createFromTemplate("invalid-id");
            });

            expect(created_record).toBe(null);
            expect(useWorkStore.getState().records.length).toBe(0);
        });

        it("use_postfix=false일 때 순차 번호를 사용한다", async () => {
            // 기존 레코드 추가
            useWorkStore.setState({
                records: [
                    createMockRecord({
                        work_name: "테스트 작업",
                        deal_name: "거래",
                        is_deleted: false,
                        is_completed: false,
                    }),
                ],
            });

            const { result } = renderHook(() => useRecordCreation());

            await act(async () => {
                result.current.createFromTemplate("template-1");
            });

            const records = useWorkStore.getState().records;
            expect(records[1].deal_name).toBe("거래 (2)");
        });

        it("use_postfix=true일 때 타임스탬프를 붙인다", async () => {
            useWorkStore.setState({
                use_postfix_on_preset_add: true,
            });

            const { result } = renderHook(() => useRecordCreation());

            await act(async () => {
                result.current.createFromTemplate("template-1");
            });

            const records = useWorkStore.getState().records;
            // 거래_MMdd_HHmmss_xxx 형식
            expect(records[0].deal_name).toMatch(/^거래_\d{4}_\d{6}_\d{3}$/);
        });

        it("선택된 날짜로 레코드를 생성한다", async () => {
            useWorkStore.setState({
                selected_date: "2026-05-15",
            });

            const { result } = renderHook(() => useRecordCreation());

            await act(async () => {
                result.current.createFromTemplate("template-1");
            });

            const records = useWorkStore.getState().records;
            expect(records[0].date).toBe("2026-05-15");
        });
    });

    describe("createEmpty", () => {
        it("빈 레코드를 생성한다", async () => {
            const { result } = renderHook(() => useRecordCreation());

            await act(async () => {
                result.current.createEmpty();
            });

            const records = useWorkStore.getState().records;
            expect(records.length).toBe(1);
            expect(records[0].work_name).toBe("");
            expect(records[0].deal_name).toBe("");
        });

        it("선택된 날짜로 빈 레코드를 생성한다", async () => {
            useWorkStore.setState({
                selected_date: "2026-12-25",
            });

            const { result } = renderHook(() => useRecordCreation());

            await act(async () => {
                result.current.createEmpty();
            });

            const records = useWorkStore.getState().records;
            expect(records[0].date).toBe("2026-12-25");
        });

        it("생성된 레코드를 반환한다", async () => {
            const { result } = renderHook(() => useRecordCreation());

            let created_record: unknown;
            await act(async () => {
                created_record = result.current.createEmpty();
            });

            expect(created_record).not.toBe(null);
            expect((created_record as { id: string }).id).toBeDefined();
        });
    });
});
