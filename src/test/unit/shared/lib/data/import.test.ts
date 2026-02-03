/**
 * import 유틸리티 테스트
 */

import { describe, it, expect } from "vitest";
import {
    validateImportData,
    extractImportData,
    parseImportContent,
} from "../../../../../shared/lib/data/import";
import {
    createMockRecord,
    createMockTemplate,
} from "../../../../helpers/mock_factory";

describe("import", () => {
    describe("validateImportData", () => {
        it("유효한 데이터에 대해 true를 반환한다", () => {
            const data = {
                records: [createMockRecord()],
                templates: [createMockTemplate()],
            };

            expect(validateImportData(data)).toBe(true);
        });

        it("records만 있어도 유효하다", () => {
            const data = {
                records: [],
            };

            expect(validateImportData(data)).toBe(true);
        });

        it("null에 대해 false를 반환한다", () => {
            expect(validateImportData(null)).toBe(false);
        });

        it("undefined에 대해 false를 반환한다", () => {
            expect(validateImportData(undefined)).toBe(false);
        });

        it("records가 없으면 false를 반환한다", () => {
            const data = {
                templates: [],
            };

            expect(validateImportData(data)).toBe(false);
        });

        it("records가 배열이 아니면 false를 반환한다", () => {
            const data = {
                records: "not an array",
            };

            expect(validateImportData(data)).toBe(false);
        });

        it("templates가 있지만 배열이 아니면 false를 반환한다", () => {
            const data = {
                records: [],
                templates: "not an array",
            };

            expect(validateImportData(data)).toBe(false);
        });
    });

    describe("extractImportData", () => {
        it("래핑된 형식에서 데이터를 추출한다", () => {
            const wrapped = {
                state: {
                    records: [createMockRecord()],
                    templates: [],
                },
                version: 1,
            };

            const result = extractImportData(wrapped);

            expect(result).toEqual(wrapped.state);
        });

        it("직접 형식의 데이터를 반환한다", () => {
            const direct = {
                records: [createMockRecord()],
                templates: [],
            };

            const result = extractImportData(direct);

            expect(result).toEqual(direct);
        });

        it("유효하지 않은 데이터에 대해 null을 반환한다", () => {
            expect(extractImportData(null)).toBe(null);
            expect(extractImportData({})).toBe(null);
            expect(extractImportData({ invalid: true })).toBe(null);
        });

        it("state가 유효하지 않으면 직접 형식 확인을 시도한다", () => {
            const data = {
                state: { invalid: true }, // 유효하지 않은 state
                records: [], // 직접 형식은 유효
            };

            const result = extractImportData(data);

            // 직접 형식으로 처리됨
            expect(result).toEqual(data);
        });
    });

    describe("parseImportContent", () => {
        it("유효한 JSON을 파싱한다", () => {
            const content = JSON.stringify({
                records: [createMockRecord()],
                templates: [createMockTemplate()],
                custom_task_options: ["옵션1"],
                custom_category_options: ["카테고리1"],
            });

            const result = parseImportContent(content);

            expect(result).not.toBe(null);
            expect(result!.records.length).toBe(1);
            expect(result!.templates.length).toBe(1);
            expect(result!.custom_task_options).toEqual(["옵션1"]);
            expect(result!.custom_category_options).toEqual(["카테고리1"]);
        });

        it("래핑된 형식을 파싱한다", () => {
            const content = JSON.stringify({
                state: {
                    records: [],
                    templates: [],
                },
                version: 1,
            });

            const result = parseImportContent(content);

            expect(result).not.toBe(null);
            expect(result!.records).toEqual([]);
        });

        it("유효하지 않은 JSON에 대해 null을 반환한다", () => {
            const result = parseImportContent("invalid json");

            expect(result).toBe(null);
        });

        it("유효하지 않은 데이터 구조에 대해 null을 반환한다", () => {
            const content = JSON.stringify({ invalid: true });

            const result = parseImportContent(content);

            expect(result).toBe(null);
        });

        it("누락된 필드에 대해 기본값을 사용한다", () => {
            const content = JSON.stringify({
                records: [],
            });

            const result = parseImportContent(content);

            expect(result).not.toBe(null);
            expect(result!.templates).toEqual([]);
            expect(result!.custom_task_options).toEqual([]);
            expect(result!.custom_category_options).toEqual([]);
        });
    });
});
