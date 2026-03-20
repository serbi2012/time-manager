import { vi } from "vitest";
import {
    createWorkSession,
    findExistingRecordWithMerge,
} from "@/store/lib/timer_helpers";
import type { WorkRecord } from "@/shared/types";

vi.mock("@/firebase/syncService", () => ({
    syncRecord: vi.fn().mockResolvedValue(undefined),
    syncSettings: vi.fn().mockResolvedValue(undefined),
    syncDeleteRecord: vi.fn().mockResolvedValue(undefined),
}));

const CUSTOM_LUNCH = { start: 720, end: 780, duration: 60 };

const make_record = (overrides: Partial<WorkRecord> = {}): WorkRecord => ({
    id: crypto.randomUUID(),
    work_name: "작업",
    deal_name: "거래",
    task_name: "",
    category_name: "",
    project_code: "P001",
    note: "",
    date: "2026-01-20",
    start_time: "09:00",
    end_time: "18:00",
    duration_minutes: 60,
    sessions: [],
    is_completed: false,
    ...overrides,
});

describe("createWorkSession", () => {
    it("시작·종료 시각에 맞춰 날짜와 시간 문자열을 만든다", () => {
        const start_ts = new Date(2026, 0, 20, 9, 15, 0, 0).getTime();
        const end_ts = new Date(2026, 0, 20, 10, 45, 0, 0).getTime();

        const session = createWorkSession(start_ts, end_ts);

        expect(session.id).toBe("test-uuid-1");
        expect(session.date).toBe("2026-01-20");
        expect(session.start_time).toBe("09:15");
        expect(session.end_time).toBe("10:45");
    });

    it("점심과 겹치지 않으면 시작~종료 분 단위 차이를 duration으로 쓴다", () => {
        const start_ts = new Date(2026, 0, 20, 9, 0, 0, 0).getTime();
        const end_ts = new Date(2026, 0, 20, 10, 0, 0, 0).getTime();

        const session = createWorkSession(start_ts, end_ts);

        expect(session.duration_minutes).toBe(60);
    });

    it("커스텀 점심 구간을 빼서 duration을 계산한다", () => {
        const start_ts = new Date(2026, 0, 20, 11, 0, 0, 0).getTime();
        const end_ts = new Date(2026, 0, 20, 14, 0, 0, 0).getTime();

        const session = createWorkSession(start_ts, end_ts, CUSTOM_LUNCH);

        expect(session.duration_minutes).toBe(120);
    });

    it("계산 결과가 0 이하이면 duration은 최소 1분이다", () => {
        const same_ts = new Date(2026, 0, 20, 12, 0, 0, 0).getTime();
        const session_same = createWorkSession(same_ts, same_ts);
        expect(session_same.duration_minutes).toBe(1);

        const start_ts = new Date(2026, 0, 20, 14, 0, 0, 0).getTime();
        const end_ts = new Date(2026, 0, 20, 9, 0, 0, 0).getTime();
        const session_reverse = createWorkSession(start_ts, end_ts);
        expect(session_reverse.duration_minutes).toBe(1);
    });

    it("날짜는 YYYY-MM-DD 형식이다", () => {
        const start_ts = new Date(2026, 11, 3, 10, 0, 0, 0).getTime();
        const end_ts = new Date(2026, 11, 3, 11, 0, 0, 0).getTime();

        const session = createWorkSession(start_ts, end_ts);

        expect(session.date).toBe("2026-12-03");
    });

    it("시간은 HH:mm이고 한 자리 시·분은 0으로 패딩한다", () => {
        const start_ts = new Date(2026, 5, 8, 7, 5, 0, 0).getTime();
        const end_ts = new Date(2026, 5, 8, 9, 9, 0, 0).getTime();

        const session = createWorkSession(start_ts, end_ts);

        expect(session.start_time).toBe("07:05");
        expect(session.end_time).toBe("09:09");
    });

    it("시간이 여러 시간에 걸치면 그만큼 분으로 합산한다", () => {
        const start_ts = new Date(2026, 0, 20, 9, 0, 0, 0).getTime();
        const end_ts = new Date(2026, 0, 20, 11, 30, 0, 0).getTime();

        const session = createWorkSession(start_ts, end_ts);

        expect(session.duration_minutes).toBe(150);
    });

    it("월·일이 한 자리여도 날짜 문자열에 0 패딩한다", () => {
        const start_ts = new Date(2026, 2, 5, 10, 0, 0, 0).getTime();
        const end_ts = new Date(2026, 2, 5, 11, 0, 0, 0).getTime();

        const session = createWorkSession(start_ts, end_ts);

        expect(session.date).toBe("2026-03-05");
    });
});

