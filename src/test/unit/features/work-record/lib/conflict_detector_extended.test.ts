import {
    addRunningTimerSlot,
    checkAndAdjustTimeRange,
    collectTimeSlots,
    formatConflictInfo,
    type TimeSlot,
} from "@/features/work-record/lib/conflict_detector";
import type { TimerState, WorkRecord } from "@/shared/types";

function time_slot(overrides: Partial<TimeSlot> = {}): TimeSlot {
    return {
        start: 540,
        end: 600,
        record_id: "r1",
        session_id: "s1",
        work_name: "작업",
        deal_name: "거래",
        ...overrides,
    };
}

function base_record(overrides: Partial<WorkRecord> = {}): WorkRecord {
    return {
        id: "rec-1",
        project_code: "P1",
        work_name: "작업",
        task_name: "태스크",
        deal_name: "거래",
        category_name: "카테고리",
        duration_minutes: 60,
        note: "",
        start_time: "09:00",
        end_time: "10:00",
        date: "2026-03-20",
        sessions: [],
        is_completed: false,
        ...overrides,
    };
}

describe("collectTimeSlots", () => {
    it("대상 날짜 세션만 수집하고 시작 순으로 정렬한다", () => {
        const records: WorkRecord[] = [
            base_record({
                id: "a",
                sessions: [
                    {
                        id: "s2",
                        date: "2026-03-20",
                        start_time: "11:00",
                        end_time: "12:00",
                        duration_minutes: 60,
                    },
                    {
                        id: "s1",
                        date: "2026-03-20",
                        start_time: "09:00",
                        end_time: "10:00",
                        duration_minutes: 60,
                    },
                ],
            }),
        ];

        const slots = collectTimeSlots(records, "2026-03-20");

        expect(slots.map((s) => s.session_id)).toEqual(["s1", "s2"]);
    });

    it("session.date가 없으면 record.date로 판별한다", () => {
        const records: WorkRecord[] = [
            base_record({
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

        const slots = collectTimeSlots(records, "2026-03-20");

        expect(slots).toHaveLength(1);
        expect(slots[0].start).toBe(540);
    });

    it("다른 날짜 세션은 제외한다", () => {
        const records: WorkRecord[] = [
            base_record({
                sessions: [
                    {
                        id: "s1",
                        date: "2026-03-21",
                        start_time: "09:00",
                        end_time: "10:00",
                        duration_minutes: 60,
                    },
                ],
            }),
        ];

        expect(collectTimeSlots(records, "2026-03-20")).toHaveLength(0);
    });

    it("exclude_session_id와 일치하는 세션은 제외한다", () => {
        const records: WorkRecord[] = [
            base_record({
                sessions: [
                    {
                        id: "keep",
                        date: "2026-03-20",
                        start_time: "09:00",
                        end_time: "10:00",
                        duration_minutes: 60,
                    },
                    {
                        id: "skip",
                        date: "2026-03-20",
                        start_time: "10:00",
                        end_time: "11:00",
                        duration_minutes: 60,
                    },
                ],
            }),
        ];

        const slots = collectTimeSlots(records, "2026-03-20", "skip");

        expect(slots).toHaveLength(1);
        expect(slots[0].session_id).toBe("keep");
    });

    it("시작 또는 종료 시간이 비어 있으면 제외한다", () => {
        const records: WorkRecord[] = [
            base_record({
                sessions: [
                    {
                        id: "a",
                        date: "2026-03-20",
                        start_time: "",
                        end_time: "10:00",
                        duration_minutes: 0,
                    },
                    {
                        id: "b",
                        date: "2026-03-20",
                        start_time: "09:00",
                        end_time: "",
                        duration_minutes: 0,
                    },
                ],
            }),
        ];

        expect(collectTimeSlots(records, "2026-03-20")).toHaveLength(0);
    });

    it("삭제된 레코드는 무시한다", () => {
        const records: WorkRecord[] = [
            base_record({
                is_deleted: true,
                sessions: [
                    {
                        id: "s1",
                        date: "2026-03-20",
                        start_time: "09:00",
                        end_time: "10:00",
                        duration_minutes: 60,
                    },
                ],
            }),
        ];

        expect(collectTimeSlots(records, "2026-03-20")).toHaveLength(0);
    });

    it("sessions가 없으면 빈 배열이다", () => {
        const records: WorkRecord[] = [base_record({ sessions: [] })];

        expect(collectTimeSlots(records, "2026-03-20")).toEqual([]);
    });

    it("sessions 필드가 없으면 빈 배열로 처리한다", () => {
        const { sessions: _omit, ...rest } = base_record();
        const records: WorkRecord[] = [
            { ...rest, sessions: undefined } as unknown as WorkRecord,
        ];

        expect(collectTimeSlots(records, "2026-03-20")).toEqual([]);
    });
});

describe("addRunningTimerSlot", () => {
    afterEach(() => {
        vi.useRealTimers();
    });

    it("실행 중이 아니면 원본 슬롯을 그대로 반환한다", () => {
        const slots: TimeSlot[] = [time_slot()];
        const timer: TimerState = {
            is_running: false,
            start_time: Date.now(),
            active_template_id: null,
            active_form_data: {
                project_code: "",
                work_name: "W",
                task_name: "",
                deal_name: "",
                category_name: "",
                note: "",
            },
            active_record_id: null,
            active_session_id: null,
        };

        const result = addRunningTimerSlot(slots, timer, "2026-03-20");

        expect(result).toBe(slots);
    });

    it("start_time이 없으면 원본을 반환한다", () => {
        const slots: TimeSlot[] = [];
        const timer: TimerState = {
            is_running: true,
            start_time: null,
            active_template_id: null,
            active_form_data: {
                project_code: "",
                work_name: "W",
                task_name: "",
                deal_name: "",
                category_name: "",
                note: "",
            },
            active_record_id: null,
            active_session_id: null,
        };

        expect(addRunningTimerSlot(slots, timer, "2026-03-20")).toBe(slots);
    });

    it("active_form_data가 없으면 원본을 반환한다", () => {
        const slots: TimeSlot[] = [];
        const timer: TimerState = {
            is_running: true,
            start_time: Date.now(),
            active_template_id: null,
            active_form_data: null,
            active_record_id: null,
            active_session_id: null,
        };

        expect(addRunningTimerSlot(slots, timer, "2026-03-20")).toBe(slots);
    });

    it("타이머 날짜가 target_date와 다르면 원본을 반환한다", () => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date("2026-03-20T10:00:00"));
        const slots: TimeSlot[] = [];
        const start = new Date("2026-03-21T09:00:00").getTime();
        const timer: TimerState = {
            is_running: true,
            start_time: start,
            active_template_id: null,
            active_form_data: {
                project_code: "",
                work_name: "W",
                task_name: "",
                deal_name: "D",
                category_name: "",
                note: "",
            },
            active_record_id: null,
            active_session_id: null,
        };

        const result = addRunningTimerSlot(slots, timer, "2026-03-20");

        expect(result).toEqual([]);
    });

    it("종료 분이 시작 분 이하이면 원본을 반환한다", () => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date("2026-03-20T08:00:00"));
        const slots: TimeSlot[] = [];
        const start = new Date("2026-03-20T22:00:00").getTime();
        const timer: TimerState = {
            is_running: true,
            start_time: start,
            active_template_id: null,
            active_form_data: {
                project_code: "",
                work_name: "W",
                task_name: "",
                deal_name: "",
                category_name: "",
                note: "",
            },
            active_record_id: null,
            active_session_id: null,
        };

        const result = addRunningTimerSlot(slots, timer, "2026-03-20");

        expect(result).toEqual([]);
    });

    it("같은 날이고 유효하면 running 슬롯을 덧붙인다", () => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date("2026-03-20T10:30:00"));
        const base_slots: TimeSlot[] = [time_slot({ session_id: "existing" })];
        const start = new Date("2026-03-20T09:00:00").getTime();
        const timer: TimerState = {
            is_running: true,
            start_time: start,
            active_template_id: null,
            active_form_data: {
                project_code: "",
                work_name: "타이머작업",
                task_name: "",
                deal_name: "타이머딜",
                category_name: "",
                note: "",
            },
            active_record_id: null,
            active_session_id: null,
        };

        const result = addRunningTimerSlot(base_slots, timer, "2026-03-20");

        expect(result).toHaveLength(2);
        expect(result[1]).toMatchObject({
            start: 540,
            end: 630,
            record_id: "running-timer",
            session_id: "running-session",
            work_name: "타이머작업",
            deal_name: "타이머딜",
        });
    });

    it("work_name이 비어 있으면 기본 문구를 쓴다", () => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date("2026-03-20T10:00:00"));
        const slots: TimeSlot[] = [];
        const start = new Date("2026-03-20T09:30:00").getTime();
        const timer: TimerState = {
            is_running: true,
            start_time: start,
            active_template_id: null,
            active_form_data: {
                project_code: "",
                work_name: "",
                task_name: "",
                deal_name: "",
                category_name: "",
                note: "",
            },
            active_record_id: null,
            active_session_id: null,
        };

        const result = addRunningTimerSlot(slots, timer, "2026-03-20");

        expect(result[0].work_name).toBe("진행 중인 작업");
        expect(result[0].deal_name).toBe("");
    });
});

