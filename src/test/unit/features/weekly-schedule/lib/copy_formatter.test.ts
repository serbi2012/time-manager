/**
 * copy_formatter 순수 함수 테스트
 */

import { describe, it, expect } from "vitest";
import {
    getDayOfWeek,
    getWeekDates,
    groupRecordsByDate,
    formatCopyText1,
    formatCopyText2,
    formatCopyText3,
    formatCopyText,
} from "../../../../../features/weekly-schedule/lib/copy_formatter";
import type { WorkRecord } from "../../../../../shared/types";

// 테스트용 레코드 헬퍼
function createTestRecord(overrides: Partial<WorkRecord> = {}): WorkRecord {
    return {
        id: "test-id",
        work_name: "테스트 작업",
        deal_name: "",
        task_name: "",
        category_name: "개발",
        project_code: "",
        date: "2024-01-15",
        start_time: "14:00",
        end_time: "16:00",
        duration_minutes: 120,
        note: "",
        is_completed: false,
        sessions: [
            {
                id: "session-1",
                date: "2024-01-15",
                start_time: "14:00",
                end_time: "16:00",
                duration_minutes: 120,
            },
        ],
        ...overrides,
    };
}

// 테스트용 세션 헬퍼
function s(id: string, date: string, start: string, end: string): { id: string; date: string; start_time: string; end_time: string; duration_minutes: number } {
    const [sh, sm] = start.split(":").map(Number);
    const [eh, em] = end.split(":").map(Number);
    return { id, date, start_time: start, end_time: end, duration_minutes: Math.max(0, (eh * 60 + em) - (sh * 60 + sm)) };
}

describe("copy_formatter", () => {
    describe("getDayOfWeek", () => {
        it("월요일 반환", () => {
            // 2024-01-15는 월요일
            const day = getDayOfWeek("2024-01-15");
            expect(day).toBe("월");
        });

        it("금요일 반환", () => {
            // 2024-01-19는 금요일
            const day = getDayOfWeek("2024-01-19");
            expect(day).toBe("금");
        });

        it("일요일 반환", () => {
            // 2024-01-21은 일요일
            const day = getDayOfWeek("2024-01-21");
            expect(day).toBe("일");
        });
    });

    describe("getWeekDates", () => {
        it("주간 날짜 배열 반환 (월-일)", () => {
            // 2024-01-17 (수요일) 기준
            const dates = getWeekDates("2024-01-17");

            expect(dates).toHaveLength(7);
            expect(dates[0]).toBe("2024-01-15"); // 월요일
            expect(dates[6]).toBe("2024-01-21"); // 일요일
        });

        it("월요일 입력 시 해당 주 반환", () => {
            const dates = getWeekDates("2024-01-15");

            expect(dates[0]).toBe("2024-01-15");
        });

        it("일요일 입력 시 해당 주 반환", () => {
            const dates = getWeekDates("2024-01-21");

            expect(dates[0]).toBe("2024-01-15");
            expect(dates[6]).toBe("2024-01-21");
        });
    });

    describe("groupRecordsByDate", () => {
        it("날짜별로 레코드 그룹화", () => {
            const dates = ["2024-01-15", "2024-01-16", "2024-01-17"];
            const records: WorkRecord[] = [
                createTestRecord({
                    id: "1",
                    date: "2024-01-15",
                    sessions: [s("s1", "2024-01-15", "14:00", "16:00")],
                }),
                createTestRecord({
                    id: "2",
                    date: "2024-01-15",
                    sessions: [s("s2", "2024-01-15", "16:00", "18:00")],
                }),
                createTestRecord({
                    id: "3",
                    date: "2024-01-17",
                    sessions: [s("s3", "2024-01-17", "14:00", "15:00")],
                }),
            ];

            const grouped = groupRecordsByDate(records, dates);

            expect(grouped).toHaveLength(3);
            expect(grouped[0].date).toBe("2024-01-15");
            expect(grouped[0].records).toHaveLength(2);
            expect(grouped[1].records).toHaveLength(0);
            expect(grouped[2].records).toHaveLength(1);
        });

        it("삭제된 레코드 제외", () => {
            const dates = ["2024-01-15"];
            const records: WorkRecord[] = [
                createTestRecord({ id: "1", date: "2024-01-15", is_deleted: false }),
                createTestRecord({ id: "2", date: "2024-01-15", is_deleted: true }),
            ];

            const grouped = groupRecordsByDate(records, dates);

            expect(grouped[0].records).toHaveLength(1);
        });

        it("총 시간 계산 (점심 시간 제외)", () => {
            const dates = ["2024-01-15"];
            const records: WorkRecord[] = [
                createTestRecord({
                    id: "1",
                    date: "2024-01-15",
                    sessions: [s("s1", "2024-01-15", "14:00", "16:00")],
                }),
                createTestRecord({
                    id: "2",
                    date: "2024-01-15",
                    sessions: [s("s2", "2024-01-15", "16:00", "18:00")],
                }),
            ];

            const grouped = groupRecordsByDate(records, dates);

            expect(grouped[0].total_minutes).toBe(240);
        });
    });

    describe("formatCopyText1", () => {
        it("형식 1로 텍스트 생성", () => {
            const day_records = [
                {
                    date: "2024-01-15",
                    day_of_week: "월",
                    records: [
                        createTestRecord({ work_name: "작업A" }),
                    ],
                    total_minutes: 120,
                },
            ];

            const text = formatCopyText1(day_records);

            expect(text).toContain("[2024-01-15 (월)]");
            expect(text).toContain("- 작업A:");
            expect(text).toContain("총:");
        });
    });

    describe("formatCopyText2", () => {
        it("형식 2로 텍스트 생성", () => {
            const day_records = [
                {
                    date: "2024-01-15",
                    day_of_week: "월",
                    records: [
                        createTestRecord({ work_name: "작업A", category_name: "개발" }),
                    ],
                    total_minutes: 120,
                },
            ];

            const text = formatCopyText2(day_records);

            expect(text).toContain("## 2024-01-15 (월)");
            expect(text).toContain("### 작업A");
            expect(text).toContain("- 카테고리: 개발");
        });
    });

    describe("formatCopyText3", () => {
        it("형식 3으로 텍스트 생성", () => {
            const day_records = [
                {
                    date: "2024-01-15",
                    day_of_week: "월",
                    records: [
                        createTestRecord({ work_name: "작업A" }),
                        createTestRecord({ work_name: "작업B" }),
                    ],
                    total_minutes: 240,
                },
            ];

            const text = formatCopyText3(day_records);

            expect(text).toContain("월:");
            expect(text).toContain("작업A");
            expect(text).toContain("작업B");
        });
    });

    describe("formatCopyText", () => {
        it("선택한 형식으로 텍스트 생성", () => {
            const day_records = [
                {
                    date: "2024-01-15",
                    day_of_week: "월",
                    records: [createTestRecord({ work_name: "작업A" })],
                    total_minutes: 120,
                },
            ];

            const text1 = formatCopyText(day_records, "format1");
            const text2 = formatCopyText(day_records, "format2");
            const text3 = formatCopyText(day_records, "format3");

            expect(text1).toContain("[2024-01-15");
            expect(text2).toContain("## 2024-01-15");
            expect(text3).toContain("월:");
        });
    });
});
