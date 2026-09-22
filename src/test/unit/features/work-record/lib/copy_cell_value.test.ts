import { describe, it, expect } from "vitest";
import { resolveCopyCellValue } from "@/features/work-record/lib/copy_cell_value";

describe("resolveCopyCellValue", () => {
    it("거래코드가 있으면 코드를 복사한다", () => {
        expect(
            resolveCopyCellValue({
                value: "거래A",
                code: "D-001",
                with_modifier: false,
                prefer_code: true,
            })
        ).toBe("D-001");
    });

    it("Ctrl을 누르면 이름을 복사한다", () => {
        expect(
            resolveCopyCellValue({
                value: "거래A",
                code: "D-001",
                with_modifier: true,
                prefer_code: true,
            })
        ).toBe("거래A");
    });

    it("거래코드가 없으면 이름을 복사한다", () => {
        expect(
            resolveCopyCellValue({
                value: "거래A",
                code: "",
                with_modifier: false,
                prefer_code: true,
            })
        ).toBe("거래A");
    });

    it("설정이 꺼져 있으면 언제나 이름을 복사한다", () => {
        expect(
            resolveCopyCellValue({
                value: "거래A",
                code: "D-001",
                with_modifier: false,
                prefer_code: false,
            })
        ).toBe("거래A");
    });

    it("코드가 연결되지 않은 셀은 값을 그대로 복사한다", () => {
        expect(
            resolveCopyCellValue({
                value: "60",
                with_modifier: false,
                prefer_code: true,
            })
        ).toBe("60");
    });
});
