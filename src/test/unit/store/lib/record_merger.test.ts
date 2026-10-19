import {
    findExistingRecord,
    mergeRecords,
} from "@/store/lib/record_merger";
import { ERROR_MESSAGES } from "@/shared/constants";
import type { WorkRecord, WorkSession } from "@/shared/types/domain";

function make_record(partial: Partial<WorkRecord> & Pick<WorkRecord, "id">): WorkRecord {
    return {
        project_code: "PRJ",
        work_name: "작업",
        task_name: "개발",
        deal_name: "거래",
        category_name: "개발",
        note: "",
        date: "2024-01-10",
        duration_minutes: 60,
        start_time: "09:00",
        end_time: "10:00",
        sessions: [
            {
                id: "default-s",
                date: "2024-01-10",
                start_time: "09:00",
                end_time: "10:00",
                duration_minutes: 60,
            },
        ],
        is_completed: false,
        ...partial,
    };
}

describe("findExistingRecord", () => {
    it("미완료 레코드가 있으면 날짜와 무관하게 먼저 반환한다", () => {
        const incomplete_other_day = make_record({
            id: "inc",
            date: "2024-01-20",
            is_completed: false,
        });
        const same_day_completed = make_record({
            id: "done",
            date: "2024-01-10",
            is_completed: true,
        });
        const records = [same_day_completed, incomplete_other_day];

        const found = findExistingRecord(
            records,
            "2024-01-10",
            "작업",
            "거래"
        );

        expect(found?.id).toBe("inc");
    });

    it("미완료가 없으면 같은 날짜·작업·거래 레코드를 반환한다", () => {
        const completed = make_record({
            id: "c1",
            is_completed: true,
            date: "2024-01-10",
        });
        const target = make_record({
            id: "t1",
            is_completed: true,
            date: "2024-01-10",
        });
        const records = [completed, target];

        const found = findExistingRecord(
            records,
            "2024-01-10",
            "작업",
            "거래"
        );

        expect(found?.id).toBe("c1");
    });

    it("조건에 맞는 레코드가 없으면 undefined를 반환한다", () => {
        const records = [
            make_record({ id: "a", work_name: "다른작업" }),
        ];

        const found = findExistingRecord(
            records,
            "2024-01-10",
            "작업",
            "거래"
        );

        expect(found).toBeUndefined();
    });

    it("삭제된 레코드는 미완료·날짜 매칭 모두에서 제외한다", () => {
        const deleted_incomplete = make_record({
            id: "d1",
            is_deleted: true,
            is_completed: false,
        });
        const deleted_same_day = make_record({
            id: "d2",
            date: "2024-01-10",
            is_deleted: true,
            is_completed: true,
        });
        const records = [deleted_incomplete, deleted_same_day];

        const found = findExistingRecord(
            records,
            "2024-01-10",
            "작업",
            "거래"
        );

        expect(found).toBeUndefined();
    });

    it("완료된 레코드는 미완료 우선 탐색에서 제외된다", () => {
        const only_completed = make_record({
            id: "only-done",
            is_completed: true,
            date: "2024-01-10",
        });
        const records = [only_completed];

        const found = findExistingRecord(
            records,
            "2024-01-10",
            "작업",
            "거래"
        );

        expect(found?.id).toBe("only-done");
    });

    it("미완료가 여러 개면 배열 앞쪽 것을 반환한다", () => {
        const first = make_record({ id: "first", is_completed: false });
        const second = make_record({ id: "second", is_completed: false });
        const records = [first, second];

        const found = findExistingRecord(
            records,
            "2024-01-10",
            "작업",
            "거래"
        );

        expect(found?.id).toBe("first");
    });
});

