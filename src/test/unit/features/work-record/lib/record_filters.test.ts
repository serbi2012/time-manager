import { describe, it, expect } from "vitest";
import { filterDisplayableRecords } from "../../../../../features/work-record/lib/record_filters";
import type { WorkRecord } from "../../../../../shared/types";

const SELECTED_DATE = "2026-09-08";

function createTestRecord(overrides: Partial<WorkRecord> = {}): WorkRecord {
    return {
        id: "test-id",
        work_name: "테스트 작업",
        deal_name: "",
        task_name: "",
        category_name: "개발",
        project_code: "A25_01846",
        date: SELECTED_DATE,
        start_time: "09:00",
        end_time: "10:00",
        duration_minutes: 60,
        note: "",
        is_completed: false,
        sessions: [
            {
                id: "s1",
                date: SELECTED_DATE,
                start_time: "09:00",
                end_time: "10:00",
                duration_minutes: 60,
            },
        ],
        ...overrides,
    };
}

describe("filterDisplayableRecords", () => {
    it("삭제된 레코드는 제외한다", () => {
        const records = [createTestRecord({ is_deleted: true })];

        expect(filterDisplayableRecords(records, SELECTED_DATE)).toHaveLength(0);
    });

    it("선택된 날짜의 미완료 레코드를 표시한다", () => {
        const records = [createTestRecord()];

        expect(filterDisplayableRecords(records, SELECTED_DATE)).toHaveLength(1);
    });

    it("과거 날짜의 미완료 레코드를 표시한다", () => {
        const records = [
            createTestRecord({ date: "2026-09-01", sessions: [] }),
        ];

        expect(filterDisplayableRecords(records, SELECTED_DATE)).toHaveLength(1);
    });

    it("레코드 날짜가 미래여도 선택된 날짜에 세션이 있으면 표시한다", () => {
        const records = [
            createTestRecord({
                date: "2026-09-09",
                sessions: [
                    {
                        id: "s1",
                        date: SELECTED_DATE,
                        start_time: "09:00",
                        end_time: "09:20",
                        duration_minutes: 20,
                    },
                    {
                        id: "s2",
                        date: "2026-09-09",
                        start_time: "10:00",
                        end_time: "10:30",
                        duration_minutes: 30,
                    },
                ],
            }),
        ];

        expect(filterDisplayableRecords(records, SELECTED_DATE)).toHaveLength(1);
    });

    it("레코드 날짜가 미래이고 선택된 날짜에 세션도 없으면 제외한다", () => {
        const records = [
            createTestRecord({
                date: "2026-09-09",
                sessions: [
                    {
                        id: "s1",
                        date: "2026-09-09",
                        start_time: "10:00",
                        end_time: "10:30",
                        duration_minutes: 30,
                    },
                ],
            }),
        ];

        expect(filterDisplayableRecords(records, SELECTED_DATE)).toHaveLength(0);
    });

    it("완료된 레코드는 선택된 날짜에 세션이 있을 때만 표시한다", () => {
        const with_session = createTestRecord({
            id: "a",
            is_completed: true,
        });
        const without_session = createTestRecord({
            id: "b",
            is_completed: true,
            date: "2026-09-01",
            sessions: [
                {
                    id: "s1",
                    date: "2026-09-01",
                    start_time: "09:00",
                    end_time: "10:00",
                    duration_minutes: 60,
                },
            ],
        });

        const result = filterDisplayableRecords(
            [with_session, without_session],
            SELECTED_DATE
        );

        expect(result).toHaveLength(1);
        expect(result[0].id).toBe("a");
    });

    it("세션 date가 비어 있으면 레코드 날짜를 기준으로 판단한다", () => {
        const records = [
            createTestRecord({
                is_completed: true,
                sessions: [
                    {
                        id: "s1",
                        date: "",
                        start_time: "09:00",
                        end_time: "10:00",
                        duration_minutes: 60,
                    },
                ],
            }),
        ];

        expect(filterDisplayableRecords(records, SELECTED_DATE)).toHaveLength(1);
    });
});
