/**
 * 거래코드 매핑 스토어 액션 테스트
 */
import { describe, it, expect, beforeEach } from "vitest";
import { useWorkStore } from "../../store/useWorkStore";

describe("거래코드 매핑", () => {
    beforeEach(() => {
        useWorkStore.setState({ deal_codes: {} });
    });

    it("거래명에 코드를 저장한다", () => {
        useWorkStore.getState().setDealCode("거래A", "D-001");

        expect(useWorkStore.getState().deal_codes["거래A"]).toBe("D-001");
    });

    it("저장한 코드를 조회한다", () => {
        useWorkStore.getState().setDealCode("거래A", "D-001");

        expect(useWorkStore.getState().getDealCode("거래A")).toBe("D-001");
    });

    it("저장되지 않은 거래명은 빈 문자열을 반환한다", () => {
        expect(useWorkStore.getState().getDealCode("없는거래")).toBe("");
    });

    it("빈 코드를 저장하면 매핑에서 제거한다", () => {
        useWorkStore.getState().setDealCode("거래A", "D-001");
        useWorkStore.getState().setDealCode("거래A", "");

        expect(useWorkStore.getState().deal_codes).not.toHaveProperty("거래A");
    });

    it("거래명과 코드의 앞뒤 공백을 제거한다", () => {
        useWorkStore.getState().setDealCode("  거래B  ", "  D-002  ");

        expect(useWorkStore.getState().deal_codes["거래B"]).toBe("D-002");
    });

    it("거래명이 비어 있으면 저장하지 않는다", () => {
        useWorkStore.getState().setDealCode("   ", "D-003");

        expect(Object.keys(useWorkStore.getState().deal_codes)).toHaveLength(0);
    });

    it("기존 매핑을 덮어쓴다", () => {
        useWorkStore.getState().setDealCode("거래A", "D-001");
        useWorkStore.getState().setDealCode("거래A", "D-999");

        expect(useWorkStore.getState().deal_codes["거래A"]).toBe("D-999");
    });

    it("여러 거래명을 독립적으로 보관한다", () => {
        useWorkStore.getState().setDealCode("거래A", "D-001");
        useWorkStore.getState().setDealCode("거래B", "D-002");

        expect(useWorkStore.getState().deal_codes).toEqual({
            거래A: "D-001",
            거래B: "D-002",
        });
    });
});