describe("mergeRecords", () => {
    it("빈 배열이면 병합 불가 에러를 던진다", () => {
        expect(() => mergeRecords([])).toThrow(ERROR_MESSAGES.noRecordsToMerge);
    });

    it("레코드가 하나면 그대로 반환하고 deleted_ids는 비어 있다", () => {
        const single = make_record({ id: "solo" });

        const result = mergeRecords([single]);

        expect(result.base_record).toBe(single);
        expect(result.deleted_ids).toEqual([]);
    });

    it("두 레코드를 날짜·시작시간 순으로 합치고 이른 쪽을 베이스로 삼는다", () => {
        const later = make_record({
            id: "late",
            date: "2024-01-15",
            start_time: "10:00",
            end_time: "11:00",
            sessions: [
                {
                    id: "s-late",
                    date: "2024-01-15",
                    start_time: "10:00",
                    end_time: "11:00",
                    duration_minutes: 60,
                },
            ],
            duration_minutes: 60,
        });
        const earlier = make_record({
            id: "early",
            date: "2024-01-10",
            start_time: "09:00",
            end_time: "10:00",
            sessions: [
                {
                    id: "s-early",
                    date: "2024-01-10",
                    start_time: "09:00",
                    end_time: "10:00",
                    duration_minutes: 60,
                },
            ],
            duration_minutes: 60,
        });

        const result = mergeRecords([later, earlier]);

        expect(result.base_record.id).toBe("early");
        expect(result.deleted_ids).toEqual(["late"]);
        expect(result.base_record.sessions.map((s) => s.id)).toEqual([
            "s-early",
            "s-late",
        ]);
        expect(result.base_record.duration_minutes).toBe(120);
        expect(result.base_record.start_time).toBe("09:00");
        expect(result.base_record.end_time).toBe("11:00");
        expect(result.base_record.date).toBe("2024-01-10");
    });

    it("같은 날짜면 시작 시간이 이른 레코드가 베이스가 된다", () => {
        const second = make_record({
            id: "b",
            date: "2024-01-10",
            start_time: "14:00",
            end_time: "15:00",
            sessions: [
                {
                    id: "s-pm",
                    date: "2024-01-10",
                    start_time: "14:00",
                    end_time: "15:00",
                    duration_minutes: 60,
                },
            ],
            duration_minutes: 60,
        });
        const first = make_record({
            id: "a",
            date: "2024-01-10",
            start_time: "09:00",
            end_time: "10:00",
            sessions: [
                {
                    id: "s-am",
                    date: "2024-01-10",
                    start_time: "09:00",
                    end_time: "10:00",
                    duration_minutes: 60,
                },
            ],
            duration_minutes: 60,
        });

        const result = mergeRecords([second, first]);

        expect(result.base_record.id).toBe("a");
        expect(result.deleted_ids).toEqual(["b"]);
    });

    it("동일 세션 ID는 한 번만 포함한다", () => {
        const shared_session: WorkSession = {
            id: "shared",
            date: "2024-01-10",
            start_time: "09:00",
            end_time: "10:00",
            duration_minutes: 60,
        };
        const r1 = make_record({
            id: "r1",
            sessions: [shared_session],
            duration_minutes: 60,
        });
        const r2 = make_record({
            id: "r2",
            date: "2024-01-11",
            sessions: [shared_session],
            duration_minutes: 60,
        });

        const result = mergeRecords([r1, r2]);

        const shared_count = result.base_record.sessions.filter(
            (s) => s.id === "shared"
        ).length;
        expect(shared_count).toBe(1);
    });

    it("세션을 날짜 후 시작 시간 순으로 정렬한다", () => {
        const r1 = make_record({
            id: "r1",
            date: "2024-01-12",
            sessions: [
                {
                    id: "s-late-day",
                    date: "2024-01-12",
                    start_time: "15:00",
                    end_time: "16:00",
                    duration_minutes: 60,
                },
            ],
            duration_minutes: 60,
        });
        const r2 = make_record({
            id: "r2",
            date: "2024-01-11",
            sessions: [
                {
                    id: "s-early-day",
                    date: "2024-01-11",
                    start_time: "18:00",
                    end_time: "19:00",
                    duration_minutes: 60,
                },
            ],
            duration_minutes: 60,
        });

        const result = mergeRecords([r1, r2]);

        expect(result.base_record.sessions.map((s) => s.id)).toEqual([
            "s-early-day",
            "s-late-day",
        ]);
    });

    it("세션 분 합이 0이면 duration_minutes는 최소 1로 만든다", () => {
        const zero_min: WorkSession = {
            id: "z",
            date: "2024-01-10",
            start_time: "09:00",
            end_time: "09:00",
            duration_minutes: 0,
        };
        const r1 = make_record({
            id: "a",
            sessions: [zero_min],
            duration_minutes: 0,
        });
        const r2 = make_record({
            id: "b",
            date: "2024-01-11",
            sessions: [
                {
                    id: "z2",
                    date: "2024-01-11",
                    start_time: "10:00",
                    end_time: "10:00",
                    duration_minutes: 0,
                },
            ],
            duration_minutes: 0,
        });

        const result = mergeRecords([r1, r2]);

        expect(result.base_record.duration_minutes).toBe(1);
    });

    it("세션이 비어 있으면 첫·끝 시간은 베이스 레코드 값을 유지한다", () => {
        const r1 = make_record({
            id: "a",
            date: "2024-01-10",
            start_time: "08:00",
            end_time: "09:00",
            sessions: [],
            duration_minutes: 0,
        });
        const r2 = make_record({
            id: "b",
            date: "2024-01-11",
            start_time: "10:00",
            end_time: "11:00",
            sessions: [],
            duration_minutes: 0,
        });

        const result = mergeRecords([r1, r2]);

        expect(result.base_record.sessions).toEqual([]);
        expect(result.base_record.start_time).toBe("08:00");
        expect(result.base_record.end_time).toBe("09:00");
        expect(result.base_record.duration_minutes).toBe(1);
    });
});
