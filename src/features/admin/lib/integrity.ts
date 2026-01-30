/**
 * 데이터 정합성 검사 순수 함수
 */

import type { WorkRecord } from "../../../shared/types";

/**
 * 정합성 문제 심각도
 */
export type IssueSeverity = "error" | "warning" | "info";

/**
 * 정합성 문제 유형
 */
export type IssueType =
    | "orphan_session"
    | "time_mismatch"
    | "date_mismatch"
    | "duplicate_id"
    | "missing_required"
    | "invalid_time_range"
    | "zero_duration"
    | "future_date"
    | "negative_duration";

/**
 * 정합성 문제 정보
 */
export interface IntegrityIssue {
    id: string;
    type: IssueType;
    severity: IssueSeverity;
    record_id?: string;
    session_id?: string;
    description: string;
    details?: string;
    auto_fixable: boolean;
    fix_action?: string;
}

/**
 * 정합성 검사 결과
 */
export interface IntegrityResult {
    issues: IntegrityIssue[];
    error_count: number;
    warning_count: number;
    info_count: number;
    checked_at: string;
}

/**
 * 문제 유형별 설명
 */
const ISSUE_DESCRIPTIONS: Record<IssueType, string> = {
    orphan_session: "레코드 없이 존재하는 세션",
    time_mismatch: "duration_minutes와 세션 합계 불일치",
    date_mismatch: "레코드 날짜와 세션 날짜 불일치",
    duplicate_id: "중복된 ID 발견",
    missing_required: "필수 필드 누락",
    invalid_time_range: "잘못된 시간 범위 (시작 > 종료)",
    zero_duration: "0분 세션",
    future_date: "미래 날짜 데이터",
    negative_duration: "음수 소요 시간",
};

let issue_counter = 0;

/**
 * 고유 ID 생성
 */
function generateIssueId(): string {
    return `issue_${Date.now()}_${issue_counter++}`;
}

/**
 * 필수 필드 누락 검사
 */
function checkMissingRequired(records: WorkRecord[]): IntegrityIssue[] {
    const issues: IntegrityIssue[] = [];

    records.forEach((record) => {
        const missing_fields: string[] = [];

        if (!record.id) missing_fields.push("id");
        if (!record.work_name) missing_fields.push("work_name");
        if (!record.date) missing_fields.push("date");

        if (missing_fields.length > 0) {
            issues.push({
                id: generateIssueId(),
                type: "missing_required",
                severity: "error",
                record_id: record.id || "unknown",
                description: ISSUE_DESCRIPTIONS.missing_required,
                details: `누락된 필드: ${missing_fields.join(", ")}`,
                auto_fixable: false,
            });
        }
    });

    return issues;
}

/**
 * 시간 불일치 검사 (duration_minutes vs 세션 합계)
 */
function checkTimeMismatch(records: WorkRecord[]): IntegrityIssue[] {
    const issues: IntegrityIssue[] = [];

    records
        .filter((r) => !r.is_deleted)
        .forEach((record) => {
            const session_total = record.sessions.reduce(
                (sum, s) => sum + (s.duration_minutes || 0),
                0
            );

            const record_duration = record.duration_minutes || 0;
            const diff = Math.abs(record_duration - session_total);

            // 1분 이상 차이나면 문제
            if (diff > 1) {
                issues.push({
                    id: generateIssueId(),
                    type: "time_mismatch",
                    severity: "warning",
                    record_id: record.id,
                    description: ISSUE_DESCRIPTIONS.time_mismatch,
                    details: `레코드: ${record_duration}분, 세션 합계: ${session_total}분 (차이: ${diff}분)`,
                    auto_fixable: true,
                    fix_action: `duration_minutes를 ${session_total}분으로 수정`,
                });
            }
        });

    return issues;
}

/**
 * 날짜 불일치 검사 (레코드 날짜 vs 세션 날짜)
 */
