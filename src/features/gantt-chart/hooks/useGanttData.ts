/**
 * 간트 차트 데이터 관리 훅
 * - 레코드 그룹화
 * - 점유 슬롯 계산
 * - 충돌 감지
 */

import { useMemo } from "react";
import dayjs from "dayjs";
import { useWorkStore } from "../../../store/useWorkStore";
import {
    groupRecordsByDealName,
    type GroupedWork,
    type TimeSlot,
} from "../lib/slot_calculator";
import { detectConflicts, type ConflictInfo } from "../lib/conflict_detector";
import {
    calculateTimeRange,
    generateTimeLabels,
    calculateWorkColor,
    type TimeRange,
} from "../lib/bar_calculator";
import { timeToMinutes } from "../../../shared/lib/time";
import type { WorkRecord } from "../../../shared/types";

export interface UseGanttDataReturn {
    /** 그룹화된 작업 목록 */
    grouped_works: GroupedWork[];
    /** 점유된 시간 슬롯 */
    occupied_slots: TimeSlot[];
    /** 충돌 정보 */
    conflict_info: ConflictInfo;
    /** 시간 범위 */
    time_range: TimeRange;
    /** 시간 라벨 */
    time_labels: string[];
    /** 총 분 */
    total_minutes: number;
    /** 현재 시간 (분 단위) */
    current_time_mins: number;
    /** 오늘 레코드 목록 (기존 작업에 세션 추가용) */
    today_records: WorkRecord[];
    /** 작업 색상 계산 함수 */
    getWorkColor: (record: WorkRecord) => string;
}

/**
 * 간트 차트 데이터 관리 훅
 */
export function useGanttData(gantt_tick: number = 0): UseGanttDataReturn {
    const { records, selected_date, templates, timer, getLunchTimeMinutes } =
        useWorkStore();

    // 점심시간 가져오기
    const lunch_time = useMemo(
        () => getLunchTimeMinutes(),
        [getLunchTimeMinutes]
    );

    // 현재 시간 (분 단위) - gantt_tick에 의해 업데이트
    const current_time_mins = useMemo(() => {
        return dayjs().hour() * 60 + dayjs().minute();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [gantt_tick]);

    // 거래명 기준으로 세션 그룹화
    const grouped_works = useMemo(() => {
        const current_time_str = dayjs().format("HH:mm");
        return groupRecordsByDealName(records, selected_date, current_time_str);
    }, [records, selected_date, gantt_tick]);

    // 점유된 시간 슬롯
    const occupied_slots = useMemo((): TimeSlot[] => {
        const slots: TimeSlot[] = [];

        // 점심시간 슬롯 추가
        slots.push({ start: lunch_time.start, end: lunch_time.end });

        // 세션 슬롯 추가
        grouped_works.forEach((group) => {
            group.sessions.forEach((session) => {
                const end_mins = session.end_time
                    ? timeToMinutes(session.end_time)
                    : current_time_mins;
                slots.push({
                    start: timeToMinutes(session.start_time),
                    end: end_mins,
                });
            });
        });

        return slots.sort((a, b) => a.start - b.start);
    }, [grouped_works, lunch_time, current_time_mins]);

    // 충돌 감지
    const conflict_info = useMemo(() => {
        return detectConflicts(grouped_works, current_time_mins);
    }, [grouped_works, current_time_mins]);

    // 시간 범위 계산
    const time_range = useMemo(() => {
        return calculateTimeRange(
            grouped_works,
            current_time_mins,
            timer.active_session_id
        );
    }, [grouped_works, current_time_mins, timer.active_session_id]);

    // 시간 라벨 생성
    const time_labels = useMemo(() => {
        return generateTimeLabels(time_range);
    }, [time_range]);

    const total_minutes = time_range.end - time_range.start;

    // 오늘 레코드 목록
    const today_records = useMemo(() => {
        // 미완료 작업
        const incomplete_records = records.filter((r) => {
            if (r.is_deleted) return false;
            if (r.is_completed) return false;
            return r.date <= selected_date;
        });

        // 선택된 날짜의 완료된 레코드
        const completed_today = records.filter(
            (r) => r.date === selected_date && r.is_completed && !r.is_deleted
        );

        // 선택된 날짜에 세션이 있는 레코드
        const records_with_sessions_today = records.filter((r) => {
            if (r.is_deleted) return false;
            if (!r.sessions || r.sessions.length === 0) return false;
            if (!r.is_completed && r.date <= selected_date) return false;
            if (r.date === selected_date && r.is_completed) return false;
            return r.sessions.some((s) => (s.date || r.date) === selected_date);
        });

        return [
            ...incomplete_records,
            ...completed_today,
            ...records_with_sessions_today,
        ].sort((a, b) => {
            if (a.is_completed !== b.is_completed) {
                return a.is_completed ? 1 : -1;
            }
            return b.date.localeCompare(a.date);
        });
    }, [records, selected_date]);

    // 작업 색상 계산 함수
    const getWorkColor = useMemo(() => {
        return (record: WorkRecord) => calculateWorkColor(record, templates);
    }, [templates]);

    return {
        grouped_works,
        occupied_slots,
        conflict_info,
        time_range,
        time_labels,
        total_minutes,
        current_time_mins,
        today_records,
        getWorkColor,
    };
}
