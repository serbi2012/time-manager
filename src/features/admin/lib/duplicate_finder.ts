/**
 * 중복 레코드 감지 관련 순수 함수
 */

import type { WorkRecord } from "../../../shared/types";

export interface DuplicateGroup {
    key: string;
    work_name: string;
    deal_name: string;
    records: WorkRecord[];
    total_sessions: number;
    total_duration: number;
    date_range: string;
}

/**
 * 같은 work_name + deal_name 조합의 중복 의심 레코드 그룹 찾기
 */
export function findDuplicateRecords(records: WorkRecord[]): DuplicateGroup[] {
    const group_map = new Map<string, WorkRecord[]>();

    records
        .filter((r) => !r.is_deleted)
        .forEach((record) => {
            const key = `${record.work_name}||${record.deal_name}`;
            if (!group_map.has(key)) {
                group_map.set(key, []);
            }
            group_map.get(key)!.push(record);
        });

    const duplicates: DuplicateGroup[] = [];

    group_map.forEach((group_records, key) => {
        if (group_records.length >= 2) {
            const sorted_records = [...group_records].sort((a, b) =>
                a.date.localeCompare(b.date)
            );
            const dates = sorted_records.map((r) => r.date);
            const unique_dates = [...new Set(dates)];

            duplicates.push({
                key,
                work_name: group_records[0].work_name,
                deal_name: group_records[0].deal_name,
                records: sorted_records,
                total_sessions: group_records.reduce(
                    (sum, r) => sum + (r.sessions?.length || 0),
                    0
                ),
                total_duration: group_records.reduce(
                    (sum, r) => sum + r.duration_minutes,
                    0
                ),
                date_range:
                    unique_dates.length === 1
                        ? unique_dates[0]
                        : `${unique_dates[0]} ~ ${
                              unique_dates[unique_dates.length - 1]
                          }`,
            });
        }
    });

    return duplicates.sort((a, b) => b.records.length - a.records.length);
}
