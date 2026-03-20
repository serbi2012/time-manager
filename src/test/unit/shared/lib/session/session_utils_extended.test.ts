import {
    findSessionById,
    filterSessionsByDate,
    getSessionMinutes,
    getSessionTimeRange,
    isRunningSession,
    sortSessionsByTime,
    type SessionLike,
} from "@/shared/lib/session/session_utils";

describe("sortSessionsByTime", () => {
    it("서로 다른 date는 문자열 비교 순으로 정렬된다", () => {
        const sessions: SessionLike[] = [
            { id: "b", date: "2024-01-02", start_time: "09:00", end_time: "10:00" },
            { id: "a", date: "2024-01-01", start_time: "14:00", end_time: "15:00" },
        ];

        const sorted = sortSessionsByTime(sessions);

        expect(sorted.map((s) => s.id)).toEqual(["a", "b"]);
    });

    it("같은 date면 start_time 순으로 정렬된다", () => {
        const sessions: SessionLike[] = [
            { id: "late", date: "2024-01-01", start_time: "11:00", end_time: "12:00" },
            { id: "early", date: "2024-01-01", start_time: "09:00", end_time: "10:00" },
        ];

        const sorted = sortSessionsByTime(sessions);

        expect(sorted.map((s) => s.id)).toEqual(["early", "late"]);
    });

    it("date가 없는 세션은 record_date를 날짜 키로 사용한다", () => {
        const sessions: SessionLike[] = [
            { id: "no_date_late", start_time: "11:00", end_time: "12:00" },
            { id: "dated", date: "2024-01-01", start_time: "09:00", end_time: "10:00" },
        ];

        const sorted_with_record = sortSessionsByTime(sessions, "2024-01-02");

        expect(sorted_with_record[0]?.id).toBe("dated");
        expect(sorted_with_record[1]?.id).toBe("no_date_late");

        const both_no_date: SessionLike[] = [
            { id: "second", start_time: "10:00", end_time: "11:00" },
            { id: "first", start_time: "09:00", end_time: "10:00" },
        ];

        const sorted_same_record_day = sortSessionsByTime(both_no_date, "2024-01-01");

        expect(sorted_same_record_day.map((s) => s.id)).toEqual(["first", "second"]);
    });

    it("빈 배열이면 빈 배열을 반환한다", () => {
        const sessions: SessionLike[] = [];

        const sorted = sortSessionsByTime(sessions);

        expect(sorted).toEqual([]);
    });

    it("원본 배열을 변경하지 않는다", () => {
        const sessions: SessionLike[] = [
            { id: "b", start_time: "11:00", end_time: "12:00" },
            { id: "a", start_time: "09:00", end_time: "10:00" },
        ];
        const snapshot = sessions.map((s) => ({ ...s }));

        const sorted = sortSessionsByTime(sessions, "2024-01-01");

        expect(sorted).not.toBe(sessions);
        expect(sessions).toEqual(snapshot);
    });
});

describe("filterSessionsByDate", () => {
    it("session.date가 target_date와 일치하는 항목만 남긴다", () => {
        const sessions: SessionLike[] = [
            { id: "keep", date: "2024-01-01", start_time: "09:00", end_time: "10:00" },
            { id: "drop", date: "2024-01-02", start_time: "09:00", end_time: "10:00" },
        ];

        const filtered = filterSessionsByDate(sessions, "2024-01-01");

        expect(filtered.map((s) => s.id)).toEqual(["keep"]);
    });

    it("date가 없으면 record_date와 target_date를 비교한다", () => {
        const sessions: SessionLike[] = [
            { id: "match", start_time: "09:00", end_time: "10:00" },
            { id: "also_match", start_time: "10:00", end_time: "11:00" },
        ];

        const filtered = filterSessionsByDate(sessions, "2024-01-01", "2024-01-01");

        expect(filtered).toHaveLength(2);

        const filtered_miss = filterSessionsByDate(sessions, "2024-01-02", "2024-01-01");

        expect(filtered_miss).toHaveLength(0);
    });

    it("혼합된 date와 record_date fallback이 올바르게 동작한다", () => {
        const sessions: SessionLike[] = [
            { id: "explicit", date: "2024-01-02", start_time: "09:00", end_time: "10:00" },
            { id: "implicit", start_time: "10:00", end_time: "11:00" },
        ];

        const filtered = filterSessionsByDate(sessions, "2024-01-02", "2024-01-02");

        expect(filtered.map((s) => s.id).sort()).toEqual(["explicit", "implicit"]);
    });
});

