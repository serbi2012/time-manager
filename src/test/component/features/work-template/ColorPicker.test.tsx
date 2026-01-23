/**
 * ColorPicker 컴포넌트 테스트
 */

import { describe, it, expect, vi } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import { ColorPicker } from "../../../../features/work-template/ui/ColorPicker";
import { TEMPLATE_COLORS } from "../../../../shared/config";

describe("ColorPicker", () => {
    const default_props = {
        selected_color: TEMPLATE_COLORS[0],
        on_change: vi.fn(),
    };

    it("렌더링되어야 함", () => {
        const { container } = render(<ColorPicker {...default_props} />);

        const swatches = container.querySelectorAll(".color-swatch");
        expect(swatches.length).toBe(TEMPLATE_COLORS.length);
    });

    it("선택된 색상에 체크 표시", () => {
        const { container } = render(
            <ColorPicker {...default_props} selected_color={TEMPLATE_COLORS[0]} />
        );

        const selected = container.querySelector(".color-swatch-selected");
        expect(selected).toBeInTheDocument();
    });

    it("색상 클릭 시 on_change 호출", () => {
        const on_change = vi.fn();
        const { container } = render(
            <ColorPicker {...default_props} on_change={on_change} />
        );

        const swatches = container.querySelectorAll(".color-swatch");
        fireEvent.click(swatches[1]); // 두 번째 색상 클릭

        expect(on_change).toHaveBeenCalledWith(TEMPLATE_COLORS[1]);
    });
});
