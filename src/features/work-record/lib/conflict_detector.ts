/**
 * 세션 시간 충돌 감지 및 조정 로직
 */

import type { WorkRecord, TimerState } from "../../../shared/types";
import { timeToMinutes, minutesToTime } from "../../../shared/lib/time";

/**
 * 시간 슬롯 정보
 */
export interface TimeSlot {
    start: number;
    end: number;
    record_id: string;
    session_id: string;
    work_name: string;
    deal_name: string;
}

/**
 * 충돌 감지 결과
 */
export interface ConflictCheckResult {
    has_conflict: boolean;
    can_adjust: boolean;
    adjusted_start?: string;
    adjusted_end?: string;
    conflict_info?: string;
}

/**
 * 특정 날짜의 모든 세션 시간 슬롯 수집
 */
export function collectTimeSlots(
    records: WorkRecord[],
    target_date: string,
    exclude_session_id?: string
): TimeSlot[] {
    const slots: TimeSlot[] = [];
    
    records.forEach((record) => {
        // 삭제된 레코드 제외
        if (record.is_deleted) return;
        
        (record.sessions || []).forEach((session) => {
            const session_date = session.date || record.date;
            
            // 대상 날짜가 아니거나 제외할 세션이면 스킵
            if (session_date !== target_date) return;
            if (exclude_session_id && session.id === exclude_session_id) return;
            
            // 종료 시간이 없는 세션(진행 중)도 포함
            if (!session.start_time || !session.end_time) return;
            
            slots.push({
                start: timeToMinutes(session.start_time),
                end: timeToMinutes(session.end_time),
                record_id: record.id,
                session_id: session.id,
                work_name: record.work_name,
                deal_name: record.deal_name,
            });
        });
    });
    
    // 시작 시간순 정렬
    return slots.sort((a, b) => a.start - b.start);
}

/**
 * 현재 진행 중인 타이머의 시간 슬롯 추가
 */
export function addRunningTimerSlot(
    slots: TimeSlot[],
    timer: TimerState,
    target_date: string
): TimeSlot[] {
    if (!timer.is_running || !timer.start_time || !timer.active_form_data) {
        return slots;
    }
    
    const timer_date = new Date(timer.start_time);
    const timer_date_str = `${timer_date.getFullYear()}-${String(timer_date.getMonth() + 1).padStart(2, "0")}-${String(timer_date.getDate()).padStart(2, "0")}`;
    
    if (timer_date_str !== target_date) {
        return slots;
    }
    
    const timer_start_mins = timer_date.getHours() * 60 + timer_date.getMinutes();
    const now = new Date();
    const timer_end_mins = now.getHours() * 60 + now.getMinutes();
    
    if (timer_end_mins <= timer_start_mins) {
        return slots;
    }
    
    return [
        ...slots,
        {
            start: timer_start_mins,
            end: timer_end_mins,
            record_id: "running-timer",
            session_id: "running-session",
            work_name: timer.active_form_data.work_name || "진행 중인 작업",
            deal_name: timer.active_form_data.deal_name || "",
        },
    ];
}

/**
 * 두 시간 범위의 충돌 여부 확인
 */
export function checkOverlap(
    start1: number,
    end1: number,
    start2: number,
    end2: number
): boolean {
    return !(end1 <= start2 || start1 >= end2);
}

/**
 * 시간 범위 충돌 검사 및 자동 조정
 */
export function checkAndAdjustTimeRange(
    new_start_mins: number,
    new_end_mins: number,
    occupied_slots: TimeSlot[],
    allow_adjust: boolean = true
): ConflictCheckResult {
    // 기본 유효성 검사
    if (new_end_mins <= new_start_mins) {
        return {
            has_conflict: true,
            can_adjust: false,
            conflict_info: "종료 시간은 시작 시간보다 나중이어야 합니다.",
        };
    }
    
    let current_start = new_start_mins;
    let current_end = new_end_mins;
    let was_adjusted = false;
    
    // 충돌 검사 및 조정 (최대 10회 반복)
    for (let iteration = 0; iteration < 10; iteration++) {
        let has_conflict = false;
        
        for (const slot of occupied_slots) {
            if (!checkOverlap(current_start, current_end, slot.start, slot.end)) {
                continue;
            }
            
            has_conflict = true;
            
            // 자동 조정 비활성화면 실패 반환
            if (!allow_adjust) {
                const slot_info = slot.deal_name 
                    ? `"${slot.work_name} > ${slot.deal_name}"` 
                    : `"${slot.work_name}"`;
                return {
                    has_conflict: true,
                    can_adjust: false,
                    conflict_info: `${slot_info} (${minutesToTime(slot.start)}~${minutesToTime(slot.end)}) 작업과 시간이 겹칩니다.`,
                };
            }
            
            // 완전 포함 케이스: 조정 불가
            if (current_start <= slot.start && current_end >= slot.end) {
                return {
                    has_conflict: true,
                    can_adjust: false,
                    conflict_info: "기존 작업과 시간이 완전히 겹칩니다.",
                };
            }
            
            if (slot.start <= current_start && slot.end >= current_end) {
                return {
                    has_conflict: true,
                    can_adjust: false,
                    conflict_info: "기존 작업 안에 완전히 포함됩니다.",
                };
            }
            
            // 시작 시간 조정
            if (current_start >= slot.start && current_start < slot.end) {
                current_start = slot.end;
                was_adjusted = true;
            }
            // 종료 시간 조정
            else if (current_end > slot.start && current_end <= slot.end) {
                current_end = slot.start;
                was_adjusted = true;
            }
        }
        
        if (!has_conflict) break;
    }
    
    // 조정 후 유효성 검사
    if (current_end <= current_start) {
        return {
            has_conflict: true,
            can_adjust: false,
            conflict_info: "충돌을 피할 수 없습니다. 다른 시간을 선택하세요.",
        };
    }
    
    return {
        has_conflict: was_adjusted,
        can_adjust: true,
        adjusted_start: minutesToTime(current_start),
        adjusted_end: minutesToTime(current_end),
    };
}

/**
 * 충돌 정보 포맷팅
 */
export function formatConflictInfo(slot: TimeSlot): string {
    const name_part = slot.deal_name 
        ? `"${slot.work_name} > ${slot.deal_name}"` 
        : `"${slot.work_name}"`;
    return `${name_part} (${minutesToTime(slot.start)}~${minutesToTime(slot.end)})`;
}
