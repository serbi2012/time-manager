/**
 * ThemeTab 스냅샷 테스트
 * 테마 설정 UI 구조 변경 감지
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { ThemeTab } from "../../../../features/settings/ui/tabs/ThemeTab";

describe("ThemeTab 스냅샷", () => {
    const mock_props = {
        current_theme: "blue" as const,
        on_change: vi.fn(),
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("블루 테마 구조가 유지됨", () => {
        const { container } = render(<ThemeTab {...mock_props} />);
        expect(container.firstChild).toMatchSnapshot();
    });

    it("그린 테마 구조가 유지됨", () => {
        const { container } = render(
            <ThemeTab {...mock_props} current_theme="green" />
        );
        expect(container.firstChild).toMatchSnapshot();
    });

    it("퍼플 테마 구조가 유지됨", () => {
        const { container } = render(
            <ThemeTab {...mock_props} current_theme="purple" />
        );
        expect(container.firstChild).toMatchSnapshot();
    });
});
