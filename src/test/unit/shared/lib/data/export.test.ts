/**
 * export 유틸리티 테스트
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
    createExportWrapper,
    createExportBlob,
    createExportFileName,
    hasExportableData,
} from "../../../../../shared/lib/data/export";
import {
    createMockRecord,
    createMockTemplate,
} from "../../../../helpers/mock_factory";

describe("export", () => {
    beforeEach(() => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date("2026-02-03T10:30:00.000Z"));
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    describe("createExportWrapper", () => {
        it("데이터를 래핑하여 반환한다", () => {
            const data = {
                records: [createMockRecord()],
                templates: [createMockTemplate()],
            };

            const result = createExportWrapper(data);

            expect(result).toEqual({
                state: data,
                version: 0,
                exported_at: "2026-02-03T10:30:00.000Z",
            });
        });

        it("버전을 지정할 수 있다", () => {
            const data = { records: [], templates: [] };

            const result = createExportWrapper(data, 2);

            expect(result.version).toBe(2);
        });

        it("내보내기 시각을 포함한다", () => {
            const data = { records: [], templates: [] };

            const result = createExportWrapper(data);

            expect(result.exported_at).toBe("2026-02-03T10:30:00.000Z");
        });
    });

    describe("createExportBlob", () => {
        it("JSON Blob을 생성한다", () => {
            const data = {
                records: [createMockRecord()],
                templates: [],
            };

            const blob = createExportBlob(data);

            expect(blob).toBeInstanceOf(Blob);
            expect(blob.type).toBe("application/json");
        });

        it("Blob 내용이 올바른 JSON이다", async () => {
            const data = {
                records: [],
                templates: [],
            };

            const blob = createExportBlob(data);
            const text = await blob.text();
            const parsed = JSON.parse(text);

            expect(parsed.state).toEqual(data);
            expect(parsed.version).toBe(0);
            expect(parsed.exported_at).toBe("2026-02-03T10:30:00.000Z");
        });
    });

    describe("createExportFileName", () => {
        it("기본 파일명을 생성한다", () => {
            const result = createExportFileName();

            expect(result).toBe("time-manager-backup-2026-02-03.json");
        });

        it("커스텀 접두사를 사용할 수 있다", () => {
            const result = createExportFileName("my-backup");

            expect(result).toBe("my-backup-2026-02-03.json");
        });
    });

    describe("hasExportableData", () => {
        it("레코드가 있으면 true를 반환한다", () => {
            const data = {
                records: [createMockRecord()],
                templates: [],
            };

            expect(hasExportableData(data)).toBe(true);
        });

        it("템플릿이 있으면 true를 반환한다", () => {
            const data = {
                records: [],
                templates: [createMockTemplate()],
            };

            expect(hasExportableData(data)).toBe(true);
        });

        it("둘 다 없으면 false를 반환한다", () => {
            const data = {
                records: [],
                templates: [],
            };

            expect(hasExportableData(data)).toBe(false);
        });

        it("둘 다 있으면 true를 반환한다", () => {
            const data = {
                records: [createMockRecord()],
                templates: [createMockTemplate()],
            };

            expect(hasExportableData(data)).toBe(true);
        });
    });
});
