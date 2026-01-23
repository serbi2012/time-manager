/**
 * ThemeTab 컴포넌트 테스트
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ThemeTab } from "../../../../features/settings/ui/tabs/ThemeTab";

describe("ThemeTab", () => {
    const default_props = {
        current_theme: "blue" as const,
        on_change: vi.fn(),
    };

    it("렌더링되어야 함", () => {
        render(<ThemeTab {...default_props} />);

        expect(screen.getByText("앱 테마 색상")).toBeInTheDocument();
    });

    it("현재 테마가 선택되어 있어야 함", () => {
        render(<ThemeTab {...default_props} current_theme="blue" />);

        const blue_radio = screen.getByLabelText(/파란색/);
        expect(blue_radio).toBeChecked();
    });

    it("테마 변경 시 on_change 호출", () => {
        const on_change = vi.fn();
        render(<ThemeTab {...default_props} on_change={on_change} />);

        const green_radio = screen.getByLabelText(/초록색/);
        fireEvent.click(green_radio);

        expect(on_change).toHaveBeenCalledWith("green");
    });

    it("모든 테마 옵션 표시", () => {
        render(<ThemeTab {...default_props} />);

        expect(screen.getByText(/파란색/)).toBeInTheDocument();
        expect(screen.getByText(/초록색/)).toBeInTheDocument();
        expect(screen.getByText(/보라색/)).toBeInTheDocument();
        expect(screen.getByText(/빨간색/)).toBeInTheDocument();
    });
});