function checkDateMismatch(records: WorkRecord[]): IntegrityIssue[] {
    const issues: IntegrityIssue[] = [];

    records
        .filter((r) => !r.is_deleted)
        .forEach((record) => {
            record.sessions.forEach((session) => {
                const session_date = session.date || record.date;

                // 세션 날짜가 레코드 날짜와 다르고, 세션에 명시적 날짜가 없는 경우
                if (!session.date && record.date) {
                    // 이 경우는 정상 (세션이 레코드 날짜를 상속)
                    return;
                }

                // 세션 날짜가 명시적으로 다른 경우는 정상일 수 있음 (다른 날짜에 추가된 세션)
                // 하지만 정보 레벨로 알림
                if (session.date && session.date !== record.date) {
                    issues.push({
                        id: generateIssueId(),
                        type: "date_mismatch",
                        severity: "info",
                        record_id: record.id,
                        session_id: session.id,
                        description: ISSUE_DESCRIPTIONS.date_mismatch,
                        details: `레코드: ${record.date}, 세션: ${session_date}`,
                        auto_fixable: false,
                    });
                }
            });
        });

    return issues;
}

/**
 * 중복 ID 검사
 */
function checkDuplicateIds(records: WorkRecord[]): IntegrityIssue[] {
    const issues: IntegrityIssue[] = [];
    const record_ids = new Map<string, number>();
    const session_ids = new Map<string, number>();

    records.forEach((record) => {
        // 레코드 ID 중복 체크
        const record_count = record_ids.get(record.id) || 0;
        record_ids.set(record.id, record_count + 1);

        // 세션 ID 중복 체크
        record.sessions.forEach((session) => {
            const session_count = session_ids.get(session.id) || 0;
            session_ids.set(session.id, session_count + 1);
        });
    });

    // 중복된 레코드 ID
    record_ids.forEach((count, id) => {
        if (count > 1) {
            issues.push({
                id: generateIssueId(),
                type: "duplicate_id",
                severity: "error",
                record_id: id,
                description: ISSUE_DESCRIPTIONS.duplicate_id,
                details: `레코드 ID "${id}"가 ${count}번 중복`,
                auto_fixable: false,
            });
        }
    });

    // 중복된 세션 ID
    session_ids.forEach((count, id) => {
        if (count > 1) {
            issues.push({
                id: generateIssueId(),
                type: "duplicate_id",
                severity: "error",
                session_id: id,
                description: ISSUE_DESCRIPTIONS.duplicate_id,
                details: `세션 ID "${id}"가 ${count}번 중복`,
                auto_fixable: false,
            });
        }
    });

    return issues;
}

/**
 * 잘못된 시간 범위 검사 (시작 > 종료)
 */
function checkInvalidTimeRange(records: WorkRecord[]): IntegrityIssue[] {
    const issues: IntegrityIssue[] = [];

    records
        .filter((r) => !r.is_deleted)
        .forEach((record) => {
            record.sessions.forEach((session) => {
                if (!session.start_time || !session.end_time) return;
                if (session.end_time === "") return; // 진행 중

                const [start_h, start_m] = session.start_time
                    .split(":")
                    .map(Number);
                const [end_h, end_m] = session.end_time.split(":").map(Number);
                const start_mins = start_h * 60 + start_m;
                const end_mins = end_h * 60 + end_m;

                if (start_mins > end_mins) {
                    issues.push({
                        id: generateIssueId(),
                        type: "invalid_time_range",
                        severity: "error",
                        record_id: record.id,
                        session_id: session.id,
                        description: ISSUE_DESCRIPTIONS.invalid_time_range,
                        details: `시작: ${session.start_time}, 종료: ${session.end_time}`,
                        auto_fixable: false,
                    });
                }
            });
        });

    return issues;
}

/**
 * 0분 세션 검사
 */
function checkZeroDuration(records: WorkRecord[]): IntegrityIssue[] {
    const issues: IntegrityIssue[] = [];

    records
        .filter((r) => !r.is_deleted)
        .forEach((record) => {
            record.sessions.forEach((session) => {
                if (session.duration_minutes === 0 && session.end_time !== "") {
                    issues.push({
                        id: generateIssueId(),
                        type: "zero_duration",
                        severity: "warning",
                        record_id: record.id,
                        session_id: session.id,
                        description: ISSUE_DESCRIPTIONS.zero_duration,
                        details: `${session.start_time} ~ ${session.end_time}`,
                        auto_fixable: true,
                        fix_action: "세션 삭제",
                    });
                }
            });
        });

    return issues;
}

