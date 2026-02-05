/**
 * 주간 일정 작업/일자 그룹화 순수 함수
 */

import type { WorkRecord } from "@/shared/types";
import { DAY_NAMES } from "../constants";
import { WEEKLY_SCHEDULE_CONFIG } from "../constants/config";

export interface WorkGroupDeal {
    deal_name: string;
    total_minutes: number;
}

export interface WorkGroup {
    project_code: string;
    work_name: string;
    status: string;
    start_date: string;
    total_minutes: number;
    deals: WorkGroupDeal[];
}

export interface DayGroup {
    date: string;
    day_name: string;
    works: WorkGroup[];
}

function formatMonthDay(
    date_str: string,
    day_names: readonly string[]
): string {
    const d = new Date(date_str + "T12:00:00");
    const m = d.getMonth() + 1;
    const day = d.getDate();
    const day_name = day_names[d.getDay()];
    return `${m}/${day}(${day_name})`;
}

/**
 * work_name 기준 해당 날짜까지의 누적 시간(분)
 */
export function getTotalMinutesForWork(
    records: WorkRecord[],
    work_name: string,
    up_to_date: string
): number {
    return records
        .filter((r) => r.work_name === work_name && !r.is_deleted)
        .reduce((sum, r) => {
            const sessions_up_to_date =
                r.sessions?.filter((s) => {
                    const session_date = s.date || r.date;
                    return session_date <= up_to_date;
                }) || [];
            return (
                sum +
                sessions_up_to_date.reduce(
                    (s_sum, s) => s_sum + (s.duration_minutes || 0),
                    0
                )
            );
        }, 0);
}

/**
 * work_name + deal_name 기준 해당 날짜까지의 누적 시간(분)
 */
export function getTotalMinutesForDeal(
    records: WorkRecord[],
    work_name: string,
    deal_name: string,
    up_to_date: string
): number {
    return records
        .filter(
            (r) =>
                r.work_name === work_name &&
                r.deal_name === deal_name &&
                !r.is_deleted
        )
        .reduce((sum, r) => {
            const sessions_up_to_date =
                r.sessions?.filter((s) => {
                    const session_date = s.date || r.date;
                    return session_date <= up_to_date;
                }) || [];
            return (
                sum +
                sessions_up_to_date.reduce(
                    (s_sum, s) => s_sum + (s.duration_minutes || 0),
                    0
                )
            );
        }, 0);
}

/**
 * 작업(work_name)의 첫 시작일 "M/D(요일)" 형식
 */
export function getFirstStartDate(
    records: WorkRecord[],
    work_name: string
): string {
    const work_records = records.filter((r) => r.work_name === work_name);
    if (work_records.length === 0) return "";

    let earliest_date = work_records[0].date;
    work_records.forEach((r) => {
        r.sessions?.forEach((s) => {
            const session_date = s.date || r.date;
            if (session_date < earliest_date) {
                earliest_date = session_date;
            }
        });
        if (r.date < earliest_date) {
            earliest_date = r.date;
        }
    });

    return formatMonthDay(earliest_date, DAY_NAMES);
}

/**
 * 작업 진행상태: 진행중 세션 있음 → "진행중", 전부 완료 → "완료", 그 외 "진행중"
 */
export function getWorkProgressStatus(
    records: WorkRecord[],
    work_name: string
): string {
    const work_records = records.filter(
        (r) => r.work_name === work_name && !r.is_deleted
    );
    if (work_records.length === 0) return "진행중";

    const all_sessions = work_records.flatMap((r) => r.sessions || []);
    const has_running_session = all_sessions.some((s) => s.end_time === "");
    if (has_running_session) return "진행중";

    const all_completed = work_records.every((r) => r.is_completed);
    return all_completed ? "완료" : "진행중";
}

/**
 * 주간 레코드와 옵션으로 날짜별 DayGroup[] 생성
 */
export function buildDayGroups(
    week_dates: string[],
    weekly_records: WorkRecord[],
    editable_status: Record<string, { status: string }>,
    hide_management_work: boolean,
    management_project_code: string
): DayGroup[] {
    const groups: DayGroup[] = [];

    week_dates.forEach((date) => {
        const d = new Date(date + "T12:00:00");
        const day_name = DAY_NAMES[d.getDay()];
        const work_map = new Map<string, WorkGroup>();

        weekly_records.forEach((record) => {
            const sessions_on_date = record.sessions?.filter(
                (s) => (s.date || record.date) === date
            );

            if (!sessions_on_date || sessions_on_date.length === 0) {
                if (record.date !== date) return;
            }

            const work_key = record.work_name;

            if (!work_map.has(work_key)) {
                const edited = editable_status[work_key];
                work_map.set(work_key, {
                    project_code:
                        record.project_code ||
                        WEEKLY_SCHEDULE_CONFIG.defaultProjectCode,
                    work_name: record.work_name,
                    status:
                        edited?.status ??
                        getWorkProgressStatus(weekly_records, record.work_name),
                    start_date: getFirstStartDate(
                        weekly_records,
                        record.work_name
                    ),
                    total_minutes: getTotalMinutesForWork(
                        weekly_records,
                        record.work_name,
                        date
                    ),
                    deals: [],
                });
            }

            const work_group = work_map.get(work_key)!;
            if (
                !work_group.deals.some((d) => d.deal_name === record.deal_name)
            ) {
                work_group.deals.push({
                    deal_name: record.deal_name || record.work_name,
                    total_minutes: getTotalMinutesForDeal(
                        weekly_records,
                        record.work_name,
                        record.deal_name,
                        date
                    ),
                });
            }
        });

        if (work_map.size > 0) {
            const filtered_works = Array.from(work_map.values()).filter(
                (work) => {
                    if (
                        hide_management_work &&
                        work.project_code === management_project_code
                    ) {
                        return false;
                    }
                    return true;
                }
            );

            if (filtered_works.length > 0) {
                groups.push({
                    date,
                    day_name,
                    works: filtered_works,
                });
            }
        }
    });

    return groups;
}
