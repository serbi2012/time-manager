/**
 * deal_name_generator 테스트
 */

import { describe, it, expect } from "vitest";
import {
    generateUniqueId,
    extractNumberFromDealName,
    generateSequentialDealName,
    generateDealName,
} from "../../../../../shared/lib/record/deal_name_generator";
import {
    createMockTemplate,
    createMockRecord,
} from "../../../../helpers/mock_factory";

describe("deal_name_generator", () => {
    describe("generateUniqueId", () => {
        it("MMdd_HHmmss_xxx 형식의 고유 ID를 생성한다", () => {
            const id = generateUniqueId();

            // 형식 검증: MMdd_HHmmss_xxx
            expect(id).toMatch(/^\d{4}_\d{6}_\d{3}$/);
        });

        it("호출할 때마다 다른 ID를 생성한다", () => {
            const id1 = generateUniqueId();
            const id2 = generateUniqueId();

            // 랜덤 접미사로 인해 높은 확률로 다름
            // (같은 초에 호출되어도 랜덤 부분이 다름)
            expect(id1).not.toBe(id2);
        });
    });

    describe("extractNumberFromDealName", () => {
        it("deal_name에서 번호를 추출한다", () => {
            expect(extractNumberFromDealName("작업 (1)")).toBe(1);
            expect(extractNumberFromDealName("작업 (3)")).toBe(3);
            expect(extractNumberFromDealName("테스트 (99)")).toBe(99);
        });

        it("번호가 없으면 0을 반환한다", () => {
            expect(extractNumberFromDealName("작업")).toBe(0);
            expect(extractNumberFromDealName("테스트 작업")).toBe(0);
        });

        it("중간에 있는 숫자는 추출하지 않는다", () => {
            expect(extractNumberFromDealName("작업 (2) 추가")).toBe(0);
        });
    });

    describe("generateSequentialDealName", () => {
        it("중복이 없으면 원래 이름을 반환한다", () => {
            const result = generateSequentialDealName("작업", []);
            expect(result).toBe("작업");
        });

        it("중복이 있으면 번호를 붙인다", () => {
            const records = [
                createMockRecord({
                    deal_name: "작업",
                    is_deleted: false,
                    is_completed: false,
                }),
            ];

            const result = generateSequentialDealName("작업", records);
            expect(result).toBe("작업 (2)");
        });

        it("기존 번호 중 최대값 + 1을 사용한다", () => {
            const records = [
                createMockRecord({
                    deal_name: "작업",
                    is_deleted: false,
                    is_completed: false,
                }),
                createMockRecord({
                    deal_name: "작업 (2)",
                    is_deleted: false,
                    is_completed: false,
                }),
                createMockRecord({
                    deal_name: "작업 (5)",
                    is_deleted: false,
                    is_completed: false,
                }),
            ];

            const result = generateSequentialDealName("작업", records);
            expect(result).toBe("작업 (6)");
        });

        it("삭제된 레코드는 무시한다", () => {
            const records = [
                createMockRecord({
                    deal_name: "작업",
                    is_deleted: true,
                    is_completed: false,
                }),
            ];

            const result = generateSequentialDealName("작업", records);
            expect(result).toBe("작업");
        });

        it("완료된 레코드는 무시한다", () => {
            const records = [
                createMockRecord({
                    deal_name: "작업",
                    is_deleted: false,
                    is_completed: true,
                }),
            ];

            const result = generateSequentialDealName("작업", records);
            expect(result).toBe("작업");
        });
    });

    describe("generateDealName", () => {
        it("use_postfix=true일 때 타임스탬프를 붙인다", () => {
            const template = createMockTemplate({ deal_name: "작업" });

            const result = generateDealName({
                template,
                existing_records: [],
                use_postfix: true,
            });

            // 작업_MMdd_HHmmss_xxx 형식
            expect(result).toMatch(/^작업_\d{4}_\d{6}_\d{3}$/);
        });

        it("use_postfix=true이고 deal_name이 없으면 '작업'을 사용한다", () => {
            const template = createMockTemplate({ deal_name: "" });

            const result = generateDealName({
                template,
                existing_records: [],
                use_postfix: true,
            });

            expect(result).toMatch(/^작업_\d{4}_\d{6}_\d{3}$/);
        });

        it("use_postfix=false일 때 순차 번호를 사용한다", () => {
            const template = createMockTemplate({
                work_name: "테스트 작업",
                deal_name: "작업",
            });
            const records = [
                createMockRecord({
                    work_name: "테스트 작업",
                    deal_name: "작업",
                    is_deleted: false,
                    is_completed: false,
                }),
            ];

            const result = generateDealName({
                template,
                existing_records: records,
                use_postfix: false,
            });

            expect(result).toBe("작업 (2)");
        });

        it("같은 work_name의 레코드만 중복 체크한다", () => {
            const template = createMockTemplate({
                work_name: "A 작업",
                deal_name: "작업",
            });
            const records = [
                createMockRecord({
                    work_name: "B 작업", // 다른 work_name
                    deal_name: "작업",
                    is_deleted: false,
                    is_completed: false,
                }),
            ];

            const result = generateDealName({
                template,
                existing_records: records,
                use_postfix: false,
            });

            // 다른 work_name이므로 중복 아님
            expect(result).toBe("작업");
        });
    });
});
