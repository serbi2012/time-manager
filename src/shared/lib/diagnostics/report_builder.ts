import type { WorkRecord, WorkTemplate } from "../../types";
import type {
    DiagnosticDataSummary,
    DiagnosticEnvironment,
    DiagnosticEvent,
    DiagnosticReport,
} from "./types";
import { DIAGNOSTIC_REPORT_VERSION, DIAGNOSTIC_FILE_PREFIX } from "./config";

export interface BuildDiagnosticReportInput {
    environment: DiagnosticEnvironment;
    events: DiagnosticEvent[];
    records: WorkRecord[];
    templates: WorkTemplate[];
    settings: Record<string, unknown>;
    timer: unknown;
    storage_bytes: number | null;
}

/**
 * 레코드 목록에서 데이터 이상 징후를 요약
 */
export function summarizeRecords(
    records: WorkRecord[],
    templates: WorkTemplate[],
    storage_bytes: number | null
): DiagnosticDataSummary {
    let session_count = 0;
    let running_session_count = 0;
    let records_missing_sessions = 0;
    let duration_mismatch_count = 0;

    records.forEach((record) => {
        const sessions = record.sessions || [];
        session_count += sessions.length;
        running_session_count += sessions.filter(
            (s) => s.end_time === ""
        ).length;

        if (sessions.length === 0) {
            records_missing_sessions += 1;
            return;
        }

        const session_total = sessions.reduce(
            (sum, s) => sum + (s.duration_minutes || 0),
            0
        );
        if (session_total !== record.duration_minutes) {
            duration_mismatch_count += 1;
        }
    });

    return {
        record_count: records.length,
        deleted_record_count: records.filter((r) => r.is_deleted).length,
        completed_record_count: records.filter((r) => r.is_completed).length,
        template_count: templates.length,
        session_count,
        running_session_count,
        records_missing_sessions,
        duration_mismatch_count,
        storage_bytes,
    };
}

/**
 * 진단 리포트 조립
 */
export function buildDiagnosticReport(
    input: BuildDiagnosticReportInput
): DiagnosticReport {
    return {
        report_version: DIAGNOSTIC_REPORT_VERSION,
        generated_at: new Date().toISOString(),
        environment: input.environment,
        events: input.events,
        summary: summarizeRecords(
            input.records,
            input.templates,
            input.storage_bytes
        ),
        settings: input.settings,
        timer: input.timer,
        records: input.records,
        templates: input.templates,
    };
}

/**
 * 진단 파일명 생성
 */
export function createDiagnosticFileName(now: Date = new Date()): string {
    const stamp = now.toISOString().replace(/[:.]/g, "-").slice(0, 19);
    return `${DIAGNOSTIC_FILE_PREFIX}-${stamp}.json`;
}
