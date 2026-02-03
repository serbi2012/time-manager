/**
 * 레코드 통계 계산 관련 순수 함수
 */

import type { WorkRecord } from "../../../shared/types";
import { getRecordDurationForDate } from "./duration_calculator";

/**
 * 오늘 통계 정보
 */
export interface TodayStats {
    /** 총 작업 시간 (분) */
    total_minutes: number;
    /** 작업 수 */
    record_count: number;
    /** 완료된 작업 수 */
    completed_count: number;
    /** 미완료 작업 수 */
    incomplete_count: number;
}

/**
 * 오늘 통계 계산
 */
export function calculateTodayStats(
    records: WorkRecord[],
    selected_date: string
): TodayStats {
    let total_minutes = 0;
    let record_count = 0;
    let completed_count = 0;
    let incomplete_count = 0;

    records.forEach((record) => {
        if (record.is_deleted) return;

        const duration = getRecordDurationForDate(record, selected_date);

        if (duration > 0) {
            total_minutes += duration;
            record_count++;

            if (record.is_completed) {
                completed_count++;
            } else {
                incomplete_count++;
            }
        }
    });

    return {
        total_minutes,
        record_count,
        completed_count,
        incomplete_count,
    };
}

/**
 * 카테고리별 통계
 */
export interface CategoryStats {
    category: string;
    minutes: number;
    count: number;
}

/**
 * 카테고리별 시간 통계 계산
 */
export function calculateCategoryStats(
    records: WorkRecord[],
    selected_date: string
): CategoryStats[] {
    const category_map = new Map<string, { minutes: number; count: number }>();

    records.forEach((record) => {
        if (record.is_deleted) return;

        const duration = getRecordDurationForDate(record, selected_date);
        if (duration <= 0) return;

        const category = record.category_name || "기타";
        const existing = category_map.get(category) || { minutes: 0, count: 0 };

        category_map.set(category, {
            minutes: existing.minutes + duration,
            count: existing.count + 1,
        });
    });

    return Array.from(category_map.entries())
        .map(([category, stats]) => ({
            category,
            minutes: stats.minutes,
            count: stats.count,
        }))
        .sort((a, b) => b.minutes - a.minutes);
}

/**
 * 작업별 통계
 */
export interface WorkStats {
    work_name: string;
    deal_name: string;
    minutes: number;
    sessions_count: number;
}

/**
 * 작업별 시간 통계 계산
 */
export function calculateWorkStats(
    records: WorkRecord[],
    selected_date: string
): WorkStats[] {
    const work_map = new Map<string, WorkStats>();

    records.forEach((record) => {
        if (record.is_deleted) return;

        const duration = getRecordDurationForDate(record, selected_date);
        if (duration <= 0) return;

        const key = `${record.work_name}::${record.deal_name || ""}`;
        const existing = work_map.get(key);

        // 해당 날짜 세션 수 계산
        let sessions_count = 1;
        if (record.sessions && record.sessions.length > 0) {
            sessions_count = record.sessions.filter(
                (s) => (s.date || record.date) === selected_date
            ).length;
        }

        if (existing) {
            work_map.set(key, {
                ...existing,
                minutes: existing.minutes + duration,
                sessions_count: existing.sessions_count + sessions_count,
            });
        } else {
            work_map.set(key, {
                work_name: record.work_name,
                deal_name: record.deal_name || "",
                minutes: duration,
                sessions_count,
            });
        }
    });

    return Array.from(work_map.values()).sort((a, b) => b.minutes - a.minutes);
}
