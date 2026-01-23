/**
 * 충돌 감지 함수 유닛 테스트
 */

import { describe, it, expect } from "vitest";
import {
    checkOverlap,
    checkAndAdjustTimeRange,
    collectTimeSlots,
    type TimeSlot,
} from "../../../../../features/work-record/lib/conflict_detector";
import type { WorkRecord } from "../../../../../shared/types";

// TimeSlot 헬퍼
function slot(start: number, end: number): TimeSlot {
    return { start, end, record_id: "r1", session_id: "s1", work_name: "작업", deal_name: "거래" };
}

describe("checkOverlap", () => {
    it("겹치는 범위 감지", () => {
        expect(checkOverlap(0, 60, 30, 90)).toBe(true);
        expect(checkOverlap(0, 60, 0, 30)).toBe(true);
        expect(checkOverlap(0, 60, 30, 60)).toBe(true);
        expect(checkOverlap(0, 100, 30, 60)).toBe(true);
        expect(checkOverlap(30, 60, 0, 100)).toBe(true);
    });

    it("겹치지 않는 범위", () => {
        expect(checkOverlap(0, 60, 60, 120)).toBe(false);
        expect(checkOverlap(0, 60, 120, 180)).toBe(false);
    });
});

describe("checkAndAdjustTimeRange", () => {
    const empty_slots: TimeSlot[] = [];

    it("빈 슬롯에서 정상 범위 허용", () => {
        const result = checkAndAdjustTimeRange(540, 600, empty_slots);
        expect(result.can_adjust).toBe(true);
        expect(result.adjusted_start).toBe("09:00");
        expect(result.adjusted_end).toBe("10:00");
    });

    it("시작이 종료보다 늦으면 실패", () => {
        const result = checkAndAdjustTimeRange(600, 540, empty_slots);
        expect(result.can_adjust).toBe(false);
    });

    it("기존 슬롯과 겹칠 때 자동 조정", () => {
        const slots = [slot(540, 600)];
        const result = checkAndAdjustTimeRange(570, 660, slots, true);
        
        expect(result.can_adjust).toBe(true);
        expect(result.has_conflict).toBe(true);
        expect(result.adjusted_start).toBe("10:00");
    });

    it("자동 조정 비활성화시 실패", () => {
        const slots = [slot(540, 600)];
        const result = checkAndAdjustTimeRange(570, 660, slots, false);
        
        expect(result.can_adjust).toBe(false);
        expect(result.conflict_info).toBeDefined();
    });
});

describe("collectTimeSlots", () => {
    it("레코드에서 시간 슬롯 수집", () => {
        const records: WorkRecord[] = [
            {
                id: "1",
                project_code: "A00",
                work_name: "작업1",
                task_name: "개발",
                deal_name: "거래1",
                category_name: "개발",
                duration_minutes: 60,
                note: "",
                start_time: "09:00",
                end_time: "10:00",
                date: "2026-01-23",
                sessions: [
                    {
                        id: "s1",
                        date: "2026-01-23",
                        start_time: "09:00",
                        end_time: "10:00",
                        duration_minutes: 60,
                    },
                ],
                is_completed: false,
            },
        ];

        const slots = collectTimeSlots(records, "2026-01-23");
        
        expect(slots.length).toBe(1);
        expect(slots[0].start).toBe(540);  // 09:00
        expect(slots[0].end).toBe(600);    // 10:00
    });

    it("삭제된 레코드 제외", () => {
        const records: WorkRecord[] = [
            {
                id: "1",
                project_code: "A00",
                work_name: "작업1",
                task_name: "개발",
                deal_name: "거래1",
                category_name: "개발",
                duration_minutes: 60,
                note: "",
                start_time: "09:00",
                end_time: "10:00",
                date: "2026-01-23",
                sessions: [],
                is_completed: false,
                is_deleted: true,
            },
        ];

        const slots = collectTimeSlots(records, "2026-01-23");
        expect(slots.length).toBe(0);
    });
});