describe("findExistingRecordWithMerge", () => {
    it("맞는 레코드가 없으면 undefined를 반환한다", () => {
        const records = [
            make_record({
                id: "a",
                work_name: "다른작업",
                deal_name: "거래",
            }),
        ];
        const set_fn = vi.fn();

        const result = findExistingRecordWithMerge(
            records,
            "2026-01-20",
            "작업",
            "거래",
            set_fn
        );

        expect(result).toBeUndefined();
        expect(set_fn).not.toHaveBeenCalled();
    });

    it("미완료 매칭이 하나면 그 레코드를 반환한다", () => {
        const target = make_record({
            id: "only",
            work_name: "작업",
            deal_name: "거래",
            is_completed: false,
            date: "2026-01-19",
        });
        const records = [target];
        const set_fn = vi.fn();

        const result = findExistingRecordWithMerge(
            records,
            "2026-01-20",
            "작업",
            "거래",
            set_fn
        );

        expect(result?.id).toBe("only");
        expect(set_fn).not.toHaveBeenCalled();
    });

    it("미완료 매칭이 둘 이상이면 병합하고 set을 호출한 뒤 base 레코드를 반환한다", () => {
        const log_spy = vi.spyOn(console, "log").mockImplementation(() => {});
        const older = make_record({
            id: "older",
            date: "2026-01-18",
            work_name: "작업",
            deal_name: "거래",
            is_completed: false,
        });
        const newer = make_record({
            id: "newer",
            date: "2026-01-20",
            work_name: "작업",
            deal_name: "거래",
            is_completed: false,
        });
        const records = [newer, older];
        const set_fn = vi.fn();

        const result = findExistingRecordWithMerge(
            records,
            "2026-01-20",
            "작업",
            "거래",
            set_fn
        );

        expect(set_fn).toHaveBeenCalledTimes(1);
        expect(typeof set_fn.mock.calls[0][0]).toBe("function");
        expect(result?.id).toBe("older");
        log_spy.mockRestore();
    });

    it("미완료가 없고 같은 날짜·작업·거래가 있으면 해당 레코드를 반환한다", () => {
        const done = make_record({
            id: "done-day",
            date: "2026-01-20",
            work_name: "작업",
            deal_name: "거래",
            is_completed: true,
        });
        const records = [done];
        const set_fn = vi.fn();

        const result = findExistingRecordWithMerge(
            records,
            "2026-01-20",
            "작업",
            "거래",
            set_fn
        );

        expect(result?.id).toBe("done-day");
        expect(set_fn).not.toHaveBeenCalled();
    });

    it("삭제된 레코드는 매칭에서 제외한다", () => {
        const deleted = make_record({
            id: "del",
            work_name: "작업",
            deal_name: "거래",
            date: "2026-01-20",
            is_deleted: true,
            is_completed: false,
        });
        const records = [deleted];
        const set_fn = vi.fn();

        const result = findExistingRecordWithMerge(
            records,
            "2026-01-20",
            "작업",
            "거래",
            set_fn
        );

        expect(result).toBeUndefined();
    });

    it("완료된 레코드는 미완료 후보에 넣지 않고 다른 날짜면 undefined다", () => {
        const completed = make_record({
            id: "c",
            work_name: "작업",
            deal_name: "거래",
            date: "2026-01-19",
            is_completed: true,
        });
        const records = [completed];
        const set_fn = vi.fn();

        const result = findExistingRecordWithMerge(
            records,
            "2026-01-20",
            "작업",
            "거래",
            set_fn
        );

        expect(result).toBeUndefined();
        expect(set_fn).not.toHaveBeenCalled();
    });

    it("완료 레코드만 있어도 같은 날짜면 두 번째 조회로 반환한다", () => {
        const completed = make_record({
            id: "c2",
            work_name: "작업",
            deal_name: "거래",
            date: "2026-01-20",
            is_completed: true,
        });
        const records = [completed];
        const set_fn = vi.fn();

        const result = findExistingRecordWithMerge(
            records,
            "2026-01-20",
            "작업",
            "거래",
            set_fn
        );

        expect(result?.id).toBe("c2");
    });
});
