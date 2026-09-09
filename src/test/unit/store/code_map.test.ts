import { describe, it, expect } from "vitest";
import { updateCodeMap, getCodeFromMap } from "@/store/lib/code_map";

describe("updateCodeMap", () => {
    it("새 항목을 추가한 맵을 반환한다", () => {
        expect(updateCodeMap({}, "거래A", "D-001")).toEqual({ 거래A: "D-001" });
    });

    it("기존 항목을 덮어쓴다", () => {
        expect(updateCodeMap({ 거래A: "D-001" }, "거래A", "D-999")).toEqual({
            거래A: "D-999",
        });
    });

    it("코드가 비어 있으면 항목을 제거한다", () => {
        expect(updateCodeMap({ 거래A: "D-001" }, "거래A", "")).toEqual({});
    });

    it("이름과 코드의 앞뒤 공백을 제거한다", () => {
        expect(updateCodeMap({}, "  거래B  ", "  D-002  ")).toEqual({
            거래B: "D-002",
        });
    });

    it("이름이 비어 있으면 null을 반환한다", () => {
        expect(updateCodeMap({}, "   ", "D-003")).toBeNull();
    });

    it("원본 맵을 변경하지 않는다", () => {
        const original = { 거래A: "D-001" };

        updateCodeMap(original, "거래B", "D-002");

        expect(original).toEqual({ 거래A: "D-001" });
    });

    it("다른 항목은 그대로 유지한다", () => {
        expect(
            updateCodeMap({ 거래A: "D-001", 거래B: "D-002" }, "거래A", "")
        ).toEqual({ 거래B: "D-002" });
    });
});

describe("getCodeFromMap", () => {
    it("저장된 코드를 반환한다", () => {
        expect(getCodeFromMap({ 거래A: "D-001" }, "거래A")).toBe("D-001");
    });

    it("이름의 앞뒤 공백을 무시한다", () => {
        expect(getCodeFromMap({ 거래A: "D-001" }, "  거래A  ")).toBe("D-001");
    });

    it("없는 이름은 빈 문자열을 반환한다", () => {
        expect(getCodeFromMap({}, "거래A")).toBe("");
    });
});
