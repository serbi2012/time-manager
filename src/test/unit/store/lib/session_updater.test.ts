import { describe, it, expect } from "vitest";
import {
    collectSameDaySessions,
    checkDateChangeConflicts,
    validateAndAdjustSessionTime,
} from "@/store/lib/session_updater";
import {
    createMockSession,
    createMockRecord,
} from "@/test/helpers/mock_factory";
import type { WorkRecord } from "@/shared/types/domain";

const MOCK_TIMER_IDLE = {
    is_running: false,
    start_time: null,
    active_form_data: null,
};

describe("collectSameDaySessions", () => {
    it("같은 날짜의 세션만 수집한다", () => {
        const date = "2026-03-17";
        const records: WorkRecord[] = [
            createMockRecord({
                id: "r1",
                date,
                sessions: [
                    createMockSession({
                        id: "s1",
                        date,
                        start_time: "09:00",
                        end_time: "10:00",
                        duration_minutes: 60,
                    }),
                ],
            }),
            createMockRecord({
                id: "r2",
                date: "2026-03-18",
                sessions: [
                    createMockSession({
                        id: "s2",
                        date: "2026-03-18",
                        start_time: "09:00",
                        end_time: "10:00",
                        duration_minutes: 60,
                    }),
                ],
            }),
        ];

        const slots = collectSameDaySessions(
            records,
            date,
            "r-exclude",
            "s-exclude",
            MOCK_TIMER_IDLE
        );
        expect(slots).toHaveLength(1);
        expect(slots[0].session.id).toBe("s1");
    });

    it("수정 중인 세션은 제외한다", () => {
        const date = "2026-03-17";
        const records: WorkRecord[] = [
            createMockRecord({
                id: "r1",
                date,
                sessions: [
                    createMockSession({
                        id: "s1",
                        date,
                        start_time: "09:00",
                        end_time: "10:00",
                        duration_minutes: 60,
                    }),
                    createMockSession({
                        id: "s2",
                        date,
                        start_time: "10:00",
                        end_time: "11:00",
                        duration_minutes: 60,
                    }),
                ],
            }),
        ];

        const slots = collectSameDaySessions(
            records,
            date,
            "r1",
            "s1",
            MOCK_TIMER_IDLE
        );
        expect(slots).toHaveLength(1);
        expect(slots[0].session.id).toBe("s2");
    });

    it("overnight 세션의 end_mins가 +1440 적용된다", () => {
        const date = "2026-03-17";
        const records: WorkRecord[] = [
            createMockRecord({
                id: "r1",
                date,
                sessions: [
                    createMockSession({
                        id: "s1",
                        date,
                        start_time: "22:00",
                        end_time: "02:24",
                        duration_minutes: 264,
                        is_overnight: true,
                    }),
                ],
            }),
        ];

        const slots = collectSameDaySessions(
            records,
            date,
            "r-exclude",
            "s-exclude",
            MOCK_TIMER_IDLE
        );
        expect(slots).toHaveLength(1);
        expect(slots[0].start_mins).toBe(1320); // 22:00
        expect(slots[0].end_mins).toBe(1584); // 02:24 + 1440
    });
});

describe("checkDateChangeConflicts", () => {
    it("충돌이 없으면 null 반환", () => {
        const slots = [
            {
                record_id: "r1",
                session: createMockSession({
                    start_time: "09:00",
                    end_time: "10:00",
                    duration_minutes: 60,
                }),
                start_mins: 540,
                end_mins: 600,
                work_name: "작업1",
                deal_name: "거래1",
            },
        ];

        const result = checkDateChangeConflicts(
            slots,
            660, // 11:00
            720, // 12:00
            "2026-03-17"
        );
        expect(result).toBeNull();
    });

    it("충돌이 있으면 에러 결과 반환", () => {
        const slots = [
            {
                record_id: "r1",
                session: createMockSession({
                    start_time: "09:00",
                    end_time: "10:00",
                    duration_minutes: 60,
                }),
                start_mins: 540,
                end_mins: 600,
                work_name: "작업1",
                deal_name: "거래1",
            },
        ];

        const result = checkDateChangeConflicts(
            slots,
            570, // 09:30 (겹침)
            660,
            "2026-03-17"
        );
        expect(result).not.toBeNull();
        expect(result!.success).toBe(false);
    });
});

describe("validateAndAdjustSessionTime - 새벽 근무", () => {
    const date = "2026-03-17";

    function createTestRecords(): WorkRecord[] {
        return [
            createMockRecord({
                id: "r1",
                date,
                work_name: "야간 작업",
                deal_name: "거래A",
                sessions: [
                    createMockSession({
                        id: "s1",
                        date,
                        start_time: "22:00",
                        end_time: "23:00",
                        duration_minutes: 60,
                    }),
                ],
            }),
            createMockRecord({
                id: "r2",
                date,
                work_name: "주간 작업",
                deal_name: "거래B",
                sessions: [
                    createMockSession({
                        id: "s2",
                        date,
                        start_time: "09:00",
                        end_time: "10:00",
                        duration_minutes: 60,
                    }),
                ],
            }),
        ];
    }

    it("새벽 근무 세션 수정이 충돌 없이 성공한다", () => {
        const records = createTestRecords();
        const result = validateAndAdjustSessionTime(
            records,
            MOCK_TIMER_IDLE,
            "r1",
            "s1",
            "22:00",
            "02:24",
            undefined,
            true
        );

        expect(result.success).toBe(true);
        expect(result.adjusted).toBe(false);
    });

    it("새벽 근무 세션이 기존 세션과 겹치면 실패한다", () => {
        const records = [
            createMockRecord({
                id: "r1",
                date,
                work_name: "작업1",
                deal_name: "",
                sessions: [
                    createMockSession({
                        id: "s1",
                        date,
                        start_time: "20:00",
                        end_time: "21:00",
                        duration_minutes: 60,
                    }),
                ],
            }),
            createMockRecord({
                id: "r2",
                date,
                work_name: "작업2",
                deal_name: "",
                sessions: [
                    createMockSession({
                        id: "s2",
                        date,
                        start_time: "21:00",
                        end_time: "23:00",
                        duration_minutes: 120,
                    }),
                ],
            }),
        ];

        // s1을 22:00~02:24 overnight로 수정 → s2(21:00~23:00)와 겹침
        const result = validateAndAdjustSessionTime(
            records,
            MOCK_TIMER_IDLE,
            "r1",
            "s1",
            "22:00",
            "02:24",
            undefined,
            true
        );

        expect(result.success).toBe(false);
    });

    it("새벽 근무에서 종료 시간이 시작 시간보다 이르면 실패 (is_overnight 없이)", () => {
        const records = createTestRecords();
        const result = validateAndAdjustSessionTime(
            records,
            MOCK_TIMER_IDLE,
            "r1",
            "s1",
            "22:00",
            "02:24",
            undefined,
            false
        );

        expect(result.success).toBe(false);
    });

    it("존재하지 않는 레코드면 실패", () => {
        const records = createTestRecords();
        const result = validateAndAdjustSessionTime(
            records,
            MOCK_TIMER_IDLE,
            "nonexistent",
            "s1",
            "22:00",
            "02:24",
            undefined,
            true
        );

        expect(result.success).toBe(false);
    });
});
