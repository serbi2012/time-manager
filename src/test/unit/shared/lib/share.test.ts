import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { shareOrCopyText } from "@/shared/lib/share";

const OPTIONS = { title: "주간 업무 보고", text: "내용" };

function setShare(value: unknown) {
    Object.defineProperty(navigator, "share", {
        value,
        configurable: true,
        writable: true,
    });
}

function setClipboard(write: ReturnType<typeof vi.fn>) {
    Object.defineProperty(navigator, "clipboard", {
        value: { writeText: write },
        configurable: true,
        writable: true,
    });
}

describe("shareOrCopyText", () => {
    let write_text: ReturnType<typeof vi.fn>;

    beforeEach(() => {
        write_text = vi.fn().mockResolvedValue(undefined);
        setClipboard(write_text);
    });

    afterEach(() => {
        setShare(undefined);
    });

    it("공유 시트를 쓸 수 있으면 공유한다", async () => {
        const share = vi.fn().mockResolvedValue(undefined);
        setShare(share);

        const result = await shareOrCopyText(OPTIONS);

        expect(result).toBe("shared");
        expect(share).toHaveBeenCalledWith(OPTIONS);
        expect(write_text).not.toHaveBeenCalled();
    });

    it("공유를 지원하지 않으면 클립보드에 복사한다", async () => {
        setShare(undefined);

        const result = await shareOrCopyText(OPTIONS);

        expect(result).toBe("copied");
        expect(write_text).toHaveBeenCalledWith(OPTIONS.text);
    });

    it("사용자가 공유를 취소하면 복사하지 않는다", async () => {
        const abort = new Error("취소");
        abort.name = "AbortError";
        setShare(vi.fn().mockRejectedValue(abort));

        const result = await shareOrCopyText(OPTIONS);

        expect(result).toBe("cancelled");
        expect(write_text).not.toHaveBeenCalled();
    });

    it("공유가 실패하면 클립보드로 넘어간다", async () => {
        setShare(vi.fn().mockRejectedValue(new Error("실패")));

        const result = await shareOrCopyText(OPTIONS);

        expect(result).toBe("copied");
        expect(write_text).toHaveBeenCalledWith(OPTIONS.text);
    });
});