/**
 * 미래 날짜 검사
 */
function checkFutureDate(records: WorkRecord[]): IntegrityIssue[] {
    const issues: IntegrityIssue[] = [];
    const today = new Date().toISOString().split("T")[0];

    records
        .filter((r) => !r.is_deleted)
        .forEach((record) => {
            if (record.date > today) {
                issues.push({
                    id: generateIssueId(),
                    type: "future_date",
                    severity: "warning",
                    record_id: record.id,
                    description: ISSUE_DESCRIPTIONS.future_date,
                    details: `레코드 날짜: ${record.date}`,
                    auto_fixable: false,
                });
            }

            record.sessions.forEach((session) => {
                const session_date = session.date || record.date;
                if (session_date > today) {
                    issues.push({
                        id: generateIssueId(),
                        type: "future_date",
                        severity: "warning",
                        record_id: record.id,
                        session_id: session.id,
                        description: ISSUE_DESCRIPTIONS.future_date,
                        details: `세션 날짜: ${session_date}`,
                        auto_fixable: false,
                    });
                }
            });
        });

    return issues;
}

/**
 * 음수 소요 시간 검사
 */
function checkNegativeDuration(records: WorkRecord[]): IntegrityIssue[] {
    const issues: IntegrityIssue[] = [];

    records.forEach((record) => {
        if (record.duration_minutes < 0) {
            issues.push({
                id: generateIssueId(),
                type: "negative_duration",
                severity: "error",
                record_id: record.id,
                description: ISSUE_DESCRIPTIONS.negative_duration,
                details: `레코드 소요 시간: ${record.duration_minutes}분`,
                auto_fixable: true,
                fix_action: "duration_minutes를 0으로 수정",
            });
        }

        record.sessions.forEach((session) => {
            if (session.duration_minutes < 0) {
                issues.push({
                    id: generateIssueId(),
                    type: "negative_duration",
                    severity: "error",
                    record_id: record.id,
                    session_id: session.id,
                    description: ISSUE_DESCRIPTIONS.negative_duration,
                    details: `세션 소요 시간: ${session.duration_minutes}분`,
                    auto_fixable: true,
                    fix_action: "세션 삭제 또는 시간 수정",
                });
            }
        });
    });

    return issues;
}

/**
 * 전체 정합성 검사 실행
 */
export function checkIntegrity(records: WorkRecord[]): IntegrityResult {
    issue_counter = 0;

    const all_issues: IntegrityIssue[] = [
        ...checkMissingRequired(records),
        ...checkDuplicateIds(records),
        ...checkTimeMismatch(records),
        ...checkDateMismatch(records),
        ...checkInvalidTimeRange(records),
        ...checkZeroDuration(records),
        ...checkFutureDate(records),
        ...checkNegativeDuration(records),
    ];

    const error_count = all_issues.filter((i) => i.severity === "error").length;
    const warning_count = all_issues.filter(
        (i) => i.severity === "warning"
    ).length;
    const info_count = all_issues.filter((i) => i.severity === "info").length;

    return {
        issues: all_issues,
        error_count,
        warning_count,
        info_count,
        checked_at: new Date().toISOString(),
    };
}

/**
 * 특정 유형의 문제만 필터링
 */
export function filterIssuesByType(
    result: IntegrityResult,
    types: IssueType[]
): IntegrityIssue[] {
    return result.issues.filter((issue) => types.includes(issue.type));
}

/**
 * 특정 심각도의 문제만 필터링
 */
export function filterIssuesBySeverity(
    result: IntegrityResult,
    severities: IssueSeverity[]
): IntegrityIssue[] {
    return result.issues.filter((issue) => severities.includes(issue.severity));
}

/**
 * 자동 수정 가능한 문제만 필터링
 */
export function filterAutoFixableIssues(
    result: IntegrityResult
): IntegrityIssue[] {
    return result.issues.filter((issue) => issue.auto_fixable);
}