describe("checkAndAdjustTimeRange", () => {
    it("종료가 시작 이하면 조정 불가로 거절한다", () => {
        const result = checkAndAdjustTimeRange(600, 600, []);

        expect(result).toEqual({
            has_conflict: true,
            can_adjust: false,
            conflict_info: "종료 시간은 시작 시간보다 나중이어야 합니다.",
        });
    });

    it("슬롯이 없으면 충돌 없이 통과한다", () => {
        const result = checkAndAdjustTimeRange(540, 600, []);

        expect(result.has_conflict).toBe(false);
        expect(result.can_adjust).toBe(true);
        expect(result.adjusted_start).toBe("09:00");
        expect(result.adjusted_end).toBe("10:00");
    });

    it("allow_adjust가 false이고 deal_name이 있으면 겹침 메시지에 딜을 포함한다", () => {
        const slots = [
            time_slot({
                work_name: "A",
                deal_name: "B",
                start: 540,
                end: 600,
            }),
        ];

        const result = checkAndAdjustTimeRange(570, 660, slots, false);

        expect(result.can_adjust).toBe(false);
        expect(result.conflict_info).toBe(
            `"A > B" (09:00~10:00) 작업과 시간이 겹칩니다.`
        );
    });

    it("allow_adjust가 false이고 deal_name이 비어 있으면 작업명만 넣는다", () => {
        const slots = [
            time_slot({
                work_name: "단일",
                deal_name: "",
                start: 540,
                end: 600,
            }),
        ];

        const result = checkAndAdjustTimeRange(570, 660, slots, false);

        expect(result.conflict_info).toBe(
            `"단일" (09:00~10:00) 작업과 시간이 겹칩니다.`
        );
    });

    it("새 구간이 기존 슬롯을 완전히 덮으면 조정 불가이다", () => {
        const slots = [time_slot({ start: 600, end: 660 })];
        const result = checkAndAdjustTimeRange(540, 720, slots, true);

        expect(result.can_adjust).toBe(false);
        expect(result.conflict_info).toBe("기존 작업과 시간이 완전히 겹칩니다.");
    });

    it("새 구간이 기존 슬롯 안에 완전히 들어가면 조정 불가이다", () => {
        const slots = [time_slot({ start: 540, end: 720 })];
        const result = checkAndAdjustTimeRange(600, 660, slots, true);

        expect(result.can_adjust).toBe(false);
        expect(result.conflict_info).toBe("기존 작업 안에 완전히 포함됩니다.");
    });

    it("시작이 슬롯과 겹치면 시작을 슬롯 끝으로 밀었다", () => {
        const slots = [time_slot({ start: 540, end: 600 })];
        const result = checkAndAdjustTimeRange(570, 660, slots, true);

        expect(result.can_adjust).toBe(true);
        expect(result.has_conflict).toBe(true);
        expect(result.adjusted_start).toBe("10:00");
        expect(result.adjusted_end).toBe("11:00");
    });

    it("종료가 슬롯과 겹치면 종료를 슬롯 시작으로 당긴다", () => {
        const slots = [time_slot({ start: 600, end: 660 })];
        const result = checkAndAdjustTimeRange(540, 630, slots, true);

        expect(result.can_adjust).toBe(true);
        expect(result.has_conflict).toBe(true);
        expect(result.adjusted_start).toBe("09:00");
        expect(result.adjusted_end).toBe("10:00");
    });
});

describe("formatConflictInfo", () => {
    it("deal_name이 있으면 작업과 딜을 함께 표시한다", () => {
        const text = formatConflictInfo(
            time_slot({ work_name: "개발", deal_name: "버그", start: 540, end: 600 })
        );

        expect(text).toBe(`"개발 > 버그" (09:00~10:00)`);
    });

    it("deal_name이 없으면 작업명만 표시한다", () => {
        const text = formatConflictInfo(
            time_slot({ work_name: "회의", deal_name: "", start: 600, end: 630 })
        );

        expect(text).toBe(`"회의" (10:00~10:30)`);
    });
});