describe("getSessionTimeRange", () => {
    it("빈 배열이면 first_start와 last_end가 빈 문자열이다", () => {
        const range = getSessionTimeRange([]);

        expect(range).toEqual({ first_start: "", last_end: "" });
    });

    it("세션이 하나면 그 세션의 시작·종료 시간을 반환한다", () => {
        const sessions: SessionLike[] = [
            { id: "only", date: "2024-01-01", start_time: "09:30", end_time: "10:45" },
        ];

        const range = getSessionTimeRange(sessions);

        expect(range).toEqual({ first_start: "09:30", last_end: "10:45" });
    });

    it("여러 세션이면 정렬 후 첫 시작과 마지막 종료를 반환한다", () => {
        const sessions: SessionLike[] = [
            { id: "later_day", date: "2024-01-02", start_time: "09:00", end_time: "10:00" },
            { id: "earlier_day", date: "2024-01-01", start_time: "14:00", end_time: "16:00" },
        ];

        const range = getSessionTimeRange(sessions);

        expect(range).toEqual({ first_start: "14:00", last_end: "10:00" });
    });

    it("같은 날 여러 세션에서 시간 순 첫·끝을 반환한다", () => {
        const sessions: SessionLike[] = [
            { id: "mid", date: "2024-01-01", start_time: "11:00", end_time: "12:00" },
            { id: "first", date: "2024-01-01", start_time: "09:00", end_time: "10:00" },
        ];

        const range = getSessionTimeRange(sessions);

        expect(range).toEqual({ first_start: "09:00", last_end: "12:00" });
    });
});

describe("isRunningSession", () => {
    it("end_time이 빈 문자열이면 true이다", () => {
        const session: SessionLike = {
            id: "run",
            start_time: "09:00",
            end_time: "",
        };

        expect(isRunningSession(session)).toBe(true);
    });

    it("end_time이 시각 문자열이면 false이다", () => {
        const session: SessionLike = {
            id: "done",
            start_time: "09:00",
            end_time: "09:00",
        };

        expect(isRunningSession(session)).toBe(false);
    });
});

describe("findSessionById", () => {
    it("일치하는 id가 있으면 해당 세션을 반환한다", () => {
        const target: SessionLike = {
            id: "find-me",
            start_time: "09:00",
            end_time: "10:00",
        };
        const sessions: SessionLike[] = [
            { id: "other", start_time: "08:00", end_time: "09:00" },
            target,
        ];

        const found = findSessionById(sessions, "find-me");

        expect(found).toBe(target);
    });

    it("일치하는 id가 없으면 undefined이다", () => {
        const sessions: SessionLike[] = [
            { id: "a", start_time: "09:00", end_time: "10:00" },
        ];

        const found = findSessionById(sessions, "missing");

        expect(found).toBeUndefined();
    });
});

describe("getSessionMinutes (레거시 duration_seconds)", () => {
    it("duration_seconds가 있으면 분으로 올림한다", () => {
        const session = {
            id: "legacy",
            start_time: "09:00",
            end_time: "18:00",
            duration_seconds: 125,
        } as SessionLike;

        const minutes = getSessionMinutes(session);

        expect(minutes).toBe(3);
    });

    it("duration_seconds만으로 정확히 나누어떨어지는 분을 반환한다", () => {
        const session = {
            id: "legacy-even",
            start_time: "09:00",
            end_time: "18:00",
            duration_seconds: 120,
        } as SessionLike;

        expect(getSessionMinutes(session)).toBe(2);
    });
});
