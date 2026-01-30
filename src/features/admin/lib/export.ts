/**
 * 데이터 내보내기 유틸리티
 */

import type { WorkRecord, WorkSession } from "../../../shared/types";
import dayjs from "dayjs";

/**
 * 내보내기 옵션
 */
export interface ExportOptions {
  include_deleted?: boolean;
  date_range?: {
    start: string;
    end: string;
  };
  format: "csv" | "json";
  data_type: "records" | "sessions" | "all";
}

/**
 * CSV 레코드 행
 */
interface CSVRecordRow {
  id: string;
  date: string;
  project_code: string;
  work_name: string;
  task_name: string;
  deal_name: string;
  category_name: string;
  duration_minutes: number;
  start_time: string;
  end_time: string;
  session_count: number;
  is_completed: string;
  is_deleted: string;
  note: string;
}

/**
 * CSV 세션 행
 */
interface CSVSessionRow {
  session_id: string;
  record_id: string;
  work_name: string;
  deal_name: string;
  date: string;
  start_time: string;
  end_time: string;
  duration_minutes: number;
}

/**
 * 날짜 범위로 레코드 필터링
 */
function filterByDateRange(
  records: WorkRecord[],
  options: ExportOptions
): WorkRecord[] {
  let filtered = records;

  if (!options.include_deleted) {
    filtered = filtered.filter((r) => !r.is_deleted);
  }

  if (options.date_range) {
    const { start, end } = options.date_range;
    filtered = filtered.filter((r) => {
      return r.date >= start && r.date <= end;
    });
  }

  return filtered;
}

/**
 * 레코드를 CSV 행으로 변환
 */
function recordToCSVRow(record: WorkRecord): CSVRecordRow {
  return {
    id: record.id,
    date: record.date,
    project_code: record.project_code,
    work_name: record.work_name,
    task_name: record.task_name,
    deal_name: record.deal_name,
    category_name: record.category_name,
    duration_minutes: record.duration_minutes,
    start_time: record.start_time,
    end_time: record.end_time,
    session_count: record.sessions.length,
    is_completed: record.is_completed ? "Y" : "N",
    is_deleted: record.is_deleted ? "Y" : "N",
    note: record.note,
  };
}

/**
 * 세션을 CSV 행으로 변환
 */
function sessionToCSVRow(
  session: WorkSession,
  record: WorkRecord
): CSVSessionRow {
  return {
    session_id: session.id,
    record_id: record.id,
    work_name: record.work_name,
    deal_name: record.deal_name,
    date: session.date || record.date,
    start_time: session.start_time,
    end_time: session.end_time,
    duration_minutes: session.duration_minutes,
  };
}

/**
 * CSV 이스케이프 처리
 */
function escapeCSV(value: string | number | boolean): string {
  const str = String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * 객체 배열을 CSV 문자열로 변환
 */
function arrayToCSV<T>(
  data: T[],
  headers: (keyof T)[]
): string {
  const header_row = headers.map((h) => escapeCSV(String(h))).join(",");
  const data_rows = data.map((row) =>
    headers
      .map((h) => escapeCSV(row[h] as string | number | boolean))
      .join(",")
  );
  return [header_row, ...data_rows].join("\n");
}

/**
 * 레코드를 CSV로 내보내기
 */
export function exportRecordsToCSV(
  records: WorkRecord[],
  options: ExportOptions
): string {
  const filtered = filterByDateRange(records, options);
  const rows = filtered.map(recordToCSVRow);

  const headers: (keyof CSVRecordRow)[] = [
    "id",
    "date",
    "project_code",
    "work_name",
    "task_name",
    "deal_name",
    "category_name",
    "duration_minutes",
    "start_time",
    "end_time",
    "session_count",
    "is_completed",
    "is_deleted",
    "note",
  ];

  return arrayToCSV(rows, headers);
}

/**
 * 세션을 CSV로 내보내기
 */
export function exportSessionsToCSV(
  records: WorkRecord[],
  options: ExportOptions
): string {
  const filtered = filterByDateRange(records, options);
  const rows: CSVSessionRow[] = [];

  filtered.forEach((record) => {
    record.sessions.forEach((session) => {
      // 날짜 범위 필터링 (세션 날짜 기준)
      if (options.date_range) {
        const session_date = session.date || record.date;
        if (
          session_date < options.date_range.start ||
          session_date > options.date_range.end
        ) {
          return;
        }
      }
      rows.push(sessionToCSVRow(session, record));
    });
  });

  const headers: (keyof CSVSessionRow)[] = [
    "session_id",
    "record_id",
    "work_name",
    "deal_name",
    "date",
    "start_time",
    "end_time",
    "duration_minutes",
  ];

  return arrayToCSV(rows, headers);
}

/**
 * JSON으로 내보내기
 */
export function exportToJSON(
  records: WorkRecord[],
  options: ExportOptions
): string {
  const filtered = filterByDateRange(records, options);

  const export_data = {
    exported_at: new Date().toISOString(),
    options: {
      include_deleted: options.include_deleted,
      date_range: options.date_range,
      data_type: options.data_type,
    },
    summary: {
      total_records: filtered.length,
      total_sessions: filtered.reduce(
        (sum, r) => sum + r.sessions.length,
        0
      ),
      total_minutes: filtered.reduce(
        (sum, r) => sum + (r.duration_minutes || 0),
        0
      ),
    },
    data:
      options.data_type === "sessions"
        ? filtered.flatMap((r) =>
            r.sessions.map((s) => ({
              ...s,
              record_id: r.id,
              work_name: r.work_name,
              deal_name: r.deal_name,
            }))
          )
        : filtered,
  };

  return JSON.stringify(export_data, null, 2);
}

/**
 * 내보내기 실행 (통합)
 */
export function exportData(
  records: WorkRecord[],
  options: ExportOptions
): string {
  if (options.format === "json") {
    return exportToJSON(records, options);
  }

  if (options.data_type === "sessions") {
    return exportSessionsToCSV(records, options);
  }

  return exportRecordsToCSV(records, options);
}

/**
 * 파일 다운로드 트리거
 */
export function downloadFile(
  content: string,
  filename: string,
  mime_type: string
): void {
  const blob = new Blob(["\uFEFF" + content], { type: mime_type }); // BOM for Excel
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * 내보내기 파일명 생성
 */
export function generateExportFilename(
  options: ExportOptions,
  prefix: string = "time_manager"
): string {
  const date_str = dayjs().format("YYYYMMDD_HHmmss");
  const type_str = options.data_type;
  const ext = options.format === "json" ? "json" : "csv";
  return `${prefix}_${type_str}_${date_str}.${ext}`;
}
