/**
 * record_creator 테스트
 */

import { describe, it, expect } from "vitest";
import {
    createRecordFromTemplate,
    createEmptyRecord,
} from "@/shared/lib/record/record_creator";
import { createMockTemplate } from "@/test/helpers/mock_factory";

describe("record_creator", () => {
    describe("createRecordFromTemplate", () => {
        it("템플릿에서 레코드를 생성한다", () => {
            const template = createMockTemplate({
                project_code: "A25_01234",
                work_name: "테스트 작업",
                task_name: "개발",
                category_name: "개발",
                note: "테스트 비고",
            });

            const result = createRecordFromTemplate({
                template,
                deal_name: "테스트 거래",
                date: "2026-02-03",
            });

            expect(result).toEqual({
                id: "test-uuid-1",
                project_code: "A25_01234",
                work_name: "테스트 작업",
                task_name: "개발",
                deal_name: "테스트 거래",
                category_name: "개발",
                note: "테스트 비고",
                duration_minutes: 0,
                start_time: "",
                end_time: "",
                date: "2026-02-03",
                sessions: [],
                is_completed: false,
                is_deleted: false,
            });
        });

        it("project_code가 없으면 기본값을 사용한다", () => {
            const template = createMockTemplate({
                project_code: "",
            });

            const result = createRecordFromTemplate({
                template,
                deal_name: "작업",
                date: "2026-02-03",
            });

            expect(result.project_code).toBe("A00_00000");
        });
    });

    describe("createEmptyRecord", () => {
        it("빈 레코드를 생성한다", () => {
            const result = createEmptyRecord({
                date: "2026-02-03",
            });

            expect(result).toEqual({
                id: "test-uuid-1",
                project_code: "",
                work_name: "",
                task_name: "",
                deal_name: "",
                category_name: "",
                note: "",
                duration_minutes: 0,
                start_time: "",
                end_time: "",
                date: "2026-02-03",
                sessions: [],
                is_completed: false,
                is_deleted: false,
            });
        });

        it("defaults로 값을 오버라이드할 수 있다", () => {
            const result = createEmptyRecord({
                date: "2026-02-03",
                defaults: {
                    work_name: "기본 작업",
                    project_code: "P001",
                },
            });

            expect(result.work_name).toBe("기본 작업");
            expect(result.project_code).toBe("P001");
            expect(result.date).toBe("2026-02-03");
        });
    });
});
