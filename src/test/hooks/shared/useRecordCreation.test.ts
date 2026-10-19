/**
 * useRecordCreation 훅 테스트
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useRecordCreation } from "@/shared/hooks/useRecordCreation";
import { useWorkStore } from "@/store/useWorkStore";
import { createMockTemplate } from "@/test/helpers/mock_factory";

vi.mock("@/shared/lib/message", () => ({
    message: {
        success: vi.fn(),
        error: vi.fn(),
    },
}));

const TIMESTAMP_POSTFIX_PATTERN = /^거래_\d{4}_\d{6}_\d{3}$/;

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

        it("use_postfix_on_preset_add 설정이 deal_name 생성 방식에 반영된다", async () => {
            const createDealName = async (use_postfix: boolean) => {
                useWorkStore.setState({
                    records: [],
                    use_postfix_on_preset_add: use_postfix,
                });
                const { result } = renderHook(() => useRecordCreation());
                await act(async () => {
                    result.current.createFromTemplate("template-1");
                });
                return useWorkStore.getState().records[0].deal_name;
            };

            expect(await createDealName(false)).toBe("거래");
            expect(await createDealName(true)).toMatch(
                TIMESTAMP_POSTFIX_PATTERN
            );
        });
    });

    describe("createEmpty", () => {
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
