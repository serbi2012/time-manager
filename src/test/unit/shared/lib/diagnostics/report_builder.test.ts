import { describe, it, expect } from "vitest";
import {
    summarizeRecords,
    buildDiagnosticReport,
    createDiagnosticFileName,
} from "@/shared/lib/diagnostics";
import type {
    DiagnosticEnvironment,
    DiagnosticEvent,
} from "@/shared/lib/diagnostics";
import type { WorkRecord, WorkTemplate } from "@/shared/types";

const DATE = "2026-09-08";

function createRecord(overrides: Partial<WorkRecord> = {}): WorkRecord {
    return {
        id: "r1",
        work_name: "작업A",
        deal_name: "거래A",
        task_name: "개발",
        category_name: "개발",
        project_code: "A25_01846",
        date: DATE,
        start_time: "09:00",
        end_time: "10:00",
        duration_minutes: 60,
        note: "",
        is_completed: false,
        sessions: [
            {
                id: "s1",
                date: DATE,
                start_time: "09:00",
                end_time: "10:00",
                duration_minutes: 60,
            },
        ],
        ...overrides,
    };
}

const ENVIRONMENT: DiagnosticEnvironment = {
    app_version: "2.11.3",
    user_agent: "test-agent",
    platform: "Win32",
    language: "ko-KR",
    screen: { width: 1920, height: 1080 },
    viewport: { width: 1280, height: 720 },
    device_pixel_ratio: 1,
    online: true,
    timezone: "Asia/Seoul",
    collected_at: "2026-09-08T00:00:00.000Z",
    url: "http://localhost:5173/",
};

describe("summarizeRecords", () => {
    it("레코드와 세션 개수를 집계한다", () => {
        const records = [createRecord({ id: "a" }), createRecord({ id: "b" })];

        const summary = summarizeRecords(records, [], 1024);

        expect(summary.record_count).toBe(2);
        expect(summary.session_count).toBe(2);
        expect(summary.storage_bytes).toBe(1024);
    });

    it("삭제/완료 레코드를 각각 센다", () => {
        const records = [
            createRecord({ id: "a", is_deleted: true }),
            createRecord({ id: "b", is_completed: true }),
            createRecord({ id: "c" }),
        ];

        const summary = summarizeRecords(records, [], null);

        expect(summary.deleted_record_count).toBe(1);
        expect(summary.completed_record_count).toBe(1);
    });

    it("진행 중 세션을 센다", () => {
        const records = [
            createRecord({
                sessions: [
                    {
                        id: "s1",
                        date: DATE,
                        start_time: "09:00",
                        end_time: "",
                        duration_minutes: 0,
                    },
                ],
                duration_minutes: 0,
            }),
        ];

        const summary = summarizeRecords(records, [], null);

        expect(summary.running_session_count).toBe(1);
    });

    it("세션이 없는 레코드를 센다", () => {
        const records = [createRecord({ sessions: [] })];

        const summary = summarizeRecords(records, [], null);

        expect(summary.records_missing_sessions).toBe(1);
        expect(summary.duration_mismatch_count).toBe(0);
    });

    it("세션 합계와 duration_minutes가 어긋나면 센다", () => {
        const records = [
            createRecord({ duration_minutes: 120 }),
            createRecord({ id: "b" }),
        ];

        const summary = summarizeRecords(records, [], null);

        expect(summary.duration_mismatch_count).toBe(1);
    });

    it("템플릿 개수를 센다", () => {
        const templates = [{ id: "t1" }, { id: "t2" }] as WorkTemplate[];

        const summary = summarizeRecords([], templates, null);

        expect(summary.template_count).toBe(2);
    });
});

describe("buildDiagnosticReport", () => {
    const events: DiagnosticEvent[] = [
        {
            id: "e1",
            at: "2026-09-08T01:00:00.000Z",
            level: "error",
            source: "window.error",
            message: "테스트 오류",
        },
    ];

    it("환경, 이벤트, 요약, 원본 데이터를 모두 담는다", () => {
        const records = [createRecord()];

        const report = buildDiagnosticReport({
            environment: ENVIRONMENT,
            events,
            records,
            templates: [],
            settings: { app_theme: "blue" },
            timer: { is_running: false },
            storage_bytes: 512,
        });

        expect(report.report_version).toBe(1);
        expect(report.environment.app_version).toBe("2.11.3");
        expect(report.events).toHaveLength(1);
        expect(report.summary.record_count).toBe(1);
        expect(report.summary.storage_bytes).toBe(512);
        expect(report.settings).toEqual({ app_theme: "blue" });
        expect(report.records).toBe(records);
    });
});

describe("createDiagnosticFileName", () => {
    it("타임스탬프가 들어간 json 파일명을 만든다", () => {
        const name = createDiagnosticFileName(
            new Date("2026-09-08T12:34:56.000Z")
        );

        expect(name).toBe("time-manager-diagnostics-2026-09-08T12-34-56.json");
    });
});
