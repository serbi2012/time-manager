/**
 * ColorPicker 스냅샷 테스트
 * 색상 선택기 UI 구조 변경 감지
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { ColorPicker } from "../../../../features/work-template/ui/ColorPicker";

describe("ColorPicker 스냅샷", () => {
    const default_props = {
        selected_color: "#1677ff",
        on_change: vi.fn(),
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("기본 렌더링 구조가 유지됨", () => {
        const { container } = render(<ColorPicker {...default_props} />);
        expect(container.firstChild).toMatchSnapshot();
    });

    it("다른 색상 선택 시 구조가 유지됨", () => {
        const { container } = render(
            <ColorPicker {...default_props} selected_color="#52c41a" />
        );
        expect(container.firstChild).toMatchSnapshot();
    });
});
