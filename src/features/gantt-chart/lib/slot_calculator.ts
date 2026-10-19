/**
 * 간트 차트 슬롯 계산 관련 순수 함수
 */

import type { WorkRecord, WorkSession } from "../../../shared/types";
import { timeToMinutes } from "../../../shared/lib/time";

/**
 * 시간 슬롯 타입
 */
export interface TimeSlot {
    start: number;
    end: number;
}

/**
 * 그룹화된 작업 정보
 */
export interface GroupedWork {
    key: string;
    record: WorkRecord;
    sessions: WorkSession[];
    first_start: number;
}

/**
 * 드래그 선택 영역 타입
 */
export interface DragSelection {
    start_mins: number;
    end_mins: number;
}

/**
 * 레코드들을 거래명(deal_name) 기준으로 그룹화
 * 선택된 날짜의 세션만 포함
 */
export function groupRecordsByDealName(
    records: WorkRecord[],
    selected_date: string,
    current_time_str: string
): GroupedWork[] {
    const groups = new Map<string, GroupedWork>();

    records.forEach((record) => {
        // 삭제된 레코드는 제외
        if (record.is_deleted) return;

        // 세션 수집
        let all_sessions: WorkSession[] = [];
        if (record.sessions && record.sessions.length > 0) {
            all_sessions = record.sessions;
        } else if (record.start_time) {
            // start_time이 있는 경우에만 가상 세션 생성
            all_sessions = [
                {
                    id: record.id,
                    date: record.date,
                    start_time: record.start_time,
                    end_time: record.end_time,
                    duration_minutes: record.duration_minutes,
                },
            ];
        }

        // 세션이 없으면 스킵
        if (all_sessions.length === 0) return;

        // 선택된 날짜의 세션만 필터링
        const date_sessions = all_sessions.filter(
            (s) => (s.date || record.date) === selected_date
        );

        // 해당 날짜에 세션이 없으면 스킵
        if (date_sessions.length === 0) return;

        // end_time이 빈 세션(진행 중)은 현재 시간으로 표시
        const displayed_sessions = date_sessions.map((s) =>
            s.end_time === "" ? { ...s, end_time: current_time_str } : s
        );

        const key = record.deal_name || record.work_name;

        if (groups.has(key)) {
            const group = groups.get(key)!;
            group.sessions.push(...displayed_sessions);
        } else {
            groups.set(key, {
                key,
                record,
                sessions: [...displayed_sessions],
                first_start: timeToMinutes(displayed_sessions[0].start_time),
            });
        }
    });

    // 첫 시작 시간순 정렬
    return Array.from(groups.values()).sort(
        (a, b) => a.first_start - b.first_start
    );
}

/**
 * 드래그 선택 가능한 범위 계산
 * 기존 세션과 겹치지 않는 범위 반환
 */
export function calculateAvailableRange(
    drag_start_mins: number,
    occupied_slots: TimeSlot[]
): { min: number; max: number } {
    let available_min = 0; // 최소: 00:00
    let available_max = 1440; // 최대: 24:00

    occupied_slots.forEach((slot) => {
        if (slot.end <= drag_start_mins) {
            // 드래그 시작점 왼쪽의 슬롯 -> 최소값 갱신
            available_min = Math.max(available_min, slot.end);
        }
        if (slot.start >= drag_start_mins) {
            // 드래그 시작점 오른쪽의 슬롯 -> 최대값 갱신
            available_max = Math.min(available_max, slot.start);
        }
    });

    return { min: available_min, max: available_max };
}

/**
 * 주어진 시간이 점유된 슬롯 내에 있는지 확인
 */
export function isTimeOccupied(
    time_mins: number,
    occupied_slots: TimeSlot[]
): boolean {
    return occupied_slots.some(
        (slot) => time_mins >= slot.start && time_mins < slot.end
    );
}
