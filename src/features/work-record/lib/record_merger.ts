/**
 * 레코드 병합 관련 순수 함수
 */

import type { WorkRecord, WorkSession } from "../../../shared/types";
import { getSessionMinutes, sortSessionsByTime } from "../../../shared/lib/session";

/**
 * 중복 레코드 그룹
 */
export interface DuplicateGroup {
    key: string;
    work_name: string;
    deal_name: string;
    records: WorkRecord[];
}

/**
 * 병합 결과
 */
export interface MergeResult {
    merged_record: WorkRecord;
    deleted_ids: string[];
}

/**
 * 중복 레코드 그룹 찾기
 * 같은 work_name + deal_name 조합의 미완료 레코드 그룹화
 */
export function findDuplicateGroups(records: WorkRecord[]): DuplicateGroup[] {
    const group_map = new Map<string, WorkRecord[]>();
    
    records
        .filter((r) => !r.is_deleted && !r.is_completed)
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
            duplicates.push({
                key,
                work_name: group_records[0].work_name,
                deal_name: group_records[0].deal_name,
                records: group_records.sort((a, b) => a.date.localeCompare(b.date)),
            });
        }
    });
    
    return duplicates;
}

/**
 * 같은 작업 기록 찾기 (미완료 작업 우선)
 */
export function findExistingRecord(
    records: WorkRecord[],
    date: string,
    work_name: string,
    deal_name: string
): WorkRecord | undefined {
    // 1. 미완료 작업 중에서 같은 work_name + deal_name 찾기 (날짜 무관)
    const incomplete_match = records.find(
        (r) =>
            !r.is_deleted &&
            !r.is_completed &&
            r.work_name === work_name &&
            r.deal_name === deal_name
    );
    
    if (incomplete_match) {
        return incomplete_match;
    }
    
    // 2. 없으면 같은 날짜의 작업 찾기
    return records.find(
        (r) =>
            !r.is_deleted &&
            r.date === date &&
            r.work_name === work_name &&
            r.deal_name === deal_name
    );
}

/**
 * 여러 레코드를 하나로 병합
 */
export function mergeRecords(records_to_merge: WorkRecord[]): MergeResult {
    if (records_to_merge.length === 0) {
        throw new Error("병합할 레코드가 없습니다.");
    }
    
    if (records_to_merge.length === 1) {
        return {
            merged_record: records_to_merge[0],
            deleted_ids: [],
        };
    }
    
    // 날짜/시작시간 순 정렬
    const sorted = [...records_to_merge].sort((a, b) => {
        const date_cmp = a.date.localeCompare(b.date);
        if (date_cmp !== 0) return date_cmp;
        return (a.start_time || "").localeCompare(b.start_time || "");
    });
    
    const base = sorted[0];
    const others = sorted.slice(1);
    
    // 모든 세션 수집 (중복 ID 제거)
    const all_sessions: WorkSession[] = [...(base.sessions || [])];
    const session_ids = new Set(all_sessions.map((s) => s.id));
    
    others.forEach((r) => {
        (r.sessions || []).forEach((s) => {
            if (!session_ids.has(s.id)) {
                all_sessions.push(s);
                session_ids.add(s.id);
            }
        });
    });
    
    // 세션 정렬
    const sorted_sessions = sortSessionsByTime(all_sessions, base.date);
    
    // 총 시간 계산
    const total = sorted_sessions.reduce(
        (sum, s) => sum + getSessionMinutes(s),
        0
    );
    
    const first = sorted_sessions[0];
    const last = sorted_sessions[sorted_sessions.length - 1];
    
    return {
        merged_record: {
            ...base,
            sessions: sorted_sessions as WorkSession[],
            duration_minutes: Math.max(1, total),
            start_time: first?.start_time || base.start_time,
            end_time: last?.end_time || base.end_time,
            date: first?.date || base.date,
        },
        deleted_ids: others.map((r) => r.id),
    };
}

/**
 * 레코드 목록에서 중복을 찾아 병합
 * @returns 병합된 레코드 목록과 삭제된 ID 목록
 */
export function autoMergeRecords(records: WorkRecord[]): {
    merged_records: WorkRecord[];
    merge_info: Array<{ group: DuplicateGroup; result: MergeResult }>;
} {
    const duplicates = findDuplicateGroups(records);
    
    if (duplicates.length === 0) {
        return { merged_records: records, merge_info: [] };
    }
    
    let result_records = [...records];
    const merge_info: Array<{ group: DuplicateGroup; result: MergeResult }> = [];
    
    for (const group of duplicates) {
        const result = mergeRecords(group.records);
        merge_info.push({ group, result });
        
        // 병합된 레코드로 업데이트
        result_records = result_records.map((r) =>
            r.id === result.merged_record.id ? result.merged_record : r
        );
        
        // 삭제할 레코드 제거
        result_records = result_records.filter(
            (r) => !result.deleted_ids.includes(r.id)
        );
    }
    
    return { merged_records: result_records, merge_info };
}
