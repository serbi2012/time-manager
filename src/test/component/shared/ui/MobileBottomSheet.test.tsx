/**
 * MobileBottomSheet 컴포넌트 테스트
 */

import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

import { MobileBottomSheet } from "@/shared/ui/mobile";

describe("MobileBottomSheet", () => {
    afterEach(() => {
        document.body.style.overflow = "";
    });

    it("open=false면 내용을 렌더하지 않는다", () => {
        render(
            <MobileBottomSheet open={false} onClose={vi.fn()} title="프리셋">
                <div>본문</div>
            </MobileBottomSheet>
        );

        expect(screen.queryByText("프리셋")).not.toBeInTheDocument();
        expect(screen.queryByText("본문")).not.toBeInTheDocument();
    });

    it("open=true면 제목과 내용을 표시한다", () => {
        render(
            <MobileBottomSheet open={true} onClose={vi.fn()} title="프리셋">
                <div>본문</div>
            </MobileBottomSheet>
        );

        expect(screen.getByText("프리셋")).toBeInTheDocument();
        expect(screen.getByText("본문")).toBeInTheDocument();
    });

    it("배경을 누르면 onClose가 호출된다", () => {
        const onClose = vi.fn();
        const { container } = render(
            <MobileBottomSheet open={true} onClose={onClose}>
                <div>본문</div>
            </MobileBottomSheet>
        );

        const backdrop = container.querySelector(".mobile-sheet-backdrop");
        expect(backdrop).not.toBeNull();

        fireEvent.click(backdrop!);

        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("열려 있는 동안 본문 스크롤을 잠근다", () => {
        const { rerender } = render(
            <MobileBottomSheet open={true} onClose={vi.fn()}>
                <div>본문</div>
            </MobileBottomSheet>
        );

        expect(document.body.style.overflow).toBe("hidden");

        rerender(
            <MobileBottomSheet open={false} onClose={vi.fn()}>
                <div>본문</div>
            </MobileBottomSheet>
        );

        expect(document.body.style.overflow).not.toBe("hidden");
    });

    it("footer를 전달하면 하단에 표시한다", () => {
        render(
            <MobileBottomSheet
                open={true}
                onClose={vi.fn()}
                footer={<button>확인</button>}
            >
                <div>본문</div>
            </MobileBottomSheet>
        );

        expect(screen.getByText("확인")).toBeInTheDocument();
    });
});
