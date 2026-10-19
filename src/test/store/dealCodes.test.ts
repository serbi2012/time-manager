/**
 * 거래코드 매핑 스토어 액션 테스트
 */
import { describe, it, expect, beforeEach } from "vitest";
import { useWorkStore } from "../../store/useWorkStore";

describe("거래코드 매핑", () => {
    beforeEach(() => {
        useWorkStore.setState({ deal_codes: {}, work_codes: {} });
    });

    it("setDealCode로 저장한 코드를 상태와 getDealCode에서 조회한다", () => {
        useWorkStore.getState().setDealCode("거래A", "D-001");

        expect(useWorkStore.getState().deal_codes["거래A"]).toBe("D-001");
        expect(useWorkStore.getState().getDealCode("거래A")).toBe("D-001");
    });

    it("거래명이 비어 있으면 상태를 바꾸지 않는다", () => {
        useWorkStore.getState().setDealCode("   ", "D-003");

        expect(useWorkStore.getState().deal_codes).toEqual({});
    });
});

describe("작업명 거래코드", () => {
    beforeEach(() => {
        useWorkStore.setState({ deal_codes: {}, work_codes: {} });
    });

    it("작업명을 함께 넘기면 작업명에도 코드를 저장한다", () => {
        useWorkStore.getState().setDealCode("거래A", "D-001", "작업A");

        expect(useWorkStore.getState().work_codes["작업A"]).toBe("D-001");
        expect(useWorkStore.getState().deal_codes["거래A"]).toBe("D-001");
    });

    it("작업명을 넘기지 않으면 작업명 코드는 바뀌지 않는다", () => {
        useWorkStore.setState({ work_codes: { 작업A: "W-001" } });
        useWorkStore.getState().setDealCode("거래A", "D-001");

        expect(useWorkStore.getState().work_codes["작업A"]).toBe("W-001");
    });

    it("코드를 비우면 작업명 코드도 지운다", () => {
        useWorkStore.getState().setDealCode("거래A", "D-001", "작업A");
        useWorkStore.getState().setDealCode("거래A", "", "작업A");

        expect(useWorkStore.getState().work_codes).not.toHaveProperty("작업A");
    });

    it("같은 작업의 다른 거래에 코드를 넣으면 작업명 코드가 갱신된다", () => {
        useWorkStore.getState().setDealCode("거래A", "D-001", "작업A");
        useWorkStore.getState().setDealCode("거래B", "D-002", "작업A");

        expect(useWorkStore.getState().work_codes["작업A"]).toBe("D-002");
        expect(useWorkStore.getState().deal_codes).toEqual({
            거래A: "D-001",
            거래B: "D-002",
        });
    });

    it("거래명이 비어 있으면 작업명 코드도 저장하지 않는다", () => {
        useWorkStore.getState().setDealCode("   ", "D-001", "작업A");

        expect(useWorkStore.getState().work_codes).toEqual({});
    });
});
