/**
 * 시간 범위 충돌 감지 및 조정 관련 함수들
 */

/**
 * 두 시간 범위가 겹치는지 확인
 *
 * @param start1 첫 번째 범위 시작 (분)
 * @param end1 첫 번째 범위 종료 (분)
 * @param start2 두 번째 범위 시작 (분)
 * @param end2 두 번째 범위 종료 (분)
 * @returns 겹치면 true, 아니면 false
 */
export function isTimeRangeOverlapping(
    start1: number,
    end1: number,
    start2: number,
    end2: number
): boolean {
    // 범위가 겹치지 않는 조건: 하나가 다른 하나의 완전히 전이거나 후
    return !(end1 <= start2 || start1 >= end2);
}

/**
 * 충돌 유형을 반환
 *
 * @returns
 * - 'none': 충돌 없음
 * - 'contains': 첫 번째가 두 번째를 완전히 포함
 * - 'contained': 두 번째가 첫 번째를 완전히 포함
 * - 'overlap_start': 첫 번째 시작이 두 번째 안에 있음
 * - 'overlap_end': 첫 번째 끝이 두 번째 안에 있음
 */
export type OverlapType =
    | "none"
    | "contains"
    | "contained"
    | "overlap_start"
    | "overlap_end";

export function getOverlapType(
    start1: number,
    end1: number,
    start2: number,
    end2: number
): OverlapType {
    if (!isTimeRangeOverlapping(start1, end1, start2, end2)) {
        return "none";
    }

    // 첫 번째가 두 번째를 완전히 포함
    if (start1 <= start2 && end1 >= end2) {
        return "contains";
    }

    // 두 번째가 첫 번째를 완전히 포함
    if (start2 <= start1 && end2 >= end1) {
        return "contained";
    }

    // 첫 번째 시작이 두 번째 안에 있음
    if (start1 >= start2 && start1 < end2) {
        return "overlap_start";
    }

    // 첫 번째 끝이 두 번째 안에 있음
    return "overlap_end";
}

/**
 * 시간 범위 조정 결과
 */
export interface AdjustedTimeRange {
    start: number;
    end: number;
    adjusted: boolean;
}

/**
 * 충돌을 피해 시간 범위를 조정
 *
 * @param new_start 새 범위 시작 (분)
 * @param new_end 새 범위 종료 (분)
 * @param existing_ranges 기존 범위들 [{start, end}]
 * @returns 조정된 범위 또는 null (조정 불가능)
 */
export function adjustTimeRangeToAvoidConflicts(
    new_start: number,
    new_end: number,
    existing_ranges: { start: number; end: number }[]
): AdjustedTimeRange | null {
    let adjusted_start = new_start;
    let adjusted_end = new_end;
    let was_adjusted = false;

    // 최대 10회 반복 (무한 루프 방지)
    for (let iteration = 0; iteration < 10; iteration++) {
        let has_conflict = false;

        for (const range of existing_ranges) {
            const overlap = getOverlapType(
                adjusted_start,
                adjusted_end,
                range.start,
                range.end
            );

            if (overlap === "none") continue;

            has_conflict = true;

            // 완전 포함 관계는 조정 불가
            if (overlap === "contains" || overlap === "contained") {
                return null;
            }

            // 시작 부분 충돌: 시작을 기존 범위 종료로 이동
            if (overlap === "overlap_start") {
                adjusted_start = range.end;
                was_adjusted = true;
            }
            // 끝 부분 충돌: 끝을 기존 범위 시작으로 이동
            else if (overlap === "overlap_end") {
                adjusted_end = range.start;
                was_adjusted = true;
            }
        }

        if (!has_conflict) break;
    }

    // 조정 후 유효성 검사
    if (adjusted_end <= adjusted_start) {
        return null;
    }

    return {
        start: adjusted_start,
        end: adjusted_end,
        adjusted: was_adjusted,
    };
}
